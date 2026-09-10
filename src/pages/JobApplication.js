import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getJobById,
  getUserProfile,
  applyJob,
  getMyJobApplications,
  getApplicationVideoUploadUrl,
} from "../services/api";

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

      const user = JSON.parse(
        localStorage.getItem("edu_user")
      );

      if (!user?.id) {
        throw new Error(
          "Unable to identify the logged-in student."
        );
      }

      const [jobData, profileData, applications] = await Promise.all([
  getJobById(id),
  getUserProfile(user.id),
  getMyJobApplications(),
]);

const existing = Array.isArray(applications)
  ? applications.find(
      (application) =>
        String(application.job_id || application.job?.id) === String(id)
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

  // Attach camera streaming live after recorder UI is rendered
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
    setError(
      "Please upload a PDF, DOC, or DOCX resume."
    );
    event.target.value = "";
    setResume(null);
    return;
  }

  setError("");
  setResume(file);
};

  // recording
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

    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
      mimeType = "video/webm;codecs=vp9,opus";
    } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
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

      additional_information:
        additionalInformation.trim(),
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
await applyJob(
  id,
  applicationData,
  resume
);

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
}

if (loading) {
  return (
    <div className="p-6 text-slate-600">
      Loading application form...
    </div>
  );
}

if (error && !job) {
  return (
    <div className="p-6">
      <div className="p-4 rounded-lg bg-red-50 text-red-600">
        {error}
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 rounded-lg border"
      >
         Back
      </button>
    </div>
  );
}

if (!job) {
  return (
    <div className="p-6 text-slate-600">
      Job not found.
    </div>
  );
}


if (existingApplication) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <div className="text-4xl mb-4">✓</div>

        <h1 className="text-xl font-bold text-slate-900">
          You Already Applied
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          You have already submitted an application for this job.
        </p>

        <div className="mt-5 inline-flex px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold capitalize">
          Status: {existingApplication.status || "submitted"}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigate("/app/my-applications")}
            className="px-4 py-2 rounded-lg bg-brand-blue-600 text-white text-sm font-medium hover:bg-brand-blue-700"
          >
            View My Application
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}



