import ProctoringService from "./proctoringServices";

describe("ProctoringService start handshake", () => {
  let service;

  test("uses a 70-second default start acknowledgement timeout", () => {
    expect(new ProctoringService().startTimeoutMs).toBe(70_000);
  });

  beforeEach(() => {
    service = new ProctoringService({ startTimeoutMs: 25 });
    service.startCameraPreview = jest.fn().mockResolvedValue();
    service.connectWebSocket = jest.fn().mockImplementation(async () => {
      service.startAcknowledgement =
        service.waitForStartAcknowledgement();
      await service.handleMessage(
        JSON.stringify({ type: "PROCTORING_STARTED" })
      );
    });
    service.enableBrowserMonitoring = jest.fn();
    service.startFrameSending = jest.fn();
    service.cleanup = jest.fn().mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("resolves only after the backend confirms AI proctoring started", async () => {
    const createElement = jest
      .spyOn(document, "createElement")
      .mockReturnValue({
        getContext: () => ({}),
      });
    const onStarted = jest.fn();
    service.onStarted = onStarted;

    await expect(service.start(23)).resolves.toBeUndefined();

    expect(service.connectWebSocket).toHaveBeenCalledWith(23);
    expect(onStarted).toHaveBeenCalledTimes(1);
    expect(service.enableBrowserMonitoring).toHaveBeenCalledTimes(1);
    createElement.mockRestore();
  });

  test("rejects with the backend error instead of waiting for a start event", async () => {
    jest.spyOn(document, "createElement").mockReturnValue({
      getContext: () => ({}),
    });
    service.connectWebSocket = jest.fn().mockImplementation(async () => {
      service.startAcknowledgement =
        service.waitForStartAcknowledgement();
      await service.handleMessage(
        JSON.stringify({
          type: "PROCTORING_ERROR",
          code: "AI_CONNECTION_FAILED",
          message: "Unable to connect to fraud AI: ECONNREFUSED",
        })
      );
    });
    const onError = jest.fn();
    service.onError = onError;

    await expect(service.start(23)).rejects.toThrow(
      "Unable to connect to fraud AI: ECONNREFUSED"
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unable to connect to fraud AI: ECONNREFUSED",
      })
    );
    expect(service.cleanup).toHaveBeenCalledTimes(1);
    expect(service.enableBrowserMonitoring).not.toHaveBeenCalled();
  });

  test("rejects when the backend never acknowledges AI startup", async () => {
    jest.spyOn(document, "createElement").mockReturnValue({
      getContext: () => ({}),
    });
    service.connectWebSocket = jest.fn().mockImplementation(async () => {
      service.startAcknowledgement =
        service.waitForStartAcknowledgement();
    });

    await expect(service.start(23)).rejects.toThrow(
      "Proctoring AI did not respond within 1 seconds."
    );

    expect(service.cleanup).toHaveBeenCalledTimes(1);
    expect(service.enableBrowserMonitoring).not.toHaveBeenCalled();
  });

  test("rejects when the proctoring WebSocket never connects", async () => {
    const OriginalWebSocket = global.WebSocket;
    service.connectionTimeoutMs = 5;
    service.connectWebSocket =
      ProctoringService.prototype.connectWebSocket.bind(service);
    jest.spyOn(document, "createElement").mockReturnValue({
      getContext: () => ({}),
    });
    global.WebSocket = class {
      close() {}
    };

    try {
      await expect(service.start(23)).rejects.toThrow(
        "Timed out connecting to the proctoring service after 1 seconds."
      );

      expect(service.cleanup).toHaveBeenCalledTimes(1);
      expect(service.enableBrowserMonitoring).not.toHaveBeenCalled();
    } finally {
      global.WebSocket = OriginalWebSocket;
    }
  });
});
