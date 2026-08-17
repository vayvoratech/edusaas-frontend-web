class ProctoringService {
  constructor(options = {}) {
    this.wsUrl =
      options.wsUrl ||
      this.getWebSocketUrl();

    this.frameRate = options.frameRate || 5;
    this.cameraWidth = options.cameraWidth || 640;
    this.cameraHeight = options.cameraHeight || 480;
    this.jpegQuality = options.jpegQuality || 0.65;

    this.websocket = null;
    this.stream = null;

    this.video = null;
    this.canvas = null;
    this.context = null;

    this.frameInterval = null;

    this.running = false;
    this.connected = false;
    this.started = false;
    this.terminated = false;

    this.browserMonitoring = false;
    this.boundEvents = [];
    this.browserEventCooldown = 1500;
    this.lastBrowserEventTime = {};

    // --------------------------------------------------
    // Callbacks
    // --------------------------------------------------

    this.onConnected = options.onConnected || (() => {});
    this.onStarted = options.onStarted || (() => {});
    this.onResult = options.onResult || (() => {});
    this.onWarning = options.onWarning || (() => {});
    this.onPause = options.onPause || (() => {});
    this.onTerminate = options.onTerminate || (() => {});
    this.onDisconnected = options.onDisconnected || (() => {});
    this.onError = options.onError || (() => {});
  }

  // WebSocket URL
  getWebSocketUrl() {
    const apiBase =
      process.env.REACT_APP_API_BASE ||
      "http://localhost:5000";

    const base = apiBase.replace(/\/api\/?$/, "");

    if (base.startsWith("https://")) {
      return base.replace("https://", "wss://") + "/ws/proctor";
    }

    if (base.startsWith("http://")) {
      return base.replace("http://", "ws://") + "/ws/proctor";
    }

    return "ws://localhost:5000/ws/proctor";
  }

  async startCameraPreview() {
    if (this.stream) {
      return;
    }

    this.video = document.getElementById("cameraVideo");

    if (!this.video) {
      throw new Error(
        'Camera video element with id="cameraVideo" was not found.'
      );
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            ideal: this.cameraWidth,
          },
          height: {
            ideal: this.cameraHeight,
          },
          facingMode: "user",
        },
        audio: false,
      });

      this.video.srcObject = this.stream;
      this.video.autoplay = true;
      this.video.muted = true;
      this.video.playsInline = true;

      await this.video.play();

      console.log("Camera preview started.");
    } catch (error) {
      console.error("Camera preview failed:", error);
      throw error;
    }
  }

  // START
 async start(sessionId) {
  if (this.running) {
    console.warn("Proctoring is already running.");
    return;
  }

  if (!sessionId) {
    throw new Error("Assessment session ID is required.");
  }

  try {
    this.terminated = false;
    this.started = false;

    await this.startCameraPreview();

    // Canvas
    this.canvas = document.createElement("canvas");

    this.canvas.width = this.cameraWidth;
    this.canvas.height = this.cameraHeight;

    this.context = this.canvas.getContext("2d");

    if (!this.context) {
      throw new Error("Unable to create canvas context.");
    }

    // WebSocket
    await this.connectWebSocket(sessionId);

    // Browser monitoring
    this.enableBrowserMonitoring();

    console.log("Waiting for PROCTORING_STARTED...");
  } catch (error) {
    console.error("Proctoring start failed:", error);
    await this.cleanup();
    this.onError(error);
    throw error;
  }
}

  // CONNECT WEBSOCKET
  connectWebSocket(sessionId) {
    return new Promise((resolve, reject) => {
      let settled = false;

      try {
        console.log(
          "Connecting to proctoring WebSocket:",
          this.wsUrl
        );

        this.websocket = new WebSocket(this.wsUrl);

        // ----------------------------------------------
        // OPEN
        // ----------------------------------------------

        this.websocket.onopen = () => {
          console.log("Connected to main backend WebSocket.");

          this.connected = true;

          const accessToken =
            localStorage.getItem("edu_token");

          if (!accessToken) {
            const error =
              new Error(
                "Access token not found. Please log in again."
              );

            this.onError(error);

            this.websocket.close();

            if (!settled) {
              settled = true;
              reject(error);
            }

            return;
          }

          // --------------------------------------------
          // Authenticate + identify assessment
          // --------------------------------------------

          this.websocket.send(
            JSON.stringify({
              type: "START_PROCTORING",
              session_id: sessionId,
              access_token: accessToken,
            })
          );

          this.onConnected();

          if (!settled) {
            settled = true;
            resolve();
          }
        };

        // ----------------------------------------------
        // MESSAGE
        // ----------------------------------------------

        this.websocket.onmessage = async (event) => {
          await this.handleMessage(event.data);
        };

        // ----------------------------------------------
        // ERROR
        // ----------------------------------------------

        this.websocket.onerror = (error) => {
          console.error(
            "Proctoring WebSocket error:",
            error
          );

          this.onError(error);

          if (!settled) {
            settled = true;

            reject(
              new Error(
                "Unable to connect to the proctoring WebSocket."
              )
            );
          }
        };

        // ----------------------------------------------
        // CLOSE
        // ----------------------------------------------

        this.websocket.onclose = (event) => {
          console.log(
            "Proctoring WebSocket disconnected:",
            event.code,
            event.reason
          );

          this.connected = false;
          this.started = false;
          this.running = false;

          this.stopFrameSending();
          this.disableBrowserMonitoring();

          this.onDisconnected(event);
        };
      } catch (error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
      }
    });
  }

  // HANDLE SERVER MESSAGE
  async handleMessage(rawData) {
    let data;

    try {
      if (typeof rawData === "string") {
        data = JSON.parse(rawData);
      } else if (rawData instanceof Blob) {
        const text = await rawData.text();
        data = JSON.parse(text);
      } else if (rawData instanceof ArrayBuffer) {
        const text = new TextDecoder().decode(rawData);
        data = JSON.parse(text);
      } else {
        data = rawData;
      }
    } catch (error) {
      console.error(
        "Failed to parse proctoring server message:",
        error
      );

      return;
    }

    if (!data) {
      return;
    }

    

    // --------------------------------------------------
    // Node tells browser that AI has started
    // --------------------------------------------------

    if (data.type === "PROCTORING_STARTED") {
      this.started = true;
      this.running = true;

      console.log(
        "AI proctoring successfully started."
      );

      this.startFrameSending();

      this.onStarted(data);

      return;
    }

    // --------------------------------------------------
    // AI result
    // --------------------------------------------------

    if (data.type === "PROCTORING_RESULT") {
      await this.processResult(data);

      this.onResult(data);

      return;
    }

    // --------------------------------------------------
    // AI termination
    // --------------------------------------------------

    if (data.type === "EXAM_TERMINATED") {
      this.terminated = true;
      this.running = false;
      this.started = false;

      this.stopFrameSending();

      await this.cleanup();

      this.onTerminate(data);

      return;
    }

    // --------------------------------------------------
    // AI stopped
    // --------------------------------------------------

    if (data.type === "PROCTORING_STOPPED") {
      this.running = false;
      this.started = false;

      this.stopFrameSending();

      return;
    }

    // --------------------------------------------------
    // Error from backend
    // --------------------------------------------------

    if (data.type === "PROCTORING_ERROR") {
      const error = new Error(
        data.message || "Proctoring service error."
      );

      this.onError(error);

      return;
    }

    // --------------------------------------------------
    // Compatibility
    // --------------------------------------------------

    if (data.fraud) {
      this.processResult(data);
      this.onResult(data);
    }
  }

  // PROCESS AI RESULT
  async processResult(data) {
    const fraud =
      data &&
      typeof data.fraud === "object" &&
      data.fraud !== null
        ? data.fraud
        : {};

    const action = fraud.action || "NORMAL";


    if (action === "WARNING") {
      this.onWarning(data);
      return;
    }

    if (action === "PAUSE_EXAM") {
      this.onPause(data);
      return;
    }

    if (action === "TERMINATE_EXAM") {
      this.terminated = true;
      this.running = false;
      this.started = false;

      this.stopFrameSending();

      await this.cleanup();

      this.onTerminate(data);

      return;
    }
  }

  // SEND VIDEO FRAMES
  startFrameSending() {
    if (this.frameInterval) {
      return;
    }

    if (!this.started) {
      return;
    }

    const interval = 1000 / this.frameRate;

    this.frameInterval = setInterval(() => {
      this.sendFrame();
    }, interval);

    console.log(
      `Video frame loop started at ${this.frameRate} FPS.`
    );
  }

  stopFrameSending() {
    if (!this.frameInterval) {
      return;
    }

    clearInterval(this.frameInterval);

    this.frameInterval = null;
  }

  sendFrame() {
    if (!this.running) {
      return;
    }

    if (!this.started) {
      return;
    }

    if (!this.websocket) {
      return;
    }

    if (
      this.websocket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    if (!this.video || !this.canvas || !this.context) {
      return;
    }

    if (
      this.video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    try {
      this.context.drawImage(
        this.video,
        0,
        0,
        this.cameraWidth,
        this.cameraHeight
      );

      const frame =
        this.canvas.toDataURL(
          "image/jpeg",
          this.jpegQuality
        );

      this.websocket.send(
        JSON.stringify({
          type: "VIDEO_FRAME",
          frame,
        })
      );
    } catch (error) {
      console.error(
        "Failed to send video frame:",
        error
      );
    }
  }

  // BROWSER MONITORING
  enableBrowserMonitoring() {
    if (this.browserMonitoring) {
      return;
    }

    this.browserMonitoring = true;

    this.addBrowserEvent(
      document,
      "visibilitychange",
      () => {
        if (document.hidden) {
          this.sendBrowserViolation(
            "TAB_SWITCH",
            {
              reason: "document_hidden",
            }
          );
        }
      }
    );

    this.addBrowserEvent(
      window,
      "blur",
      () => {
        this.sendBrowserViolation(
          "WINDOW_BLUR"
        );
      }
    );

    this.addBrowserEvent(
      document,
      "copy",
      () => {
        this.sendBrowserViolation(
          "COPY_ATTEMPT"
        );
      }
    );

    this.addBrowserEvent(
      document,
      "paste",
      () => {
        this.sendBrowserViolation(
          "PASTE_ATTEMPT"
        );
      }
    );

    this.addBrowserEvent(
      document,
      "cut",
      () => {
        this.sendBrowserViolation(
          "CUT_ATTEMPT"
        );
      }
    );

    this.addBrowserEvent(
      document,
      "contextmenu",
      (event) => {
        event.preventDefault();

        this.sendBrowserViolation(
          "RIGHT_CLICK"
        );
      }
    );

    this.addBrowserEvent(
      document,
      "fullscreenchange",
      () => {
        if (!document.fullscreenElement) {
          this.sendBrowserViolation(
            "FULLSCREEN_EXIT"
          );
        }
      }
    );

    console.log(
      "Browser proctoring monitoring enabled."
    );
  }

  addBrowserEvent(target, eventName, handler) {
    target.addEventListener(
      eventName,
      handler
    );

    this.boundEvents.push({
      target,
      eventName,
      handler,
    });
  }

  sendBrowserViolation(event, metadata = {}) {
    if (!this.started) {
      return;
    }

    if (!this.websocket) {
      return;
    }

    if (
      this.websocket.readyState !==
      WebSocket.OPEN
    ) {
      return;
    }

    const now = Date.now();

    const lastTime =
      this.lastBrowserEventTime[event] || 0;

    if (
      now - lastTime <
      this.browserEventCooldown
    ) {
      return;
    }

    this.lastBrowserEventTime[event] = now;

    const payload = {
      type: "BROWSER_VIOLATION",
      event,
      metadata,
    };

    console.log(
      "Browser violation:",
      payload
    );

    this.websocket.send(
      JSON.stringify(payload)
    );
  }

  disableBrowserMonitoring() {
    this.boundEvents.forEach(
      ({ target, eventName, handler }) => {
        target.removeEventListener(
          eventName,
          handler
        );
      }
    );

    this.boundEvents = [];
    this.browserMonitoring = false;
    this.lastBrowserEventTime = {};
  }

  // STOP
  async stop() {
    console.log("Stopping proctoring...");

    if (
      this.websocket &&
      this.websocket.readyState ===
        WebSocket.OPEN
    ) {
      try {
        this.websocket.send(
          JSON.stringify({
            type: "STOP_EXAM",
          })
        );
      } catch (error) {
        console.error(
          "Failed to send STOP_EXAM:",
          error
        );
      }
    }

    await this.cleanup();
  }

  // CLEANUP
  async cleanup() {
    this.stopFrameSending();
    this.disableBrowserMonitoring();

    // Camera

    if (this.stream) {
      this.stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }

    // WebSocket

    if (this.websocket) {
      try {
        if (
          this.websocket.readyState ===
            WebSocket.OPEN ||
          this.websocket.readyState ===
            WebSocket.CONNECTING
        ) {
          this.websocket.close();
        }
      } catch (error) {
        console.error(
          "Failed to close WebSocket:",
          error
        );
      }
    }

    this.websocket = null;

    this.connected = false;
    this.started = false;
    this.running = false;

    this.canvas = null;
    this.context = null;
  }
}

export default ProctoringService;