import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const TABS = ['Account', 'Notifications', 'Privacy', 'Preferences'];

const PREFS_KEY = 'edu_user_prefs';
const LANGUAGE_KEY = 'edu_language';
const TIME_ZONE_KEY = 'edu_time_zone';

const defaults = {
  profile_visibility: 'classmates',
  dark_mode: false,
  learning_reminders: true,
  language: 'en-US',
  time_zone: 'Asia/Kolkata',
  weekly_digest: true,
  activity_visible: true,
  show_progress: true,
  theme: 'Light',
};

const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: 'English (US)', native: 'English' },
  { value: 'en-GB', label: 'English (UK)', native: 'English' },
  { value: 'hi-IN', label: 'Hindi', native: 'à¤¹à¤¿à¤¨à¥à¤¦à¥€' },
  { value: 'te-IN', label: 'Telugu', native: 'à°¤à±†à°²à±à°—à±' },
  { value: 'ta-IN', label: 'Tamil', native: 'à®¤à®®à®¿à®´à¯' },
  { value: 'kn-IN', label: 'Kannada', native: 'à²•à²¨à³à²¨à²¡' },
  { value: 'ml-IN', label: 'Malayalam', native: 'à´®à´²à´¯à´¾à´³à´‚' },
  { value: 'bn-IN', label: 'Bengali', native: 'à¦¬à¦¾à¦‚à¦²à¦¾' },
  { value: 'mr-IN', label: 'Marathi', native: 'à¤®à¤°à¤¾à¤ à¥€' },
  { value: 'gu-IN', label: 'Gujarati', native: 'àª—à«àªœàª°àª¾àª¤à«€' },
  { value: 'pa-IN', label: 'Punjabi', native: 'à¨ªà©°à¨œà¨¾à¨¬à©€' },
  { value: 'or-IN', label: 'Odia', native: 'à¬“à¬¡à¬¼à¬¿à¬†' },
];

const TIME_ZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC â€” Coordinated Universal Time' },
  { value: 'Asia/Kolkata', label: 'India â€” Asia/Kolkata' },
  { value: 'Asia/Dubai', label: 'UAE â€” Asia/Dubai' },
  { value: 'Asia/Singapore', label: 'Singapore â€” Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Japan â€” Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: 'China â€” Asia/Shanghai' },
  { value: 'Asia/Seoul', label: 'South Korea â€” Asia/Seoul' },
  { value: 'Europe/London', label: 'UK â€” Europe/London' },
  { value: 'Europe/Paris', label: 'France â€” Europe/Paris' },
  { value: 'Europe/Berlin', label: 'Germany â€” Europe/Berlin' },
  { value: 'Africa/Cairo', label: 'Egypt â€” Africa/Cairo' },
  { value: 'America/New_York', label: 'US East â€” America/New_York' },
  { value: 'America/Chicago', label: 'US Central â€” America/Chicago' },
  { value: 'America/Denver', label: 'US Mountain â€” America/Denver' },
  { value: 'America/Los_Angeles', label: 'US Pacific â€” America/Los_Angeles' },
  { value: 'Australia/Sydney', label: 'Australia â€” Australia/Sydney' },
];

const TAB_META = {
  Account: {
    icon: 'user',
    small: 'ACCOUNT',
    title: 'Account',
    description: 'Profile, security and personal workspace controls',
  },
  Notifications: {
    icon: 'bell',
    small: 'ALERTS',
    title: 'Notifications',
    description: 'Manage the updates and reminders you receive',
  },
  Privacy: {
    icon: 'shield',
    small: 'PRIVACY',
    title: 'Privacy',
    description: 'Control activity and progress visibility',
  },
  Preferences: {
    icon: 'palette',
    small: 'STYLE',
    title: 'Preferences',
    description: 'Personalize your workspace appearance',
  },
};

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.7-3.4 3.2-5.2 7-5.2s6.3 1.8 7 5.2" />
        </svg>
      );

    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );

    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15" r="1" />
        </svg>
      );

    case 'moon':
      return (
        <svg {...common}>
          <path d="M20 15.5A8 8 0 0 1 8.5 4 8.2 8.2 0 1 0 20 15.5Z" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21" />
          <path d="M12 3c-2.2 2.5-3.3 5.5-3.3 9S9.8 18.5 12 21" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );

    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c.5-3.2 2.5-5 6-5s5.5 1.8 6 5" />
          <path d="M16 5.5a3 3 0 0 1 0 5.7" />
          <path d="M18 15c2 .5 3 2 3 4" />
        </svg>
      );

    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 5-6" />
        </svg>
      );

    case 'palette':
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12Z" />
          <circle cx="7.5" cy="10" r=".8" fill="currentColor" />
          <circle cx="9" cy="6.5" r=".8" fill="currentColor" />
          <circle cx="14" cy="6.5" r=".8" fill="currentColor" />
        </svg>
      );

    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 19 6v5c0 4.5-2.7 7.8-7 10-4.3-2.2-7-5.5-7-10V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case 'building':
      return (
        <svg {...common}>
          <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
          <path d="M16 9h3a1 1 0 0 1 1 1v11" />
          <path d="M8 7h3M8 11h3M8 15h3M8 19h3" />
          <path d="M2 21h20" />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    default:
      return null;
  }
}

