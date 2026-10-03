import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getJobById,
  getUserProfile,
  applyJob,
  getMyJobApplications,
  getApplicationVideoUploadUrl,
} from "../services/api";

/* =========================================================
   PROFESSIONAL INLINE SVG ICONS
   ========================================================= */

const Icon = ({ name, size = 20, stroke = "currentColor", className = "" }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  const icons = {
    arrowLeft: (
      <>
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V6.5L12 3l8 3.5V21" />
        <path d="M8 9h1" />
        <path d="M15 9h1" />
        <path d="M8 13h1" />
        <path d="M15 13h1" />
        <path d="M10 21v-4h4v4" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),
    replace: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M18.5 12A7 7 0 0 0 6.2 7.3L4 9" />
        <path d="M5.5 12a7 7 0 0 0 12.3 4.7L20 15" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="m16 10 5-3v10l-5-3z" />
      </>
    ),
    camera: (
      <>
        <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    stop: (
      <rect x="7" y="7" width="10" height="10" rx="2" />
    ),
    x: (
      <>
        <path d="m7 7 10 10" />
        <path d="m17 7-10 10" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4.5 4.5L19 7" />
      </>
    ),
    checkCircle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 21 20H3L12 3Z" />
        <path d="M12 9v4" />
        <circle cx="12" cy="16.5" r=".7" fill="currentColor" stroke="none" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
        <path d="M10 12v2h4v-2" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.2 4.1L17 8.5l-3.8 1.4L12 14l-1.2-4.1L7 8.5l3.8-1.4L12 3Z" />
        <path d="m19 14 .6 2.1L21.5 17l-1.9.9L19 20l-.6-2.1-1.9-.9 1.9-.9L19 14Z" />
        <path d="m5 14 .5 1.7L7 16.5l-1.5.8L5 19l-.5-1.7L3 16.5l1.5-.8L5 14Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || null}</svg>;
};

export default function JobApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [submitStage, setSubmitStage] = useState("");
  const [existingApplication, setExistingApplication] = useState(null);

  const [error, setError] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");

  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const resumeSectionRef = useRef(null);
  const videoSectionRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [additionalInformation, setAdditionalInformation] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const cameraVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    const loadJobAndProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const user = JSON.parse(localStorage.getItem("edu_user"));

        if (!user?.id) {
          throw new Error("Unable to identify the logged-in student.");
        }

        const [jobData, profileData, applications] = await Promise.all([
          getJobById(id),
          getUserProfile(user.id),
          getMyJobApplications(),
        ]);

        const existing = Array.isArray(applications)
          ? applications.find(
              (application) =>
                String(application.job_id || application.job?.id) ===
                String(id)
            )
          : null;

        if (existing) {
          setExistingApplication(existing);
        }

        setJob(jobData);
        setProfile(profileData);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load job details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJobAndProfile();
  }, [id]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  useEffect(() => {
    if (
      showRecorder &&
      cameraVideoRef.current &&
      mediaStreamRef.current
    ) {
      cameraVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [showRecorder]);

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setResume(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOC, or DOCX resume.");
      event.target.value = "";
      setResume(null);
      return;
    }

    setError("");
    setResume(file);
  };

  const startRecording = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      mediaStreamRef.current = stream;

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }

      recordingChunksRef.current = [];

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp9,opus"
        )
      ) {
        mimeType = "video/webm;codecs=vp9,opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp8,opus"
        )
      ) {
        mimeType = "video/webm;codecs=vp8,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalType = recorder.mimeType || "video/webm";

        const blob = new Blob(recordingChunksRef.current, {
          type: finalType,
        });

        const file = new File(
          [blob],
          `video-introduction-${Date.now()}.webm`,
          {
            type: finalType,
          }
        );

        const previewUrl = URL.createObjectURL(blob);

        setVideoFile(file);
        setVideoPreview(previewUrl);
        setShowRecorder(false);
        setIsRecording(false);

        stream.getTracks().forEach((track) => track.stop());

        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        recordingChunksRef.current = [];
      };

      recorder.start();

      setRecordingSeconds(0);
      setShowRecorder(true);
      setIsRecording(true);

      const maxDuration = Number(job.video_max_duration) || 60;

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((previous) => {
          const next = previous + 1;

          if (next >= maxDuration) {
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
          }

          return Math.min(next, maxDuration);
        });
      }, 1000);
    } catch (err) {
      console.error("Camera recording failed:", err);

      setError(
        "Unable to access your camera and microphone. Please allow camera and microphone access and try again."
      );

      setShowRecorder(false);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    recordingChunksRef.current = [];

    setShowRecorder(false);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      setSubmitStage("Preparing application...");
      setApplicationMessage("");
      setError("");

      const profileResume = profile?.profile?.resume;

      const missingFields = [];

      if (!resume && !profileResume) {
        missingFields.push("resume");
      }

      if (job.require_video && !videoFile) {
        missingFields.push("video");
      }

      if (missingFields.length > 0) {
        setValidationErrors(missingFields);
        setShowValidationModal(true);
        return;
      }

      const applicationData = {
        profile: {
          name: profile?.name || "",
          email: profile?.email || "",
          institution: profile?.profile?.institution || "",
          company: profile?.profile?.company || "",
          career_goal: profile?.profile?.career_goal || "",
        },

        resume: resume
          ? {
              file_name: resume.name,
              file_type: resume.type,
            }
          : {
              file_name: profileResume.file_name,
              stored_name: profileResume.stored_name,
              file_type: profileResume.file_type,
              file_size: profileResume.file_size,
              url: profileResume.url,
            },

        cover_letter: coverLetter.trim(),

        additional_information: additionalInformation.trim(),
      };

      if (videoFile) {
        setSubmitStage("Uploading video...");

        const uploadInfo = await getApplicationVideoUploadUrl(
          id,
          videoFile.name,
          videoFile.type,
          videoFile.size
        );

        const uploadResponse = await fetch(
          uploadInfo.upload_url,
          {
            method: "PUT",
            headers: {
              "Content-Type": videoFile.type,
            },
            body: videoFile,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(
            "Video upload failed. Please try again."
          );
        }

        applicationData.video = {
          file_name: videoFile.name,
          file_type: videoFile.type,
          file_size: videoFile.size,
          storage: "backblaze_b2",
          key: uploadInfo.key,
        };
      }

      setSubmitStage("Submitting application...");

      await applyJob(id, applicationData, resume);

      setSubmitStage("");
      setApplicationMessage("");
      setShowSuccessModal(true);

      setResume(null);
      setCoverLetter("");
      setAdditionalInformation("");

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      setVideoFile(null);
      setVideoPreview("");
    } catch (err) {
      setSubmitStage("");

      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to apply for this job."
      );
    } finally {
      setApplying(false);
    }
  };

  /* =========================================================
     LOADING / ERROR STATES
     ========================================================= */

  if (loading) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className="job-app-loading">
          <div className="job-app-loader-card">
            <div className="job-app-loader-icon">
              <Icon name="briefcase" size={25} />
            </div>

            <div>
              <div className="job-app-loading-title">
                Loading application
              </div>
              <div className="job-app-loading-subtitle">
                Preparing your application form...
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error && !job) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className="job-app-page">
          <div className="job-app-error-page">
            <div className="job-app-error-icon">
              <Icon name="alert" size={25} />
            </div>

            <h2>Unable to load this job</h2>

            <p>{error}</p>

            <button
              onClick={() => navigate(-1)}
              className="job-app-secondary-button"
            >
              <Icon name="arrowLeft" size={17} />
              Back
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className="job-app-page">
          <div className="job-app-empty">
            <div className="job-app-empty-icon">
              <Icon name="briefcase" size={24} />
            </div>

            <h2>Job not found</h2>
            <p>The job you're looking for is no longer available.</p>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================
     ALREADY APPLIED
     ========================================================= */

  if (existingApplication) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className="job-app-page">
          <div className="job-app-already">
            <div className="already-icon">
              <Icon name="checkCircle" size={38} />
            </div>

            <div className="already-badge">
              Application Found
            </div>

            <h1>You Already Applied</h1>

            <p>
              You have already submitted an application for this
              job. You can review your application and track its
              current status from your applications page.
            </p>

            <div className="already-status">
              <span>Status</span>
              <strong>
                {existingApplication.status || "submitted"}
              </strong>
            </div>

            <div className="already-actions">
              <button
                onClick={() => navigate("/app/my-applications")}
                className="job-app-primary-button"
              >
                <Icon name="briefcase" size={17} />
                View My Application
              </button>

              <button
                onClick={() => navigate(-1)}
                className="job-app-secondary-button"
              >
                <Icon name="arrowLeft" size={17} />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{pageStyles}</style>

      <div className="job-app-page">
        <div className="job-app-container">

          {/* =================================================
              BACK
          ================================================= */}

          <button
            onClick={() => navigate(-1)}
            className="job-app-back"
          >
            <span className="job-app-back-icon">
              <Icon name="arrowLeft" size={17} />
            </span>
            Back to Job
          </button>

          {/* =================================================
              APPLICATION FORM
          ================================================= */}

          <div className="job-app-form-card">

            {/* Decorative top */}
            <div className="job-app-form-glow glow-one" />
            <div className="job-app-form-glow glow-two" />

            {/* =================================================
                FORM HEADER
            ================================================= */}

            <div className="job-app-header">
              <div className="job-app-header-icon">
                <Icon name="briefcase" size={25} />
              </div>

              <div>
                <div className="job-app-eyebrow">
                  JOB APPLICATION
                </div>

                <h1>Complete Your Application</h1>

                <p>
                  Review your information and submit your
                  application for this opportunity.
                </p>
              </div>
            </div>

            <div className="job-app-header-line" />

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="job-app-alert job-app-alert-error">
                <div className="job-app-alert-icon">
                  <Icon name="alert" size={18} />
                </div>

                <div>
                  <strong>Something needs your attention</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {applicationMessage && (
              <div className="job-app-alert job-app-alert-success">
                <div className="job-app-alert-icon">
                  <Icon name="checkCircle" size={18} />
                </div>

                <div>
                  <strong>Application ready</strong>
                  <p>{applicationMessage}</p>
                </div>
              </div>
            )}

            {/* =================================================
                CANDIDATE INFORMATION
            ================================================= */}

            <div className="job-app-section">
              <div className="job-app-section-heading">
                <div className="job-app-section-icon">
                  <Icon name="user" size={19} />
                </div>

                <div>
                  <h3>Candidate Information</h3>
                  <p>
                    Your profile information is automatically
                    included with this application.
                  </p>
                </div>
              </div>

              <div className="job-app-grid">
                {/* Full Name */}
                <div className="job-app-field">
                  <label>Full Name</label>

                  <div className="job-app-input-wrap readonly">
                    <span className="job-app-input-icon">
                      <Icon name="user" size={17} />
                    </span>

                    <input
                      value={profile?.name || ""}
                      readOnly
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="job-app-field">
                  <label>Email</label>

                  <div className="job-app-input-wrap readonly">
                    <span className="job-app-input-icon">
                      <Icon name="mail" size={17} />
                    </span>

                    <input
                      value={profile?.email || ""}
                      readOnly
                    />
                  </div>
                </div>

                {/* Institution */}
                <div className="job-app-field">
                  <label>Institution</label>

                  <div className="job-app-input-wrap readonly">
                    <span className="job-app-input-icon">
                      <Icon name="building" size={17} />
                    </span>

                    <input
                      value={
                        profile?.profile?.institution || ""
                      }
                      readOnly
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="job-app-field">
                  <label>Company</label>

                  <div className="job-app-input-wrap readonly">
                    <span className="job-app-input-icon">
                      <Icon name="briefcase" size={17} />
                    </span>

                    <input
                      value={
                        profile?.profile?.company || ""
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                CAREER GOAL
            ================================================= */}

            <div className="job-app-field job-app-full-field">
              <label>Career Goal</label>

              <div className="job-app-textarea-wrap readonly">
                <span className="job-app-textarea-icon">
                  <Icon name="target" size={17} />
                </span>

                <textarea
                  value={
                    profile?.profile?.career_goal || ""
                  }
                  readOnly
                  rows={3}
                />
              </div>
            </div>

            {/* =================================================
                RESUME
            ================================================= */}

            <div
              ref={resumeSectionRef}
              className="job-app-section job-app-section-divider"
            >
              <div className="job-app-section-heading">
                <div className="job-app-section-icon purple">
                  <Icon name="file" size={19} />
                </div>

                <div>
                  <h3>
                    Resume
                    <span className="required-mark">*</span>
                  </h3>

                  <p>
                    Choose the resume you want the employer to
                    receive.
                  </p>
                </div>
              </div>

              {profile?.profile?.resume && !resume ? (
                <div className="profile-resume-card">
                  <div className="profile-resume-left">
                    <div className="profile-resume-icon">
                      <Icon name="file" size={20} />
                    </div>

                    <div className="profile-resume-info">
                      <p>
                        {profile.profile.resume.file_name}
                      </p>

                      <span>
                        Using your profile resume
                      </span>
                    </div>
                  </div>

                  <label className="replace-label">
                    <span className="replace-button">
                      <Icon name="replace" size={15} />
                      Replace
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="hidden-input"
                    />
                  </label>
                </div>
              ) : (
                <>
                  <label className="resume-upload-zone">
                    <div className="resume-upload-icon">
                      <Icon name="upload" size={23} />
                    </div>

                    <div className="resume-upload-content">
                      <p>
                        {resume
                          ? resume.name
                          : "Upload Resume"}
                      </p>

                      <span>
                        PDF, DOC or DOCX · Max 5 MB
                      </span>
                    </div>

                    <div className="resume-upload-action">
                      Browse
                    </div>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="hidden-input"
                    />
                  </label>

                  {resume && (
                    <div className="file-selected-message">
                      <Icon name="checkCircle" size={16} />
                      <span>
                        New resume selected: {resume.name}
                      </span>
                    </div>
                  )}

                  {profile?.profile?.resume && resume && (
                    <p className="replacement-note">
                      This resume will be used instead of your
                      profile resume for this application.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* =================================================
                COVER LETTER
            ================================================= */}

            <div className="job-app-field">
              <div className="field-label-row">
                <label>Cover Letter</label>
                <span className="optional-label">
                  Optional
                </span>
              </div>

              <div className="job-app-textarea-wrap">
                <textarea
                  value={coverLetter}
                  onChange={(e) =>
                    setCoverLetter(e.target.value)
                  }
                  rows={6}
                  placeholder="Write a short message to the employer..."
                />
              </div>

              <p className="field-help">
                Example: "Thank you for the opportunity. I am
                interested in this position and would be happy
                to contribute my skills."
              </p>
            </div>

            {/* =================================================
                ADDITIONAL INFORMATION
            ================================================= */}

            <div className="job-app-field">
              <div className="field-label-row">
                <label>Additional Information</label>
                <span className="optional-label">
                  Optional
                </span>
              </div>

              <div className="job-app-textarea-wrap">
                <textarea
                  value={additionalInformation}
                  onChange={(e) =>
                    setAdditionalInformation(e.target.value)
                  }
                  rows={4}
                  placeholder="Anything else you would like the employer to know?"
                />
              </div>
            </div>

            {/* =================================================
                VIDEO INTRODUCTION
            ================================================= */}

            <div
              ref={videoSectionRef}
              className="job-app-video-section"
            >
              <div className="job-app-section-heading">
                <div className="job-app-section-icon pink">
                  <Icon name="video" size={19} />
                </div>

                <div>
                  <h3>
                    A Short Video Introduction about you
                    {job.require_video && (
                      <span className="required-mark">*</span>
                    )}
                  </h3>

                  <p>
                    Introduce yourself and tell the employer
                    why you're a good fit.
                  </p>
                </div>
              </div>

              <div className="video-prompt-card">
                <div className="video-prompt-icon">
                  <Icon name="sparkles" size={18} />
                </div>

                <div>
                  <span className="video-prompt-label">
                    Employer Prompt
                  </span>

                  <p>
                    {job.video_prompt ||
                      "Please introduce yourself and explain why you are a good fit for this role."}
                  </p>
                </div>
              </div>

              <div className="video-duration">
                <Icon name="clock" size={15} />
                Maximum duration:{" "}
                <strong>
                  {job.video_max_duration || 60} seconds
                </strong>
              </div>

              {/* =================================================
                  RECORD / UPLOAD BUTTONS
              ================================================= */}

              {!videoFile && !showRecorder && (
                <div className="video-action-grid">

                  {/* Record */}
                  <button
                    type="button"
                    onClick={startRecording}
                    className="video-action-card record-card"
                  >
                    <div className="video-action-icon">
                      <Icon name="camera" size={22} />
                    </div>

                    <div className="video-action-content">
                      <strong>Record Video</strong>
                      <span>
                        Use your camera and microphone
                      </span>
                    </div>

                    <Icon
                      name="arrowRight"
                      size={18}
                      className="video-action-arrow"
                    />
                  </button>

                  {/* Upload */}
                  <label className="video-action-card upload-card">
                    <div className="video-action-icon">
                      <Icon name="upload" size={22} />
                    </div>

                    <div className="video-action-content">
                      <strong>Upload Video</strong>
                      <span>
                        Choose an existing video
                      </span>
                    </div>

                    <Icon
                      name="arrowRight"
                      size={18}
                      className="video-action-arrow"
                    />

                    <input
                      type="file"
                      accept="video/*"
                      className="hidden-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        if (!file.type.startsWith("video/")) {
                          setError(
                            "Please select a valid video file."
                          );
                          e.target.value = "";
                          return;
                        }

                        const previewUrl =
                          URL.createObjectURL(file);

                        const video =
                          document.createElement("video");

                        video.preload = "metadata";
                        video.src = previewUrl;

                        video.onloadedmetadata = () => {
                          const maxDuration =
                            Number(
                              job.video_max_duration
                            ) || 60;

                          if (
                            video.duration > maxDuration
                          ) {
                            setError(
                              `Video must be ${maxDuration} seconds or less.`
                            );

                            URL.revokeObjectURL(
                              previewUrl
                            );

                            e.target.value = "";
                            return;
                          }

                          setError("");
                          setVideoFile(file);
                          setVideoPreview(previewUrl);
                        };
                      }}
                    />
                  </label>
                </div>
              )}

              {/* =================================================
                  CAMERA RECORDER
              ================================================= */}

              {showRecorder && (
                <div className="recorder-panel">
                  <div className="recorder-video-shell">
                    <video
                      ref={cameraVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="recorder-video"
                    />

                    <div className="recorder-top-gradient" />

                    {isRecording && (
                      <div className="recording-indicator">
                        <span className="recording-dot" />
                        Recording
                      </div>
                    )}

                    <div className="recording-timer">
                      <Icon name="clock" size={14} />

                      {recordingSeconds}s /{" "}
                      {job.video_max_duration || 60}s
                    </div>
                  </div>

                  <div className="recorder-controls">
                    {isRecording ? (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="stop-recording-button"
                      >
                        <Icon name="stop" size={17} />
                        Stop Recording
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="cancel-recording-button"
                    >
                      <Icon name="x" size={17} />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  RECORDED / UPLOADED VIDEO
              ================================================= */}

              {videoFile && !showRecorder && (
                <div className="uploaded-video-card">
                  <div className="uploaded-video-header">
                    <div>
                      <span className="uploaded-video-label">
                        Your Video Introduction
                      </span>

                      <p>
                        Review your video before submitting.
                      </p>
                    </div>

                    <div className="uploaded-video-check">
                      <Icon name="check" size={17} />
                    </div>
                  </div>

                  <video
                    src={videoPreview}
                    controls
                    className="uploaded-video"
                  />

                  <div className="uploaded-video-footer">
                    <span className="uploaded-file-name">
                      <Icon name="video" size={15} />
                      {videoFile.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoPreview) {
                          URL.revokeObjectURL(
                            videoPreview
                          );
                        }

                        setVideoFile(null);
                        setVideoPreview("");
                        setRecordingSeconds(0);
                      }}
                      className="remove-video-button"
                    >
                      <Icon name="replace" size={14} />
                      Remove & Record Again
                    </button>
                  </div>
                </div>
              )}

              <p className="video-help">
                You can record using your camera or upload an
                existing video. Maximum duration is{" "}
                {job.video_max_duration || 60} seconds.
              </p>
            </div>

            {/* =================================================
                SUBMIT STAGE
            ================================================= */}

            {submitStage && (
              <div className="submit-progress">
                <div className="submit-spinner" />

                <span>{submitStage}</span>
              </div>
            )}

            {/* =================================================
                SUBMIT APPLICATION
            ================================================= */}

            <div className="submit-area">
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="submit-application-button"
              >
                {applying ? (
                  <>
                    <span className="button-spinner" />
                    {submitStage ||
                      "Submitting Application..."}
                  </>
                ) : (
                  <>
                    Submit Application
                    <Icon name="arrowRight" size={18} />
                  </>
                )}
              </button>

              <p className="submit-note">
                Please review your information before submitting.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            VALIDATION MODAL
        ===================================================== */}

        {showValidationModal && (
          <div className="job-app-modal-backdrop">
            <div className="job-app-modal">

              <div className="modal-top-accent" />

              <div className="modal-icon warning">
                <Icon name="alert" size={27} />
              </div>

              <h2>
                Want to Complete Your Application?
              </h2>

              <p className="modal-description">
                Please complete the following required fields
                before submitting.
              </p>

              <div className="modal-missing-fields">

                {validationErrors.includes("resume") && (
                  <div className="missing-field-card">
                    <div className="missing-field-icon">
                      <Icon name="file" size={18} />
                    </div>

                    <div>
                      <p>Resume Required</p>
                      <span>
                        Please upload your resume to proceed.
                      </span>
                    </div>
                  </div>
                )}

                {validationErrors.includes("video") && (
                  <div className="missing-field-card">
                    <div className="missing-field-icon">
                      <Icon name="video" size={18} />
                    </div>

                    <div>
                      <p>
                        Self-Introduction Required
                      </p>

                      <span>
                        Please upload or record your
                        self-introduction video to proceed.
                      </span>
                    </div>
                  </div>
                )}

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowValidationModal(false);

                  setTimeout(() => {
                    if (
                      validationErrors.includes("resume")
                    ) {
                      resumeSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    } else if (
                      validationErrors.includes("video")
                    ) {
                      videoSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  }, 100);
                }}
                className="modal-primary-button"
              >
                OK, Understood
                <Icon name="arrowRight" size={17} />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            SUCCESS MODAL
        ===================================================== */}

        {showSuccessModal && (
          <div className="job-app-modal-backdrop">
            <div className="job-app-modal success-modal">

              <div className="success-modal-glow" />

              <div className="modal-icon success">
                <Icon name="check" size={29} />
              </div>

              <div className="success-badge">
                <Icon name="checkCircle" size={14} />
                Successfully Submitted
              </div>

              <h2>Application Submitted!</h2>

              <p className="modal-description">
                Your application has been submitted successfully.
                You can track its progress from your applications
                dashboard.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/app/dashboard");
                }}
                className="modal-primary-button success-button"
              >
                Continue to Dashboard
                <Icon name="arrowRight" size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================================
   PREMIUM UI STYLES
   ============================================================ */

const pageStyles = `
  .job-app-page {
    min-height: 100vh;
    padding: 30px 20px 70px;
    position: relative;
    overflow-x: hidden;
    background:
      radial-gradient(circle at 8% 8%, rgba(99,102,241,.13), transparent 28%),
      radial-gradient(circle at 92% 15%, rgba(168,85,247,.11), transparent 27%),
      radial-gradient(circle at 50% 100%, rgba(59,130,246,.08), transparent 32%),
      linear-gradient(180deg, #f8faff 0%, #f4f7ff 48%, #ffffff 100%);
  }

  .job-app-page::before {
    content: "";
    position: absolute;
    width: 460px;
    height: 460px;
    top: -220px;
    right: -180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,.10), transparent 68%);
    pointer-events: none;
  }

  .job-app-page::after {
    content: "";
    position: absolute;
    width: 390px;
    height: 390px;
    bottom: -210px;
    left: -170px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,.08), transparent 68%);
    pointer-events: none;
  }

  .job-app-container {
    width: min(900px, 100%);
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* Loading */

  .job-app-loading {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background:
      radial-gradient(circle at 50% 20%, rgba(99,102,241,.12), transparent 35%),
      #f7f9ff;
  }

  .job-app-loader-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 18px 22px;
    background: rgba(255,255,255,.9);
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    box-shadow: 0 18px 50px rgba(30,41,59,.10);
  }

  .job-app-loader-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    box-shadow: 0 8px 22px rgba(79,70,229,.25);
  }

  .job-app-loading-title {
    color: #172033;
    font-weight: 800;
    font-size: 15px;
  }

  .job-app-loading-subtitle {
    margin-top: 3px;
    color: #64748b;
    font-size: 13px;
  }

  /* Error / Empty */

  .job-app-error-page,
  .job-app-empty {
    max-width: 560px;
    margin: 80px auto;
    padding: 36px;
    text-align: center;
    background: rgba(255,255,255,.95);
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    box-shadow: 0 25px 70px rgba(15,23,42,.10);
  }

  .job-app-error-icon,
  .job-app-empty-icon {
    width: 58px;
    height: 58px;
    margin: 0 auto 17px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
  }

  .job-app-error-icon {
    color: #dc2626;
    background: #fff1f2;
    border: 1px solid #fecdd3;
  }

  .job-app-empty-icon {
    color: #4f46e5;
    background: linear-gradient(135deg,#eef2ff,#f5f3ff);
    border: 1px solid #ddd6fe;
  }

  .job-app-error-page h2,
  .job-app-empty h2 {
    margin: 0;
    color: #172033;
    font-size: 21px;
    font-weight: 850;
  }

  .job-app-error-page p,
  .job-app-empty p {
    margin: 8px 0 22px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.65;
  }

  /* Back */

  .job-app-back {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 17px;
    border: 0;
    background: transparent;
    color: #475569;
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
    transition: .2s ease;
  }

  .job-app-back:hover {
    color: #4338ca;
    transform: translateX(-2px);
  }

  .job-app-back-icon {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.9);
    border: 1px solid #e2e8f0;
    box-shadow: 0 5px 15px rgba(15,23,42,.06);
  }

  /* Main card */

  .job-app-form-card {
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(226,232,240,.9);
    border-radius: 27px;
    padding: 30px;
    box-shadow:
      0 30px 80px rgba(30,41,59,.10),
      0 5px 18px rgba(30,41,59,.04);
    backdrop-filter: blur(14px);
  }

  .job-app-form-glow {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    pointer-events: none;
    opacity: .45;
    filter: blur(3px);
  }

  .glow-one {
    top: -210px;
    right: -150px;
    background: radial-gradient(circle, rgba(99,102,241,.14), transparent 68%);
  }

  .glow-two {
    bottom: -240px;
    left: -180px;
    background: radial-gradient(circle, rgba(168,85,247,.10), transparent 68%);
  }

  .job-app-header {
    position: relative;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .job-app-header-icon {
    flex: 0 0 auto;
    width: 53px;
    height: 53px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    color: white;
    background: linear-gradient(135deg,#4f46e5,#7c3aed 70%,#9333ea);
    box-shadow:
      0 12px 27px rgba(79,70,229,.24),
      inset 0 1px 0 rgba(255,255,255,.35);
  }

  .job-app-eyebrow {
    margin-bottom: 4px;
    color: #6366f1;
    font-size: 10px;
    letter-spacing: .16em;
    font-weight: 900;
  }

  .job-app-header h1 {
    margin: 0;
    color: #172033;
    font-size: clamp(23px, 4vw, 30px);
    line-height: 1.16;
    letter-spacing: -.035em;
    font-weight: 900;
  }

  .job-app-header p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
  }

  .job-app-header-line {
    height: 1px;
    margin: 25px 0 27px;
    background: linear-gradient(
      90deg,
      transparent,
      #dbe3f0 15%,
      #c7d2fe 50%,
      #dbe3f0 85%,
      transparent
    );
  }

  /* Alerts */

  .job-app-alert {
    display: flex;
    gap: 11px;
    align-items: flex-start;
    margin-bottom: 22px;
    padding: 13px 15px;
    border-radius: 15px;
    font-size: 13px;
  }

  .job-app-alert-icon {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  }

  .job-app-alert strong {
    display: block;
    font-size: 13px;
    font-weight: 850;
  }

  .job-app-alert p {
    margin: 3px 0 0;
    line-height: 1.5;
  }

  .job-app-alert-error {
    color: #991b1b;
    background: linear-gradient(135deg,#fff7f7,#fff1f2);
    border: 1px solid #fecaca;
  }

  .job-app-alert-error .job-app-alert-icon {
    color: #dc2626;
    background: #fee2e2;
  }

  .job-app-alert-success {
    color: #166534;
    background: linear-gradient(135deg,#f0fdf4,#ecfdf5);
    border: 1px solid #bbf7d0;
  }

  .job-app-alert-success .job-app-alert-icon {
    color: #16a34a;
    background: #dcfce7;
  }

  /* Sections */

  .job-app-section {
    position: relative;
    margin-bottom: 27px;
  }

  .job-app-section-divider {
    padding-top: 27px;
    border-top: 1px solid #edf1f7;
  }

  .job-app-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 17px;
  }

  .job-app-section-icon {
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4f46e5;
    background: linear-gradient(135deg,#eef2ff,#e0e7ff);
    border: 1px solid #c7d2fe;
    border-radius: 12px;
    box-shadow: 0 7px 18px rgba(79,70,229,.08);
  }

  .job-app-section-icon.purple {
    color: #7c3aed;
    background: linear-gradient(135deg,#f5f3ff,#ede9fe);
    border-color: #ddd6fe;
  }

  .job-app-section-icon.pink {
    color: #c026d3;
    background: linear-gradient(135deg,#fdf4ff,#fae8ff);
    border-color: #f5d0fe;
  }

  .job-app-section-heading h3 {
    margin: 0;
    color: #172033;
    font-size: 16px;
    font-weight: 850;
    letter-spacing: -.015em;
  }

  .job-app-section-heading p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }

  .required-mark {
    margin-left: 4px;
    color: #ef4444;
  }

  /* Inputs */

  .job-app-grid {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 16px;
  }

  .job-app-field {
    margin-bottom: 22px;
  }

  .job-app-full-field {
    margin-bottom: 27px;
  }

  .job-app-field label,
  .field-label-row label {
    display: block;
    margin-bottom: 7px;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
  }

  .field-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .optional-label {
    color: #94a3b8;
    font-size: 10px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: .07em;
  }

  .job-app-input-wrap {
    display: flex;
    align-items: center;
    min-height: 46px;
    overflow: hidden;
    border: 1px solid #dbe3ee;
    border-radius: 13px;
    background: #fff;
    transition: .2s ease;
  }

  .job-app-input-wrap.readonly {
    background: linear-gradient(135deg,#f8fafc,#f6f8fc);
  }

  .job-app-input-wrap:focus-within {
    border-color: #818cf8;
    box-shadow: 0 0 0 4px rgba(99,102,241,.09);
  }

  .job-app-input-icon {
    width: 42px;
    display: flex;
    justify-content: center;
    color: #64748b;
  }

  .job-app-input-wrap input {
    width: 100%;
    min-width: 0;
    padding: 11px 13px 11px 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #334155;
    font-size: 13px;
    font-weight: 600;
  }

  .job-app-textarea-wrap {
    overflow: hidden;
    border: 1px solid #dbe3ee;
    border-radius: 14px;
    background: #fff;
    transition: .2s ease;
  }

  .job-app-textarea-wrap:focus-within {
    border-color: #818cf8;
    box-shadow: 0 0 0 4px rgba(99,102,241,.09);
  }

  .job-app-textarea-wrap.readonly {
    background: linear-gradient(135deg,#f8fafc,#f6f8fc);
  }

  .job-app-textarea-wrap textarea {
    display: block;
    width: 100%;
    min-height: 100px;
    padding: 12px 14px;
    border: 0;
    outline: 0;
    resize: vertical;
    background: transparent;
    color: #334155;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.6;
  }

  .job-app-textarea-icon {
    display: none;
  }

  .job-app-textarea-wrap textarea::placeholder {
    color: #a1adbd;
  }

  .field-help {
    margin: 6px 1px 0;
    color: #94a3b8;
    font-size: 11px;
    line-height: 1.55;
  }

  /* Resume */

  .profile-resume-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 13px;
    border: 1px solid #dbe3ee;
    border-radius: 16px;
    background: linear-gradient(135deg,#f8fafc,#f7f8ff);
  }

  .profile-resume-left {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 11px;
  }

  .profile-resume-icon {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6366f1;
    background: linear-gradient(135deg,#eef2ff,#e0e7ff);
    border: 1px solid #c7d2fe;
    border-radius: 12px;
  }

  .profile-resume-info {
    min-width: 0;
  }

  .profile-resume-info p {
    margin: 0;
    color: #334155;
    font-size: 13px;
    font-weight: 750;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-resume-info span {
    display: block;
    margin-top: 3px;
    color: #94a3b8;
    font-size: 11px;
  }

  .replace-label {
    flex: 0 0 auto;
    cursor: pointer;
  }

  .replace-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 11px;
    border: 1px solid #dbe3ee;
    border-radius: 10px;
    background: white;
    color: #475569;
    font-size: 11px;
    font-weight: 800;
    transition: .2s ease;
  }

  .replace-button:hover {
    color: #4338ca;
    border-color: #c7d2fe;
    background: #eef2ff;
  }

  .resume-upload-zone {
    display: flex;
    align-items: center;
    gap: 13px;
    min-height: 76px;
    padding: 13px 15px;
    cursor: pointer;
    border: 1.5px dashed #c7d2fe;
    border-radius: 16px;
    background:
      linear-gradient(135deg,rgba(238,242,255,.75),rgba(248,250,252,.85));
    transition: .22s ease;
  }

  .resume-upload-zone:hover {
    border-color: #818cf8;
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(79,70,229,.08);
  }

  .resume-upload-icon {
    flex: 0 0 auto;
    width: 43px;
    height: 43px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4f46e5;
    background: linear-gradient(135deg,#ffffff,#eef2ff);
    border: 1px solid #c7d2fe;
    border-radius: 13px;
  }

  .resume-upload-content {
    min-width: 0;
    flex: 1;
  }

  .resume-upload-content p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #334155;
    font-size: 13px;
    font-weight: 800;
  }

  .resume-upload-content span {
    display: block;
    margin-top: 3px;
    color: #94a3b8;
    font-size: 11px;
  }

  .resume-upload-action {
    flex: 0 0 auto;
    padding: 7px 10px;
    border-radius: 9px;
    color: #4f46e5;
    background: #eef2ff;
    font-size: 11px;
    font-weight: 850;
  }

  .hidden-input {
    display: none;
  }

  .file-selected-message {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    color: #16a34a;
    font-size: 11px;
    font-weight: 750;
  }

  .replacement-note {
    margin: 6px 1px 0;
    color: #94a3b8;
    font-size: 11px;
  }

  /* Video */

  .job-app-video-section {
    padding-top: 27px;
    margin-top: 4px;
    border-top: 1px solid #edf1f7;
  }

  .video-prompt-card {
    display: flex;
    gap: 11px;
    align-items: flex-start;
    padding: 14px;
    margin-bottom: 11px;
    border: 1px solid #e9d5ff;
    border-radius: 15px;
    background:
      linear-gradient(135deg,#faf5ff,#f5f3ff,#eef2ff);
  }

  .video-prompt-icon {
    flex: 0 0 auto;
    width: 33px;
    height: 33px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7c3aed;
    border-radius: 10px;
    background: white;
    border: 1px solid #ddd6fe;
  }

  .video-prompt-label {
    display: block;
    margin-bottom: 3px;
    color: #7c3aed;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: .1em;
    font-weight: 900;
  }

  .video-prompt-card p {
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.6;
  }

  .video-duration {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 15px;
    color: #64748b;
    font-size: 11px;
  }

  .video-duration strong {
    color: #475569;
  }

  .video-action-grid {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 12px;
  }

  .video-action-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 16px;
    border-radius: 16px;
    text-align: left;
    cursor: pointer;
    border: 1px solid;
    transition: .22s ease;
  }

  .video-action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 32px rgba(30,41,59,.09);
  }

  .record-card {
    border-color: #c7d2fe;
    background: linear-gradient(135deg,#eef2ff,#f5f3ff);
    color: #4338ca;
  }

  .upload-card {
    border-color: #ddd6fe;
    background: linear-gradient(135deg,#faf5ff,#f5f3ff);
    color: #6d28d9;
  }

  .video-action-icon {
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    background: rgba(255,255,255,.85);
    border: 1px solid rgba(255,255,255,.95);
    box-shadow: 0 7px 16px rgba(79,70,229,.07);
  }

  .video-action-content {
    min-width: 0;
    flex: 1;
  }

  .video-action-content strong {
    display: block;
    color: #29345a;
    font-size: 13px;
    font-weight: 850;
  }

  .video-action-content span {
    display: block;
    margin-top: 3px;
    color: #718096;
    font-size: 10px;
    line-height: 1.4;
  }

  .video-action-arrow {
    flex: 0 0 auto;
    opacity: .65;
  }

  /* Recorder */

  .recorder-panel {
    padding: 13px;
    border: 1px solid #dbe3ee;
    border-radius: 18px;
    background: #f8fafc;
  }

  .recorder-video-shell {
    position: relative;
    overflow: hidden;
    min-height: 280px;
    border-radius: 14px;
    background: #090b12;
    box-shadow: 0 15px 35px rgba(15,23,42,.15);
  }

  .recorder-video {
    display: block;
    width: 100%;
    max-height: 420px;
    object-fit: contain;
  }

  .recorder-top-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    pointer-events: none;
    background: linear-gradient(to bottom,rgba(0,0,0,.45),transparent);
  }

  .recording-indicator {
    position: absolute;
    top: 13px;
    left: 13px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(0,0,0,.62);
    color: white;
    font-size: 11px;
    font-weight: 750;
    backdrop-filter: blur(8px);
  }

  .recording-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 0 4px rgba(239,68,68,.18);
    animation: recordingPulse 1.3s infinite;
  }

  @keyframes recordingPulse {
    0%,100% { opacity: 1; }
    50% { opacity: .45; }
  }

  .recording-timer {
    position: absolute;
    right: 13px;
    bottom: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 10px;
    background: rgba(0,0,0,.65);
    color: white;
    font-size: 11px;
    font-weight: 750;
    backdrop-filter: blur(8px);
  }

  .recorder-controls {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  .stop-recording-button {
    flex: 1;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    padding: 11px 14px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(135deg,#dc2626,#ef4444);
    color: white;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 9px 20px rgba(220,38,38,.20);
  }

  .cancel-recording-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    padding: 11px 15px;
    border: 1px solid #dbe3ee;
    border-radius: 12px;
    background: white;
    color: #475569;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
  }

  /* Uploaded video */

  .uploaded-video-card {
    padding: 14px;
    border: 1px solid #c7d2fe;
    border-radius: 17px;
    background: linear-gradient(135deg,#f8faff,#f5f3ff);
  }

  .uploaded-video-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .uploaded-video-label {
    display: block;
    color: #4338ca;
    font-size: 12px;
    font-weight: 850;
  }

  .uploaded-video-header p {
    margin: 3px 0 0;
    color: #94a3b8;
    font-size: 10px;
  }

  .uploaded-video-check {
    width: 31px;
    height: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #16a34a;
    background: #dcfce7;
    border-radius: 10px;
  }

  .uploaded-video {
    display: block;
    width: 100%;
    max-width: 650px;
    max-height: 390px;
    margin: 0 auto;
    border-radius: 13px;
    background: #080b12;
    border: 1px solid #e2e8f0;
  }

  .uploaded-video-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 11px;
  }

  .uploaded-file-name {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: #16a34a;
    font-size: 10px;
    font-weight: 750;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-video-button {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 0;
    background: transparent;
    color: #dc2626;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
  }

  .remove-video-button:hover {
    color: #b91c1c;
  }

  .video-help {
    margin: 9px 1px 0;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.5;
  }

  /* Submit */

  .submit-progress {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 7px;
    margin-bottom: 12px;
    padding: 11px 13px;
    border-radius: 12px;
    color: #4f46e5;
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    font-size: 12px;
    font-weight: 750;
  }

  .submit-spinner,
  .button-spinner {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
    border: 2px solid rgba(79,70,229,.20);
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin .75s linear infinite;
  }

  .button-spinner {
    width: 15px;
    height: 15px;
    border-color: rgba(255,255,255,.35);
    border-top-color: white;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .submit-area {
    margin-top: 28px;
    padding-top: 23px;
    border-top: 1px solid #edf1f7;
  }

  .submit-application-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 48px;
    padding: 12px 20px;
    border: 0;
    border-radius: 13px;
    color: white;
    background:
      linear-gradient(135deg,#4f46e5 0%,#6366f1 48%,#7c3aed 100%);
    box-shadow:
      0 12px 27px rgba(79,70,229,.23),
      inset 0 1px 0 rgba(255,255,255,.25);
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
    transition: .22s ease;
  }

  .submit-application-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 17px 32px rgba(79,70,229,.27),
      inset 0 1px 0 rgba(255,255,255,.25);
  }

  .submit-application-button:disabled {
    opacity: .62;
    cursor: not-allowed;
  }

  .submit-note {
    margin: 8px 1px 0;
    color: #94a3b8;
    font-size: 10px;
  }

  /* Buttons */

  .job-app-primary-button,
  .job-app-secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 43px;
    padding: 10px 15px;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: .2s ease;
  }

  .job-app-primary-button {
    color: white;
    border: 0;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    box-shadow: 0 9px 22px rgba(79,70,229,.20);
  }

  .job-app-primary-button:hover {
    transform: translateY(-1px);
  }

  .job-app-secondary-button {
    color: #475569;
    border: 1px solid #dbe3ee;
    background: white;
  }

  .job-app-secondary-button:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  /* Already applied */

  .job-app-already {
    max-width: 610px;
    margin: 65px auto;
    padding: 40px 35px;
    text-align: center;
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,.96);
    border: 1px solid #e2e8f0;
    border-radius: 27px;
    box-shadow: 0 30px 75px rgba(30,41,59,.11);
  }

  .job-app-already::before {
    content: "";
    position: absolute;
    width: 280px;
    height: 280px;
    top: -190px;
    right: -130px;
    border-radius: 50%;
    background: radial-gradient(circle,rgba(99,102,241,.13),transparent 68%);
  }

  .already-icon {
    position: relative;
    width: 72px;
    height: 72px;
    margin: 0 auto 17px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #16a34a;
    background: linear-gradient(135deg,#dcfce7,#ecfdf5);
    border: 1px solid #bbf7d0;
    border-radius: 22px;
    box-shadow: 0 13px 30px rgba(22,163,74,.13);
  }

  .already-badge,
  .success-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border-radius: 999px;
    color: #4338ca;
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .job-app-already h1 {
    margin: 13px 0 0;
    color: #172033;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -.03em;
  }

  .job-app-already > p {
    max-width: 470px;
    margin: 8px auto 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.65;
  }

  .already-status {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-top: 19px;
    padding: 7px 11px;
    border: 1px solid #dbe3ee;
    border-radius: 10px;
    background: #f8fafc;
    font-size: 11px;
  }

  .already-status span {
    color: #94a3b8;
  }

  .already-status strong {
    color: #4f46e5;
    text-transform: capitalize;
  }

  .already-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 23px;
  }

  /* Modal */

  .job-app-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(15,23,42,.57);
    backdrop-filter: blur(7px);
  }

  .job-app-modal {
    position: relative;
    overflow: hidden;
    width: min(440px,100%);
    padding: 31px 27px 26px;
    text-align: center;
    background: rgba(255,255,255,.98);
    border: 1px solid rgba(226,232,240,.9);
    border-radius: 23px;
    box-shadow:
      0 35px 90px rgba(15,23,42,.25),
      0 5px 20px rgba(15,23,42,.10);
    animation: modalIn .2s ease-out;
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: translateY(8px) scale(.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-top-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg,#4f46e5,#7c3aed,#c026d3);
  }

  .modal-icon {
    width: 59px;
    height: 59px;
    margin: 0 auto 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
  }

  .modal-icon.warning {
    color: #d97706;
    background: linear-gradient(135deg,#fff7ed,#fffbeb);
    border: 1px solid #fed7aa;
  }

  .modal-icon.success {
    color: #16a34a;
    background: linear-gradient(135deg,#dcfce7,#ecfdf5);
    border: 1px solid #bbf7d0;
    box-shadow: 0 12px 28px rgba(22,163,74,.13);
  }

  .job-app-modal h2 {
    margin: 0;
    color: #172033;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: -.025em;
  }

  .modal-description {
    margin: 7px auto 18px;
    max-width: 365px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.65;
  }

  .modal-missing-fields {
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin-bottom: 19px;
    text-align: left;
  }

  .missing-field-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 11px;
    border: 1px solid #fecaca;
    border-radius: 13px;
    background: linear-gradient(135deg,#fff7f7,#fff1f2);
  }

  .missing-field-icon {
    flex: 0 0 auto;
    width: 31px;
    height: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    background: #fee2e2;
    border-radius: 9px;
  }

  .missing-field-card p {
    margin: 0;
    color: #334155;
    font-size: 12px;
    font-weight: 850;
  }

  .missing-field-card span {
    display: block;
    margin-top: 2px;
    color: #64748b;
    font-size: 10px;
    line-height: 1.45;
  }

  .modal-primary-button {
    width: 100%;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 0;
    border-radius: 12px;
    color: white;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    box-shadow: 0 10px 23px rgba(79,70,229,.21);
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
    transition: .2s ease;
  }

  .modal-primary-button:hover {
    transform: translateY(-1px);
  }

  .success-modal {
    padding-top: 35px;
  }

  .success-modal-glow {
    position: absolute;
    width: 230px;
    height: 230px;
    top: -150px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50%;
    background: radial-gradient(circle,rgba(34,197,94,.13),transparent 70%);
    pointer-events: none;
  }

  .success-modal .success-badge {
    margin-bottom: 10px;
    color: #15803d;
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .success-button {
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
  }

  /* Responsive */

  @media (max-width: 700px) {
    .job-app-page {
      padding: 20px 12px 45px;
    }

    .job-app-form-card {
      padding: 21px 17px;
      border-radius: 21px;
    }

    .job-app-header {
      gap: 11px;
    }

    .job-app-header-icon {
      width: 45px;
      height: 45px;
      border-radius: 13px;
    }

    .job-app-header h1 {
      font-size: 22px;
    }

    .job-app-grid {
      grid-template-columns: 1fr;
      gap: 13px;
    }

    .video-action-grid {
      grid-template-columns: 1fr;
    }

    .profile-resume-card {
      align-items: flex-start;
      flex-direction: column;
    }

    .replace-label {
      width: 100%;
    }

    .replace-button {
      width: 100%;
      justify-content: center;
    }

    .resume-upload-action {
      display: none;
    }

    .resume-upload-zone {
      min-height: 70px;
    }

    .uploaded-video-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .already-actions {
      flex-direction: column;
    }

    .already-actions button {
      width: 100%;
    }

    .job-app-already {
      margin: 35px auto;
      padding: 30px 20px;
    }
  }

  @media (max-width: 480px) {
    .job-app-header p {
      font-size: 11px;
    }

    .job-app-section-heading p {
      display: none;
    }

    .job-app-section-heading {
      margin-bottom: 13px;
    }

    .job-app-section-icon {
      width: 35px;
      height: 35px;
    }

    .recorder-controls {
      flex-direction: column;
    }

    .cancel-recording-button {
      width: 100%;
    }

    .job-app-modal {
      padding: 27px 18px 21px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }
`;