import React, {
  useMemo,
  useState,
  useEffect,
  useCallback
} from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getEducatorCommunityFeed,
  createEducatorCommunityPost,
  toggleEducatorCommunityPostBookmark,
  getMyConnections,
  searchUsers,
  sendConnectionRequest,
  getPendingConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  
  getDomainRoles,
  getAnnouncements,
  markAnnouncementNotificationsRead,
  aimlPredictSentiment,
  aimlPredictToxicity
} from '../services/api';

/* =========================================================
   ICONS
========================================================= */

const Icon = ({
  name,
  size = 18,
  strokeWidth = 2,
  className = ''
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    megaphone: (
      <>
        <path d="m3 11 18-5v12L3 13v-2Z" />
        <path d="M11 15v5" />
        <path d="M7 14.2 6 19" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    bookmark: (
      <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" />
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
        <path d="M4 5.5V22" />
      </>
    ),
    rocket: (
      <>
        <path d="M14 4c3.5-2 6-1.5 6-1.5S20.5 5 18.5 8.5L15 12l-3-3 2-5Z" />
        <path d="M12 9 8 10l-3 3 6 2" />
        <path d="m15 12 1 4-3 3-2-6" />
        <path d="M8 16 5 19" />
        <path d="M5 13 3 15" />
      </>
    ),
    message: (
      <>
        <path d="M21 11.5a8 8 0 0 1-8.5 8 8.8 8.8 0 0 1-4-.9L3 20l1.4-4.2A7.8 7.8 0 0 1 5 11.5a8 8 0 0 1 16 0Z" />
      </>
    ),
    heart: (
      <path d="M20.8 8.7c0 5.5-8.8 10.5-8.8 10.5S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
    ),
    share: (
      <>
        <path d="m15 5 5 4-5 4V10H9a6 6 0 0 0-6 6" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m21 15-5-5L5 20" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 3-4 3 2 5-7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    x: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    shield: (
      <path d="M12 3 20 6v6c0 5-3.3 8-8 10-4.7-2-8-5-8-10V6l8-3Z" />
    ),
    sparkles: (
      <>
        <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3Z" />
        <path d="m19 14-.7 2.3-2.3.7 2.3.7.7 2.3.7-2.3 2.3-.7-2.3-.7L19 14Z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    userPlus: (
      <>
        <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    )
  };

  return (
    <svg {...common}>
      {paths[name] || paths.info}
    </svg>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const fmtRel = (iso) => {
  if (!iso) return 'Recent';

  const diff = (new Date() - new Date(iso)) / 60000;

  if (diff < 1) return 'Just now';
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;

  return `${Math.round(diff / 1440)}d ago`;
};

const getInitials = (name = '') => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'U';

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const DEFAULT_DOMAIN_ROLES = [
  'AI Engineer',
  'Backend Developer',
  'Blockchain Developer',
  'Business Intelligence Developer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Data Analyst',
  'Data Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Frontend Developer',
  'Full Stack Developer',
  'Generative AI Engineer',
  'IoT Engineer',
  'Machine Learning Engineer',
  'MLOps Engineer',
  'Mobile Application Developer',
  'Robotics and Computer Vision Engineer',
  'Software Development Engineer',
  'Software Development Engineer (SDE)',
  'Software Test Engineer',
  'UI/UX Designer'
];

const ROLE_CONFIG = {
  Student: {
    label: 'Student',
    bg: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  Educator: {
    label: 'Educator',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  Employer: {
    label: 'Employer',
    bg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  Admin: {
    label: 'Platform Admin',
    bg: 'bg-purple-50 text-purple-700 border-purple-200'
  }
};

/* =========================================================
   COMPONENT
========================================================= */

export default function EducatorCommunity() {
  const { user, role: authRole } = useAuth();
  const location = useLocation();

  const displayName = user?.name || 'EduSaaS Member';
  const userRole = authRole || 'Student';

  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'All'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [composerOpen, setComposerOpen] = useState(false);

  const [postType, setPostType] = useState('Discussion');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postTags, setPostTags] = useState('');

  const [isPublic, setIsPublic] = useState(true);
  const [visibleRoles, setVisibleRoles] = useState([
    'Student',
    'Educator',
    'Employer'
  ]);

  const [availableDomainRoles, setAvailableDomainRoles] = useState(
    DEFAULT_DOMAIN_ROLES
  );

  const [notifyDomainRoles, setNotifyDomainRoles] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);

  const [connectionsCount, setConnectionsCount] = useState(0);
  const [networkConnections, setNetworkConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [showConnectionsModal, setShowConnectionsModal] =
    useState(false);

  const [modalTab, setModalTab] = useState('connections');
  const [sentRequests, setSentRequests] = useState({});

  const [aiChecking, setAiChecking] = useState(false);
  const [aiToneResult, setAiToneResult] = useState(null);

  const seenKey = `edu_seen_announcements_${user?.id || 'user'}`;

  const [seenAnnouncementIds, setSeenAnnouncementIds] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(seenKey) || '[]'
        );
      } catch {
        return [];
      }
    });

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({
      message,
      type
    });

    window.clearTimeout(
      showToast.timeoutId
    );

    showToast.timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  /* =========================================================
     ANNOUNCEMENTS
  ========================================================= */

  const getSeenAnnouncementIds = useCallback(() => {
    try {
      return JSON.parse(
        localStorage.getItem(seenKey) || '[]'
      );
    } catch {
      return [];
    }
  }, [seenKey]);

  useEffect(() => {
    setSeenAnnouncementIds(
      getSeenAnnouncementIds()
    );
  }, [getSeenAnnouncementIds]);

  const unseenAnnouncementsCount = useMemo(() => {
    return announcements.filter(
      (item) => !seenAnnouncementIds.includes(item.id)
    ).length;
  }, [
    announcements,
    seenAnnouncementIds
  ]);

  useEffect(() => {
    const onSeen = () => {
      setSeenAnnouncementIds(
        getSeenAnnouncementIds()
      );
    };

    window.addEventListener(
      'announcements_seen',
      onSeen
    );

    return () => {
      window.removeEventListener(
        'announcements_seen',
        onSeen
      );
    };
  }, [getSeenAnnouncementIds]);

  useEffect(() => {
    let mounted = true;

    const loadAnnouncements = async () => {
      try {
        const result = await getAnnouncements();

        if (!mounted) return;

        setAnnouncements(
          Array.isArray(result)
            ? result
            : result?.results || []
        );
      } catch (error) {
        console.error(
          'Failed to load announcements',
          error
        );
      }
    };

    loadAnnouncements();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      activeTab !== 'Announcements' ||
      announcements.length === 0
    ) {
      return;
    }

    const ids = announcements
      .map((item) => item.id)
      .filter(Boolean);

    if (!ids.length) return;

    const current = getSeenAnnouncementIds();

    const merged = Array.from(
      new Set([...current, ...ids])
    );

    localStorage.setItem(
      seenKey,
      JSON.stringify(merged)
    );

    setSeenAnnouncementIds(merged);

    markAnnouncementNotificationsRead().catch(
      () => {}
    );

    window.dispatchEvent(
      new Event('notifications_updated')
    );

    window.dispatchEvent(
      new Event('announcements_seen')
    );
  }, [
    activeTab,
    announcements,
    getSeenAnnouncementIds,
    seenKey
  ]);

  /* =========================================================
     AI TONE CHECK
  ========================================================= */

  const handleAiToneCheck = async () => {
    const text = `${postTitle}\n${postBody}`.trim();

    if (!text) {
      showToast(
        'Please enter a title or message first.',
        'error'
      );
      return;
    }

    setAiChecking(true);

    try {
      const [sentimentResult, toxicityResult] =
        await Promise.allSettled([
          aimlPredictSentiment({
            post_text: text
          }),
          aimlPredictToxicity({
            post_text: text
          })
        ]);

      setAiToneResult({
        sentiment:
          sentimentResult.status === 'fulfilled'
            ? sentimentResult.value
            : null,
        toxicity:
          toxicityResult.status === 'fulfilled'
            ? toxicityResult.value
            : null
      });

      showToast(
        'AI tone and safety analysis completed.',
        'success'
      );
    } catch (error) {
      console.error(
        'AI tone check failed',
        error
      );

      showToast(
        'AI tone check could not be completed.',
        'error'
      );
    } finally {
      setAiChecking(false);
    }
  };

  /* =========================================================
     IMAGES
  ========================================================= */

  const handleImageChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    if (
      selectedImages.length + files.length >
      3
    ) {
      showToast(
        'You can upload a maximum of 3 images.',
        'error'
      );

      setSelectedImages((prev) =>
        [...prev, ...files].slice(0, 3)
      );

      return;
    }

    setSelectedImages((prev) => [
      ...prev,
      ...files
    ]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* =========================================================
     POSTS
  ========================================================= */

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);

    try {
      const result =
        await getEducatorCommunityFeed();

      const rawPosts = Array.isArray(result)
        ? result
        : result?.results || [];

      const mapped = rawPosts.map((p) => {
        const author =
          p.author?.name ||
          p.author_name ||
          p.user?.name ||
          'EduSaaS Member';

        const role =
          p.author?.role?.name ||
          p.author?.role ||
          p.role ||
          'Student';

        return {
          ...p,
          id: p.id,
          author,
          role,
          avatar: getInitials(author),
          type:
            p.post_type ||
            p.type ||
            'Discussion',
          when: fmtRel(
            p.created_at ||
              p.createdAt ||
              p.timestamp
          ),
          title: p.title || '',
          body:
            p.content ||
            p.body ||
            '',
          tags: Array.isArray(p.tags)
            ? p.tags
            : typeof p.tags === 'string'
            ? p.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
          likes:
            Number(
              p.reactions_count ??
                p.likes_count ??
                p.likes ??
                0
            ),
          liked: Boolean(
            p.liked_by_user ||
              p.liked
          ),
          bookmarked: Boolean(
            p.bookmarked
          ),
          applied: Boolean(
            p.applied
          ),
          comments: Array.isArray(
            p.comments
          )
            ? p.comments
            : [],
          jobDetails:
            p.job_details ||
            p.jobDetails ||
            null,
          images:
            p.images ||
            p.attachments ||
            [],
          sentiment:
            p.sentiment ||
            null,
          toxicity:
            p.toxicity ||
            null
        };
      });

      setPosts(mapped);
    } catch (error) {
      console.error(
        'Failed to load community feed',
        error
      );

      showToast(
        'Unable to load community posts.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /* =========================================================
     NETWORK
  ========================================================= */

  const loadNetworkData = useCallback(
    async () => {
      try {
        const connections =
          await getMyConnections();

        if (connections) {
          const data = Array.isArray(
            connections
          )
            ? connections
            : connections?.results || [];

          setNetworkConnections(data);
          setConnectionsCount(data.length);
        }

        const pending =
          await getPendingConnections();

        if (pending) {
          setPendingRequests(
            Array.isArray(pending)
              ? pending
              : pending?.results || []
          );
        }
      } catch (error) {
        console.error(
          'Failed to load network data',
          error
        );
      }
    },
    []
  );

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      try {
        const result =
          await getDomainRoles();

        if (!mounted) return;

        const data = Array.isArray(result)
          ? result
          : result?.results || [];

        if (data.length) {
          const names = data
            .map(
              (item) =>
                item.name ||
                item.title ||
                item.role
            )
            .filter(Boolean);

          if (names.length) {
            setAvailableDomainRoles(
              names
            );
          }
        }
      } catch (error) {
        console.error(
          'Failed to load domain roles',
          error
        );
      }
    };

    loadRoles();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     SCROLL TO POST
  ========================================================= */

  useEffect(() => {
    const targetId =
      location.state?.scrollToPost;

    if (!targetId || isLoading) return;

    const timer = window.setTimeout(() => {
      const element =
        document.getElementById(
          `post-${targetId}`
        );

      if (!element) return;

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      element.classList.add(
        'community-highlight-post'
      );

      window.setTimeout(() => {
        element.classList.remove(
          'community-highlight-post'
        );
      }, 2500);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    location.state?.scrollToPost,
    isLoading
  ]);

  /* =========================================================
     USER SEARCH
  ========================================================= */

  useEffect(() => {
    const query =
      searchQuery.trim();

    if (query.length <= 2) {
      setUserSearchResults([]);
      setIsSearchingUsers(false);
      return undefined;
    }

    setIsSearchingUsers(true);

    const timer = window.setTimeout(
      async () => {
        try {
          const result =
            await searchUsers(query);

          const users = Array.isArray(
            result
          )
            ? result
            : result?.results || [];

          const filtered = users.filter(
            (item) =>
              String(item.id) !==
              String(user?.id)
          );

          const nextSent = {};

          filtered.forEach((item) => {
            if (
              item.connection_status ===
                'pending_sent' &&
              item.connection_id
            ) {
              nextSent[item.id] =
                item.connection_id;
            }
          });

          setSentRequests((prev) => ({
            ...prev,
            ...nextSent
          }));

          setUserSearchResults(
            filtered
          );
        } catch (error) {
          console.error(
            'User search failed',
            error
          );

          setUserSearchResults([]);
        } finally {
          setIsSearchingUsers(false);
        }
      },
      500
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery, user?.id]);

  /* =========================================================
     CONNECTION HANDLERS
  ========================================================= */

  const handleConnect = async (
    targetUserId
  ) => {
    try {
      const result =
        await sendConnectionRequest(
          targetUserId
        );

      const connectionId =
        result?.id ||
        result?.connection_id;

      if (connectionId) {
        setSentRequests((prev) => ({
          ...prev,
          [targetUserId]:
            connectionId
        }));
      }

      showToast(
        'Connection request sent.',
        'success'
      );
    } catch (error) {
      console.error(
        'Failed to send connection request',
        error
      );

      showToast(
        error?.response?.data?.detail ||
          'Unable to send connection request.',
        'error'
      );
    }
  };

  const handleRemoveRequest = async (
    targetUserId,
    connectionId
  ) => {
    try {
      await removeConnection(
        connectionId
      );

      setSentRequests((prev) => {
        const next = {
          ...prev
        };

        delete next[targetUserId];

        return next;
      });

      showToast(
        'Connection request cancelled.',
        'success'
      );
    } catch (error) {
      console.error(
        'Failed to remove request',
        error
      );

      showToast(
        'Unable to cancel request.',
        'error'
      );
    }
  };

  const handleAcceptRequest = async (
    connectionId
  ) => {
    try {
      await acceptConnectionRequest(
        connectionId
      );

      await loadNetworkData();

      showToast(
        'Connection accepted.',
        'success'
      );
    } catch (error) {
      console.error(
        'Failed to accept request',
        error
      );

      showToast(
        'Unable to accept request.',
        'error'
      );
    }
  };

  const handleRejectRequest = async (
    connectionId
  ) => {
    try {
      await rejectConnectionRequest(
        connectionId
      );

      setPendingRequests((prev) =>
        prev.filter(
          (item) =>
            item.id !== connectionId
        )
      );

      showToast(
        'Connection request declined.',
        'success'
      );
    } catch (error) {
      console.error(
        'Failed to reject request',
        error
      );

      showToast(
        'Unable to decline request.',
        'error'
      );
    }
  };

  const handleRemoveConnection = (
    connectionId
  ) => {
    setConfirmModal({
      title: 'Remove connection?',
      message:
        'This person will be removed from your network.',
      confirmText: 'Remove',
      danger: true,
      onConfirm: async () => {
        try {
          await removeConnection(
            connectionId
          );

          setNetworkConnections(
            (prev) =>
              prev.filter(
                (item) =>
                  item.connectionId !==
                    connectionId &&
                  item.id !== connectionId
              )
          );

          setConnectionsCount(
            (count) =>
              Math.max(0, count - 1)
          );

          showToast(
            'Connection removed.',
            'success'
          );
        } catch (error) {
          console.error(
            'Failed to remove connection',
            error
          );

          showToast(
            'Unable to remove connection.',
            'error'
          );
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  /* =========================================================
     FILTERS
  ========================================================= */

  const filteredPosts = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      let tabMatches = true;

      if (activeTab === 'Jobs') {
        tabMatches =
          post.type === 'Job';
      } else if (
        activeTab === 'Courses'
      ) {
        tabMatches =
          post.type === 'Course';
      } else if (
        activeTab === 'Projects'
      ) {
        tabMatches =
          post.type === 'Project';
      } else if (
        activeTab === 'Discussions'
      ) {
        tabMatches =
          post.type === 'Discussion';
      } else if (
        activeTab === 'Bookmarks'
      ) {
        tabMatches =
          post.bookmarked;
      } else if (
        activeTab === 'Connections' ||
        activeTab === 'Announcements'
      ) {
        tabMatches = false;
      }

      if (!tabMatches) return false;

      if (!query) return true;

      const haystack = [
        post.title,
        post.body,
        post.author,
        ...(post.tags || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [
    posts,
    activeTab,
    searchQuery
  ]);

  const filteredAnnouncements =
    useMemo(() => {
      const query =
        searchQuery.trim().toLowerCase();

      if (!query) {
        return announcements;
      }

      return announcements.filter(
        (announcement) => {
          const haystack = [
            announcement.title,
            announcement.message,
            announcement.educator?.name,
            announcement.audience
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(query);
        }
      );
    }, [
      announcements,
      searchQuery
    ]);

  const recentJobPosts = useMemo(
    () =>
      posts
        .filter(
          (post) =>
            post.type === 'Job'
        )
        .slice(0, 3),
    [posts]
  );

  const recentCoursePosts = useMemo(
    () =>
      posts
        .filter(
          (post) =>
            post.type === 'Course'
        )
        .slice(0, 3),
    [posts]
  );

  const bookmarkedCount = useMemo(
    () =>
      posts.filter(
        (post) => post.bookmarked
      ).length,
    [posts]
  );

  const insights = useMemo(() => {
    const total =
      posts.length;

    const jobs = posts.filter(
      (post) =>
        post.type === 'Job'
    ).length;

    const courses = posts.filter(
      (post) =>
        post.type === 'Course'
    ).length;

    const projects = posts.filter(
      (post) =>
        post.type === 'Project'
    ).length;

    const discussions =
      posts.filter(
        (post) =>
          post.type === 'Discussion'
      ).length;

    return {
      total,
      jobs,
      courses,
      projects,
      discussions
    };
  }, [posts]);

  /* =========================================================
     POST ACTIONS
  ========================================================= */

  const handleToggleLike = (
    postId
  ) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked
                ? Math.max(
                    0,
                    post.likes - 1
                  )
                : post.likes + 1,
              liked: !post.liked
            }
          : post
      )
    );
  };

  const handleToggleBookmark =
    async (postId) => {
      const previous =
        posts.find(
          (post) =>
            post.id === postId
        );

      if (!previous) return;

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                bookmarked:
                  !post.bookmarked
              }
            : post
        )
      );

      try {
        await toggleEducatorCommunityPostBookmark(
          postId
        );
      } catch (error) {
        console.error(
          'Failed to toggle bookmark',
          error
        );

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  bookmarked:
                    previous.bookmarked
                }
              : post
          )
        );

        showToast(
          'Unable to update bookmark.',
          'error'
        );
      }
    };

  const handleApplyJob = (
    postId
  ) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              applied: true
            }
          : post
      )
    );

    showToast(
      'Application submitted successfully.',
      'success'
    );
  };

  const handleToggleComments = (
    postId
  ) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = (
    postId
  ) => {
    const text =
      commentDrafts[postId]?.trim();

    if (!text) return;

    const comment = {
      id: `local-${Date.now()}`,
      author: displayName,
      role: userRole,
      text
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...(post.comments || []),
                comment
              ]
            }
          : post
      )
    );

    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: ''
    }));
  };

  /* =========================================================
     CREATE POST
  ========================================================= */

  const handleCreatePost = async (
    e
  ) => {
    e.preventDefault();

    if (
      !postTitle.trim() ||
      !postBody.trim()
    ) {
      return;
    }

    if (
      !isPublic &&
      visibleRoles.length === 0
    ) {
      showToast(
        'Please select at least one audience role for restricted visibility.',
        'error'
      );
      return;
    }

    if (
      (postType === 'Job' ||
        postType === 'Course') &&
      notifyDomainRoles.length === 0
    ) {
      showToast(
        'Please select at least one related domain role for this post.',
        'error'
      );
      return;
    }

    try {
      const formData =
        new FormData();

      formData.append(
        'title',
        postTitle.trim()
      );

      formData.append(
        'content',
        postBody.trim()
      );

      formData.append(
        'post_type',
        postType
      );

      formData.append(
        'visibility',
        'Public'
      );

      const finalMetadata = {};

      if (!isPublic) {
        finalMetadata.allowedRoles =
          visibleRoles.map((role) =>
            role.toLowerCase()
          );
      }

      if (
        (postType === 'Job' ||
          postType === 'Course') &&
        notifyDomainRoles.length
      ) {
        finalMetadata.notifyDomainRoles =
          notifyDomainRoles;
      }

      if (
        Object.keys(finalMetadata)
          .length > 0
      ) {
        formData.append(
          'metadata',
          JSON.stringify(
            finalMetadata
          )
        );
      }

      if (postTags.trim()) {
        formData.append(
          'tags',
          postTags.trim()
        );
      }

      selectedImages.forEach(
        (file) => {
          formData.append(
            'images',
            file
          );
        }
      );

      await createEducatorCommunityPost(
        formData
      );

      await fetchPosts();

      setPostTitle('');
      setPostBody('');
      setPostTags('');
      setNotifyDomainRoles([]);
      setIsPublic(true);

      setVisibleRoles([
        'Student',
        'Educator',
        'Employer'
      ]);

      setSelectedImages([]);
      setAiToneResult(null);
      setComposerOpen(false);

      showToast(
        'Your post has been published.',
        'success'
      );
    } catch (error) {
      console.error(
        'Failed to create post',
        error
      );

      showToast(
        error?.response?.data?.detail ||
          'Failed to create post.',
        'error'
      );
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const feedItems = [
    {
      key: 'All',
      label: 'All Updates',
      icon: 'home'
    },
    {
      key: 'Announcements',
      label: 'Announcements',
      icon: 'megaphone',
      badge: unseenAnnouncementsCount
    },
    {
      key: 'Connections',
      label: 'Network & Connections',
      icon: 'users',
      badge: pendingRequests.length
    },
    {
      key: 'Bookmarks',
      label: 'Saved Posts',
      icon: 'bookmark'
    },
    {
      key: 'Jobs',
      label: 'Job Board',
      icon: 'briefcase'
    },
    {
      key: 'Courses',
      label: 'Course Stream',
      icon: 'book'
    },
    {
      key: 'Projects',
      label: 'Showcase & Demos',
      icon: 'rocket'
    },
    {
      key: 'Discussions',
      label: 'Discussions',
      icon: 'message'
    }
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="community-page community-pro-shell min-h-screen pb-16 text-slate-800">
      <style>{`
        @keyframes communityFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }

        @keyframes communityPulse {
          0%, 100% {
            opacity: .45;
            transform: scale(1);
          }
          50% {
            opacity: .8;
            transform: scale(1.06);
          }
        }

        @keyframes communityShimmer {
          0% {
            background-position: -300% 0;
          }
          100% {
            background-position: 300% 0;
          }
        }

        @keyframes communitySpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes communityEntry {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .community-page {
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 10% 4%, rgba(99,102,241,.13), transparent 26%),
            radial-gradient(circle at 92% 9%, rgba(168,85,247,.12), transparent 25%),
            radial-gradient(circle at 50% 100%, rgba(59,130,246,.09), transparent 35%),
            #f7f9fc;
        }

        .community-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              120deg,
              transparent 0%,
              rgba(255,255,255,.45) 45%,
              transparent 65%
            );
          opacity: .35;
          z-index: 0;
        }

        .community-shell {
          position: relative;
          z-index: 1;
          max-width: 1500px;
          margin: 0 auto;
        }

        .community-hero {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          background:
            radial-gradient(circle at 85% 15%, rgba(255,255,255,.2), transparent 20%),
            radial-gradient(circle at 20% 90%, rgba(59,130,246,.28), transparent 28%),
            linear-gradient(135deg, #172554 0%, #312e81 43%, #6d28d9 100%);
          box-shadow:
            0 30px 70px rgba(49,46,129,.22),
            inset 0 1px 0 rgba(255,255,255,.2);
        }

        .community-hero::before {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 999px;
          right: -100px;
          top: -160px;
          background: rgba(255,255,255,.09);
          filter: blur(2px);
          animation: communityPulse 7s ease-in-out infinite;
        }

        .community-hero::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 999px;
          left: 35%;
          bottom: -190px;
          background: rgba(96,165,250,.2);
          filter: blur(5px);
        }

        .community-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226,232,240,.9);
          background: rgba(255,255,255,.9);
          box-shadow:
            0 14px 38px rgba(15,23,42,.06),
            0 2px 5px rgba(15,23,42,.03);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition:
            transform .28s ease,
            box-shadow .28s ease,
            border-color .28s ease;
        }

        .community-card:hover {
          transform: translateY(-3px);
          border-color: rgba(129,140,248,.45);
          box-shadow:
            0 22px 50px rgba(79,70,229,.10),
            0 5px 12px rgba(15,23,42,.05);
        }

        .community-nav-item {
          position: relative;
          transition:
            background .2s ease,
            color .2s ease,
            transform .2s ease,
            box-shadow .2s ease;
        }

        .community-nav-item:hover {
          transform: translateX(3px);
        }

        .community-nav-item.active {
          color: #3730a3;
          background:
            linear-gradient(
              135deg,
              rgba(238,242,255,.95),
              rgba(245,243,255,.95)
            );
          box-shadow:
            inset 3px 0 0 #6366f1,
            0 8px 20px rgba(99,102,241,.08);
        }

        .community-post {
          animation: communityEntry .45s ease both;
        }

        .community-post:hover {
          transform: translateY(-3px);
          box-shadow:
            0 24px 60px rgba(79,70,229,.11),
            0 4px 12px rgba(15,23,42,.04);
        }

        .community-radiant-button {
          position: relative;
          overflow: hidden;
          box-shadow:
            0 12px 28px rgba(79,70,229,.24),
            inset 0 1px 0 rgba(255,255,255,.2);
        }

        .community-radiant-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              110deg,
              transparent 20%,
              rgba(255,255,255,.3) 45%,
              transparent 70%
            );
          background-size: 250% 100%;
          animation: communityShimmer 4s linear infinite;
        }

        .community-radiant-button > * {
          position: relative;
          z-index: 1;
        }

        .community-avatar {
          position: relative;
          box-shadow:
            0 12px 24px rgba(79,70,229,.22),
            0 0 0 4px rgba(255,255,255,.9);
        }

        .community-highlight-post {
          animation:
            communityPulse 1.2s ease-in-out 2;
          box-shadow:
            0 0 0 5px rgba(99,102,241,.16),
            0 25px 70px rgba(79,70,229,.18);
        }

        .community-scroll::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        .community-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .community-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .community-modal {
          animation: communityEntry .25s ease both;
        }

        .community-insight-card {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.96),
              rgba(248,250,252,.92)
            );
        }

        .community-insight-card::after {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 999px;
          right: -45px;
          top: -45px;
          background: rgba(99,102,241,.08);
        }

        .community-gradient-text {
          background:
            linear-gradient(
              90deg,
              #312e81,
              #4f46e5,
              #7c3aed
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .community-post-body {
          white-space: pre-wrap;
          word-break: break-word;
        }

        @media (max-width: 1100px) {
          .community-three-column {
            grid-template-columns: 230px minmax(0, 1fr);
          }

          .community-right-column {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .community-shell {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .community-hero {
            border-radius: 22px;
          }

          .community-three-column {
            grid-template-columns: 1fr;
          }

          .community-left-column {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="community-shell px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="community-hero px-5 sm:px-8 py-7 sm:py-9 mb-6">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/85 text-[10px] sm:text-xs font-black uppercase tracking-[.16em] mb-4 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
                EduSaaS Network
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-.04em] text-white leading-[1.04]">
                Educator Community
                <span className="ml-2 text-indigo-200">
                  PRO
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl font-medium">
                The collaborative network for
                Students, Educators, Employers and
                industry professionals. Learn, share,
                connect and grow together.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-6">
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md">
                  <Icon
                    name="users"
                    size={15}
                  />
                  {connectionsCount} Connections
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md">
                  <Icon
                    name="bookmark"
                    size={15}
                  />
                  {bookmarkedCount} Saved
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md">
                  <Icon
                    name="message"
                    size={15}
                  />
                  {posts.length} Posts
                </span>
              </div>
            </div>

            <div className="relative hidden md:block w-48 h-40 shrink-0">
              <div className="absolute inset-6 rounded-full border border-white/15" />
              <div className="absolute inset-10 rounded-full border border-white/20" />

              <div
                className="absolute inset-0 grid place-items-center"
                style={{
                  animation:
                    'communityFloat 5s ease-in-out infinite'
                }}
              >
                <div className="w-24 h-24 rounded-[28px] bg-white/10 border border-white/20 backdrop-blur-xl grid place-items-center shadow-2xl">
                  <Icon
                    name="users"
                    size={42}
                    className="text-white"
                    strokeWidth={1.6}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH / CREATE
        ====================================================== */}

        <section className="community-card rounded-2xl p-3 sm:p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Icon
                name="search"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search posts, tags, members..."
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setComposerOpen(true)
              }
              className="community-radiant-button inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white text-sm font-black hover:-translate-y-0.5 transition-all"
            >
              <Icon
                name="plus"
                size={18}
              />
              <span className="relative">
                Create New Post
              </span>
            </button>
          </div>
        </section>

        {/* =====================================================
            THREE COLUMN
        ====================================================== */}

        <div className="community-three-column grid grid-cols-[240px_minmax(0,1fr)_260px] gap-5 items-start">
          {/* ===================================================
              LEFT
          ==================================================== */}

          <aside className="community-left-column space-y-4">
            {/* Profile */}
            <Card className="community-card rounded-2xl overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-700 relative">
                <div className="absolute -right-8 -top-12 w-36 h-36 rounded-full bg-white/10" />
                <div className="absolute -left-8 bottom-[-55px] w-32 h-32 rounded-full bg-blue-400/10" />
              </div>

              <div className="px-5 pb-5">
                <div className="-mt-9 flex items-end justify-between">
                  <div className="community-avatar w-[70px] h-[70px] rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center text-xl font-black">
                    {getInitials(
                      displayName
                    )}
                  </div>

                  <span
                    className={`mb-1 px-2.5 py-1 rounded-full border text-[9px] font-black ${
                      ROLE_CONFIG[
                        userRole
                      ]?.bg ||
                      ROLE_CONFIG.Student.bg
                    }`}
                  >
                    {ROLE_CONFIG[
                      userRole
                    ]?.label || userRole}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-black text-slate-900 truncate">
                  {displayName}
                </h2>

                <p className="text-xs text-slate-500 font-medium mt-1">
                  {user?.username
                    ? `@${user.username}`
                    : 'Community member'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab(
                        'connections'
                      );
                      setShowConnectionsModal(
                        true
                      );
                    }}
                    className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                  >
                    <div className="text-lg font-black text-slate-900">
                      {connectionsCount}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      Connections
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        'Bookmarks'
                      )
                    }
                    className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                  >
                    <div className="text-lg font-black text-slate-900">
                      {bookmarkedCount}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      Saved
                    </div>
                  </button>
                </div>
              </div>
            </Card>

            {/* Navigation */}
            <Card className="community-card rounded-2xl p-3">
              <div className="px-3 pt-2 pb-3">
                <div className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">
                  Community
                </div>
              </div>

              <div className="space-y-1">
                {feedItems.map(
                  (item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          item.key
                        )
                      }
                      className={`community-nav-item w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                        activeTab ===
                        item.key
                          ? 'active'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-700'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg grid place-items-center ${
                          activeTab ===
                          item.key
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                        />
                      </span>

                      <span className="flex-1 text-xs font-black">
                        {item.label}
                      </span>

                      {item.badge > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[9px] font-black grid place-items-center shadow-sm">
                          {item.badge >
                          99
                            ? '99+'
                            : item.badge}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            </Card>
          </aside>

          {/* ===================================================
              CENTER
          ==================================================== */}

          <main className="min-w-0 space-y-5">
            {/* Insights */}
            <Card className="community-card rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-indigo-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Community Insights
                  </div>

                  <h2 className="community-gradient-text text-2xl sm:text-3xl font-black tracking-[-.035em] mt-1">
                    Your Community Pulse
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    A quick view of what is happening
                    across your network.
                  </p>
                </div>

                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Live feed
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  {
                    label: 'Total Posts',
                    value: insights.total,
                    icon: 'message',
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-600'
                  },
                  {
                    label: 'Jobs',
                    value: insights.jobs,
                    icon: 'briefcase',
                    bg: 'bg-amber-50',
                    text: 'text-amber-600'
                  },
                  {
                    label: 'Courses',
                    value: insights.courses,
                    icon: 'book',
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-600'
                  },
                  {
                    label: 'Projects',
                    value: insights.projects,
                    icon: 'rocket',
                    bg: 'bg-purple-50',
                    text: 'text-purple-600'
                  },
                  {
                    label: 'Discussions',
                    value: insights.discussions,
                    icon: 'users',
                    bg: 'bg-blue-50',
                    text: 'text-blue-600'
                  }
                ].map(
                  (item) => (
                    <div
                      key={
                        item.label
                      }
                      className="community-insight-card rounded-xl border border-slate-200 p-3.5 hover:-translate-y-1 hover:shadow-lg transition-all"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl ${item.bg} ${item.text} grid place-items-center mb-3`}
                      >
                        <Icon
                          name={
                            item.icon
                          }
                          size={17}
                        />
                      </div>

                      <div className="text-xl font-black text-slate-900">
                        {item.value}
                      </div>

                      <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                        {item.label}
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Quick composer */}
            {activeTab !==
              'Connections' &&
              activeTab !==
                'Announcements' && (
                <Card
                  className="community-card rounded-2xl p-4 sm:p-5 cursor-pointer"
                  onClick={() =>
                    setComposerOpen(
                      true
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="community-avatar w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center font-black text-sm shrink-0">
                      {getInitials(
                        displayName
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-400 font-medium hover:bg-white hover:border-indigo-200 transition-all">
                        Share an update, ask a
                        question, or post a job...
                      </div>
                    </div>

                    <div className="hidden sm:flex gap-2">
                      <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
                        <Icon
                          name="image"
                          size={16}
                        />
                      </span>

                      <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 grid place-items-center">
                        <Icon
                          name="chart"
                          size={16}
                        />
                      </span>
                    </div>
                  </div>
                </Card>
              )}

            {/* Member results */}
            {searchQuery.trim()
              .length > 2 && (
              <Card className="community-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Member Results
                    </h3>

                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      People matching your search
                    </p>
                  </div>

                  <Icon
                    name="users"
                    size={20}
                    className="text-indigo-500"
                  />
                </div>

                {isSearchingUsers ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 mx-auto rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                    <p className="text-xs text-slate-500 font-semibold mt-3">
                      Searching members...
                    </p>
                  </div>
                ) : userSearchResults.length ===
                  0 ? (
                  <div className="py-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <Icon
                      name="search"
                      size={26}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-sm font-black text-slate-600 mt-2">
                      No members found
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Try a different name or
                      username.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {userSearchResults.map(
                      (member) => {
                        const memberName =
                          member.name ||
                          member.username ||
                          'Member';

                        const sent =
                          Boolean(
                            sentRequests[
                              member.id
                            ]
                          );

                        return (
                          <div
                            key={
                              member.id
                            }
                            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center text-xs font-black shrink-0">
                              {getInitials(
                                memberName
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-black text-slate-900 truncate">
                                {
                                  memberName
                                }
                              </div>

                              <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                                {member.username
                                  ? `@${member.username}`
                                  : member.role
                                    ?.name ||
                                    member.role ||
                                    'Student'}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                sent
                                  ? handleRemoveRequest(
                                      member.id,
                                      sentRequests[
                                        member.id
                                      ]
                                    )
                                  : handleConnect(
                                      member.id
                                    )
                              }
                              className={`shrink-0 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${
                                sent
                                  ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                              }`}
                            >
                              {sent
                                ? 'Cancel'
                                : 'Connect'}
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Announcements */}
            {activeTab ===
              'Announcements' && (
              <div className="space-y-5">
                <Card className="community-card rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center shadow-lg shadow-indigo-500/20">
                        <Icon
                          name="megaphone"
                          size={21}
                        />
                      </div>

                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[.15em] text-indigo-500">
                          Official Updates
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                          Announcements Feed
                        </h2>

                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Verified broadcasts from
                          educators and platform leaders.
                        </p>
                      </div>
                    </div>

                    {(userRole ===
                      'Educator' ||
                      userRole ===
                        'Admin') && (
                      <Link
                        to="/app/announcements"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        <Icon
                          name="plus"
                          size={15}
                        />
                        Send Announcement
                      </Link>
                    )}
                  </div>
                </Card>

                {filteredAnnouncements.length ===
                0 ? (
                  <Card className="community-card rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-500 grid place-items-center">
                      <Icon
                        name="bell"
                        size={28}
                      />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mt-5">
                      No Announcements Yet
                    </h3>

                    <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto">
                      There are no announcements matching
                      your current search.
                    </p>
                  </Card>
                ) : (
                  filteredAnnouncements.map(
                    (announcement) => (
                      <Card
                        key={
                          announcement.id
                        }
                        className="community-card rounded-2xl p-5 sm:p-6"
                      >
                        <div className="flex gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center font-black shrink-0">
                            {getInitials(
                              announcement
                                .educator
                                ?.name ||
                                'Admin'
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-slate-900">
                                {announcement
                                  .educator
                                  ?.name ||
                                  'EduSaaS Team'}
                              </span>

                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black">
                                <Icon
                                  name="check"
                                  size={10}
                                />
                                Verified
                              </span>

                              <span className="text-[10px] text-slate-400 font-bold">
                                {fmtRel(
                                  announcement.created_at ||
                                    announcement.createdAt
                                )}
                              </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 mt-3">
                              {
                                announcement.title
                              }
                            </h3>

                            <p className="text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-wrap">
                              {
                                announcement.message
                              }
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-4">
                              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-black">
                                Notice
                              </span>

                              {announcement.audience && (
                                <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-black">
                                  Audience:{' '}
                                  {
                                    announcement.audience
                                  }
                                </span>
                              )}

                              {announcement.attachment_url && (
                                <a
                                  href={
                                    announcement.attachment_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-black hover:bg-purple-100 transition-colors"
                                >
                                  View Attachment
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  )
                )}
              </div>
            )}

            {/* Connections */}
            {activeTab ===
              'Connections' && (
              <div className="space-y-5">
                {pendingRequests.length >
                  0 && (
                  <Card className="community-card rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center shadow-lg">
                        <Icon
                          name="userPlus"
                          size={20}
                        />
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-slate-900">
                          Pending Invitations
                        </h2>

                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          People who want to connect
                          with you.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {pendingRequests.map(
                        (req) => (
                          <div
                            key={
                              req.id
                            }
                            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center font-black shrink-0 shadow-lg">
                                {getInitials(
                                  req
                                    .requester
                                    ?.name
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-black text-slate-900 truncate">
                                  {
                                    req
                                      .requester
                                      ?.name
                                  }
                                </div>

                                <div className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                                  @
                                  {req
                                    .requester
                                    ?.username ||
                                    'user'}
                                  <span className="mx-1 text-slate-300">
                                    â€¢
                                  </span>
                                  {req
                                    .requester
                                    ?.role
                                    ?.name ||
                                    req
                                      .requester
                                      ?.role ||
                                    'Student'}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAcceptRequest(
                                    req.id
                                  )
                                }
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-md hover:-translate-y-0.5 transition-all"
                              >
                                Accept
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRejectRequest(
                                    req.id
                                  )
                                }
                                className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black hover:bg-rose-100 transition-all"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

                <Card className="community-card rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
                        <Icon
                          name="users"
                          size={20}
                        />
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-slate-900">
                          Your Network
                        </h2>

                        <p className="text-xs text-slate-500 font-medium">
                          {connectionsCount} active
                          connections
                        </p>
                      </div>
                    </div>
                  </div>

                  {networkConnections.length ===
                  0 ? (
                    <div className="py-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 text-slate-400 grid place-items-center">
                        <Icon
                          name="users"
                          size={25}
                        />
                      </div>

                      <h3 className="text-base font-black text-slate-700 mt-4">
                        Your network is waiting
                      </h3>

                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Search for members above and
                        start connecting.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {networkConnections.map(
                        (conn) => {
                          const friend =
                            conn.friend ||
                            conn.user ||
                            conn.connected_user ||
                            conn;

                          const connectionId =
                            conn.connectionId ||
                            conn.connection_id ||
                            conn.id;

                          return (
                            <div
                              key={
                                connectionId
                              }
                              className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 hover:shadow-lg transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white grid place-items-center font-black shrink-0">
                                  {getInitials(
                                    friend.name
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="text-sm font-black text-slate-900 truncate">
                                    {
                                      friend.name
                                    }
                                  </div>

                                  <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                    @
                                    {friend.username ||
                                      'user'}
                                    <span className="mx-1 text-slate-300">
                                      â€¢
                                    </span>
                                    {friend
                                      .role
                                      ?.name ||
                                      friend.role ||
                                      'Student'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    showToast(
                                      'Messaging feature coming soon!',
                                      'success'
                                    )
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-black hover:bg-indigo-100 transition-all"
                                >
                                  Message
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveConnection(
                                      connectionId
                                    )
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 text-xs font-black hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Posts */}
            {activeTab !==
              'Connections' &&
              activeTab !==
                'Announcements' && (
              <>
                {isLoading ? (
                  <Card className="community-card rounded-2xl p-14 text-center">
                    <div className="w-10 h-10 mx-auto rounded-full border-3 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <p className="text-sm font-black text-slate-600 mt-4">
                      Loading community feed...
                    </p>
                  </Card>
                ) : filteredPosts.length ===
                  0 ? (
                  <Card className="community-card rounded-2xl p-12 text-center">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-indigo-100 animate-pulse" />

                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center shadow-xl shadow-indigo-500/20">
                        <Icon
                          name="message"
                          size={31}
                        />
                      </div>
                    </div>

                    <h3 className="community-gradient-text text-2xl font-black mt-6">
                      No posts found
                    </h3>

                    <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto">
                      Try another search or switch to
                      a different community view.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveTab(
                          'All'
                        );
                      }}
                      className="mt-5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-all"
                    >
                      Clear Filters
                    </button>
                  </Card>
                ) : (
                  <div className="space-y-5">
                    {filteredPosts.map(
                      (post, index) => (
                        <Card
                          key={
                            post.id
                          }
                          id={`post-${post.id}`}
                          className="community-card community-post rounded-2xl overflow-hidden"
                          style={{
                            animationDelay: `${index * 45}ms`
                          }}
                        >
                          {/* Post header */}
                          <div className="p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                              <div className="community-avatar w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center font-black text-sm shrink-0">
                                {post.avatar ||
                                  getInitials(
                                    post.author
                                  )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-black text-slate-900">
                                    {
                                      post.author
                                    }
                                  </span>

                                  <span
                                    className={`px-2 py-0.5 rounded-full border text-[9px] font-black ${
                                      ROLE_CONFIG[
                                        post.role
                                      ]?.bg ||
                                      ROLE_CONFIG
                                        .Student
                                        .bg
                                    }`}
                                  >
                                    {ROLE_CONFIG[
                                      post.role
                                    ]?.label ||
                                      post.role}
                                  </span>

                                  {post.sentiment && (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[9px] font-black text-slate-500">
                                      Tone analyzed
                                    </span>
                                  )}

                                  {post.toxicity
                                    ?.is_toxic && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[9px] font-black text-rose-600">
                                      Safety flag
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold">
                                  <Icon
                                    name="clock"
                                    size={11}
                                  />
                                  {post.when}
                                  <span>
                                    â€¢
                                  </span>
                                  <span>
                                    {post.type}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleBookmark(
                                    post.id
                                  )
                                }
                                className={`w-9 h-9 rounded-xl grid place-items-center transition-all ${
                                  post.bookmarked
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                                title={
                                  post.bookmarked
                                    ? 'Remove bookmark'
                                    : 'Save post'
                                }
                              >
                                <Icon
                                  name="bookmark"
                                  size={16}
                                />
                              </button>
                            </div>

                            {/* Title/body */}
                            {post.title && (
                              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-[-.02em] mt-5">
                                {post.title}
                              </h3>
                            )}

                            {post.body && (
                              <p className="community-post-body text-sm text-slate-600 leading-relaxed mt-2.5 font-medium">
                                {
                                  post.body
                                }
                              </p>
                            )}

                            {/* Images */}
                            {post.images?.length >
                              0 && (
                              <div
                                className={`grid gap-2.5 mt-5 ${
                                  post.images
                                    .length ===
                                  1
                                    ? 'grid-cols-1'
                                    : post.images
                                        .length ===
                                      2
                                    ? 'grid-cols-2'
                                    : 'grid-cols-3'
                                }`}
                              >
                                {post.images
                                  .slice(
                                    0,
                                    3
                                  )
                                  .map(
                                    (
                                      image,
                                      imageIndex
                                    ) => {
                                      const src =
                                        typeof image ===
                                        'string'
                                          ? image
                                          : image.url ||
                                            image.image ||
                                            image.image_url;

                                      if (
                                        !src
                                      ) {
                                        return null;
                                      }

                                      return (
                                        <img
                                          key={
                                            imageIndex
                                          }
                                          src={
                                            src
                                          }
                                          alt="Community post"
                                          className="w-full h-52 object-cover rounded-2xl border border-slate-200 hover:scale-[1.01] transition-transform duration-300"
                                        />
                                      );
                                    }
                                  )}
                              </div>
                            )}

                            {/* Job details */}
                            {post.type ===
                              'Job' &&
                              post.jobDetails && (
                                <div className="mt-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-white text-amber-600 grid place-items-center shadow-sm">
                                      <Icon
                                        name="briefcase"
                                        size={17}
                                      />
                                    </div>

                                    <div>
                                      <div className="text-xs font-black text-amber-900">
                                        Hiring Opportunity
                                      </div>

                                      <div className="text-[10px] text-amber-700 font-semibold">
                                        {post.jobDetails
                                          .company ||
                                          'Opportunity'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid sm:grid-cols-3 gap-2 mt-4">
                                    <div className="rounded-xl bg-white/80 border border-amber-100 p-3">
                                      <div className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                                        Location
                                      </div>
                                      <div className="text-xs font-black text-slate-700 mt-1">
                                        {post
                                          .jobDetails
                                          .location ||
                                          'Remote'}
                                      </div>
                                    </div>

                                    <div className="rounded-xl bg-white/80 border border-amber-100 p-3">
                                      <div className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                                        Type
                                      </div>
                                      <div className="text-xs font-black text-slate-700 mt-1">
                                        {post
                                          .jobDetails
                                          .employment_type ||
                                          'Full-time'}
                                      </div>
                                    </div>

                                    <div className="rounded-xl bg-white/80 border border-amber-100 p-3">
                                      <div className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                                        Role
                                      </div>
                                      <div className="text-xs font-black text-slate-700 mt-1">
                                        {post
                                          .jobDetails
                                          .role ||
                                          post.title}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApplyJob(
                                        post.id
                                      )
                                    }
                                    disabled={
                                      post.applied
                                    }
                                    className={`mt-4 w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                                      post.applied
                                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5'
                                    }`}
                                  >
                                    {post.applied
                                      ? 'Application Submitted'
                                      : 'Apply Now'}
                                  </button>
                                </div>
                              )}

                            {/* Tags */}
                            {post.tags?.length >
                              0 && (
                              <div className="flex flex-wrap gap-2 mt-5">
                                {post.tags.map(
                                  (
                                    tag
                                  ) => (
                                    <span
                                      key={
                                        tag
                                      }
                                      className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black"
                                    >
                                      #
                                      {
                                        tag
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          {/* Footer actions */}
                          <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleLike(
                                    post.id
                                  )
                                }
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                  post.liked
                                    ? 'text-rose-600 bg-rose-50'
                                    : 'text-slate-500 hover:text-rose-600 hover:bg-white'
                                }`}
                              >
                                <Icon
                                  name="heart"
                                  size={16}
                                />
                                <span>
                                  {post.likes ||
                                    0}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleComments(
                                    post.id
                                  )
                                }
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-slate-500 hover:text-indigo-600 hover:bg-white transition-all"
                              >
                                <Icon
                                  name="message"
                                  size={16}
                                />
                                <span>
                                  {post
                                    .comments
                                    ?.length ||
                                    0}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  showToast(
                                    'Share link feature coming soon!',
                                    'success'
                                  )
                                }
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-slate-500 hover:text-indigo-600 hover:bg-white transition-all"
                              >
                                <Icon
                                  name="share"
                                  size={16}
                                />
                                <span className="hidden sm:inline">
                                  Share
                                </span>
                              </button>
                            </div>

                            <span className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                              Community
                            </span>
                          </div>

                          {/* Comments */}
                          {expandedComments[
                            post.id
                          ] && (
                            <div className="p-5 sm:p-6 bg-white border-t border-slate-100">
                              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 community-scroll">
                                {post
                                  .comments
                                  ?.length ===
                                0 ? (
                                  <div className="text-center py-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <div className="w-9 h-9 mx-auto rounded-xl bg-indigo-50 text-indigo-500 grid place-items-center">
                                      <Icon
                                        name="message"
                                        size={17}
                                      />
                                    </div>

                                    <p className="text-sm text-slate-500 font-semibold mt-2">
                                      Be the first to
                                      share your
                                      thoughts.
                                    </p>
                                  </div>
                                ) : (
                                  post.comments.map(
                                    (
                                      comment
                                    ) => (
                                      <div
                                        key={
                                          comment.id
                                        }
                                        className="flex gap-3"
                                      >
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 text-white font-black text-[10px] grid place-items-center shrink-0">
                                          {getInitials(
                                            comment.author
                                          )}
                                        </div>

                                        <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-black text-sm text-slate-800">
                                              {
                                                comment.author
                                              }
                                            </span>

                                            <span className="text-[9px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                              {
                                                comment.role
                                              }
                                            </span>
                                          </div>

                                          <p className="text-sm text-slate-700 leading-relaxed">
                                            {
                                              comment.text
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )
                                )}
                              </div>

                              <div className="flex gap-3 pt-4">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-[10px] grid place-items-center shrink-0 mt-1">
                                  {getInitials(
                                    displayName
                                  )}
                                </div>

                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={
                                      commentDrafts[
                                        post.id
                                      ] ||
                                      ''
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setCommentDrafts(
                                        {
                                          ...commentDrafts,
                                          [post.id]:
                                            e
                                              .target
                                              .value
                                        }
                                      )
                                    }
                                    placeholder="Write a comment..."
                                    className="w-full pl-4 pr-20 py-2.5 text-sm rounded-full border border-slate-300 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-inner"
                                    onKeyDown={(
                                      e
                                    ) => {
                                      if (
                                        e.key ===
                                        'Enter'
                                      ) {
                                        handleAddComment(
                                          post.id
                                        );
                                      }
                                    }}
                                  />

                                  <Button
                                    onClick={() =>
                                      handleAddComment(
                                        post.id
                                      )
                                    }
                                    disabled={
                                      !commentDrafts[
                                        post.id
                                      ]?.trim()
                                    }
                                    className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 rounded-full font-black shadow-sm disabled:opacity-50 transition-colors"
                                  >
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Card>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </main>

          {/* ===================================================
              RIGHT
          ==================================================== */}

          <aside className="community-right-column space-y-4">
            {/* Hiring */}
            <Card className="community-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[.15em] text-amber-500">
                    Opportunities
                  </div>

                  <h3 className="text-base font-black text-slate-900 mt-1">
                    Hiring Spotlight
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
                  <Icon
                    name="briefcase"
                    size={17}
                  />
                </div>
              </div>

              <ul className="space-y-2.5">
                {recentJobPosts.map(
                  (job) => (
                    <li
                      key={job.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all"
                    >
                      <div className="text-xs font-black text-slate-800 line-clamp-2">
                        {job.title}
                      </div>

                      <div className="text-[10px] text-slate-500 font-semibold mt-1.5">
                        {job.author}
                      </div>

                      <div className="inline-flex items-center gap-1 text-[9px] text-amber-700 font-black mt-2 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                        <Icon
                          name="globe"
                          size={10}
                        />
                        {job.jobDetails
                          ?.location ||
                          'Remote'}
                      </div>
                    </li>
                  )
                )}

                {recentJobPosts.length ===
                  0 && (
                  <li className="p-4 text-xs text-slate-500 text-center font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No active job postings.
                  </li>
                )}
              </ul>
            </Card>

            {/* Courses */}
            <Card className="community-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[.15em] text-emerald-500">
                    Learning
                  </div>

                  <h3 className="text-base font-black text-slate-900 mt-1">
                    Trending Courses
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
                  <Icon
                    name="book"
                    size={17}
                  />
                </div>
              </div>

              <ul className="space-y-2.5">
                {recentCoursePosts.map(
                  (coursePost) => (
                    <li
                      key={
                        coursePost.id
                      }
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all"
                    >
                      <div className="text-xs font-black text-slate-800 line-clamp-2">
                        {
                          coursePost.title
                        }
                      </div>

                      <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-lg bg-emerald-100 grid place-items-center">
                          <Icon
                            name="userPlus"
                            size={10}
                          />
                        </span>

                        {
                          coursePost.author
                        }
                      </div>
                    </li>
                  )
                )}

                {recentCoursePosts.length ===
                  0 && (
                  <li className="p-4 text-xs text-slate-500 text-center font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No recent courses.
                  </li>
                )}
              </ul>
            </Card>

            {/* Network mini card */}
            <Card className="community-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
                  <Icon
                    name="users"
                    size={18}
                  />
                </div>

                <div>
                  <div className="text-sm font-black text-slate-900">
                    Grow your network
                  </div>

                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Connect with people across EduSaaS.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalTab(
                    'connections'
                  );
                  setShowConnectionsModal(
                    true
                  );
                }}
                className="w-full mt-4 rounded-xl bg-slate-900 text-white py-2.5 text-xs font-black hover:bg-indigo-700 transition-all"
              >
                View Network
              </button>
            </Card>

            <div className="text-[10px] font-semibold text-slate-400 px-2 space-y-2 text-center pt-2">
              <p>
                Â© 2026 EduSaaS Inc.
              </p>

              <div className="flex justify-center gap-3">
                <a
                  href="/privacy"
                  className="hover:text-indigo-500 hover:underline transition-colors"
                >
                  Privacy
                </a>

                <a
                  href="/terms"
                  className="hover:text-indigo-500 hover:underline transition-colors"
                >
                  Terms
                </a>

                <a
                  href="/guidelines"
                  className="hover:text-indigo-500 hover:underline transition-colors"
                >
                  Guidelines
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* =====================================================
            TOAST
        ====================================================== */}

        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] max-w-[calc(100vw-24px)]">
            <div
              className={`px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-black flex items-center gap-2 border backdrop-blur-xl ${
                toastMessage.type ===
                'error'
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <span className="w-6 h-6 rounded-lg bg-white/10 grid place-items-center">
                <Icon
                  name={
                    toastMessage.type ===
                    'error'
                      ? 'info'
                      : 'check'
                  }
                  size={14}
                />
              </span>

              <span>
                {
                  toastMessage.message
                }
              </span>
            </div>
          </div>
        )}

        {/* =====================================================
            CONFIRM MODAL
        ====================================================== */}

        {confirmModal && (
          <div className="fixed inset-0 z-[1100] bg-slate-950/60 backdrop-blur-sm p-4 flex items-center justify-center">
            <Card className="community-modal w-full max-w-md rounded-3xl p-6 bg-white shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center">
                <Icon
                  name="trash"
                  size={21}
                />
              </div>

              <h2 className="text-xl font-black text-slate-900 mt-5">
                {
                  confirmModal.title
                }
              </h2>

              <p className="text-sm text-slate-500 leading-relaxed mt-2">
                {
                  confirmModal.message
                }
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal(
                      null
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    confirmModal.onConfirm?.()
                  }
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-lg transition-all ${
                    confirmModal.danger
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  }`}
                >
                  {confirmModal.confirmText ||
                    'Confirm'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* =====================================================
            CONNECTIONS MODAL
        ====================================================== */}

        {showConnectionsModal && (
          <div
            className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowConnectionsModal(
                  false
                );
              }
            }}
          >
            <Card className="community-modal w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-white/60">
              <div className="px-5 sm:px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-white to-indigo-50/50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[.16em] text-indigo-500">
                      Your Network
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Network & Connections
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowConnectionsModal(
                        false
                      )
                    }
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 grid place-items-center transition-all"
                  >
                    <Icon
                      name="x"
                      size={17}
                    />
                  </button>
                </div>

                <div className="flex gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setModalTab(
                        'connections'
                      )
                    }
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                      modalTab ===
                      'connections'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Connections (
                    {connectionsCount})
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setModalTab(
                        'pending'
                      )
                    }
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                      modalTab ===
                      'pending'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Pending (
                    {
                      pendingRequests.length
                    }
                    )
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 max-h-[62vh] overflow-y-auto community-scroll">
                {modalTab ===
                'connections' ? (
                  networkConnections.length ===
                  0 ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-500 grid place-items-center">
                        <Icon
                          name="users"
                          size={28}
                        />
                      </div>

                      <h3 className="text-lg font-black text-slate-800 mt-4">
                        No connections yet
                      </h3>

                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Start connecting with people in
                        the community.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {networkConnections.map(
                        (conn) => {
                          const friend =
                            conn.friend ||
                            conn.user ||
                            conn.connected_user ||
                            conn;

                          const connectionId =
                            conn.connectionId ||
                            conn.connection_id ||
                            conn.id;

                          return (
                            <div
                              key={
                                connectionId
                              }
                              className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:border-indigo-200 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white grid place-items-center font-black shrink-0">
                                  {getInitials(
                                    friend.name
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="text-sm font-black text-slate-900 truncate">
                                    {
                                      friend.name
                                    }
                                  </div>

                                  <div className="text-[10px] text-slate-500 font-semibold truncate">
                                    @
                                    {friend.username ||
                                      'user'}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveConnection(
                                    connectionId
                                  )
                                }
                                className="shrink-0 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black hover:bg-rose-100 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )
                ) : pendingRequests.length ===
                  0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 text-slate-400 grid place-items-center">
                      <Icon
                        name="clock"
                        size={27}
                      />
                    </div>

                    <h3 className="text-lg font-black text-slate-800 mt-4">
                      No pending requests
                    </h3>

                    <p className="text-xs text-slate-400 font-medium mt-1">
                      New connection invitations will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map(
                      (req) => (
                        <div
                          key={
                            req.id
                          }
                          className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center font-black shrink-0">
                              {getInitials(
                                req
                                  .requester
                                  ?.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 truncate">
                                {
                                  req
                                    .requester
                                    ?.name
                                }
                              </div>

                              <div className="text-[10px] text-slate-500 font-semibold truncate">
                                @
                                {req
                                  .requester
                                  ?.username ||
                                  'user'}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleAcceptRequest(
                                  req.id
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black hover:bg-indigo-700 transition-all"
                            >
                              Accept
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleRejectRequest(
                                  req.id
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black hover:bg-rose-100 transition-all"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* =====================================================
            CREATE POST MODAL
        ====================================================== */}

        {composerOpen && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
            <Card className="community-modal w-full max-w-2xl max-h-[90vh] shadow-2xl bg-white rounded-3xl flex flex-col border border-white/70 overflow-hidden my-auto">
              <div className="relative px-5 sm:px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/40 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[.16em] text-indigo-500">
                      Educator Community Composer
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Create a New Post
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setComposerOpen(
                        false
                      );
                      setNotifyDomainRoles(
                        []
                      );
                      setAiToneResult(
                        null
                      );
                    }}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 grid place-items-center transition-all"
                  >
                    <Icon
                      name="x"
                      size={17}
                    />
                  </button>
                </div>
              </div>

              <form
                onSubmit={
                  handleCreatePost
                }
                className="flex flex-col min-h-0"
              >
                <div className="px-5 sm:px-6 py-5 overflow-y-auto community-scroll space-y-5">
                  {/* Author / visibility */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center font-black shrink-0 shadow-lg">
                      {getInitials(
                        displayName
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-900">
                        {displayName}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                          <input
                            type="checkbox"
                            checked={
                              isPublic
                            }
                            onChange={(
                              e
                            ) =>
                              setIsPublic(
                                e
                                  .target
                                  .checked
                              )
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />

                          <Icon
                            name={
                              isPublic
                                ? 'globe'
                                : 'lock'
                            }
                            size={11}
                          />

                          {isPublic
                            ? 'Visible to Everyone'
                            : 'Restricted Visibility'}
                        </label>
                      </div>

                      {!isPublic && (
                        <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-indigo-950">
                              Select Audiences
                            </span>

                            <span className="text-[9px] font-bold text-indigo-500">
                              Admins can always view
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {[
                              'Student',
                              'Educator',
                              'Employer'
                            ].map(
                              (
                                role
                              ) => (
                                <label
                                  key={
                                    role
                                  }
                                  className={`inline-flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg border text-[10px] font-black transition-all ${
                                    visibleRoles.includes(
                                      role
                                    )
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={visibleRoles.includes(
                                      role
                                    )}
                                    onChange={(
                                      e
                                    ) => {
                                      if (
                                        e
                                          .target
                                          .checked
                                      ) {
                                        setVisibleRoles(
                                          (
                                            prev
                                          ) => [
                                            ...prev,
                                            role
                                          ]
                                        );
                                      } else {
                                        setVisibleRoles(
                                          (
                                            prev
                                          ) =>
                                            prev.filter(
                                              (
                                                item
                                              ) =>
                                                item !==
                                                role
                                            )
                                        );
                                      }
                                    }}
                                    className="hidden"
                                  />

                                  {role}
                                </label>
                              )
                            )}
                          </div>

                          {visibleRoles.length ===
                            0 && (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-2">
                              <Icon
                                name="info"
                                size={12}
                              />
                              Please select at least one
                              role.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title / body */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={
                        postTitle
                      }
                      onChange={(e) =>
                        setPostTitle(
                          e.target.value
                        )
                      }
                      placeholder="Enter an engaging title..."
                      required
                      className="w-full text-lg sm:text-xl font-black text-slate-800 placeholder:text-slate-300 bg-transparent border-none focus:ring-0 px-0 focus:outline-none"
                    />

                    <textarea
                      value={
                        postBody
                      }
                      onChange={(e) =>
                        setPostBody(
                          e.target.value
                        )
                      }
                      placeholder="What do you want to share with the educator community?"
                      rows={5}
                      required
                      className="w-full text-sm sm:text-base leading-relaxed text-slate-700 placeholder:text-slate-400 bg-transparent border-none focus:ring-0 px-0 resize-none focus:outline-none community-scroll"
                    />

                    {/* Images */}
                    {selectedImages.length >
                      0 && (
                      <div className="flex gap-3 overflow-x-auto py-1 community-scroll">
                        {selectedImages.map(
                          (
                            file,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group"
                            >
                              <img
                                src={URL.createObjectURL(
                                  file
                                )}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeImage(
                                    index
                                  )
                                }
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-950/70 hover:bg-rose-500 text-white rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Icon
                                  name="x"
                                  size={12}
                                />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* AI */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={
                          handleAiToneCheck
                        }
                        disabled={
                          aiChecking ||
                          (!postTitle.trim() &&
                            !postBody.trim())
                        }
                        className="inline-flex items-center gap-2 text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {aiChecking ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                            Analyzing Tone & Safety...
                          </>
                        ) : (
                          <>
                            <Icon
                              name="sparkles"
                              size={14}
                            />
                            AI Tone & Safety Pre-Check
                          </>
                        )}
                      </button>
                    </div>

                    {aiToneResult && (
                      <div className="p-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-700 text-xs">
                            AI Feedback:
                          </span>

                          {aiToneResult.sentiment && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                aiToneResult
                                  .sentiment
                                  .sentiment ===
                                  'POSITIVE' ||
                                aiToneResult
                                  .sentiment
                                  .label ===
                                  'POSITIVE'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : aiToneResult
                                      .sentiment
                                      .sentiment ===
                                      'NEGATIVE' ||
                                    aiToneResult
                                      .sentiment
                                      .label ===
                                      'NEGATIVE'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-slate-200 text-slate-700 border-slate-300'
                              }`}
                            >
                              {aiToneResult
                                .sentiment
                                .sentiment ===
                                'POSITIVE' ||
                              aiToneResult
                                .sentiment
                                .label ===
                                'POSITIVE'
                                ? 'Positive'
                                : aiToneResult
                                    .sentiment
                                    .sentiment ===
                                    'NEGATIVE' ||
                                  aiToneResult
                                    .sentiment
                                    .label ===
                                    'NEGATIVE'
                                ? 'Critical'
                                : 'Neutral'}

                              {aiToneResult
                                .sentiment
                                .confidence
                                ? ` (${Math.round(
                                    aiToneResult
                                      .sentiment
                                      .confidence *
                                      100
                                  )}%)`
                                : ''}
                            </span>
                          )}

                          {aiToneResult.toxicity && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                aiToneResult
                                  .toxicity
                                  .is_toxic
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <Icon
                                name="shield"
                                size={11}
                              />

                              {aiToneResult
                                .toxicity
                                .is_toxic
                                ? 'Toxic content flagged'
                                : 'Safe & Constructive'}

                              {typeof aiToneResult
                                .toxicity
                                .toxicity_score ===
                              'number'
                                ? ` (${Math.round(
                                    aiToneResult
                                      .toxicity
                                      .toxicity_score *
                                      100
                                  )}%)`
                                : ''}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setAiToneResult(
                              null
                            )
                          }
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Icon
                            name="x"
                            size={15}
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-indigo-500 bg-indigo-50 w-9 h-9 rounded-xl grid place-items-center shrink-0">
                      #
                    </span>

                    <input
                      type="text"
                      value={
                        postTags
                      }
                      onChange={(e) =>
                        setPostTags(
                          e.target.value
                        )
                      }
                      placeholder="Add tags (comma separated, e.g. React, Hiring, Updates)"
                      className="flex-1 text-sm font-medium text-slate-700 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
                    />
                  </div>

                  {/* Domain roles */}
                  {(postType ===
                    'Job' ||
                    postType ===
                      'Course') && (
                    <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-black text-indigo-950">
                          Select Related Domain Roles
                          <span className="text-rose-500 ml-1">
                            *
                          </span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                notifyDomainRoles.length ===
                                availableDomainRoles.length
                              ) {
                                setNotifyDomainRoles(
                                  []
                                );
                              } else {
                                setNotifyDomainRoles(
                                  [
                                    ...availableDomainRoles
                                  ]
                                );
                              }
                            }}
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full transition-all border ${
                              notifyDomainRoles.length ===
                              availableDomainRoles.length
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                            }`}
                          >
                            {notifyDomainRoles.length ===
                            availableDomainRoles.length
                              ? 'All Selected'
                              : 'Select All'}
                          </button>

                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-100/80 px-2 py-1 rounded-full">
                            {
                              notifyDomainRoles.length
                            }{' '}
                            /{' '}
                            {
                              availableDomainRoles.length
                            }
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Select the domain roles eligible
                        for this{' '}
                        {postType.toLowerCase()} post.
                        Eligible students will be notified.
                      </p>

                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 community-scroll">
                        <label
                          className={`flex items-center gap-1.5 text-[11px] font-black cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all ${
                            notifyDomainRoles.length ===
                              availableDomainRoles.length &&
                            availableDomainRoles.length >
                              0
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              notifyDomainRoles.length ===
                                availableDomainRoles.length &&
                              availableDomainRoles.length >
                                0
                            }
                            onChange={(
                              e
                            ) => {
                              setNotifyDomainRoles(
                                e.target
                                  .checked
                                  ? [
                                      ...availableDomainRoles
                                    ]
                                  : []
                              );
                            }}
                            className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />

                          All Domain Roles
                        </label>

                        {availableDomainRoles.map(
                          (role) => {
                            const checked =
                              notifyDomainRoles.includes(
                                role
                              );

                            return (
                              <label
                                key={
                                  role
                                }
                                className={`flex items-center gap-1.5 text-[11px] cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all ${
                                  checked
                                    ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-black shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  onChange={(
                                    e
                                  ) => {
                                    if (
                                      e
                                        .target
                                        .checked
                                    ) {
                                      setNotifyDomainRoles(
                                        (
                                          prev
                                        ) => [
                                          ...prev,
                                          role
                                        ]
                                      );
                                    } else {
                                      setNotifyDomainRoles(
                                        (
                                          prev
                                        ) =>
                                          prev.filter(
                                            (
                                              item
                                            ) =>
                                              item !==
                                              role
                                          )
                                      );
                                    }
                                  }}
                                  className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                />

                                {role}
                              </label>
                            );
                          }
                        )}
                      </div>

                      {notifyDomainRoles.length ===
                        0 && (
                        <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                          <Icon
                            name="info"
                            size={12}
                          />
                          Please select at least one domain
                          role to post.
                        </span>
                      )}
                    </div>
                  )}

                  {/* Upload / type */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-xs sm:text-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                        <Icon
                          name="image"
                          size={16}
                        />

                        <span>
                          Upload Image
                        </span>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={
                            handleImageChange
                          }
                          disabled={
                            selectedImages.length >=
                            3
                          }
                        />
                      </label>

                      <span className="text-[10px] font-bold text-slate-400">
                        {
                          selectedImages.length
                        }
                        /3 images
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        'Discussion',
                        'Job',
                        'Course',
                        'Project'
                      ].map(
                        (type) => {
                          const active =
                            postType ===
                            type;

                          return (
                            <button
                              key={
                                type
                              }
                              type="button"
                              onClick={() =>
                                setPostType(
                                  type
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-black rounded-xl transition-all border ${
                                active
                                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300 scale-[1.03]'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                              }`}
                            >
                              <Icon
                                name={
                                  type ===
                                  'Discussion'
                                    ? 'message'
                                    : type ===
                                      'Job'
                                    ? 'briefcase'
                                    : type ===
                                      'Course'
                                    ? 'book'
                                    : 'rocket'
                                }
                                size={14}
                              />

                              {type}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* Composer footer */}
                <div className="px-5 sm:px-6 py-3.5 flex justify-end gap-3 items-center border-t border-slate-200 bg-slate-50 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setComposerOpen(
                        false
                      );
                      setNotifyDomainRoles(
                        []
                      );
                      setAiToneResult(
                        null
                      );
                    }}
                    className="text-slate-600 hover:bg-slate-200 rounded-xl px-5 py-2.5 font-black transition-colors"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      !postTitle.trim() ||
                      !postBody.trim() ||
                      (!isPublic &&
                        visibleRoles.length ===
                          0) ||
                      ((postType ===
                        'Job' ||
                        postType ===
                          'Course') &&
                        notifyDomainRoles.length ===
                          0)
                    }
                    className={`community-radiant-button rounded-xl px-7 py-2.5 text-sm font-black transition-all ${
                      !postTitle.trim() ||
                      !postBody.trim() ||
                      (!isPublic &&
                        visibleRoles.length ===
                          0) ||
                      ((postType ===
                        'Job' ||
                        postType ===
                          'Course') &&
                        notifyDomainRoles.length ===
                          0)
                        ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none'
                        : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:-translate-y-0.5 text-white'
                    }`}
                  >
                    <span className="relative">
                      Post to Educator Community
                    </span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

