import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  getEmployerDashboard,
  getJobs,
  getEligibleStudents,
  getJobApplications,
  getApplicationVideoUrl,
  getUserProfile,
  updateApplicationStatus,
  scheduleInterview,
  getInterview,
  updateInterview,
  cancelInterview,
  sendApplicantEmail,
  getDomainRoles,
} from "../services/api";

import { useAuth } from "../context/AuthContext";
import AppDialog from "../components/ui/AppDialog";


const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(2, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
};


const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const getInitials = (name = "") => {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "C"
  );
};


const getMatchCategory = (score) => {
  const value = Number(score || 0);

  if (value >= 80) return "Strong";
  if (value >= 60) return "Good";
  return "Possible";
};


const getStatusLabel = (status) => {
  if (!status) return "Submitted";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};


const getStatusClasses = (status) => {
  switch (status) {
    case "shortlisted":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200";

    case "selected":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
};


export default function EmployerDashboard() {
  const { user } = useAuth();

  const [dialog, setDialog] = useState({
    open: false,
    type: "error",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    destructive: false,
    onConfirm: null,
  });

  const closeDialog = () => {
    setDialog((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const showDialog = (options) => {
    setDialog({
      open: true,
      type: "error",
      title: "Something went wrong",
      message: "",
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: false,
      destructive: false,
      onConfirm: closeDialog,
      ...options,
    });
  };


  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [candidates, setCandidates] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");

  const [expandedCandidateId, setExpandedCandidateId] = useState(null);

  const [videoCandidate, setVideoCandidate] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [profileCandidate, setProfileCandidate] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [selectedMatchType, setSelectedMatchType] = useState(null);

  const [updatingApplicationId, setUpdatingApplicationId] =
    useState(null);

  const [applicationStatusFilter, setApplicationStatusFilter] =
    useState("all");

  const [candidateSort, setCandidateSort] =
    useState("match");

  const [matchScoreFilter, setMatchScoreFilter] =
    useState("all");

  const [selectedCandidateIds, setSelectedCandidateIds] =
    useState([]);

  const [interviewCandidate, setInterviewCandidate] =
    useState(null);

  const [interviewForm, setInterviewForm] = useState({
    scheduled_at: "",
    duration: 30,
    interview_type: "online",
    meeting_link: "",
    notes: "",
  });

  const [schedulingInterview, setSchedulingInterview] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [cancelCandidate, setCancelCandidate] =
    useState(null);

  const [emailCandidate, setEmailCandidate] =
    useState(null);

  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
  });

  const [sendingEmail, setSendingEmail] =
    useState(false);

  const [domainRoleFilter, setDomainRoleFilter] =
    useState("all");

  const [domainRoles, setDomainRoles] =
    useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage] =
    useState(10);

  const [pipelinePage, setPipelinePage] =
    useState(1);

  const [pipelineItemsPerPage] =
    useState(10);


  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const dashboard = await getEmployerDashboard();

        if (!cancelled) {
          setData(dashboard);
        }
      } catch (error) {
        console.error("Failed to load employer dashboard:", error);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =========================================================
     LOAD JOBS + CANDIDATES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCandidates = async () => {
      if (!user?.id) {
        return;
      }

      setCandidateLoading(true);
      setCandidateError("");

      try {
        const jobsResponse = await getJobs({
          employer_id: user.id,
        });

        const employerJobs = Array.isArray(jobsResponse)
          ? jobsResponse
          : jobsResponse?.results || [];

        if (cancelled) return;

        setJobs(employerJobs);

        if (!employerJobs.length) {
          setCandidates([]);
          setCandidateLoading(false);
          return;
        }

        const candidateRecords = [];

        for (const job of employerJobs) {
          if (cancelled) return;

          let eligibleStudents = [];
          let applications = [];

          try {
            const eligibleResponse =
              await getEligibleStudents(job.id);

            eligibleStudents = Array.isArray(eligibleResponse)
              ? eligibleResponse
              : eligibleResponse?.results || [];
          } catch (error) {
            console.error(
              `Failed to load eligible students for job ${job.id}:`,
              error
            );
          }

          try {
            const applicationsResponse =
              await getJobApplications(job.id);

            applications = Array.isArray(applicationsResponse)
              ? applicationsResponse
              : applicationsResponse?.results || [];
          } catch (error) {
            console.error(
              `Failed to load applications for job ${job.id}:`,
              error
            );
          }

          const applicationMap = new Map();

          applications.forEach((application) => {
            const studentId =
              application.student_id ??
              application.student?.id ??
              application.user_id ??
              application.user?.id;

            if (studentId != null) {
              applicationMap.set(
                `${studentId}-${job.id}`,
                application
              );
            }
          });

          eligibleStudents.forEach((student) => {
            const studentId =
              student.id ??
              student.student_id ??
              student.user_id;

            if (studentId == null) return;

            const application =
              applicationMap.get(
                `${studentId}-${job.id}`
              );

            candidateRecords.push({
              ...student,
              id: studentId,
              job_id: job.id,
              job_title:
                job.title ||
                job.job_title ||
                "Untitled Position",
              application_id:
                application?.id ||
                application?.application_id ||
                null,
              application_status:
                application?.status ||
                application?.application_status ||
                "submitted",
              application_data:
                application || null,
              has_video: Boolean(
                application?.video
              ),
            });
          });
        }

        /*
          Deduplicate candidates.

          Preference:
          1. Candidate with video
          2. Candidate with application
          3. Higher skill match
        */

        const candidateMap = new Map();

        candidateRecords.forEach((candidate) => {
          const existing =
            candidateMap.get(candidate.id);

          if (!existing) {
            candidateMap.set(
              candidate.id,
              candidate
            );
            return;
          }

          const existingPriority =
            (existing.has_video ? 3 : 0) +
            (existing.application_id ? 2 : 0) +
            Number(existing.skill_match || 0) / 100;

          const currentPriority =
            (candidate.has_video ? 3 : 0) +
            (candidate.application_id ? 2 : 0) +
            Number(candidate.skill_match || 0) / 100;

          if (currentPriority > existingPriority) {
            candidateMap.set(
              candidate.id,
              candidate
            );
          }
        });

        let initialCandidates = Array.from(
          candidateMap.values()
        ).sort(
          (a, b) =>
            Number(b.skill_match || 0) -
            Number(a.skill_match || 0)
        );

        if (!cancelled) {
          setCandidates(initialCandidates);
        }

        /*
          Load existing interviews.
        */

        const candidatesWithInterviews =
          await Promise.all(
            initialCandidates.map(async (candidate) => {
              if (!candidate.application_id) {
                return candidate;
              }

              try {
                const interview =
                  await getInterview(
                    candidate.job_id,
                    candidate.application_id
                  );

                return {
                  ...candidate,
                  interview:
                    interview || null,
                };
              } catch (error) {
                if (
                  error?.response?.status === 404 ||
                  error?.status === 404
                ) {
                  return candidate;
                }

                return candidate;
              }
            })
          );

        if (cancelled) return;

        const finalMap = new Map();

        candidatesWithInterviews.forEach(
          (candidate) => {
            const existing =
              finalMap.get(candidate.id);

            if (!existing) {
              finalMap.set(
                candidate.id,
                candidate
              );
              return;
            }

            const existingPriority =
              (existing.has_video ? 3 : 0) +
              (existing.application_id ? 2 : 0) +
              Number(existing.skill_match || 0) / 100;

            const currentPriority =
              (candidate.has_video ? 3 : 0) +
              (candidate.application_id ? 2 : 0) +
              Number(candidate.skill_match || 0) / 100;

            if (currentPriority > existingPriority) {
              finalMap.set(
                candidate.id,
                candidate
              );
            }
          }
        );

        const finalCandidates =
          Array.from(finalMap.values()).sort(
            (a, b) =>
              Number(b.skill_match || 0) -
              Number(a.skill_match || 0)
          );

        setCandidates(finalCandidates);
      } catch (error) {
        console.error(
          "Failed to load employer candidates:",
          error
        );

        if (!cancelled) {
          setCandidateError(
            "Unable to load candidates right now."
          );
        }
      } finally {
        if (!cancelled) {
          setCandidateLoading(false);
        }
      }
    };

    loadCandidates();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);


  /* =========================================================
     DOMAIN ROLES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async () => {
      try {
        const response = await getDomainRoles();

        if (cancelled) return;

        const roles = Array.isArray(response)
          ? response
          : response?.results || [];

        setDomainRoles(roles);
      } catch (error) {
        console.error(
          "Failed to load domain roles:",
          error
        );

        if (!cancelled) {
          setDomainRoles([]);
        }
      }
    };

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =========================================================
     PROFILE
  ========================================================= */

  const handleViewProfile = async (candidate) => {
    setProfileCandidate(candidate);
    setCandidateProfile(null);
    setLoadingProfile(true);

    try {
      const profile =
        await getUserProfile(candidate.id);

      setCandidateProfile(profile);
    } catch (error) {
      console.error(
        "Failed to load candidate profile:",
        error
      );

      setCandidateProfile(null);

      showDialog({
        type: "error",
        title: "Unable to Load Profile",
        message:
          "The candidate profile could not be loaded right now.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };


  /* =========================================================
     APPLICATION STATUS
  ========================================================= */

  const handleApplicationStatus = async (
    candidate,
    status
  ) => {
    const targetId =
      candidate.application_id ||
      candidate.id;

    setUpdatingApplicationId(targetId);

    try {
      const response =
        await updateApplicationStatus(
          candidate.job_id,
          targetId,
          status
        );

      const returnedId =
        response?.id ||
        candidate.application_id ||
        targetId;

      const returnedStatus =
        response?.status ||
        status;

      setCandidates((prev) =>
        prev.map((item) => {
          if (item.id !== candidate.id) {
            return item;
          }

          return {
            ...item,
            application_id:
              item.application_id ||
              returnedId,
            application_status:
              returnedStatus,
            application_data:
              item.application_data
                ? {
                    ...item.application_data,
                    status: returnedStatus,
                  }
                : item.application_data,
          };
        })
      );
    } catch (error) {
      console.error(
        "Failed to update application status:",
        error
      );

      showDialog({
        type: "error",
        title: "Status Update Failed",
        message:
          "We could not update the application status. Please try again.",
      });
    } finally {
      setUpdatingApplicationId(null);
    }
  };


  /* =========================================================
     VIDEO
  ========================================================= */

  const handleViewApplicationVideo = async (
    candidate
  ) => {
    if (!candidate.application_id) {
      return;
    }

    setVideoCandidate(candidate);
    setVideoUrl("");
    setLoadingVideo(true);

    try {
      const response =
        await getApplicationVideoUrl(
          candidate.job_id,
          candidate.application_id
        );

      setVideoUrl(
        response?.url ||
        response?.video_url ||
        ""
      );
    } catch (error) {
      console.error(
        "Failed to load application video:",
        error
      );

      setVideoCandidate(null);
      setVideoUrl("");

      showDialog({
        type: "error",
        title: "Video Unavailable",
        message:
          "The candidate video could not be loaded right now.",
      });
    } finally {
      setLoadingVideo(false);
    }
  };


  /* =========================================================
     INTERVIEW
  ========================================================= */

  const handleScheduleInterview = async (event) => {
    event.preventDefault();

    if (
      !interviewCandidate?.application_id
    ) {
      return;
    }

    setSchedulingInterview(true);

    try {
      const existingInterview =
        interviewCandidate.interview;

      const isEditing =
        existingInterview &&
        existingInterview.status !==
          "cancelled";

      let response;

      if (isEditing) {
        response = await updateInterview(
          interviewCandidate.job_id,
          interviewCandidate.application_id,
          interviewForm
        );
      } else {
        response = await scheduleInterview(
          interviewCandidate.job_id,
          interviewCandidate.application_id,
          interviewForm
        );
      }

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id ===
          interviewCandidate.id
            ? {
                ...candidate,
                interview:
                  response || {
                    ...interviewForm,
                    status: "scheduled",
                  },
              }
            : candidate
        )
      );

      setInterviewCandidate(null);

      setInterviewForm({
        scheduled_at: "",
        duration: 30,
        interview_type: "online",
        meeting_link: "",
        notes: "",
      });

      showDialog({
        type: "success",
        title: isEditing
          ? "Interview Updated"
          : "Interview Scheduled",
        message: isEditing
          ? `The interview for ${interviewCandidate.name} has been updated successfully.`
          : `The interview for ${interviewCandidate.name} has been scheduled successfully.`,
        confirmText: "Done",
      });
    } catch (error) {
      console.error(
        "Failed to schedule interview:",
        error
      );

      showDialog({
        type: "error",
        title: "Interview Scheduling Failed",
        message:
          "We could not save the interview details. Please check the information and try again.",
      });
    } finally {
      setSchedulingInterview(false);
    }
  };


  const handleSendApplicantEmail = async (
    event
  ) => {
    event.preventDefault();

    if (!emailCandidate?.application_id) {
      return;
    }

    setSendingEmail(true);

    try {
      await sendApplicantEmail(
        emailCandidate.job_id,
        emailCandidate.application_id,
        emailForm
      );

      setEmailCandidate(null);

      setEmailForm({
        subject: "",
        message: "",
      });

      showDialog({
        type: "success",
        title: "Email Sent",
        message: `Your email has been sent to ${emailCandidate.name}.`,
        confirmText: "Done",
      });
    } catch (error) {
      console.error(
        "Failed to send applicant email:",
        error
      );

      showDialog({
        type: "error",
        title: "Email Failed",
        message:
          "We could not send the email. Please try again.",
      });
    } finally {
      setSendingEmail(false);
    }
  };


  const handleCancelInterview = async (
    candidate
  ) => {
    if (
      !candidate?.application_id ||
      !candidate?.interview
    ) {
      return;
    }

    setSchedulingInterview(true);

    try {
      const response =
        await cancelInterview(
          candidate.job_id,
          candidate.application_id
        );

      setCandidates((prev) =>
        prev.map((item) =>
          item.id === candidate.id
            ? {
                ...item,
                interview:
                  response || {
                    ...item.interview,
                    status: "cancelled",
                  },
              }
            : item
        )
      );

      setShowCancelModal(false);
      setCancelCandidate(null);
      setInterviewCandidate(null);

      showDialog({
        type: "success",
        title: "Interview Cancelled",
        message: `The interview for ${candidate.name} has been cancelled.`,
        confirmText: "Done",
      });
    } catch (error) {
      console.error(
        "Failed to cancel interview:",
        error
      );

      showDialog({
        type: "error",
        title: "Cancellation Failed",
        message:
          "We could not cancel the interview. Please try again.",
      });
    } finally {
      setSchedulingInterview(false);
    }
  };


  /* =========================================================
     BULK APPLICATION STATUS
  ========================================================= */

  const handleBulkApplicationStatus = async (
    status
  ) => {
    if (!selectedCandidateIds.length) {
      return;
    }

    try {
      await Promise.all(
        selectedCandidateIds.map(
          async (candidateId) => {
            const candidate =
              candidates.find(
                (item) =>
                  item.id === candidateId
              );

            if (!candidate) return;

            const targetId =
              candidate.application_id ||
              candidate.id;

            await updateApplicationStatus(
              candidate.job_id,
              targetId,
              status
            );
          }
        )
      );

      setCandidates((prev) =>
        prev.map((candidate) =>
          selectedCandidateIds.includes(
            candidate.id
          )
            ? {
                ...candidate,
                application_status:
                  status,
                application_data:
                  candidate.application_data
                    ? {
                        ...candidate.application_data,
                        status,
                      }
                    : candidate.application_data,
              }
            : candidate
        )
      );

      setSelectedCandidateIds([]);

      showDialog({
        type: "success",
        title: "Applications Updated",
        message: `${selectedCandidateIds.length} candidate${
          selectedCandidateIds.length === 1
            ? ""
            : "s"
        } moved to ${getStatusLabel(status)}.`,
        confirmText: "Done",
      });
    } catch (error) {
      console.error(
        "Failed bulk application update:",
        error
      );

      showDialog({
        type: "error",
        title: "Bulk Update Failed",
        message:
          "Some applications could not be updated. Please try again.",
      });
    }
  };


  /* =========================================================
     ANALYTICS
  ========================================================= */

  const matchData = [
    {
      name: "Strong",
      value: candidates.filter(
        (candidate) =>
          Number(candidate.skill_match || 0) >= 80
      ).length,
    },
    {
      name: "Good",
      value: candidates.filter(
        (candidate) =>
          Number(candidate.skill_match || 0) >= 60 &&
          Number(candidate.skill_match || 0) < 80
      ).length,
    },
    {
      name: "Possible",
      value: candidates.filter(
        (candidate) =>
          Number(candidate.skill_match || 0) < 60
      ).length,
    },
  ];


  const matchColors = [
    "#f97316",
    "#fb7185",
    "#f59e0b",
  ];


  /* =========================================================
     FILTERED CANDIDATES
  ========================================================= */

  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    if (domainRoleFilter !== "all") {
      result = result.filter(
        (candidate) =>
          String(candidate.domain_role_id) ===
          String(domainRoleFilter)
      );
    }

    if (applicationStatusFilter !== "all") {
      result = result.filter(
        (candidate) =>
          String(
            candidate.application_status ||
              "submitted"
          ).toLowerCase() ===
          applicationStatusFilter.toLowerCase()
      );
    }

    if (matchScoreFilter !== "all") {
      result = result.filter((candidate) => {
        const score = Number(
          candidate.skill_match || 0
        );

        if (matchScoreFilter === "80+") {
          return score >= 80;
        }

        if (matchScoreFilter === "60+") {
          return score >= 60;
        }

        if (matchScoreFilter === "below60") {
          return score < 60;
        }

        return true;
      });
    }

    if (candidateSort === "match") {
      result.sort(
        (a, b) =>
          Number(b.skill_match || 0) -
          Number(a.skill_match || 0)
      );
    }

    if (candidateSort === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    if (candidateSort === "status") {
      result.sort((a, b) =>
        String(
          a.application_status || "submitted"
        ).localeCompare(
          String(
            b.application_status || "submitted"
          )
        )
      );
    }

    return result;
  }, [
    candidates,
    domainRoleFilter,
    applicationStatusFilter,
    matchScoreFilter,
    candidateSort,
  ]);


  const totalPages = Math.ceil(
    filteredCandidates.length /
      itemsPerPage
  );


  const paginatedCandidates =
    filteredCandidates.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );


  const pipelineCandidates =
    candidates.filter(
      (candidate) =>
        candidate.application_status ===
          "shortlisted" ||
        (candidate.interview &&
          candidate.interview.status !==
            "cancelled")
    );


  const pipelineTotalPages = Math.ceil(
    pipelineCandidates.length /
      pipelineItemsPerPage
  );


  const paginatedPipelineCandidates =
    pipelineCandidates.slice(
      (pipelinePage - 1) *
        pipelineItemsPerPage,
      pipelinePage *
        pipelineItemsPerPage
    );


  const sortedDomainRoles = Array.from(
    new Map(
      domainRoles.map((role) => [
        role.domain_role_id,
        role,
      ])
    ).values()
  ).sort((a, b) =>
    String(
      a.domain_name || ""
    ).localeCompare(
      String(b.domain_name || "")
    )
  );


  /* =========================================================
     COUNTS
  ========================================================= */

  const shortlistedCount =
    candidates.filter(
      (candidate) =>
        candidate.application_status ===
        "shortlisted"
    ).length;

  const submittedCount =
    candidates.filter(
      (candidate) =>
        !candidate.application_status ||
        candidate.application_status ===
          "submitted"
    ).length;

  const rejectedCount =
    candidates.filter(
      (candidate) =>
        candidate.application_status ===
        "rejected"
    ).length;

  const scheduledInterviewCount =
    candidates.filter(
      (candidate) =>
        candidate.interview &&
        candidate.interview.status !==
          "cancelled"
    ).length;


  const averageMatch =
    candidates.length
      ? Math.round(
          candidates.reduce(
            (total, candidate) =>
              total +
              Number(
                candidate.skill_match || 0
              ),
            0
          ) / candidates.length
        )
      : 0;


  /* =========================================================
     SELECTION
  ========================================================= */

  const allCurrentPageSelected =
    paginatedCandidates.length > 0 &&
    paginatedCandidates.every(
      (candidate) =>
        selectedCandidateIds.includes(
          candidate.id
        )
    );


  const toggleCandidateSelection = (
    candidateId
  ) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter(
            (id) => id !== candidateId
          )
        : [...prev, candidateId]
    );
  };


  const toggleSelectAllCurrentPage = () => {
    const currentIds =
      paginatedCandidates.map(
        (candidate) => candidate.id
      );

    if (allCurrentPageSelected) {
      setSelectedCandidateIds((prev) =>
        prev.filter(
          (id) => !currentIds.includes(id)
        )
      );
    } else {
      setSelectedCandidateIds((prev) =>
        Array.from(
          new Set([
            ...prev,
            ...currentIds,
          ])
        )
      );
    }
  };


  /* =========================================================
     RESET PAGINATION ON FILTER CHANGE
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    applicationStatusFilter,
    matchScoreFilter,
    domainRoleFilter,
    candidateSort,
  ]);


  useEffect(() => {
    setPipelinePage(1);
  }, [candidates.length]);


  /* =========================================================
     INTERVIEW FORM OPEN
  ========================================================= */

  const openInterviewForm = (candidate) => {
    setInterviewCandidate(candidate);

    if (
      candidate.interview &&
      candidate.interview.status !==
        "cancelled"
    ) {
      setInterviewForm({
        scheduled_at:
          formatDateTimeLocal(
            candidate.interview.scheduled_at
          ),
        duration:
          candidate.interview.duration ||
          30,
        interview_type:
          candidate.interview.interview_type ||
          "online",
        meeting_link:
          candidate.interview.meeting_link ||
          "",
        notes:
          candidate.interview.notes ||
          "",
      });
    } else {
      setInterviewForm({
        scheduled_at: "",
        duration: 30,
        interview_type: "online",
        meeting_link: "",
        notes: "",
      });
    }
  };


  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-slate-900 pb-12">

      {/* =====================================================
          HERO / TALENT OPERATIONS HEADER
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[30px] mx-1 mt-1 shadow-[0_25px_70px_rgba(95,35,20,0.24)]">

        <div className="absolute inset-0 bg-gradient-to-br from-[#24130f] via-[#7c2d12] to-[#be123c]" />

        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#fb923c]/25 blur-3xl" />

        <div className="absolute right-20 top-20 h-56 w-56 rounded-full bg-[#facc15]/20 blur-3xl" />

        <div className="absolute -left-20 bottom-[-120px] h-72 w-72 rounded-full bg-[#fb7185]/20 blur-3xl" />

        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
          >
            <path
              d="M-50 420 C180 250 260 480 460 300 C650 130 720 350 1050 100"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />

            <path
              d="M-50 470 C180 300 300 510 490 350 C690 180 760 380 1050 150"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="relative px-6 py-8 md:px-10 md:py-10">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-orange-100 backdrop-blur-md shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-300" />
                </span>

                Talent Operations Center
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.02]">
                Build your next
                <span className="block text-orange-200">
                  great team.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm md:text-base leading-7 text-orange-50/80">
                Welcome back,{" "}
                <span className="font-bold text-white">
                  {user?.name?.split(" ")[0] ||
                    "there"}
                </span>
                . Discover candidates, review talent
                matches, manage interviews, and move
                your hiring pipeline forward.
              </p>

            </div>


            <div className="relative w-full lg:w-[310px]">

              <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.14]">

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-100/70">
                    Hiring pulse
                  </span>

                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-200 border border-emerald-300/20">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-5 flex items-end gap-3">

                  <div className="text-5xl font-black text-white">
                    {averageMatch}%
                  </div>

                  <div className="pb-1 text-xs text-orange-100/70">
                    average candidate
                    <br />
                    match score
                  </div>

                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-300 via-amber-300 to-rose-300 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        averageMatch,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-black/10 p-3">
                    <div className="text-xl font-bold text-white">
                      {candidates.length}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-orange-100/60">
                      Talent Pool
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/10 p-3">
                    <div className="text-xl font-bold text-white">
                      {scheduledInterviewCount}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-orange-100/60">
                      Interviews
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* KPI STRIP */}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {[
              {
                label: "Open Positions",
                value:
                  data?.jobOpenings ?? jobs.length,
                detail: "Active listings",
                icon: "â—ˆ",
              },
              {
                label: "New Applicants",
                value:
                  data?.newApplicants ??
                  submittedCount,
                detail: "Awaiting review",
                icon: "âœ¦",
              },
              {
                label: "Top Matches",
                value:
                  data?.topMatches ??
                  matchData[0].value,
                detail: "80%+ compatibility",
                icon: "â—†",
              },
              {
                label: "Shortlisted",
                value: shortlistedCount,
                detail: "Moving forward",
                icon: "âœ“",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="group rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.16] hover:shadow-[0_22px_45px_rgba(0,0,0,0.2)]"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-orange-100/60">
                      {item.label}
                    </p>

                    <div className="mt-2 text-3xl font-black text-white">
                      {item.value}
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-200 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {item.icon}
                  </div>

                </div>

                <p className="mt-2 text-[11px] text-orange-100/55">
                  {item.detail}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>


      {/* =====================================================
          QUICK OVERVIEW
      ===================================================== */}

      <section className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Hiring Pulse */}

        <div className="xl:col-span-5 rounded-[26px] border border-orange-100 bg-white shadow-[0_15px_45px_rgba(90,40,20,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(90,40,20,0.15)]">

          <div className="flex items-center justify-between border-b border-orange-100 px-6 py-5">

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-orange-500">
                Candidate intelligence
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                Hiring Pulse
              </h2>
            </div>

            <div className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600">
              {candidates.length} profiles
            </div>

          </div>


          <div className="p-6">

            <div className="h-[245px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={matchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(entry) =>
                      setSelectedMatchType(
                        entry.name
                      )
                    }
                  >
                    {matchData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            matchColors[index]
                          }
                          className="cursor-pointer outline-none transition-opacity"
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                  />

                </PieChart>
              </ResponsiveContainer>

            </div>


            <div className="mt-5 grid grid-cols-3 gap-2">

              {matchData.map(
                (item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() =>
                      setSelectedMatchType(
                        item.name
                      )
                    }
                    className="group rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50 hover:shadow-md"
                  >

                    <div
                      className="h-2 w-2 rounded-full mb-2 transition-transform duration-300 group-hover:scale-125"
                      style={{
                        background:
                          matchColors[index],
                      }}
                    />

                    <div className="text-lg font-black text-slate-900">
                      {item.value}
                    </div>

                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {item.name}
                    </div>

                  </button>
                )
              )}

            </div>


            {selectedMatchType && (
              <div className="mt-5 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-rose-50 p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold text-orange-700">
                      {selectedMatchType} Matches
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Candidates in this match group
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMatchType(null)
                    }
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
                  >
                    Clear
                  </button>

                </div>


                <div className="mt-3 space-y-2">

                  {candidates
                    .filter(
                      (candidate) =>
                        getMatchCategory(
                          candidate.skill_match
                        ) ===
                        selectedMatchType
                    )
                    .slice(0, 5)
                    .map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() =>
                          handleViewProfile(
                            candidate
                          )
                        }
                        className="w-full flex items-center justify-between rounded-xl bg-white px-3 py-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-xs font-black text-white">
                            {getInitials(
                              candidate.name
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-slate-900">
                              {candidate.name}
                            </div>

                            <div className="truncate text-[10px] text-slate-500">
                              {candidate.domain_role ||
                                "Candidate"}
                            </div>
                          </div>

                        </div>

                        <span className="ml-3 shrink-0 text-sm font-black text-orange-600">
                          {Math.round(
                            Number(
                              candidate.skill_match ||
                                0
                            )
                          )}
                          %
                        </span>

                      </button>
                    ))}

                </div>

              </div>
            )}

          </div>
        </div>


        {/* Recent Roles */}

        <div className="xl:col-span-4 rounded-[26px] border border-orange-100 bg-white shadow-[0_15px_45px_rgba(90,40,20,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(90,40,20,0.15)]">

          <div className="border-b border-orange-100 px-6 py-5">

            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-rose-500">
              Recruitment activity
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              Recent Roles
            </h2>

          </div>

          <div className="p-5">

            {jobs.length ? (
              <div className="space-y-3">

                {jobs.slice(0, 5).map(
                  (job, index) => (
                    <div
                      key={
                        job.id ||
                        `${job.title}-${index}`
                      }
                      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50 hover:shadow-[0_12px_30px_rgba(194,65,12,0.12)]"
                    >

                      <div className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-orange-200/30 transition-transform duration-500 group-hover:scale-150" />

                      <div className="relative flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fb7185] text-lg text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">
                          â—ˆ
                        </div>

                        <div className="min-w-0">

                          <div className="truncate text-sm font-bold text-slate-900">
                            {job.title ||
                              job.job_title ||
                              "Untitled Position"}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-500">
                            Posted{" "}
                            {formatDate(
                              job.created_at ||
                                job.createdAt
                            )}
                          </div>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 text-center">

                <div>
                  <div className="text-3xl">
                    â—ˆ
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    No listings yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Your active roles will appear here.
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>


        {/* Skills Intelligence */}

        <div className="xl:col-span-3 rounded-[26px] border border-slate-900 bg-[#19120f] shadow-[0_18px_50px_rgba(30,15,10,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(30,15,10,0.28)]">

          <div className="px-5 py-5">

            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-orange-300">
              Market signal
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Skills Intelligence
            </h2>

            <p className="mt-1 text-[11px] text-orange-100/50">
              Candidate skill availability
            </p>

          </div>

          <div className="h-[330px] px-2 pb-4">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={data?.skillsInsights || []}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 45,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="skill"
                  tick={{
                    fill: "#fed7aa",
                    fontSize: 9,
                  }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                />

                <YAxis
                  tick={{
                    fill: "#fed7aa",
                    fontSize: 9,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #fed7aa",
                    background: "#fffaf5",
                    color: "#1f2937",
                  }}
                  formatter={(value, name) => [
                    value,
                    name,
                  ]}
                />

                <Legend
                  wrapperStyle={{
                    color: "#fed7aa",
                    fontSize: "10px",
                  }}
                />

                <Bar
                  dataKey="value"
                  name="Skill Level"
                  fill="#fb7185"
                  radius={[
                    7,
                    7,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>
        </div>

      </section>


      {/* =====================================================
          TALENT SHORTLIST
      ===================================================== */}

      <section className="mt-6 overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_18px_55px_rgba(90,40,20,0.10)]">

        {/* Section Header */}

        <div className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-r from-[#fff7ed] via-[#fff1f2] to-[#fffbeb] px-5 py-6 md:px-7">

          <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-orange-200/30 blur-2xl" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_0_5px_rgba(249,115,22,0.12)]" />

                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-orange-600">
                  Talent discovery
                </span>

              </div>

              <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                Recommended Candidates
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Review compatibility, experience,
                applications and next actions.
              </p>

            </div>


            {/* Status filters */}

            <div className="flex flex-wrap gap-2">

              {[
                {
                  key: "all",
                  label: "All",
                  count:
                    candidates.length,
                },
                {
                  key: "submitted",
                  label: "Submitted",
                  count:
                    submittedCount,
                },
                {
                  key: "shortlisted",
                  label: "Shortlisted",
                  count:
                    shortlistedCount,
                },
                {
                  key: "rejected",
                  label: "Rejected",
                  count:
                    rejectedCount,
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() =>
                    setApplicationStatusFilter(
                      filter.key
                    )
                  }
                  className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-300 ${
                    applicationStatusFilter ===
                    filter.key
                      ? "border-orange-500 bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]"
                      : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`ml-1.5 ${
                      applicationStatusFilter ===
                      filter.key
                        ? "text-orange-100"
                        : "text-slate-400"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}

            </div>

          </div>


          {/* Filters */}

          <div className="relative mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">

            <div className="relative">

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                â†•
              </span>

              <select
                value={candidateSort}
                onChange={(event) =>
                  setCandidateSort(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-300 hover:border-orange-300 hover:shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="match">
                  Best Match
                </option>

                <option value="name">
                  Candidate Name
                </option>

                <option value="status">
                  Application Status
                </option>
              </select>

            </div>


            <div className="relative">

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                â—‡
              </span>

              <select
                value={domainRoleFilter}
                onChange={(event) =>
                  setDomainRoleFilter(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-300 hover:border-orange-300 hover:shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">
                  All Roles
                </option>

                {sortedDomainRoles.map(
                  (role) => (
                    <option
                      key={
                        role.domain_role_id
                      }
                      value={
                        role.domain_role_id
                      }
                    >
                      {role.domain_name}
                    </option>
                  )
                )}
              </select>

            </div>


            <div className="flex gap-2">

              {[
                ["all", "All"],
                ["80+", "80%+"],
                ["60+", "60%+"],
                ["below60", "<60%"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setMatchScoreFilter(
                      value
                    )
                  }
                  className={`flex-1 rounded-xl border px-2 py-2 text-[11px] font-bold transition-all duration-300 ${
                    matchScoreFilter === value
                      ? "border-rose-500 bg-rose-500 text-white shadow-[0_7px_18px_rgba(244,63,94,0.22)]"
                      : "border-slate-200 bg-white text-slate-500 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm"
                  }`}
                >
                  {label}
                </button>
              ))}

            </div>

          </div>

        </div>


        {/* Bulk Action Bar */}

        <div className="flex flex-col gap-3 border-b border-slate-100 bg-[#fffdfb] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">

          <label className="flex cursor-pointer items-center gap-3 text-xs font-semibold text-slate-600">

            <input
              type="checkbox"
              checked={
                allCurrentPageSelected
              }
              onChange={
                toggleSelectAllCurrentPage
              }
              className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
            />

            Select candidates on this page

          </label>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              disabled={
                !selectedCandidateIds.length
              }
              onClick={() =>
                handleBulkApplicationStatus(
                  "shortlisted"
                )
              }
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              âœ“ Shortlist Selected
            </button>

            <button
              type="button"
              disabled={
                !selectedCandidateIds.length
              }
              onClick={() =>
                handleBulkApplicationStatus(
                  "rejected"
                )
              }
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ã— Reject Selected
            </button>

          </div>

        </div>


        {/* Candidate List */}

        <div className="p-5 md:p-7">

          {candidateLoading && (
            <div className="space-y-4">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="h-5 w-48 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-72 rounded bg-slate-200" />
                  <div className="mt-5 h-2 w-full rounded bg-slate-200" />
                </div>
              ))}

            </div>
          )}


          {!candidateLoading &&
            candidateError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
                {candidateError}
              </div>
            )}


          {!candidateLoading &&
            !candidateError &&
            !filteredCandidates.length && (
              <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-gradient-to-br from-orange-50/50 to-rose-50/50 text-center">

                <div>

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
                    â—‡
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-800">
                    No candidates found
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    Try changing the filters or
                    wait for new applications to
                    arrive.
                  </p>

                </div>

              </div>
            )}


          {!candidateLoading &&
            !candidateError &&
            paginatedCandidates.length > 0 && (
              <div className="space-y-4">

                {paginatedCandidates.map(
                  (candidate) => {
                    const score = Math.round(
                      Number(
                        candidate.skill_match ||
                          0
                      )
                    );

                    const matchCategory =
                      getMatchCategory(score);

                    const targetId =
                      candidate.application_id ||
                      candidate.id;

                    return (
                      <div
                        key={`${candidate.id}-${candidate.job_id}`}
                        className="group relative overflow-hidden rounded-[25px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_22px_50px_rgba(194,65,12,0.13)]"
                      >

                        {/* Accent edge */}

                        <div
                          className={`absolute left-0 top-0 h-full w-1.5 ${
                            score >= 80
                              ? "bg-gradient-to-b from-orange-400 to-rose-500"
                              : score >= 60
                              ? "bg-gradient-to-b from-amber-400 to-orange-500"
                              : "bg-gradient-to-b from-slate-300 to-slate-400"
                          }`}
                        />


                        <div className="p-5 md:p-6">

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

                            {/* Checkbox */}

                            <div className="flex items-start">

                              <input
                                type="checkbox"
                                checked={selectedCandidateIds.includes(
                                  candidate.id
                                )}
                                onChange={() =>
                                  toggleCandidateSelection(
                                    candidate.id
                                  )
                                }
                                className="mt-2 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                              />

                            </div>


                            {/* Avatar */}

                            <div className="shrink-0">

                              <div className="relative">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#fb7185] text-lg font-black text-white shadow-[0_10px_25px_rgba(234,88,12,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:rotate-1">
                                  {getInitials(
                                    candidate.name
                                  )}
                                </div>

                                {candidate.has_video && (
                                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[9px] text-white shadow-md">
                                    â–¶
                                  </span>
                                )}

                              </div>

                            </div>


                            {/* Candidate info */}

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="truncate text-lg font-black text-slate-900 transition-colors duration-300 group-hover:text-orange-700">
                                      {candidate.name ||
                                        "Candidate"}
                                    </h3>

                                    <span
                                      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${getStatusClasses(
                                        candidate.application_status
                                      )}`}
                                    >
                                      {getStatusLabel(
                                        candidate.application_status
                                      )}
                                    </span>

                                  </div>

                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {candidate.domain_role ||
                                      candidate.role_target ||
                                      "Professional Candidate"}
                                  </p>

                                  <p className="mt-1 text-[11px] text-slate-400">
                                    Applied for{" "}
                                    <span className="font-semibold text-slate-500">
                                      {candidate.job_title}
                                    </span>
                                  </p>

                                </div>


                                {/* Match score */}

                                <div className="shrink-0">

                                  <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-rose-50 px-4 py-3 text-center shadow-sm transition-all duration-300 group-hover:shadow-md">

                                    <div className="text-2xl font-black text-orange-600">
                                      {score}%
                                    </div>

                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                                      {matchCategory} Match
                                    </div>

                                  </div>

                                </div>

                              </div>


                              {/* Score bar */}

                              <div className="mt-5">

                                <div className="mb-2 flex items-center justify-between">

                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Compatibility
                                  </span>

                                  <span className="text-[10px] font-black text-slate-600">
                                    {score}/100
                                  </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400 transition-all duration-700 group-hover:brightness-110"
                                    style={{
                                      width: `${Math.min(
                                        score,
                                        100
                                      )}%`,
                                    }}
                                  />

                                </div>

                              </div>


                              {/* Skills */}

                              <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-3">

                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">

                                  <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600">
                                    Matched
                                  </div>

                                  <div className="mt-1 text-[11px] leading-5 text-slate-600">
                                    {candidate.matched_skills?.length
                                      ? candidate.matched_skills.join(
                                          ", "
                                        )
                                      : "No direct matches listed"}
                                  </div>

                                </div>


                                <div className="rounded-xl border border-orange-100 bg-orange-50/70 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">

                                  <div className="text-[9px] font-black uppercase tracking-wider text-orange-600">
                                    Developing
                                  </div>

                                  <div className="mt-1 text-[11px] leading-5 text-slate-600">
                                    {candidate.partial_skills
                                      ?.length
                                      ? candidate.partial_skills
                                          .map(
                                            (skill) =>
                                              `${skill.skill} (${skill.student_level}/${skill.required_level})`
                                          )
                                          .join(
                                            ", "
                                          )
                                      : "No developing skills listed"}
                                  </div>

                                </div>


                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">

                                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                                    Missing
                                  </div>

                                  <div className="mt-1 text-[11px] leading-5 text-slate-600">
                                    {candidate.missing_skills
                                      ?.length
                                      ? candidate.missing_skills.join(
                                          ", "
                                        )
                                      : "No major gaps listed"}
                                  </div>

                                </div>

                              </div>


                              {/* Actions */}

                              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4">

                                <div className="flex flex-wrap items-center gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedCandidateId(
                                        expandedCandidateId ===
                                          candidate.id
                                          ? null
                                          : candidate.id
                                      )
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md"
                                  >
                                    {expandedCandidateId ===
                                    candidate.id
                                      ? "Hide Match Details â†‘"
                                      : "Why Recommended? â†“"}
                                  </button>


                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewProfile(
                                        candidate
                                      )
                                    }
                                    className="rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_10px_25px_rgba(234,88,12,0.25)]"
                                  >
                                    Review Candidate
                                  </button>


                                  <button
                                    type="button"
                                    disabled={
                                      !candidate.application_id
                                    }
                                    onClick={() => {
                                      setEmailCandidate(
                                        candidate
                                      );

                                      setEmailForm({
                                        subject: "",
                                        message: "",
                                      });
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    âœ‰ Send Email
                                  </button>


                                  {candidate.application_id &&
                                    candidate.application_data?.video && (
                                      <button
                                        type="button"
                                        disabled={
                                          loadingVideo
                                        }
                                        onClick={() =>
                                          handleViewApplicationVideo(
                                            candidate
                                          )
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:shadow-md disabled:opacity-50"
                                      >
                                        ðŸŽ¥ View Video
                                      </button>
                                    )}

                                </div>


                                <div className="flex flex-wrap gap-2">

                                  {candidate.application_status !==
                                    "shortlisted" && (
                                    <button
                                      type="button"
                                      disabled={
                                        updatingApplicationId ===
                                        targetId
                                      }
                                      onClick={() =>
                                        handleApplicationStatus(
                                          candidate,
                                          "shortlisted"
                                        )
                                      }
                                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-bold text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md disabled:opacity-50"
                                    >
                                      {updatingApplicationId ===
                                      targetId
                                        ? "Updating..."
                                        : "âœ“ Shortlist"}
                                    </button>
                                  )}


                                  {candidate.application_status !==
                                    "rejected" && (
                                    <button
                                      type="button"
                                      disabled={
                                        updatingApplicationId ===
                                        targetId
                                      }
                                      onClick={() => {
                                        showDialog({
                                          type: "confirm",
                                          title:
                                            "Reject Candidate?",
                                          message: `Are you sure you want to reject ${candidate.name}?`,
                                          confirmText:
                                            "Reject",
                                          cancelText:
                                            "Cancel",
                                          showCancel:
                                            true,
                                          destructive:
                                            true,
                                          onConfirm:
                                            () => {
                                              closeDialog();

                                              handleApplicationStatus(
                                                candidate,
                                                "rejected"
                                              );
                                            },
                                        });
                                      }}
                                      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[11px] font-bold text-rose-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md disabled:opacity-50"
                                    >
                                      {updatingApplicationId ===
                                      targetId
                                        ? "Updating..."
                                        : "Ã— Reject"}
                                    </button>
                                  )}


                                  {candidate.application_status !==
                                    "submitted" && (
                                    <button
                                      type="button"
                                      disabled={
                                        updatingApplicationId ===
                                        targetId
                                      }
                                      onClick={() =>
                                        handleApplicationStatus(
                                          candidate,
                                          "submitted"
                                        )
                                      }
                                      className="rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-[11px] font-bold text-orange-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-md disabled:opacity-50"
                                    >
                                      Move to Submitted
                                    </button>
                                  )}

                                </div>


                                {/* Application status message */}

                                <div className="text-[11px] text-slate-500">

                                  {candidate.interview?.status ===
                                    "cancelled" && (
                                    <span className="font-semibold text-rose-600">
                                      Interview has been cancelled.
                                    </span>
                                  )}

                                  {candidate.application_status ===
                                    "shortlisted" && (
                                    <span className="font-semibold text-emerald-600">
                                      Candidate is shortlisted for further review.
                                    </span>
                                  )}

                                  {candidate.application_status ===
                                    "rejected" && (
                                    <span className="font-semibold text-rose-600">
                                      Candidate was rejected for this application.
                                    </span>
                                  )}

                                  {candidate.application_status ===
                                    "selected" && (
                                    <span className="font-semibold text-amber-600">
                                      âœ“ Candidate has been selected for this position.
                                    </span>
                                  )}

                                  {(!candidate.application_status ||
                                    candidate.application_status ===
                                      "submitted") && (
                                    <span className="font-semibold text-orange-600">
                                      Application is awaiting employer review.
                                    </span>
                                  )}

                                </div>

                              </div>


                              {/* Expanded Match Details */}

                              {expandedCandidateId ===
                                candidate.id && (
                                <div className="mt-5 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-[#fff7ed] via-[#fff1f2] to-[#fffbeb] p-5">

                                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                                        Match explanation
                                      </p>

                                      <h4 className="mt-1 text-lg font-black text-slate-900">
                                        Why this candidate?
                                      </h4>
                                    </div>

                                    <div className="rounded-2xl bg-white px-5 py-3 text-center shadow-md">
                                      <div className="text-2xl font-black text-orange-600">
                                        {score}%
                                      </div>
                                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                        Overall Match
                                      </div>
                                    </div>

                                  </div>


                                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-white shadow-inner">

                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400 transition-all duration-700"
                                      style={{
                                        width: `${Math.min(
                                          score,
                                          100
                                        )}%`,
                                      }}
                                    />

                                  </div>


                                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                      <div className="text-2xl font-black text-emerald-600">
                                        {candidate
                                          .matched_skills
                                          ?.length || 0}
                                      </div>
                                      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Matched Skills
                                      </div>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                      <div className="text-2xl font-black text-orange-500">
                                        {candidate
                                          .partial_skills
                                          ?.length || 0}
                                      </div>
                                      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Developing
                                      </div>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                      <div className="text-2xl font-black text-slate-500">
                                        {candidate
                                          .missing_skills
                                          ?.length || 0}
                                      </div>
                                      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Missing
                                      </div>
                                    </div>

                                  </div>


                                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                                    <div>
                                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                        Matched Skills
                                      </div>

                                      <p className="mt-2 text-xs leading-6 text-slate-600">
                                        {candidate
                                          .matched_skills
                                          ?.length
                                          ? candidate.matched_skills.join(
                                              ", "
                                            )
                                          : "None listed"}
                                      </p>
                                    </div>


                                    <div>
                                      <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                                        Developing Skills
                                      </div>

                                      <p className="mt-2 text-xs leading-6 text-slate-600">
                                        {candidate
                                          .partial_skills
                                          ?.length
                                          ? candidate.partial_skills
                                              .map(
                                                (skill) =>
                                                  `${skill.skill} (${skill.student_level}/${skill.required_level})`
                                              )
                                              .join(
                                                ", "
                                              )
                                          : "None listed"}
                                      </p>
                                    </div>


                                    <div>
                                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Missing Skills
                                      </div>

                                      <p className="mt-2 text-xs leading-6 text-slate-600">
                                        {candidate
                                          .missing_skills
                                          ?.length
                                          ? candidate.missing_skills.join(
                                              ", "
                                            )
                                          : "None listed"}
                                      </p>
                                    </div>

                                  </div>


                                  <div className="mt-5 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">

                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                      Recommendation
                                    </div>

                                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">

                                      {score >= 80 &&
                                        "This candidate has a strong skill alignment with the position and may be suitable for the next stage of review."}

                                      {score >= 60 &&
                                        score < 80 &&
                                        "This candidate shows good alignment with the position, with some skills that may require additional evaluation."}

                                      {score < 60 &&
                                        "This candidate has partial alignment with the position. Review the skill gaps and overall profile before proceeding."}

                                    </p>

                                  </div>

                                </div>
                              )}

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}


                {/* Candidate Pagination */}

                {totalPages > 1 && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                    <span className="text-xs font-semibold text-slate-500">
                      Page {currentPage} of{" "}
                      {totalPages}
                    </span>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        disabled={
                          currentPage === 1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              page - 1
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        â† Previous
                      </button>

                      <button
                        type="button"
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              page + 1
                          )
                        }
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next â†’
                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}

        </div>

      </section>


      {/* =====================================================
          HIRING PIPELINE
      ===================================================== */}

      <section className="mt-6 overflow-hidden rounded-[28px] bg-[#19120f] shadow-[0_20px_60px_rgba(30,15,10,0.22)]">

        <div className="relative overflow-hidden px-6 py-7 md:px-8">

          <div className="absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-20 rounded-full bg-orange-500/15 blur-3xl" />

          <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                Recruitment flow
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                Hiring Pipeline
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-orange-100/50">
                Track shortlisted candidates and
                interviews from review through the next
                stage.
              </p>

            </div>


            <div className="flex gap-2">

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                <div className="text-lg font-black text-white">
                  {shortlistedCount}
                </div>

                <div className="text-[9px] uppercase tracking-wider text-orange-100/45">
                  Shortlisted
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                <div className="text-lg font-black text-white">
                  {scheduledInterviewCount}
                </div>

                <div className="text-[9px] uppercase tracking-wider text-orange-100/45">
                  Interviews
                </div>
              </div>

            </div>

          </div>


          <div className="relative mt-7">

            {paginatedPipelineCandidates.length ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {paginatedPipelineCandidates.map(
                  (candidate) => {
                    const interviewScheduled =
                      candidate.interview &&
                      candidate.interview.status !==
                        "cancelled";

                    return (
                      <div
                        key={`pipeline-${candidate.id}`}
                        className="group rounded-[24px] border border-white/10 bg-white/[0.055] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/30 hover:bg-white/[0.08] hover:shadow-[0_20px_45px_rgba(0,0,0,0.2)]"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-xs font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                              {getInitials(
                                candidate.name
                              )}
                            </div>

                            <div className="min-w-0">

                              <div className="truncate text-sm font-black text-white">
                                {candidate.name}
                              </div>

                              <div className="truncate text-[10px] text-orange-100/45">
                                {candidate.job_title}
                              </div>

                            </div>

                          </div>


                          <div className="shrink-0 rounded-xl bg-orange-400/10 px-3 py-2 text-center">
                            <div className="text-lg font-black text-orange-300">
                              {Math.round(
                                Number(
                                  candidate.skill_match ||
                                    0
                                )
                              )}
                              %
                            </div>

                            <div className="text-[8px] uppercase tracking-wider text-orange-100/40">
                              Match
                            </div>
                          </div>

                        </div>


                        {/* Pipeline steps */}

                        <div className="mt-6 grid grid-cols-3 gap-2">

                          {[
                            {
                              label:
                                "Shortlisted",
                              active: true,
                            },
                            {
                              label:
                                "Interview",
                              active:
                                Boolean(
                                  interviewScheduled
                                ),
                            },
                            {
                              label:
                                "Completed",
                              active: false,
                            },
                          ].map(
                            (step, index) => (
                              <div
                                key={
                                  step.label
                                }
                                className="relative"
                              >

                                {index < 2 && (
                                  <div className="absolute left-[calc(50%+14px)] right-[-8px] top-3.5 h-px bg-white/10" />
                                )}

                                <div className="relative text-center">

                                  <div
                                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black transition-all duration-300 ${
                                      step.active
                                        ? "border-orange-300 bg-orange-400 text-white shadow-[0_0_0_5px_rgba(251,146,60,0.08)]"
                                        : "border-white/10 bg-white/5 text-orange-100/25"
                                    }`}
                                  >
                                    {step.active
                                      ? "âœ“"
                                      : index + 1}
                                  </div>

                                  <div
                                    className={`mt-2 text-[9px] font-bold ${
                                      step.active
                                        ? "text-orange-200"
                                        : "text-orange-100/25"
                                    }`}
                                  >
                                    {step.label}
                                  </div>

                                </div>

                              </div>
                            )
                          )}

                        </div>


                        {/* Current stage */}

                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <div className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-100/35">
                                Current Stage
                              </div>

                              <div className="mt-1 text-sm font-bold text-white">
                                {interviewScheduled
                                  ? "Interview Scheduled"
                                  : "Shortlisted"}
                              </div>

                            </div>

                            {interviewScheduled && (
                              <div className="text-[10px] font-semibold text-orange-200/70">
                                {formatDateTime(
                                  candidate
                                    .interview
                                    ?.scheduled_at
                                )}
                              </div>
                            )}

                          </div>

                        </div>


                        {/* Pipeline actions */}

                        <div className="mt-4 flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewProfile(
                                candidate
                              )
                            }
                            className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md"
                          >
                            View Profile
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              openInterviewForm(
                                candidate
                              )
                            }
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-orange-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/30 hover:bg-orange-400/10 hover:text-orange-200"
                          >
                            {interviewScheduled
                              ? "Edit Interview"
                              : "Schedule Interview"}
                          </button>


                          {interviewScheduled && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelCandidate(
                                  candidate
                                );
                                setShowCancelModal(
                                  true
                                );
                              }}
                              className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-[10px] font-bold text-rose-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400/40 hover:bg-rose-400/10"
                            >
                              Cancel Interview
                            </button>
                          )}


                          <button
                            type="button"
                            disabled={
                              !candidate.application_id
                            }
                            onClick={() => {
                              setEmailCandidate(
                                candidate
                              );

                              setEmailForm({
                                subject: "",
                                message: "",
                              });
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-orange-100/70 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            Send Email
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">

                <div className="text-3xl text-orange-300/50">
                  â—‡
                </div>

                <p className="mt-3 text-sm font-bold text-white">
                  Pipeline is waiting
                </p>

                <p className="mt-1 text-xs text-orange-100/40">
                  Shortlisted candidates and scheduled
                  interviews will appear here.
                </p>

              </div>
            )}

          </div>


          {pipelineTotalPages > 1 && (
            <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-5">

              <span className="text-xs font-semibold text-orange-100/40">
                Page {pipelinePage} of{" "}
                {pipelineTotalPages}
              </span>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={
                    pipelinePage === 1
                  }
                  onClick={() =>
                    setPipelinePage(
                      (page) => page - 1
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-orange-100/70 transition-all hover:-translate-y-0.5 hover:bg-white/10 disabled:opacity-30"
                >
                  â† Previous
                </button>

                <button
                  type="button"
                  disabled={
                    pipelinePage ===
                    pipelineTotalPages
                  }
                  onClick={() =>
                    setPipelinePage(
                      (page) => page + 1
                    )
                  }
                  className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-orange-500/20 disabled:opacity-30"
                >
                  Next â†’
                </button>

              </div>

            </div>
          )}

        </div>

      </section>


      {/* =====================================================
          INTERVIEW MODAL
      ===================================================== */}

      {interviewCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]">

            <div className="relative overflow-hidden bg-gradient-to-br from-[#24130f] via-[#9a3412] to-[#be123c] px-6 py-6">

              <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-orange-300/20 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">

                <div>

                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-200/70">
                    Interview management
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white">
                    {interviewCandidate.interview &&
                    interviewCandidate.interview.status !==
                      "cancelled"
                      ? "Edit Interview"
                      : "Schedule Interview"}
                  </h2>

                  <p className="mt-1 text-xs text-orange-100/70">
                    {interviewCandidate.name}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setInterviewCandidate(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 hover:rotate-90"
                >
                  Ã—
                </button>

              </div>

            </div>


            <form
              onSubmit={
                handleScheduleInterview
              }
              className="space-y-5 p-6"
            >

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Scheduled Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    required
                    min={new Date()
                      .toISOString()
                      .slice(0, 16)}
                    value={
                      interviewForm.scheduled_at
                    }
                    onChange={(event) =>
                      setInterviewForm(
                        (prev) => ({
                          ...prev,
                          scheduled_at:
                            event.target.value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Duration
                  </label>

                  <select
                    value={
                      interviewForm.duration
                    }
                    onChange={(event) =>
                      setInterviewForm(
                        (prev) => ({
                          ...prev,
                          duration:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  >
                    {[15, 30, 45, 60, 90].map(
                      (minutes) => (
                        <option
                          key={minutes}
                          value={minutes}
                        >
                          {minutes} minutes
                        </option>
                      )
                    )}
                  </select>

                </div>

              </div>


              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Interview Type
                </label>

                <select
                  value={
                    interviewForm.interview_type
                  }
                  onChange={(event) => {
                    const type =
                      event.target.value;

                    setInterviewForm(
                      (prev) => ({
                        ...prev,
                        interview_type:
                          type,
                        meeting_link:
                          type === "online"
                            ? prev.meeting_link
                            : "",
                      })
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                >
                  <option value="online">
                    Online
                  </option>

                  <option value="in-person">
                    In-person
                  </option>
                </select>

              </div>


              {interviewForm.interview_type ===
                "online" && (
                <div>

                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Meeting Link
                  </label>

                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/..."
                    value={
                      interviewForm.meeting_link
                    }
                    onChange={(event) =>
                      setInterviewForm(
                        (prev) => ({
                          ...prev,
                          meeting_link:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />

                </div>
              )}


              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Notes
                </label>

                <textarea
                  rows={4}
                  placeholder="Add interview notes or instructions..."
                  value={
                    interviewForm.notes
                  }
                  onChange={(event) =>
                    setInterviewForm(
                      (prev) => ({
                        ...prev,
                        notes:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />

              </div>


              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setInterviewCandidate(
                      null
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    schedulingInterview
                  }
                  className="rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 px-5 py-2.5 text-xs font-black text-white shadow-[0_10px_25px_rgba(234,88,12,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-500 hover:to-rose-500 hover:shadow-[0_15px_30px_rgba(234,88,12,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {schedulingInterview
                    ? "Saving..."
                    : interviewCandidate.interview &&
                      interviewCandidate.interview.status !==
                        "cancelled"
                    ? "Reschedule Interview"
                    : "Schedule Interview"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          CANCEL INTERVIEW MODAL
      ===================================================== */}

      {showCancelModal &&
        cancelCandidate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]">

              <div className="bg-gradient-to-br from-[#431407] via-[#9a3412] to-[#be123c] px-6 py-6">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-200/70">
                      Interview action
                    </p>

                    <h2 className="mt-1 text-xl font-black text-white">
                      Cancel Interview?
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(
                        false
                      );
                      setCancelCandidate(
                        null
                      );
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20"
                  >
                    Ã—
                  </button>

                </div>

              </div>


              <div className="p-6">

                <div className="rounded-2xl bg-slate-50 p-4">

                  <div className="font-black text-slate-900">
                    {cancelCandidate.name}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {cancelCandidate.job_title}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-white p-3 shadow-sm">

                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Scheduled
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-700">
                        {formatDateTime(
                          cancelCandidate
                            .interview
                            ?.scheduled_at
                        )}
                      </div>

                    </div>

                    <div className="rounded-xl bg-white p-3 shadow-sm">

                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Duration
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-700">
                        {cancelCandidate
                          .interview
                          ?.duration ||
                          30}{" "}
                        minutes
                      </div>

                    </div>

                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Type:{" "}
                    <span className="font-bold text-slate-700">
                      {cancelCandidate
                        .interview
                        ?.interview_type ||
                        "online"}
                    </span>
                  </div>

                </div>


                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Cancelling the interview will update
                  its status for this application.
                </p>


                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(
                        false
                      );
                      setCancelCandidate(
                        null
                      );
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:shadow-sm"
                  >
                    Keep Interview
                  </button>

                  <button
                    type="button"
                    disabled={
                      schedulingInterview
                    }
                    onClick={() =>
                      handleCancelInterview(
                        cancelCandidate
                      )
                    }
                    className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-rose-200 disabled:opacity-50"
                  >
                    {schedulingInterview
                      ? "Cancelling..."
                      : "Cancel Interview"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}


      {/* =====================================================
          VIDEO MODAL
      ===================================================== */}

      {videoCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">

          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-[#15100e] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-300">
                  Candidate media
                </p>

                <h2 className="mt-1 text-lg font-black text-white">
                  Video Introduction
                </h2>

                <p className="text-xs text-orange-100/45">
                  {videoCandidate.name}
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setVideoCandidate(
                    null
                  );
                  setVideoUrl("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 hover:rotate-90"
              >
                Ã—
              </button>

            </div>


            <div className="p-4 md:p-6">

              {loadingVideo ? (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-black">

                  <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-orange-400" />

                    <p className="mt-4 text-xs font-semibold text-orange-100/60">
                      Loading candidate video...
                    </p>

                  </div>

                </div>
              ) : videoUrl ? (
                <video
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full rounded-2xl bg-black shadow-2xl"
                  src={videoUrl}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-black text-center">

                  <div>

                    <div className="text-3xl text-orange-300">
                      !
                    </div>

                    <p className="mt-3 text-sm font-bold text-white">
                      Video unavailable
                    </p>

                    <p className="mt-1 text-xs text-orange-100/40">
                      No playable video URL was returned.
                    </p>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          EMAIL MODAL
      ===================================================== */}

      {emailCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]">

            <div className="bg-gradient-to-br from-[#24130f] via-[#9a3412] to-[#be123c] px-6 py-6">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-200/70">
                    Candidate communication
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white">
                    Send Email
                  </h2>

                  <p className="mt-1 text-xs text-orange-100/65">
                    To: {emailCandidate.name}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEmailCandidate(
                      null
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 hover:rotate-90"
                >
                  Ã—
                </button>

              </div>

            </div>


            <form
              onSubmit={
                handleSendApplicantEmail
              }
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Subject
                </label>

                <input
                  type="text"
                  required
                  value={
                    emailForm.subject
                  }
                  onChange={(event) =>
                    setEmailForm(
                      (prev) => ({
                        ...prev,
                        subject:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Interview opportunity"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />

              </div>


              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Message
                </label>

                <textarea
                  rows={7}
                  required
                  value={
                    emailForm.message
                  }
                  onChange={(event) =>
                    setEmailForm(
                      (prev) => ({
                        ...prev,
                        message:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Write your message to the candidate..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />

              </div>


              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setEmailCandidate(
                      null
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    sendingEmail
                  }
                  className="rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 px-5 py-2.5 text-xs font-black text-white shadow-[0_10px_25px_rgba(234,88,12,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-500 hover:to-rose-500 hover:shadow-[0_15px_30px_rgba(234,88,12,0.3)] disabled:opacity-50"
                >
                  {sendingEmail
                    ? "Sending..."
                    : "Send Email"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      {profileCandidate && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setProfileCandidate(
                null
              );
              setCandidateProfile(
                null
              );
            }
          }}
        >

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] bg-white shadow-[0_35px_120px_rgba(0,0,0,0.35)]">

            {/* Profile Header */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#24130f] via-[#9a3412] to-[#be123c] px-6 py-7 md:px-8">

              <div className="absolute right-0 top-0 h-44 w-44 translate-x-14 -translate-y-14 rounded-full bg-orange-300/20 blur-3xl" />

              <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-rose-300/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-5">

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-white shadow-lg backdrop-blur-md">
                    {getInitials(
                      profileCandidate.name
                    )}
                  </div>

                  <div className="min-w-0">

                    <h2 className="truncate text-2xl font-black text-white">
                      {profileCandidate.name}
                    </h2>

                    <p className="mt-1 truncate text-xs text-orange-100/70">
                      {candidateProfile
                        ?.email ||
                        profileCandidate.email ||
                        "Email unavailable"}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-orange-200">
                      {candidateProfile
                        ?.profile
                        ?.role_target ||
                        profileCandidate.role_target ||
                        profileCandidate.domain_role ||
                        "Candidate"}
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={() => {
                    setProfileCandidate(
                      null
                    );
                    setCandidateProfile(
                      null
                    );
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 hover:rotate-90"
                >
                  Ã—
                </button>

              </div>

            </div>


            <div className="p-6 md:p-8">

              {loadingProfile ? (
                <div className="space-y-4">

                  <div className="animate-pulse rounded-2xl bg-slate-100 p-6">

                    <div className="h-4 w-40 rounded bg-slate-200" />

                    <div className="mt-4 h-3 w-full rounded bg-slate-200" />

                    <div className="mt-3 h-3 w-3/4 rounded bg-slate-200" />

                  </div>

                  <div className="animate-pulse rounded-2xl bg-slate-100 p-6">

                    <div className="h-4 w-32 rounded bg-slate-200" />

                    <div className="mt-4 h-20 rounded bg-slate-200" />

                  </div>

                </div>
              ) : candidateProfile ? (
                <div className="space-y-6">

                  {/* Application summary */}

                  <div>

                    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                      Application overview
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </div>

                        <div className="mt-2 text-sm font-black text-orange-700">
                          {getStatusLabel(
                            profileCandidate.application_status
                          )}
                        </div>

                      </div>


                      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Match
                        </div>

                        <div className="mt-2 text-sm font-black text-rose-700">
                          {Math.round(
                            Number(
                              profileCandidate.skill_match ||
                                0
                            )
                          )}
                          %
                        </div>

                      </div>


                      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Target Role
                        </div>

                        <div className="mt-2 truncate text-xs font-black text-amber-700">
                          {profileCandidate.role_target ||
                            profileCandidate.domain_role ||
                            "Not specified"}
                        </div>

                      </div>


                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Domain
                        </div>

                        <div className="mt-2 truncate text-xs font-black text-slate-700">
                          {profileCandidate.domain_role ||
                            "Not specified"}
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* Student details */}

                  <div>

                    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                      Candidate details
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                      {[
                        [
                          "Career Goal",
                          candidateProfile
                            ?.profile
                            ?.career_goal,
                        ],
                        [
                          "Institution",
                          candidateProfile
                            ?.profile
                            ?.institution,
                        ],
                        [
                          "Company",
                          candidateProfile
                            ?.profile
                            ?.company,
                        ],
                        [
                          "Last Login",
                          candidateProfile
                            ?.profile
                            ?.last_login
                            ? formatDateTime(
                                candidateProfile
                                  .profile
                                  .last_login
                              )
                            : null,
                        ],
                      ].map(
                        ([label, value]) => (
                          <div
                            key={label}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                          >

                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              {label}
                            </div>

                            <div className="mt-2 text-sm font-semibold leading-5 text-slate-700">
                              {value ||
                                "Not provided"}
                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>


                  {/* Resume */}

                  {candidateProfile?.profile
                    ?.resume?.url && (
                    <div>

                      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                        Resume
                      </div>

                      <div className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                            â–¤
                          </div>

                          <div>

                            <div className="text-sm font-black text-slate-800">
                              {candidateProfile
                                .profile
                                .resume
                                .name ||
                                "Candidate Resume"}
                            </div>

                            <div className="mt-1 text-[10px] text-slate-500">
                              {candidateProfile
                                .profile
                                .resume
                                .type ||
                                "Resume document"}
                            </div>

                          </div>

                        </div>


                        <a
                          href={
                            String(
                              candidateProfile
                                .profile
                                .resume
                                .url
                            ).startsWith(
                              "http"
                            )
                              ? candidateProfile
                                  .profile
                                  .resume
                                  .url
                              : `http://localhost:5000${candidateProfile.profile.resume.url}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-xs font-black text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
                        >
                          Open Resume â†—
                        </a>

                      </div>

                    </div>
                  )}

                </div>
              ) : (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
                  Candidate profile details could not
                  be loaded.
                </div>
              )}


              <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setProfileCandidate(
                      null
                    );
                    setCandidateProfile(
                      null
                    );
                  }}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          APP DIALOG
      ===================================================== */}

      <AppDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
        destructive={dialog.destructive}
        onConfirm={
          dialog.onConfirm ||
          closeDialog
        }
        onCancel={closeDialog}
        onClose={closeDialog}
      />

    </div>
  );
}