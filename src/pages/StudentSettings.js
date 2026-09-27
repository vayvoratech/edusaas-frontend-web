
import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const TABS = [
  'Account',
  'Notifications',
  'Privacy',
  'Preferences',
];

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

/* ================= LANGUAGE OPTIONS ================= */

const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: 'English (US)', nativeLabel: 'English' },
  { value: 'en-GB', label: 'English (UK)', nativeLabel: 'English' },
  { value: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { value: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { value: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { value: 'kn-IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { value: 'ml-IN', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { value: 'bn-IN', label: 'Bengali', nativeLabel: 'বাংলা' },
  { value: 'mr-IN', label: 'Marathi', nativeLabel: 'मराठी' },
  { value: 'gu-IN', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { value: 'pa-IN', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { value: 'or-IN', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
];

/* ================= TIME ZONE OPTIONS ================= */

const TIME_ZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },

  { value: 'Asia/Kolkata', label: 'India — Asia/Kolkata (IST)' },
  { value: 'Asia/Karachi', label: 'Pakistan — Asia/Karachi (PKT)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh — Asia/Dhaka (BST)' },
  { value: 'Asia/Kathmandu', label: 'Nepal — Asia/Kathmandu (NPT)' },
  { value: 'Asia/Colombo', label: 'Sri Lanka — Asia/Colombo' },
  { value: 'Asia/Dubai', label: 'UAE — Asia/Dubai (GST)' },
  { value: 'Asia/Riyadh', label: 'Saudi Arabia — Asia/Riyadh' },
  { value: 'Asia/Qatar', label: 'Qatar — Asia/Qatar' },
  { value: 'Asia/Muscat', label: 'Oman — Asia/Muscat' },
  { value: 'Asia/Bangkok', label: 'Thailand — Asia/Bangkok' },
  { value: 'Asia/Singapore', label: 'Singapore — Asia/Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia — Asia/Kuala_Lumpur' },
  { value: 'Asia/Jakarta', label: 'Indonesia — Asia/Jakarta' },
  { value: 'Asia/Manila', label: 'Philippines — Asia/Manila' },
  { value: 'Asia/Shanghai', label: 'China — Asia/Shanghai' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong — Asia/Hong_Kong' },
  { value: 'Asia/Taipei', label: 'Taiwan — Asia/Taipei' },
  { value: 'Asia/Tokyo', label: 'Japan — Asia/Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'South Korea — Asia/Seoul (KST)' },
  { value: 'Asia/Almaty', label: 'Kazakhstan — Asia/Almaty' },
  { value: 'Asia/Tashkent', label: 'Uzbekistan — Asia/Tashkent' },
  { value: 'Asia/Baku', label: 'Azerbaijan — Asia/Baku' },
  { value: 'Asia/Tbilisi', label: 'Georgia — Asia/Tbilisi' },
  { value: 'Asia/Yerevan', label: 'Armenia — Asia/Yerevan' },

  { value: 'Europe/London', label: 'United Kingdom — Europe/London' },
  { value: 'Europe/Dublin', label: 'Ireland — Europe/Dublin' },
  { value: 'Europe/Paris', label: 'France — Europe/Paris' },
  { value: 'Europe/Berlin', label: 'Germany — Europe/Berlin' },
  { value: 'Europe/Rome', label: 'Italy — Europe/Rome' },
  { value: 'Europe/Madrid', label: 'Spain — Europe/Madrid' },
  { value: 'Europe/Amsterdam', label: 'Netherlands — Europe/Amsterdam' },
  { value: 'Europe/Brussels', label: 'Belgium — Europe/Brussels' },
  { value: 'Europe/Zurich', label: 'Switzerland — Europe/Zurich' },
  { value: 'Europe/Vienna', label: 'Austria — Europe/Vienna' },
  { value: 'Europe/Stockholm', label: 'Sweden — Europe/Stockholm' },
  { value: 'Europe/Oslo', label: 'Norway — Europe/Oslo' },
  { value: 'Europe/Copenhagen', label: 'Denmark — Europe/Copenhagen' },
  { value: 'Europe/Helsinki', label: 'Finland — Europe/Helsinki' },
  { value: 'Europe/Warsaw', label: 'Poland — Europe/Warsaw' },
  { value: 'Europe/Athens', label: 'Greece — Europe/Athens' },
  { value: 'Europe/Istanbul', label: 'Turkey — Europe/Istanbul' },
  { value: 'Europe/Moscow', label: 'Russia — Europe/Moscow' },

  { value: 'Africa/Cairo', label: 'Egypt — Africa/Cairo' },
  { value: 'Africa/Johannesburg', label: 'South Africa — Africa/Johannesburg' },
  { value: 'Africa/Nairobi', label: 'Kenya — Africa/Nairobi' },
  { value: 'Africa/Lagos', label: 'Nigeria — Africa/Lagos' },

  { value: 'America/New_York', label: 'US Eastern — America/New_York' },
  { value: 'America/Chicago', label: 'US Central — America/Chicago' },
  { value: 'America/Denver', label: 'US Mountain — America/Denver' },
  { value: 'America/Los_Angeles', label: 'US Pacific — America/Los_Angeles' },
  { value: 'America/Anchorage', label: 'US Alaska — America/Anchorage' },
  { value: 'Pacific/Honolulu', label: 'US Hawaii — Pacific/Honolulu' },
  { value: 'America/Toronto', label: 'Canada Eastern — America/Toronto' },
  { value: 'America/Vancouver', label: 'Canada Pacific — America/Vancouver' },
  { value: 'America/Mexico_City', label: 'Mexico — America/Mexico_City' },

  { value: 'America/Sao_Paulo', label: 'Brazil — America/Sao_Paulo' },
  {
    value: 'America/Argentina/Buenos_Aires',
    label: 'Argentina — America/Argentina/Buenos_Aires',
  },

  { value: 'Australia/Sydney', label: 'Australia Eastern — Australia/Sydney' },
  { value: 'Australia/Melbourne', label: 'Australia Melbourne — Australia/Melbourne' },
  { value: 'Australia/Brisbane', label: 'Australia Brisbane — Australia/Brisbane' },
  { value: 'Australia/Perth', label: 'Australia Western — Australia/Perth' },
  { value: 'Pacific/Auckland', label: 'New Zealand — Pacific/Auckland' },
];

/* ================= ICONS ================= */

function Icon({ name, size = 19 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.8-3.4 3.2-5.2 7-5.2s6.2 1.8 7 5.2" />
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
          <path d="M12 14v2" />
        </svg>
      );

    case 'moon':
      return (
        <svg {...common}>
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
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
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'users':
      return (
        <svg {...common}>
          <path d="M16 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 2 19.5V21" />
          <circle cx="9" cy="7" r="3.5" />
          <path d="M16 3.5a3.5 3.5 0 0 1 0 7" />
          <path d="M17 15.2a4.5 4.5 0 0 1 5 4.3V21" />
        </svg>
      );

    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <rect x="7" y="12" width="2.5" height="5" rx=".5" />
          <rect x="11" y="9" width="2.5" height="8" rx=".5" />
          <rect x="15" y="6" width="2.5" height="11" rx=".5" />
        </svg>
      );

    case 'palette':
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h2.5A6.5 6.5 0 0 0 21 6.5 9 9 0 0 0 12 3Z" />
          <circle cx="7.5" cy="9" r="1" fill="currentColor" stroke="none" />
          <circle cx="10" cy="6.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );

    default:
      return null;
  }
}

/* ================= TOGGLE ================= */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative
        h-7
        w-12
        shrink-0
        rounded-full
        border
        transition-all
        duration-300
        ${
          checked
            ? `
              border-blue-500/70
              bg-blue-600
              shadow-[0_0_16px_rgba(59,130,246,0.28)]
            `
            : `
              border-slate-300
              bg-slate-200
              dark:border-slate-600
              dark:bg-slate-700
            `
        }
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/30
      `}
    >
      <span
        className={`
          absolute
          top-1/2
          h-5
          w-5
          -translate-y-1/2
          rounded-full
          bg-white
          shadow-sm
          transition-all
          duration-300
          ${checked ? 'left-[24px]' : 'left-[2px]'}
        `}
      />
    </button>
  );
}

/* ================= SETTING ROW ================= */

function Row({
  title,
  desc,
  icon,
  children,
  compactControl = false,
}) {
  return (
    <div className="group relative py-1">
      <div
        className="
          pointer-events-none
          absolute
          -inset-x-1
          -inset-y-1
          rounded-2xl
          opacity-0
          blur-xl
          transition-all
          duration-300
          group-hover:opacity-100
          group-hover:bg-blue-500/[0.07]
          dark:group-hover:bg-blue-400/[0.08]
        "
      />

      <div
        className={`
          relative
          grid
          gap-4
          rounded-2xl
          border
          border-transparent
          px-3
          py-4
          transition-all
          duration-300
          sm:grid-cols-[minmax(0,1fr)_auto]
          sm:items-center
          sm:gap-5
          sm:px-4
          ${
            compactControl
              ? 'grid-cols-[minmax(0,1fr)_auto] items-center'
              : 'grid-cols-1'
          }
          group-hover:border-slate-200
          group-hover:bg-slate-50/80
          dark:group-hover:border-slate-700
          dark:group-hover:bg-slate-800/70
        `}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-slate-500
              transition-all
              duration-300
              group-hover:border-blue-200
              group-hover:bg-blue-50
              group-hover:text-blue-600
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-400
              dark:group-hover:border-slate-600
              dark:group-hover:bg-slate-700
              dark:group-hover:text-blue-400
            "
          >
            <Icon name={icon} />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="
                break-words
                text-sm
                font-semibold
                text-slate-800
                transition-colors
                duration-300
                group-hover:text-blue-700
                dark:text-slate-100
                dark:group-hover:text-blue-300
              "
            >
              {title}
            </div>

            {desc && (
              <div
                className="
                  mt-1
                  max-w-2xl
                  break-words
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {desc}
              </div>
            )}
          </div>
        </div>

        <div
          className={`
            flex
            min-w-0
            items-center
            ${
              compactControl
                ? 'w-auto shrink-0 justify-end'
                : 'w-full justify-start sm:w-auto sm:justify-end'
            }
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= SELECT ================= */

function SettingSelect({
  value,
  onChange,
  children,
  width = '190px',
  className = '',
}) {
  const widthClass =
    width === '200px'
      ? 'sm:min-w-[200px]'
      : width === '180px'
        ? 'sm:min-w-[180px]'
        : 'sm:min-w-[190px]';

  return (
    <select
      value={value}
      onChange={onChange}
      className={`
        w-full
        max-w-full
        ${widthClass}
        cursor-pointer
        rounded-xl
        border
        border-slate-300
        bg-white
        px-3
        py-2.5
        text-sm
        font-medium
        text-slate-700
        outline-none
        transition-all
        duration-300
        hover:border-blue-300
        hover:bg-slate-50
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-500/20
        dark:border-slate-600
        dark:bg-slate-800
        dark:text-slate-100
        dark:hover:border-slate-500
        dark:hover:bg-slate-700
        dark:focus:border-blue-500
        dark:focus:ring-blue-500/20
        ${className}
      `}
    >
      {children}
    </select>
  );
}

/* ================= LOAD ================= */

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);

    if (!raw) {
      return { ...defaults };
    }

    const parsed = JSON.parse(raw);

    return {
      ...defaults,
      ...parsed,
    };
  } catch {
    return { ...defaults };
  }
}

/* ================= LANGUAGE HELPERS ================= */

function getLanguageName(language) {
  const selected = LANGUAGE_OPTIONS.find(
    (item) => item.value === language
  );

  return selected?.label || 'English (US)';
}

function getNativeLanguageName(language) {
  const selected = LANGUAGE_OPTIONS.find(
    (item) => item.value === language
  );

  return selected?.nativeLabel || 'English';
}

/* ================= TIME ZONE HELPERS ================= */

function isValidTimeZone(timeZone) {
  if (!timeZone) {
    return false;
  }

  try {
    Intl.DateTimeFormat('en-US', {
      timeZone,
    }).format();

    return true;
  } catch {
    return false;
  }
}

function getBrowserTimeZone() {
  try {
    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (
      browserTimeZone &&
      isValidTimeZone(browserTimeZone)
    ) {
      return browserTimeZone;
    }

    return 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

function getInitialTimeZone(storedPrefs) {
  const savedTimeZone =
    localStorage.getItem(TIME_ZONE_KEY);

  if (
    savedTimeZone &&
    isValidTimeZone(savedTimeZone)
  ) {
    return savedTimeZone;
  }

  if (
    storedPrefs?.time_zone &&
    isValidTimeZone(storedPrefs.time_zone)
  ) {
    return storedPrefs.time_zone;
  }

  return getBrowserTimeZone();
}

function getTimeZoneLabel(timeZone) {
  const selected = TIME_ZONE_OPTIONS.find(
    (item) => item.value === timeZone
  );

  const countryName =
    selected?.label?.split(' — ')[0] ||
    'UTC';

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date());

    const offset = parts.find(
      (part) => part.type === 'timeZoneName'
    )?.value;

    if (!offset || offset === 'GMT') {
      return `${countryName} — UTC+0:00`;
    }

    const match = offset.match(
      /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/
    );

    if (!match) {
      return `${countryName} — ${offset.replace(
        'GMT',
        'UTC'
      )}`;
    }

    const [, sign, hours, minutes = '00'] = match;

    return `${countryName} — UTC${sign}${Number(
      hours
    )}:${minutes}`;
  } catch {
    return `${countryName} — UTC+0:00`;
  }
}

/* ================= APPLY LANGUAGE ================= */

async function applyLanguage(language) {
  try {
    await i18n.changeLanguage(language);

    localStorage.setItem(
      LANGUAGE_KEY,
      language
    );

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
        detail: {
          language,
        },
      })
    );
  } catch (error) {
    console.error(
      'Failed to apply language:',
      error
    );
  }
}