return (
  <div className="max-w-3xl mx-auto space-y-6 pb-10">

    {/* Back */}
    <button
      onClick={() => navigate(-1)}
      className="text-sm text-slate-600 hover:text-slate-900"
    >
       Back to Job
    </button>


    {/* Application Form */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">

      {/* Error */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {applicationMessage && (
        <div className="mb-5 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          {applicationMessage}
        </div>
      )}

      {/* Candidate Information */}
      <div className="space-y-4">

        <div>
          <h3 className="font-semibold text-slate-800 mb-3">
            Candidate Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>

              <input
                value={profile?.name || ""}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>

              <input
                value={profile?.email || ""}
                readOnly
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Institution
              </label>

              <input
                value={profile?.profile?.institution || ""}
                readOnly
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company
              </label>

              <input
                value={profile?.profile?.company || ""}
                readOnly
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>

          </div>
        </div>

        {/* Career Goal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Career Goal
          </label>

          <textarea
            value={profile?.profile?.career_goal || ""}
            readOnly
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 resize-none"
          />
        </div>

        {/* Resume */}
       <div ref={resumeSectionRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resume
            <span className="text-red-500 ml-1">*</span>
          </label>

          {profile?.profile?.resume && !resume ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">

                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {profile.profile.resume.file_name}
                  </p>

                  <p className="text-xs text-slate-400">
                    Using your profile resume
                  </p>
                </div>
              </div>

              <label className="shrink-0 cursor-pointer">
                <span className="inline-flex px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-100">
                  Replace
                </span>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              <label className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-lg">📄</span>

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {resume ? resume.name : "Upload Resume"}
                  </p>

                  <p className="text-xs text-slate-400">
                    PDF, DOC or DOCX · Max 5 MB
                  </p>
                </div>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </label>

              {resume && (
                <p className="mt-2 text-xs text-green-600">
                  ✓ New resume selected: {resume.name}
                </p>
              )}

              {profile?.profile?.resume && resume && (
                <p className="mt-1 text-xs text-slate-400">
                  This resume will be used instead of your profile resume
                  for this application.
                </p>
              )}
            </>
          )}
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Cover Letter
          </label>

          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            placeholder="Write a short message to the employer..."
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-200 resize-none"
          />

          <p className="text-xs text-slate-400 mt-1">
            Example: "Thank you for the opportunity. I am interested in
            this position and would be happy to contribute my skills."
          </p>
        </div>


        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Additional Information
          </label>

          <textarea
            value={additionalInformation}
            onChange={(e) =>
              setAdditionalInformation(e.target.value)
            }
            rows={4}
            placeholder="Anything else you would like the employer to know?"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-200 resize-none"
          />
        </div>


          {/* Video Introduction */}
<div
  ref={videoSectionRef}
  className="mt-6 border-t border-slate-200 pt-6"
>
  <div className="flex items-center justify-between mb-2">
    <h3 className="font-semibold text-slate-800">
       A Short Video Introduction about you{job.require_video && (<span className="text-red-500">*</span>) }
    </h3>
  </div>

  <p className="text-sm text-slate-600 mb-2">
    {job.video_prompt ||
      "Please introduce yourself and explain why you are a good fit for this role."}
  </p>

  <p className="text-xs text-slate-500 mb-4">
    Maximum duration:{" "}
    {job.video_max_duration || 60} seconds
  </p>

  {!videoFile && !showRecorder && (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Record */}
      <button
        type="button"
        onClick={startRecording}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-blue-200 bg-brand-blue-50 text-brand-blue-700 font-medium hover:bg-brand-blue-100 transition-colors"
      >
         Record Video
      </button>

      {/* Upload */}
      <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 cursor-pointer transition-colors">
         Upload Video

        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            if (!file.type.startsWith("video/")) {
              setError("Please select a valid video file.");
              e.target.value = "";
              return;
            }

            const previewUrl = URL.createObjectURL(file);
            const video = document.createElement("video");

            video.preload = "metadata";
            video.src = previewUrl;

            video.onloadedmetadata = () => {
              const maxDuration =
                Number(job.video_max_duration) || 60;

              if (video.duration > maxDuration) {
                setError(
                  `Video must be ${maxDuration} seconds or less.`
                );

                URL.revokeObjectURL(previewUrl);
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

  {/* Camera Recorder */}
  {showRecorder && (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl bg-black">
        <video
          ref={cameraVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-h-[420px] object-contain"
        />

        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 text-white text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording
          </div>
        )}

        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm">
          {recordingSeconds}s /{" "}
          {job.video_max_duration || 60}s
        </div>
      </div>

      <div className="flex gap-3">
        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            ⏹ Stop Recording
          </button>
        ) : null}

        <button
          type="button"
          onClick={cancelRecording}
          className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )}

  {/* Recorded / Uploaded Video */}
  {videoFile && !showRecorder && (
    <div className="space-y-3">
      <video
        src={videoPreview}
        controls
        className="w-full max-w-xl rounded-xl border border-slate-200"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-green-600 truncate">
          ✓ {videoFile.name}
        </span>

        <button
          type="button"
          onClick={() => {
            if (videoPreview) {
              URL.revokeObjectURL(videoPreview);
            }

            setVideoFile(null);
            setVideoPreview("");
            setRecordingSeconds(0);
          }}
          className="text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Remove & Record Again
        </button>
      </div>
    </div>
  )}

  <p className="text-xs text-slate-400 mt-3">
    You can record using your camera or upload an existing video.
    Maximum duration is {job.video_max_duration || 60} seconds.
  </p>
</div>

         {submitStage && (
  <p className="mb-3 text-sm text-slate-600">
    {submitStage}
  </p>
)}
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="w-full sm:w-auto px-7 py-3 rounded-lg bg-brand-blue-600 text-white font-semibold hover:bg-brand-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying
  ? submitStage || "Submitting Application..."
  : "Submit Application"}
          </button>


      </div>
    </div>

{showValidationModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">

      {/* Title */}
      <h2 className="text-xl font-semibold text-center text-slate-800">
         Want to Complete Your Application?
      </h2>

      <p className="text-sm text-slate-500 text-center mt-2 mb-5">
        Please complete the following required fields before submitting.
      </p>

      {/* Missing fields */}
      <div className="space-y-3 mb-6">

        {validationErrors.includes("resume") && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3">
            <span className="text-red-500 mt-0.5">!</span>

            <div>
              <p className="text-sm font-medium text-slate-800">
                Resume Required
              </p>

              <p className="text-sm text-slate-600">
                Please upload your resume to proceed.
              </p>
            </div>
          </div>
        )}

        {validationErrors.includes("video") && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3">
            <span className="text-red-500 mt-0.5">!</span>

            <div>
              <p className="text-sm font-medium text-slate-800">
                Self-Introduction Required
              </p>

              <p className="text-sm text-slate-600">
                Please upload or record your self-introduction video to proceed.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Button */}
      <button
        type="button"
        onClick={() => {
          setShowValidationModal(false);

          setTimeout(() => {
            if (validationErrors.includes("resume")) {
              resumeSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            } else if (validationErrors.includes("video")) {
              videoSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 100);
        }}
        className="w-full rounded-xl bg-brand-blue-600 px-4 py-3 text-white font-semibold hover:bg-brand-blue-700 transition-colors"
      >
        OK, Understood
      </button>

    </div>
  </div>
)}

{showSuccessModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">

      {/* Success Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <span className="text-3xl text-green-600">
            ✓
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-center text-slate-800">
        Application Submitted!
      </h2>

      {/* Message */}
      <p className="text-sm text-slate-500 text-center mt-2 mb-6">
        Your application has been submitted successfully.
      </p>

      {/* Button */}
      <button
        type="button"
        onClick={() =>  {setShowSuccessModal(false);
          navigate("/app/dashboard");
        }}
        className="w-full rounded-xl bg-brand-blue-600 px-4 py-3 text-white font-semibold hover:bg-brand-blue-700 transition-colors"
      >
        OK
      </button>

    </div>
  </div>
)}
  </div>
);
}