function GradientIcon({ name, size = 20 }) {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-1 group-hover:shadow-indigo-500/30">
      <Icon name={name} size={size} />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-7 w-12 shrink-0 rounded-full p-1 transition-all duration-300',
        'focus:outline-none focus:ring-4 focus:ring-violet-500/10',
        checked
          ? 'bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25'
          : 'bg-slate-300 dark:bg-slate-700',
      ].join(' ')}
    >
      <span
        className={[
          'block h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

function SettingSelect({
  value,
  onChange,
  children,
  width = '200px',
  className = '',
}) {
  const widthClass =
    width === '180px'
      ? 'w-full sm:w-[180px]'
      : width === '190px'
        ? 'w-full sm:w-[190px]'
        : 'w-full sm:w-[200px]';

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        widthClass,
        'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800',
        'outline-none transition-all duration-200',
        'hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5',
        'focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-white',
        'dark:hover:border-indigo-600 dark:focus:border-violet-500',
        className,
      ].join(' ')}
    >
      {children}
    </select>
  );
}

function GlassRow({
  title,
  desc,
  icon,
  children,
  compactControl = false,
}) {
  return (
    <div
      className={[
        'group relative overflow-hidden rounded-[22px]',
        'border border-white/70 bg-white/70 backdrop-blur-xl',
        'shadow-[0_10px_35px_rgba(30,41,59,0.05)]',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:border-indigo-200 hover:bg-white',
        'hover:shadow-[0_18px_45px_rgba(79,70,229,0.10)]',
        'dark:border-slate-800/80 dark:bg-slate-900/60',
        'dark:hover:border-indigo-800 dark:hover:bg-slate-900',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-500 group-hover:w-full" />

      <div
        className={[
          'relative flex gap-4 p-4 sm:p-5',
          compactControl
            ? 'flex-col sm:flex-row sm:items-center sm:justify-between'
            : 'flex-col lg:flex-row lg:items-center lg:justify-between',
        ].join(' ')}
      >
        <div className="flex min-w-0 items-start gap-4">
          <GradientIcon name={icon} />

          <div className="min-w-0 pt-0.5">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {title}
            </div>

            <div className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              {desc}
            </div>
          </div>
        </div>

        <div className="relative shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
        {eyebrow}
      </div>

      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  setShow,
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14',
          'text-sm text-slate-900 outline-none transition-all',
          'placeholder:text-slate-400',
          'focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-white',
          'dark:focus:border-indigo-500 dark:focus:bg-slate-950',
        ].join(' ')}
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-950/40 dark:hover:text-violet-300"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);

    if (!raw) {
      return { ...defaults };
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return { ...defaults };
    }

    return {
      ...defaults,
      ...parsed,
    };
  } catch {
    return { ...defaults };
  }
}

function getLanguageName(value) {
  return (
    LANGUAGE_OPTIONS.find((item) => item.value === value)?.label ||
    'English (US)'
  );
}

function getNativeLanguageName(value) {
  return (
    LANGUAGE_OPTIONS.find((item) => item.value === value)?.native ||
    'English'
  );
}

function isValidTimeZone(value) {
  if (!value) return false;

  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: value,
    }).format();

    return true;
  } catch {
    return false;
  }
}

function getBrowserTimeZone() {
  try {
    const value = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (isValidTimeZone(value)) {
      return value;
    }
  } catch {
    // Ignore.
  }

  return 'Asia/Kolkata';
}

function getInitialTimeZone() {
  const stored = localStorage.getItem(TIME_ZONE_KEY);

  if (stored && isValidTimeZone(stored)) {
    return stored;
  }

  const prefs = loadPrefs();

  if (prefs.time_zone && isValidTimeZone(prefs.time_zone)) {
    return prefs.time_zone;
  }

  return getBrowserTimeZone();
}