/* ================= APPLY TIME ZONE ================= */

function applyTimeZone(timeZone) {
  if (!isValidTimeZone(timeZone)) {
    return;
  }

  localStorage.setItem(
    TIME_ZONE_KEY,
    timeZone
  );

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
      detail: {
        timeZone,
      },
    })
  );
}

/* ================= PASSWORD INPUT ================= */

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="
            w-full
            rounded-xl
            border
            border-slate-300
            bg-white
            px-3
            py-3
            pr-20
            text-sm
            text-slate-800
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            dark:border-slate-600
            dark:bg-slate-800
            dark:text-slate-100
            dark:placeholder:text-slate-500
          "
        />

        <button
          type="button"
          onClick={onToggle}
          className="
            absolute
            right-2
            top-1/2
            -translate-y-1/2
            rounded-lg
            px-2.5
            py-1.5
            text-xs
            font-medium
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-slate-700
            dark:text-slate-400
            dark:hover:bg-slate-700
            dark:hover:text-slate-200
          "
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function StudentSettings() {
  const { user, changePassword } = useAuth();
  const { t } = useTranslation();

  const [tab, setTab] = useState('Account');

  const [draft, setDraft] = useState(() => {
    const stored = loadPrefs();

    const savedLanguage =
      localStorage.getItem(LANGUAGE_KEY) ||
      stored.language ||
      'en-US';

    const savedTimeZone =
      getInitialTimeZone(stored);

    return {
      ...stored,
      language: savedLanguage,
      time_zone: savedTimeZone,
      dark_mode:
        document.documentElement.classList.contains(
          'dark'
        ),
      email: user?.email || '',
    };
  });

  const [saved, setSaved] = useState(null);

  /* ================= PASSWORD STATE ================= */

  const [passwordOpen, setPasswordOpen] = useState(false);

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState('');

  const [passwordSuccess, setPasswordSuccess] =
    useState(false);

  /* ================= LANGUAGE SYNC ================= */

  useEffect(() => {
    const currentLanguage =
      i18n.language ||
      localStorage.getItem(LANGUAGE_KEY) ||
      'en-US';

    document.documentElement.lang =
      currentLanguage;

    setDraft((prev) => ({
      ...prev,
      language: currentLanguage,
    }));
  }, []);

  /* ================= TIME ZONE SYNC ================= */

  useEffect(() => {
    const stored = loadPrefs();

    const currentTimeZone =
      getInitialTimeZone(stored);

    setDraft((prev) => ({
      ...prev,
      time_zone: currentTimeZone,
    }));

    applyTimeZone(currentTimeZone);
  }, []);

  /* ================= SET ================= */

  const set = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === 'dark_mode') {
      document.documentElement.classList.toggle(
        'dark',
        !!value
      );
    }

    if (key === 'language') {
      applyLanguage(value);
    }

    if (key === 'time_zone') {
      applyTimeZone(value);
    }
  };

  /* ================= SAVE ================= */

  const onSave = () => {
    try {
      const { email, ...prefs } = draft;

      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify(prefs)
      );

      if (draft.language) {
        localStorage.setItem(
          LANGUAGE_KEY,
          draft.language
        );

        document.documentElement.lang =
          draft.language;
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
            detail: {
              timeZone: draft.time_zone,
            },
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent('languageChanged', {
          detail: {
            language: draft.language,
          },
        })
      );

      setSaved('ok');

      setTimeout(() => {
        setSaved(null);
      }, 2500);
    } catch {
      setSaved('error');
    }
  };

  /* ================= CANCEL ================= */

  const onCancel = () => {
    const stored = loadPrefs();

    const language =
      localStorage.getItem(LANGUAGE_KEY) ||
      stored.language ||
      'en-US';

    const timeZone =
      getInitialTimeZone(stored);

    setDraft({
      ...stored,
      language,
      time_zone: timeZone,
      email: user?.email || '',
    });

    document.documentElement.classList.toggle(
      'dark',
      !!stored.dark_mode
    );

    applyLanguage(language);
    applyTimeZone(timeZone);
  };

  /* ================= THEME ================= */

  const changeTheme = (value) => {
    set('theme', value);

    if (value === 'Dark') {
      set('dark_mode', true);
    } else {
      set('dark_mode', false);
    }
  };

  /* ================= LANGUAGE CHANGE ================= */

  const changeLanguage = (language) => {
    set('language', language);
  };

  /* ================= TIME ZONE CHANGE ================= */

  const changeTimeZone = (timeZone) => {
    if (!isValidTimeZone(timeZone)) {
      return;
    }

    set('time_zone', timeZone);
  };

  /* ================= OPEN PASSWORD ================= */

  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setPasswordOpen(true);
  };

  /* ================= CLOSE PASSWORD ================= */

  const closePasswordModal = () => {
    if (passwordLoading) {
      return;
    }

    setPasswordOpen(false);
    setPasswordError('');
    setPasswordSuccess(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  /* ================= CHANGE PASSWORD ================= */

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword.trim()) {
      setPasswordError(
        'Please enter your current password.'
      );
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError(
        'Please enter your new password.'
      );
      return;
    }

    if (!confirmPassword.trim()) {
      setPasswordError(
        'Please confirm your new password.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New password and confirm password do not match.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        'New password must be different from your current password.'
      );
      return;
    }

    if (typeof changePassword !== 'function') {
      setPasswordError(
        'Password change is not available. Please check the authentication configuration.'
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setPasswordOpen(false);
        setPasswordSuccess(false);
      }, 1800);
    } catch (error) {
      console.error(
        'Password change failed:',
        error
      );

      let message =
        'Unable to change your password. Please check your current password and try again.';

      if (
        error?.errors?.[0]?.longMessage
      ) {
        message =
          error.errors[0].longMessage;
      } else if (
        error?.errors?.[0]?.message
      ) {
        message =
          error.errors[0].message;
      } else if (error?.message) {
        message = error.message;
      }

      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <div
        className="
          w-full
          max-w-full
          space-y-6
        "
      >
        {/* ================= HEADER ================= */}

        <div>
          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-slate-50
            "
          >
            {t('settings')}
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            {t('manage_account_description')}
          </p>
        </div>

        {/* ================= CARD ================= */}

        <Card
          className="
            !w-full
            !max-w-full
            !overflow-hidden
            !p-0
            !border
            !border-slate-200
            !bg-white
            !shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            dark:!border-slate-800
            dark:!bg-slate-950
            dark:!shadow-[0_10px_40px_rgba(0,0,0,0.30)]
          "
        >
          {/* ================= TABS ================= */}

          <div
            className="
              flex
              overflow-x-auto
              border-b
              border-slate-200
              bg-slate-50
              px-3
              sm:px-5
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            {TABS.map((item) => {
              const tabKey = item.toLowerCase();

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`
                    relative
                    shrink-0
                    px-4
                    py-4
                    text-sm
                    font-medium
                    transition-all
                    duration-300

                    ${
                      tab === item
                        ? `
                          text-blue-600
                          dark:text-blue-400
                        `
                        : `
                          text-slate-500
                          hover:text-slate-800
                          dark:text-slate-400
                          dark:hover:text-slate-200
                        `
                    }
                  `}
                >
                  {t(tabKey)}

                  {tab === item && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-3
                        right-3
                        h-0.5
                        rounded-full
                        bg-blue-500
                        dark:bg-blue-400
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ================= CONTENT ================= */}

          <div
            className="
              px-3
              py-4
              sm:px-5
              sm:py-5
              dark:bg-slate-950
            "
          >
            {/* ================= ACCOUNT ================= */}

            {tab === 'Account' && (
              <div className="animate-fade-in">
                <Row
                  title={t('profile_visibility')}
                  icon="user"
                >
                  <SettingSelect
                    value={draft.profile_visibility}
                    onChange={(e) =>
                      set(
                        'profile_visibility',
                        e.target.value
                      )
                    }
                    className="w-full sm:w-64"
                  >
                    <option value="classmates">
                      {t('visible_to_all_classmates')}
                    </option>

                    <option value="private">
                      {t('private')}
                    </option>

                    <option value="public">
                      {t('public')}
                    </option>
                  </SettingSelect>
                </Row>

                <Row
                  title={t('email_address')}
                  desc={t('email_read_only')}
                  icon="mail"
                >
                  <input
                    value={draft.email}
                    readOnly
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-3
                      py-2.5
                      text-sm
                      text-slate-600
                      outline-none
                      sm:w-64
                      dark:border-slate-700
                      dark:bg-slate-800
                      dark:text-slate-300
                    "
                  />
                </Row>

                {/* ================= CHANGE PASSWORD ================= */}

                <Row
                  title={t('change_password')}
                  desc="Update your account password securely."
                  icon="lock"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openPasswordModal}
                    className="
                      w-full
                      sm:w-auto
                      sm:min-w-[110px]
                    "
                  >
                    {t('change')}
                  </Button>
                </Row>

                <Row
                  title={t('enable_dark_mode')}
                  desc={t('dark_mode_description')}
                  icon="moon"
                >
                  <Toggle
                    checked={draft.dark_mode}
                    onChange={(value) =>
                      set(
                        'dark_mode',
                        value
                      )
                    }
                  />
                </Row>

                {/* ================= RESPONSIVE LEARNING REMINDER ================= */}

                <Row
                  title={t('learning_reminders')}
                  desc={t('receive_task_reminders')}
                  icon="bell"
                  compactControl
                >
                  <Toggle
                    checked={
                      draft.learning_reminders
                    }
                    onChange={(value) =>
                      set(
                        'learning_reminders',
                        value
                      )
                    }
                  />
                </Row>

                {/* ================= LANGUAGE ================= */}

                <Row
                  title={t('language')}
                  desc={t('choose_preferred_language')}
                  icon="globe"
                >
                  <div
                    className="
                      flex
                      w-full
                      min-w-0
                      flex-col
                      gap-3
                      sm:w-auto
                      sm:flex-row
                      sm:items-center
                    "
                  >
                    <SettingSelect
                      value={draft.language}
                      onChange={(e) =>
                        changeLanguage(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        sm:w-64
                        max-w-full
                      "
                    >
                      {LANGUAGE_OPTIONS.map(
                        (language) => (
                          <option
                            key={language.value}
                            value={language.value}
                          >
                            {language.label}
                          </option>
                        )
                      )}
                    </SettingSelect>

                    <div
                      className="
                        flex
                        min-h-[52px]
                        w-full
                        min-w-0
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-blue-200
                        bg-blue-50
                        px-4
                        py-2
                        text-center
                        transition-all
                        duration-300
                        sm:w-52
                        dark:border-blue-900
                        dark:bg-blue-950
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-wider
                          text-blue-500
                          dark:text-blue-400
                        "
                      >
                        {t('selected_language')}
                      </span>

                      <span
                        className="
                          mt-0.5
                          max-w-full
                          truncate
                          text-sm
                          font-semibold
                          text-blue-700
                          dark:text-blue-300
                        "
                      >
                        {getNativeLanguageName(
                          draft.language
                        )}
                      </span>

                      <span
                        className="
                          max-w-full
                          truncate
                          text-[11px]
                          text-blue-600/80
                          dark:text-blue-300/80
                        "
                      >
                        {getLanguageName(
                          draft.language
                        )}
                      </span>
                    </div>
                  </div>
                </Row>

                {/* ================= TIME ZONE ================= */}

                <Row
                  title={t('time_zone')}
                  desc={
                    t('choose_time_zone') !==
                    'choose_time_zone'
                      ? t('choose_time_zone')
                      : 'Choose the time zone used for dates and times.'
                  }
                  icon="clock"
                >
                  <div
                    className="
                      flex
                      w-full
                      min-w-0
                      flex-col
                      gap-3
                      sm:w-auto
                      sm:flex-row
                      sm:items-center
                    "
                  >
                    <SettingSelect
                      value={draft.time_zone}
                      onChange={(e) =>
                        changeTimeZone(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        sm:w-[260px]
                        max-w-full
                      "
                    >
                      {TIME_ZONE_OPTIONS.map(
                        (timeZone) => (
                          <option
                            key={timeZone.value}
                            value={timeZone.value}
                          >
                            {timeZone.label}
                          </option>
                        )
                      )}
                    </SettingSelect>

                    <div
                      className="
                        flex
                        min-h-[52px]
                        w-full
                        min-w-0
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-blue-200
                        bg-blue-50
                        px-4
                        py-2
                        text-center
                        transition-all
                        duration-300
                        sm:w-[180px]
                        dark:border-blue-900
                        dark:bg-blue-950
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-wider
                          text-blue-500
                          dark:text-blue-400
                        "
                      >
                        Selected Time Zone
                      </span>

                      <span
                        className="
                          mt-0.5
                          text-base
                          font-bold
                          text-blue-700
                          dark:text-blue-300
                        "
                      >
                        {getTimeZoneLabel(
                          draft.time_zone
                        )}
                      </span>
                    </div>
                  </div>
                </Row>
              </div>
            )}

            {/* ================= NOTIFICATIONS ================= */}

            {tab === 'Notifications' && (
              <div className="animate-fade-in">
                <Row
                  title={t('weekly_digest_email')}
                  desc={t('progress_recommendations')}
                  icon="mail"
                >
                  <Toggle
                    checked={
                      draft.weekly_digest
                    }
                    onChange={(value) =>
                      set(
                        'weekly_digest',
                        value
                      )
                    }
                  />
                </Row>

                {/* ================= RESPONSIVE LEARNING REMINDER ================= */}

                <Row
                  title={t('learning_reminders')}
                  desc={t('upcoming_task_notifications')}
                  icon="bell"
                  compactControl
                >
                  <Toggle
                    checked={
                      draft.learning_reminders
                    }
                    onChange={(value) =>
                      set(
                        'learning_reminders',
                        value
                      )
                    }
                  />
                </Row>
              </div>
            )}

            {/* ================= PRIVACY ================= */}

            {tab === 'Privacy' && (
              <div className="animate-fade-in">
                <Row
                  title={t('show_activity_classmates')}
                  desc={t('recent_submissions_comments')}
                  icon="users"
                >
                  <Toggle
                    checked={
                      draft.activity_visible
                    }
                    onChange={(value) =>
                      set(
                        'activity_visible',
                        value
                      )
                    }
                  />
                </Row>

                <Row
                  title={t('show_progress_leaderboards')}
                  icon="chart"
                >
                  <Toggle
                    checked={
                      draft.show_progress
                    }
                    onChange={(value) =>
                      set(
                        'show_progress',
                        value
                      )
                    }
                  />
                </Row>
              </div>
            )}

            {/* ================= PREFERENCES ================= */}

            {tab === 'Preferences' && (
              <div className="animate-fade-in">
                <Row
                  title={t('theme')}
                  desc={t('choose_application_appearance')}
                  icon="palette"
                >
                  <SettingSelect
                    value={draft.theme}
                    width="180px"
                    onChange={(e) =>
                      changeTheme(
                        e.target.value
                      )
                    }
                    className="w-full sm:w-auto"
                  >
                    <option value="Light">
                      {t('light')}
                    </option>

                    <option value="Dark">
                      {t('dark')}
                    </option>

                    <option value="SaaS Blue-White">
                      SaaS Blue-White
                    </option>
                  </SettingSelect>
                </Row>
              </div>
            )}
          </div>

          {/* ================= FOOTER ================= */}

          <div
            className="
              flex
              flex-col
              gap-3
              border-t
              border-slate-200
              bg-slate-50
              px-3
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-end
              sm:px-5
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            {saved === 'ok' && (
              <span
                className="
                  text-xs
                  font-medium
                  text-emerald-600
                  sm:mr-auto
                  dark:text-emerald-400
                "
              >
                {t('changes_saved_successfully')}
              </span>
            )}

            {saved === 'error' && (
              <span
                className="
                  text-xs
                  font-medium
                  text-red-600
                  sm:mr-auto
                  dark:text-red-400
                "
              >
                {t('failed_to_save_changes')}
              </span>
            )}

            <Button
              variant="outline"
              onClick={onCancel}
            >
              {t('cancel')}
            </Button>

            <Button onClick={onSave}>
              {t('save_changes')}
            </Button>
          </div>
        </Card>
      </div>

      {/* ================= PASSWORD MODAL ================= */}

      {passwordOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            overflow-y-auto
            bg-slate-950/60
            px-3
            py-4
            backdrop-blur-sm
            sm:px-4
            sm:py-6
          "
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !passwordLoading
            ) {
              closePasswordModal();
            }
          }}
        >
          <div
            className="
              my-auto
              w-full
              max-w-md
              max-h-[calc(100vh-32px)]
              overflow-y-auto
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              shadow-2xl
              sm:p-6
              dark:border-slate-700
              dark:bg-slate-900
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            {/* MODAL HEADER */}

            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3
                  id="change-password-title"
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Change Password
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Enter your current password and choose
                  a new password for your account.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={passwordLoading}
                aria-label="Close"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-xl
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:hover:bg-slate-800
                  dark:hover:text-slate-200
                "
              >
                ×
              </button>
            </div>

            {/* SUCCESS */}

            {passwordSuccess && (
              <div
                className="
                  mb-4
                  rounded-xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-emerald-700
                  dark:border-emerald-900
                  dark:bg-emerald-950
                  dark:text-emerald-300
                "
              >
                Password changed successfully.
              </div>
            )}

            {/* ERROR */}

            {passwordError && (
              <div
                className="
                  mb-4
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  leading-5
                  text-red-700
                  dark:border-red-900
                  dark:bg-red-950
                  dark:text-red-300
                "
                role="alert"
              >
                {passwordError}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handlePasswordChange}
              className="space-y-4"
            >
              <PasswordInput
                label="Current password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                show={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword(
                    (value) => !value
                  )
                }
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                show={showNewPassword}
                onToggle={() =>
                  setShowNewPassword(
                    (value) => !value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                show={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  pt-2
                  sm:flex-row
                  sm:justify-end
                "
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full sm:w-auto"
                >
                  {passwordLoading
                    ? 'Changing...'
                    : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