function getTimeZoneLabel(value) {
  const selected = TIME_ZONE_OPTIONS.find(
    (item) => item.value === value
  );

  return selected?.label || value || 'Asia/Kolkata';
}

function EmployerSettings() {
  const { user, changePassword } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('Account');

  const [draft, setDraft] = useState(() => {
    const prefs = loadPrefs();

    const savedLanguage =
      localStorage.getItem(LANGUAGE_KEY) ||
      prefs.language ||
      'en-US';

    const savedTimeZone = getInitialTimeZone();

    return {
      ...prefs,
      language: savedLanguage,
      time_zone: savedTimeZone,
      dark_mode:
        document.documentElement.classList.contains('dark') ||
        Boolean(prefs.dark_mode),
      email: user?.email || '',
    };
  });

  const [savedStatus, setSavedStatus] = useState(null);

  const [passwordModal, setPasswordModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setDraft((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user?.email]);

  useEffect(() => {
    const currentLanguage =
      localStorage.getItem(LANGUAGE_KEY) ||
      draft.language ||
      'en-US';

    if (currentLanguage && i18n.language !== currentLanguage) {
      try {
        i18n.changeLanguage(currentLanguage);
      } catch {
        // Ignore.
      }
    }

    document.documentElement.lang = currentLanguage;
  }, [draft.language]);

  const applyLanguage = (language) => {
    if (!language) return;

    try {
      i18n.changeLanguage(language);
    } catch {
      // Ignore.
    }

    localStorage.setItem(LANGUAGE_KEY, language);

    const currentPrefs = loadPrefs();

    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        ...currentPrefs,
        language,
      })
    );

    document.documentElement.lang = language;

    window.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: language,
      })
    );
  };

  const applyTimeZone = (timeZone) => {
    if (!timeZone || !isValidTimeZone(timeZone)) {
      return;
    }

    localStorage.setItem(TIME_ZONE_KEY, timeZone);

    const currentPrefs = loadPrefs();

    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        ...currentPrefs,
        time_zone: timeZone,
      })
    );

    window.dispatchEvent(
      new CustomEvent('timeZoneChanged', {
        detail: timeZone,
      })
    );
  };

  const set = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === 'dark_mode') {
      document.documentElement.classList.toggle(
        'dark',
        Boolean(value)
      );
    }

    if (key === 'language') {
      applyLanguage(value);
    }

    if (key === 'time_zone') {
      applyTimeZone(value);
    }
  };

  const onSave = () => {
    try {
      const finalPrefs = {
        ...loadPrefs(),
        ...draft,
      };

      delete finalPrefs.email;

      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify(finalPrefs)
      );

      if (draft.language) {
        localStorage.setItem(
          LANGUAGE_KEY,
          draft.language
        );

        try {
          i18n.changeLanguage(draft.language);
        } catch {
          // Ignore.
        }

        document.documentElement.lang = draft.language;

        window.dispatchEvent(
          new CustomEvent('languageChanged', {
            detail: draft.language,
          })
        );
      }

      if (
        draft.time_zone &&
        isValidTimeZone(draft.time_zone)
      ) {
        localStorage.setItem(
          TIME_ZONE_KEY,
          draft.time_zone
        );

        window.dispatchEvent(
          new CustomEvent('timeZoneChanged', {
            detail: draft.time_zone,
          })
        );
      }

      document.documentElement.classList.toggle(
        'dark',
        Boolean(draft.dark_mode)
      );

      setSavedStatus({
        type: 'success',
        message: 'Settings saved successfully.',
      });

      window.setTimeout(() => {
        setSavedStatus(null);
      }, 2500);
    } catch {
      setSavedStatus({
        type: 'error',
        message: 'Unable to save settings. Please try again.',
      });
    }
  };

  const onCancel = () => {
    const storedPrefs = loadPrefs();

    const savedLanguage =
      localStorage.getItem(LANGUAGE_KEY) ||
      storedPrefs.language ||
      'en-US';

    const savedTimeZone =
      localStorage.getItem(TIME_ZONE_KEY) ||
      storedPrefs.time_zone ||
      'Asia/Kolkata';

    const restored = {
      ...defaults,
      ...storedPrefs,
      language: savedLanguage,
      time_zone: savedTimeZone,
      dark_mode:
        document.documentElement.classList.contains('dark') ||
        Boolean(storedPrefs.dark_mode),
      email: user?.email || '',
    };

    setDraft(restored);

    document.documentElement.classList.toggle(
      'dark',
      Boolean(restored.dark_mode)
    );

    try {
      i18n.changeLanguage(savedLanguage);
    } catch {
      // Ignore.
    }

    document.documentElement.lang = savedLanguage;

    setSavedStatus({
      type: 'success',
      message: 'Changes discarded.',
    });

    window.setTimeout(() => {
      setSavedStatus(null);
    }, 1800);
  };

  const changeTheme = (value) => {
    set('theme', value);

    if (value === 'Dark') {
      set('dark_mode', true);
    } else {
      set('dark_mode', false);
    }
  };

  const changeLanguage = (value) => {
    set('language', value);
  };

  const changeTimeZone = (value) => {
    if (!isValidTimeZone(value)) return;

    set('time_zone', value);
  };

  const openPasswordModal = () => {
    setPasswordStatus(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (passwordLoading) return;

    setPasswordModal(false);
    setPasswordStatus(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordChange = async () => {
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Please enter your current password.',
      });
      return;
    }

    if (!newPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Please enter a new password.',
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: 'New password must be at least 8 characters.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'New passwords do not match.',
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordStatus({
        type: 'error',
        message:
          'New password must be different from your current password.',
      });
      return;
    }

    if (typeof changePassword !== 'function') {
      setPasswordStatus({
        type: 'error',
        message: 'Password change is not available right now.',
      });
      return;
    }

    try {
      setPasswordLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordStatus({
        type: 'success',
        message: 'Password changed successfully.',
      });

      window.setTimeout(() => {
        setPasswordModal(false);
        setPasswordStatus(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1800);
    } catch (error) {
      let message =
        'Unable to change password. Please check your current password.';

      if (typeof error === 'string') {
        message = error;
      } else if (error?.message) {
        message = error.message;
      } else if (
        error?.errors &&
        Array.isArray(error.errors) &&
        error.errors[0]?.message
      ) {
        message = error.errors[0].message;
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      setPasswordStatus({
        type: 'error',
        message,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderAccount = () => (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="ACCOUNT SETTINGS"
        title="Your account, your control."
        description="Manage your profile visibility, account security and everyday workspace preferences."
      />

      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-[1px] shadow-[0_20px_60px_rgba(79,70,229,0.18)]">
        <div className="relative overflow-hidden rounded-[27px] bg-white/95 p-5 dark:bg-slate-950/90 sm:p-6">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-400/15 blur-3xl" />
          <div className="absolute -bottom-20 right-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/25">
                <Icon name="building" size={28} />

                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white bg-cyan-400 text-white dark:border-slate-950">
                  <Icon name="check" size={10} strokeWidth={2.5} />
                </span>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
                  EMPLOYER WORKSPACE
                </div>

                <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  Workspace identity
                </div>

                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Keep your account and workspace preferences up to date.
                </div>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              Account active
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <GlassRow
          title="Profile visibility"
          desc="Choose who can discover and view your profile."
          icon="users"
          compactControl
        >
          <SettingSelect
            value={draft.profile_visibility}
            onChange={(value) =>
              set('profile_visibility', value)
            }
          >
            <option value="public">Public</option>
            <option value="classmates">Classmates</option>
            <option value="private">Private</option>
          </SettingSelect>
        </GlassRow>

        <GlassRow
          title="Email address"
          desc="Your account email is used for important account communication."
          icon="mail"
        >
          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:min-w-[245px]">
            {user?.email || draft.email || 'Not available'}
          </div>
        </GlassRow>

        <GlassRow
          title="Account password"
          desc="Change your password to keep your account protected."
          icon="lock"
          compactControl
        >
          <button
            type="button"
            onClick={openPasswordModal}
            className="group/password inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
          >
            Change password
            <span className="transition-transform duration-200 group-hover/password:translate-x-1">
              <Icon name="arrow" size={15} />
            </span>
          </button>
        </GlassRow>

        <GlassRow
          title="Dark mode"
          desc="Use a darker visual experience throughout the application."
          icon="moon"
          compactControl
        >
          <Toggle
            checked={Boolean(draft.dark_mode)}
            onChange={(value) => set('dark_mode', value)}
          />
        </GlassRow>

        <GlassRow
          title="Learning reminders"
          desc="Receive reminders related to learning and platform activity."
          icon="bell"
          compactControl
        >
          <Toggle
            checked={Boolean(draft.learning_reminders)}
            onChange={(value) =>
              set('learning_reminders', value)
            }
          />
        </GlassRow>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-lg shadow-indigo-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-400/15 blur-3xl transition-all group-hover:bg-violet-400/25" />

          <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GradientIcon name="globe" size={18} />

                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    Language
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Interface language
                  </div>
                </div>
              </div>

              <span className="rounded-full bg-gradient-to-r from-violet-50 to-cyan-50 px-2.5 py-1 text-[10px] font-black text-indigo-600 dark:from-violet-950/50 dark:to-cyan-950/50 dark:text-indigo-300">
                {getNativeLanguageName(draft.language)}
              </span>
            </div>

            <SettingSelect
              value={draft.language}
              onChange={changeLanguage}
              width="200px"
              className="sm:w-full"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label} â€” {option.native}
                </option>
              ))}
            </SettingSelect>

            <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-violet-50/80 to-cyan-50/80 px-3 py-2.5 text-xs text-slate-500 dark:border-indigo-900 dark:from-violet-950/30 dark:to-cyan-950/30 dark:text-slate-400">
              Selected:{' '}
              <span className="font-black text-indigo-600 dark:text-indigo-300">
                {getLanguageName(draft.language)}
              </span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-lg shadow-cyan-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl transition-all group-hover:bg-cyan-400/25" />

          <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GradientIcon name="clock" size={18} />

                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    Time zone
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Dates and notifications
                  </div>
                </div>
              </div>

              <span className="rounded-full bg-gradient-to-r from-cyan-50 to-indigo-50 px-2.5 py-1 text-[10px] font-black text-cyan-700 dark:from-cyan-950/50 dark:to-indigo-950/50 dark:text-cyan-300">
                LOCAL
              </span>
            </div>

            <SettingSelect
              value={draft.time_zone}
              onChange={changeTimeZone}
              width="200px"
              className="sm:w-full"
            >
              {TIME_ZONE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </SettingSelect>

            <div className="mt-4 rounded-xl border border-cyan-100 bg-gradient-to-r from-cyan-50/80 to-indigo-50/80 px-3 py-2.5 text-xs text-slate-500 dark:border-cyan-900 dark:from-cyan-950/30 dark:to-indigo-950/30 dark:text-slate-400">
              Current:{' '}
              <span className="font-black text-cyan-700 dark:text-cyan-300">
                {getTimeZoneLabel(draft.time_zone)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="NOTIFICATION CENTER"
        title="Stay informed without the noise."
        description="Choose the updates that matter to you and keep unnecessary notifications out of your workspace."
      />

      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 p-[1px] shadow-xl shadow-indigo-500/15">
        <div className="relative overflow-hidden rounded-[27px] bg-slate-950 p-6 text-white sm:p-7">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute -bottom-28 left-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 ring-1 ring-white/10 backdrop-blur-md">
                <Icon name="bell" size={25} />
              </div>

              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-cyan-300">
                  SMART NOTIFICATIONS
                </div>

                <div className="mt-1 text-lg font-black">
                  Your notification rhythm
                </div>

                <div className="mt-1 text-sm text-slate-400">
                  Keep the information you need and reduce distractions.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Active preferences
              </div>

              <div className="mt-1 text-sm font-black text-white">
                {
                  [
                    draft.weekly_digest,
                    draft.learning_reminders,
                  ].filter(Boolean).length
                } of 2 enabled
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <GlassRow
          title="Weekly digest"
          desc="Receive a weekly summary of important activity and updates."
          icon="chart"
          compactControl
        >
          <Toggle
            checked={Boolean(draft.weekly_digest)}
            onChange={(value) =>
              set('weekly_digest', value)
            }
          />
        </GlassRow>

        <GlassRow
          title="Learning reminders"
          desc="Receive reminders about learning activities and platform engagement."
          icon="bell"
          compactControl
        >
          <Toggle
            checked={Boolean(draft.learning_reminders)}
            onChange={(value) =>
              set('learning_reminders', value)
            }
          />
        </GlassRow>
      </div>

      <div className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-5 dark:border-indigo-900 dark:from-violet-950/30 dark:via-slate-950 dark:to-cyan-950/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg">
            <Icon name="check" size={18} />
          </div>

          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              Notification settings are account-specific
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Your selections only affect the notifications delivered to
              your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="PRIVACY CENTER"
        title="You decide what others can see."
        description="Control your activity and progress visibility while keeping the rest of your account private."
      />

      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-2xl shadow-violet-500/15 sm:p-7">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-28 left-10 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
            <Icon name="shield" size={23} />
          </div>

          <div className="mt-5 text-2xl font-black">
            Privacy at your fingertips.
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
            Adjust visibility settings whenever you want. Your
            preferences can be changed without affecting your other
            account settings.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <GlassRow
          title="Activity visibility"
          desc="Allow your activity to be visible where supported by the platform."
          icon="users"
          compactControl
        >
          <Toggle
            checked={Boolean(draft.activity_visible)}
            onChange={(value) =>
              set('activity_visible', value)
            }
          />
        </GlassRow>

        <GlassRow
          title="Progress & leaderboards"
          desc="Allow your progress information to appear in supported progress and leaderboard views."
          icon="chart"
          compactControl
        >
          <Toggle
            checked={Boolean(draft.show_progress)}
            onChange={(value) =>
              set('show_progress', value)
            }
          />
        </GlassRow>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group rounded-[22px] border border-white/80 bg-white/70 p-5 shadow-lg shadow-violet-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <GradientIcon name="shield" size={18} />

            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                Privacy protection
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Visibility controls available
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-300">
            <Icon name="check" size={14} />
            Controls enabled
          </div>
        </div>

        <div className="group rounded-[22px] border border-white/80 bg-white/70 p-5 shadow-lg shadow-cyan-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <GradientIcon name="users" size={18} />

            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                Profile visibility
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Current visibility preference
              </div>
            </div>
          </div>

          <div className="mt-5 text-xs font-bold text-slate-600 dark:text-slate-300">
            Mode:{' '}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text font-black text-transparent">
              {draft.profile_visibility}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="VISUAL EXPERIENCE"
        title="Make the workspace feel like yours."
        description="Choose the appearance that works best for your daily employer workspace."
      />

      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-fuchsia-600 via-violet-600 to-cyan-500 p-[1px] shadow-2xl shadow-violet-500/15">
        <div className="relative overflow-hidden rounded-[29px] bg-white/95 p-6 dark:bg-slate-950/95 sm:p-7">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-xl shadow-violet-500/20">
                <Icon name="palette" size={25} />
              </div>

              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-violet-600 dark:text-violet-300">
                  THEME
                </div>

                <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  Workspace appearance
                </div>

                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Current theme: {draft.theme}
                </div>
              </div>
            </div>

            <SettingSelect
              value={draft.theme}
              onChange={changeTheme}
              width="200px"
            >
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
              <option value="SaaS Blue-White">
                SaaS Blue-White
              </option>
            </SettingSelect>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Light */}
        <button
          type="button"
          onClick={() => changeTheme('Light')}
          className={[
            'group relative overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-300',
            draft.theme === 'Light'
              ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-cyan-50 shadow-xl shadow-violet-500/10'
              : 'border-slate-200 bg-white/70 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl',
            'dark:border-slate-800 dark:bg-slate-900/60',
          ].join(' ')}
        >
          <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-violet-300/20 blur-2xl opacity-0 transition group-hover:opacity-100" />

          <div className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex h-20 gap-2">
              <div className="w-1/4 rounded-lg bg-gradient-to-b from-violet-100 to-cyan-50" />

              <div className="flex-1 space-y-2">
                <div className="h-2 w-2/3 rounded-full bg-slate-200" />
                <div className="h-8 rounded-xl bg-gradient-to-r from-violet-50 to-cyan-50" />
                <div className="h-3 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              Light
            </div>

            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Bright and clean
            </div>
          </div>
        </button>

        {/* Dark */}
        <button
          type="button"
          onClick={() => changeTheme('Dark')}
          className={[
            'group relative overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-300',
            draft.theme === 'Dark'
              ? 'border-indigo-400 bg-gradient-to-br from-indigo-950/60 to-violet-950/50 shadow-xl shadow-indigo-500/10'
              : 'border-slate-200 bg-white/70 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl',
            'dark:border-slate-800 dark:bg-slate-900/60',
          ].join(' ')}
        >
          <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-indigo-400/20 blur-2xl opacity-0 transition group-hover:opacity-100" />

          <div className="relative mb-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-sm">
            <div className="flex h-20 gap-2">
              <div className="w-1/4 rounded-lg bg-gradient-to-b from-indigo-950 to-violet-950" />

              <div className="flex-1 space-y-2">
                <div className="h-2 w-2/3 rounded-full bg-slate-700" />
                <div className="h-8 rounded-xl bg-gradient-to-r from-indigo-950 to-violet-950" />
                <div className="h-3 rounded-full bg-slate-800" />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              Dark
            </div>

            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Deep and immersive
            </div>
          </div>
        </button>

        {/* SaaS */}
        <button
          type="button"
          onClick={() => changeTheme('SaaS Blue-White')}
          className={[
            'group relative overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-300',
            draft.theme === 'SaaS Blue-White'
              ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-indigo-50 shadow-xl shadow-cyan-500/10'
              : 'border-slate-200 bg-white/70 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl',
            'dark:border-slate-800 dark:bg-slate-900/60',
          ].join(' ')}
        >
          <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl opacity-0 transition group-hover:opacity-100" />

          <div className="relative mb-4 overflow-hidden rounded-2xl border border-cyan-100 bg-white p-2 shadow-sm">
            <div className="flex h-20 gap-2">
              <div className="w-1/4 rounded-lg bg-gradient-to-b from-cyan-100 to-indigo-50" />

              <div className="flex-1 space-y-2">
                <div className="h-2 w-2/3 rounded-full bg-cyan-200" />
                <div className="h-8 rounded-xl bg-gradient-to-r from-cyan-50 to-indigo-50" />
                <div className="h-3 rounded-full bg-cyan-100" />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              SaaS Blue-White
            </div>

            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Crisp SaaS style
            </div>
          </div>
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 p-[1px]">
        <div className="rounded-[23px] bg-white/95 p-5 dark:bg-slate-950/95">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-white">
              <Icon name="palette" size={18} />
            </div>

            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                Theme preview
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Your selected appearance is applied immediately and
                can be saved using the Save Changes button below.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Notifications':
        return renderNotifications();

      case 'Privacy':
        return renderPrivacy();

      case 'Preferences':
        return renderPreferences();

      case 'Account':
      default:
        return renderAccount();
    }
  };

  const activeMeta = TAB_META[activeTab];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f7fb] px-3 py-4 text-slate-900 dark:bg-[#070711] dark:text-white sm:px-5 sm:py-6 lg:px-8">
      {/* ============================= */}
      {/* AURORA BACKGROUND */}
      {/* ============================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-[120px] dark:bg-violet-600/10" />

        <div className="absolute right-[-180px] top-[10%] h-[550px] w-[550px] rounded-full bg-cyan-400/15 blur-[130px] dark:bg-cyan-500/10" />

        <div className="absolute bottom-[-220px] left-[25%] h-[500px] w-[500px] rounded-full bg-fuchsia-400/10 blur-[130px] dark:bg-fuchsia-600/10" />

        <div className="absolute left-[45%] top-[35%] h-[300px] w-[300px] rounded-full bg-indigo-400/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* ============================= */}
        {/* GRADIENT HERO */}
        {/* ============================= */}

        <div className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-[1px] shadow-[0_25px_80px_rgba(79,70,229,0.20)]">
          <div className="relative overflow-hidden rounded-[31px] bg-slate-950">
            {/* Glow effects */}
            <div className="absolute -left-20 -top-32 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-[100px]" />

            <div className="absolute right-[-80px] top-[-100px] h-80 w-80 rounded-full bg-cyan-400/20 blur-[100px]" />

            <div className="absolute bottom-[-150px] left-[35%] h-80 w-80 rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur-md">
                    <Icon name="building" size={29} />

                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-slate-950 bg-gradient-to-r from-cyan-300 to-fuchsia-400 shadow-lg" />
                  </div>

                  <div>
                    <div className="text-[10px] font-black tracking-[0.3em] text-cyan-300">
                      VAYVORA â€¢ EMPLOYER SPACE
                    </div>

                    <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                      Settings
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                      Shape your workspace exactly the way you want it.
                      Manage account, notifications, privacy and
                      appearance from one beautiful control center.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <div className="relative">
                    <span className="block h-3 w-3 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Workspace
                    </div>

                    <div className="text-xs font-bold text-white">
                      All systems ready
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================= */}
              {/* GRADIENT TABS */}
              {/* ============================= */}

              <div className="mt-8 overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
                  {TABS.map((tab) => {
                    const meta = TAB_META[tab];
                    const active = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={[
                          'group relative flex items-center gap-2.5 rounded-xl px-4 py-3 text-left transition-all duration-300',
                          active
                            ? 'bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-900/30'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                            active
                              ? 'bg-white/15 text-white'
                              : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-cyan-300',
                          ].join(' ')}
                        >
                          <Icon name={meta.icon} size={17} />
                        </span>

                        <span>
                          <span className="block text-xs font-black">
                            {t(tab)}
                          </span>

                          <span
                            className={[
                              'mt-0.5 block text-[9px] font-bold tracking-wider',
                              active
                                ? 'text-white/65'
                                : 'text-slate-600',
                            ].join(' ')}
                          >
                            {meta.small}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* CONTENT */}
        {/* ============================= */}

        <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/60 shadow-[0_25px_80px_rgba(30,41,59,0.08)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/60">
          {/* Content glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-400/5 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 left-20 h-80 w-80 rounded-full bg-cyan-400/5 blur-[100px]" />

          {/* Section header */}
          <div className="relative border-b border-slate-200/60 px-5 py-5 dark:border-slate-800 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
                  {activeMeta.small}
                </div>

                <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                  {activeMeta.title}
                </div>
              </div>

              <div className="text-xs text-slate-400">
                {activeMeta.description}
              </div>
            </div>
          </div>

          {/* Actual tab content */}
          <div className="relative p-5 sm:p-8 lg:p-9">
            {renderContent()}
          </div>

          {/* ============================= */}
          {/* ACTION FOOTER */}
          {/* ============================= */}

          <div className="relative border-t border-slate-200/60 bg-white/40 px-5 py-5 dark:border-slate-800 dark:bg-slate-950/30 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[32px]">
                {savedStatus && (
                  <div
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold',
                      savedStatus.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'h-2 w-2 rounded-full',
                        savedStatus.type === 'success'
                          ? 'bg-emerald-500'
                          : 'bg-red-500',
                      ].join(' ')}
                    />

                    {savedStatus.message}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  className="w-full rounded-xl sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={onSave}
                  className="w-full !border-0 !bg-gradient-to-r !from-violet-500 !via-indigo-500 !to-cyan-400 !text-white !shadow-lg !shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:!from-violet-600 hover:!via-indigo-600 hover:!to-cyan-500 hover:!shadow-xl hover:!shadow-indigo-500/30 sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* PASSWORD MODAL */}
      {/* ============================= */}

      {passwordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-xl">
          <div
            className="absolute inset-0"
            onClick={closePasswordModal}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_30px_100px_rgba(79,70,229,0.35)]">
            <div className="relative overflow-hidden rounded-[29px] bg-white dark:bg-slate-950">
              {/* Modal top */}
              <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 px-6 py-7 text-white sm:px-7">
                <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-fuchsia-400/20 blur-3xl" />
                <div className="absolute -bottom-24 left-20 h-52 w-52 rounded-full bg-cyan-300/15 blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur-md">
                      <Icon name="lock" size={23} />
                    </div>

                    <div>
                      <div className="text-xl font-black">
                        Change password
                      </div>

                      <div className="mt-1 text-xs leading-5 text-white/70">
                        Update your account security credentials.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePasswordModal}
                    disabled={passwordLoading}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white/20 disabled:opacity-50"
                  >
                    âœ•
                  </button>
                </div>
              </div>

              {/* Modal content */}
              <div className="p-6 sm:p-7">
                {passwordStatus && (
                  <div
                    className={[
                      'mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold',
                      passwordStatus.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
                    ].join(' ')}
                  >
                    {passwordStatus.message}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                      Current password
                    </label>

                    <PasswordInput
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      placeholder="Enter current password"
                      show={showCurrent}
                      setShow={setShowCurrent}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                      New password
                    </label>

                    <PasswordInput
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Minimum 8 characters"
                      show={showNew}
                      setShow={setShowNew}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                      Confirm new password
                    </label>

                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Re-enter new password"
                      show={showConfirm}
                      setShow={setShowConfirm}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-r from-violet-50 to-cyan-50 p-4 dark:border-indigo-900 dark:from-violet-950/30 dark:to-cyan-950/20">
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                      <Icon name="shield" size={14} />
                    </div>

                    <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Use at least 8 characters and choose a password
                      that you do not use elsewhere.
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closePasswordModal}
                    disabled={passwordLoading}
                    className="w-full rounded-xl sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                    className="w-full !border-0 !bg-gradient-to-r !from-violet-500 !via-indigo-500 !to-cyan-400 !text-white !shadow-lg !shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
                  >
                    {passwordLoading
                      ? 'Changing...'
                      : 'Change password'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerSettings;