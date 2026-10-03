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
  {
    value: 'Australia/Melbourne',
    label: 'Australia Melbourne — Australia/Melbourne',
  },
  {
    value: 'Australia/Brisbane',
    label: 'Australia Brisbane — Australia/Brisbane',
  },
  {
    value: 'Australia/Perth',
    label: 'Australia Western — Australia/Perth',
  },
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
          <circle
            cx="7.5"
            cy="9"
            r="1"
            fill="currentColor"
            stroke="none"
          />
          <circle
            cx="10"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
          <circle
            cx="14"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5.2-3.4 8.8-8 10-4.6-1.2-8-4.8-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case 'spark':
      return (
        <svg {...common}>
          <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
          <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
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
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-500/30
        ${
          checked
            ? `
              border-emerald-600
              bg-emerald-600
              shadow-[0_0_20px_rgba(5,150,105,0.30)]
            `
            : `
              border-slate-300
              bg-slate-200
              dark:border-slate-600
              dark:bg-slate-700
            `
        }
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
          shadow-[0_2px_7px_rgba(15,23,42,0.20)]
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
    <div className="group relative">
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -inset-px
          rounded-[1.35rem]
          bg-gradient-to-r
          from-emerald-500/0
          via-emerald-400/10
          to-lime-400/0
          opacity-0
          blur-xl
          transition-all
          duration-500
          group-hover:opacity-100
        "
      />

      <div
        className={`
          relative
          overflow-hidden
          rounded-[1.25rem]
          border
          border-slate-200/80
          bg-white/80
          p-4
          shadow-[0_8px_28px_rgba(15,23,42,0.035)]
          backdrop-blur-sm
          transition-all
          duration-300
          group-hover:-translate-y-0.5
          group-hover:border-emerald-200
          group-hover:shadow-[0_12px_32px_rgba(5,150,105,0.08)]
          dark:border-slate-800
          dark:bg-slate-900/70
          dark:group-hover:border-emerald-900
          sm:p-5
          ${
            compactControl
              ? 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4'
              : 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6'
          }
        `}
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-20
            w-20
            rounded-full
            bg-emerald-400/5
            blur-2xl
          "
        />

        <div className="relative flex min-w-0 items-start gap-3.5">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-emerald-100
              bg-gradient-to-br
              from-emerald-50
              via-white
              to-lime-50
              text-emerald-700
              shadow-sm
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:border-emerald-200
              group-hover:shadow-[0_8px_20px_rgba(5,150,105,0.12)]
              dark:border-emerald-900
              dark:from-emerald-950
              dark:via-slate-900
              dark:to-lime-950
              dark:text-emerald-400
            "
          >
            <Icon name={icon} size={19} />
          </div>

          <div className="min-w-0 pt-0.5">
            <div
              className="
                break-words
                text-sm
                font-bold
                tracking-[-0.01em]
                text-slate-800
                dark:text-slate-100
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
            relative
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
        px-3.5
        py-2.5
        text-sm
        font-semibold
        text-slate-700
        shadow-sm
        outline-none
        transition-all
        duration-300
        hover:border-emerald-300
        hover:bg-emerald-50/30
        focus:border-emerald-500
        focus:ring-2
        focus:ring-emerald-500/20
        dark:border-slate-600
        dark:bg-slate-800
        dark:text-slate-100
        dark:hover:border-emerald-700
        dark:hover:bg-slate-800
        dark:focus:border-emerald-500
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
    <div className="space-y-2.5">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="relative">
        <div
          className="
            pointer-events-none
            absolute
            left-3.5
            top-1/2
            flex
            -translate-y-1/2
            items-center
            text-slate-400
          "
        >
          <Icon name="lock" size={17} />
        </div>

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
            py-3
            pl-10
            pr-20
            text-sm
            font-medium
            text-slate-800
            shadow-sm
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-emerald-500
            focus:ring-4
            focus:ring-emerald-500/10
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
            font-bold
            text-slate-500
            transition
            hover:bg-emerald-50
            hover:text-emerald-700
            dark:text-slate-400
            dark:hover:bg-slate-700
            dark:hover:text-emerald-300
          "
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function EducatorSettings() {
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
      <div className="relative w-full max-w-full overflow-hidden">
        {/* =====================================================
            BEAUTIFUL GRADIENT BACKGROUND
        ===================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            fixed
            inset-0
            -z-10
            overflow-hidden
            bg-[#f6f8f5]
            dark:bg-[#07120e]
          "
        >
          <div
            className="
              absolute
              -left-40
              -top-40
              h-[500px]
              w-[500px]
              rounded-full
              bg-emerald-300/20
              blur-[100px]
              dark:bg-emerald-900/20
            "
          />

          <div
            className="
              absolute
              right-[-180px]
              top-[5%]
              h-[550px]
              w-[550px]
              rounded-full
              bg-lime-200/20
              blur-[110px]
              dark:bg-lime-900/10
            "
          />

          <div
            className="
              absolute
              bottom-[-220px]
              left-[25%]
              h-[500px]
              w-[500px]
              rounded-full
              bg-teal-200/15
              blur-[110px]
              dark:bg-emerald-950/30
            "
          />

          <div
            className="
              absolute
              left-[45%]
              top-[35%]
              h-[280px]
              w-[280px]
              rounded-full
              bg-green-100/20
              blur-[90px]
              dark:bg-green-950/20
            "
          />
        </div>

        <div className="relative space-y-6">
          {/* =====================================================
              HEADER
          ===================================================== */}

          <section
            className="
              relative
              overflow-hidden
              rounded-[1.75rem]
              border
              border-emerald-100/80
              bg-white/90
              shadow-[0_20px_70px_rgba(15,23,42,0.07)]
              backdrop-blur-xl
              dark:border-emerald-950
              dark:bg-slate-950/90
            "
          >
            {/* gradient top line */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-emerald-500 to-lime-400" />

            {/* decorative glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                right-[-80px]
                top-[-110px]
                h-72
                w-72
                rounded-full
                bg-emerald-300/20
                blur-[80px]
                dark:bg-emerald-800/15
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-[-100px]
                left-[35%]
                h-64
                w-64
                rounded-full
                bg-lime-200/20
                blur-[80px]
                dark:bg-lime-900/10
              "
            />

            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className="
                      relative
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-br
                      from-emerald-700
                      via-emerald-600
                      to-lime-500
                      text-white
                      shadow-[0_12px_30px_rgba(5,150,105,0.25)]
                    "
                  >
                    <Icon name="spark" size={25} />

                    <span
                      className="
                        absolute
                        -right-1
                        -top-1
                        h-3
                        w-3
                        rounded-full
                        border-2
                        border-white
                        bg-lime-300
                        dark:border-slate-950
                      "
                    />
                  </div>

                  <div className="min-w-0">
                    <div
                      className="
                        mb-2
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-emerald-100
                        bg-emerald-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-emerald-700
                        dark:border-emerald-900
                        dark:bg-emerald-950
                        dark:text-emerald-300
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Educator Workspace
                    </div>

                    <h1
                      className="
                        text-2xl
                        font-black
                        tracking-[-0.035em]
                        text-slate-900
                        dark:text-white
                        sm:text-3xl
                      "
                    >
                      {t('settings', 'Settings')}
                    </h1>

                    <p
                      className="
                        mt-1.5
                        max-w-2xl
                        text-sm
                        leading-6
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Personalize your educator experience,
                      notifications, privacy, language and
                      workspace preferences.
                    </p>
                  </div>
                </div>

                {/* Account summary */}
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    lg:max-w-md
                    lg:justify-end
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50/80
                      px-3
                      py-2
                      dark:border-slate-800
                      dark:bg-slate-900
                    "
                  >
                    <div
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-emerald-100
                        text-emerald-700
                        dark:bg-emerald-950
                        dark:text-emerald-400
                      "
                    >
                      <Icon name="mail" size={15} />
                    </div>

                    <span
                      className="
                        max-w-[220px]
                        truncate
                        text-xs
                        font-semibold
                        text-slate-600
                        dark:text-slate-300
                      "
                    >
                      {user?.email || draft.email || 'Account'}
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-emerald-100
                      bg-gradient-to-r
                      from-emerald-50
                      to-lime-50
                      px-3
                      py-2
                      dark:border-emerald-900
                      dark:from-emerald-950
                      dark:to-lime-950
                    "
                  >
                    <Icon
                      name="globe"
                      size={15}
                    />

                    <span
                      className="
                        text-xs
                        font-bold
                        text-emerald-700
                        dark:text-emerald-300
                      "
                    >
                      {getNativeLanguageName(
                        draft.language
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick information */}
              <div
                className="
                  mt-6
                  grid
                  gap-3
                  sm:grid-cols-3
                "
              >
                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white/75
                    p-3.5
                    dark:border-slate-800
                    dark:bg-slate-900/70
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-50
                        text-emerald-700
                        dark:bg-emerald-950
                        dark:text-emerald-400
                      "
                    >
                      <Icon name="user" size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Profile
                      </p>
                      <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                        Educator account
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white/75
                    p-3.5
                    dark:border-slate-800
                    dark:bg-slate-900/70
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-lime-50
                        text-lime-700
                        dark:bg-lime-950
                        dark:text-lime-400
                      "
                    >
                      <Icon name="globe" size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Language
                      </p>
                      <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                        {getLanguageName(draft.language)}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white/75
                    p-3.5
                    dark:border-slate-800
                    dark:bg-slate-900/70
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-green-50
                        text-green-700
                        dark:bg-green-950
                        dark:text-green-400
                      "
                    >
                      <Icon name="clock" size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Time zone
                      </p>
                      <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                        {getTimeZoneLabel(
                          draft.time_zone
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              SETTINGS CONTAINER
          ===================================================== */}

          <Card
            className="
              !overflow-visible
              !rounded-[1.75rem]
              !border-slate-200/80
              !bg-white/90
              !shadow-[0_18px_60px_rgba(15,23,42,0.055)]
              backdrop-blur-xl
              dark:!border-slate-800
              dark:!bg-slate-950/90
            "
          >
            {/* =====================================================
                TAB NAVIGATION
            ===================================================== */}

            <div
              className="
                border-b
                border-slate-200/80
                px-4
                py-4
                dark:border-slate-800
                sm:px-6
              "
            >
              <div
                className="
                  flex
                  w-full
                  gap-2
                  overflow-x-auto
                  rounded-2xl
                  bg-slate-100/70
                  p-1.5
                  dark:bg-slate-900
                "
              >
                {TABS.map((item) => {
                  const active = tab === item;

                  const tabIcons = {
                    Account: 'user',
                    Notifications: 'bell',
                    Privacy: 'shield',
                    Preferences: 'palette',
                  };

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTab(item)}
                      className={`
                        relative
                        flex
                        min-w-fit
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        px-4
                        py-2.5
                        text-xs
                        font-bold
                        transition-all
                        duration-300
                        sm:text-sm
                        ${
                          active
                            ? `
                              bg-white
                              text-emerald-700
                              shadow-[0_5px_18px_rgba(15,23,42,0.08)]
                              dark:bg-slate-800
                              dark:text-emerald-300
                            `
                            : `
                              text-slate-500
                              hover:bg-white/70
                              hover:text-slate-800
                              dark:text-slate-400
                              dark:hover:bg-slate-800/60
                              dark:hover:text-slate-200
                            `
                        }
                      `}
                    >
                      <Icon
                        name={tabIcons[item]}
                        size={16}
                      />

                      <span>{item}</span>

                      {active && (
                        <span
                          className="
                            absolute
                            bottom-0.5
                            left-1/2
                            h-0.5
                            w-7
                            -translate-x-1/2
                            rounded-full
                            bg-gradient-to-r
                            from-emerald-600
                            to-lime-400
                          "
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div className="p-4 sm:p-6 lg:p-7">
              {/* ===================================================
                  ACCOUNT
              =================================================== */}

              {tab === 'Account' && (
                <div className="space-y-6">
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-[1.4rem]
                      border
                      border-emerald-100
                      bg-gradient-to-br
                      from-emerald-50
                      via-white
                      to-lime-50
                      p-5
                      dark:border-emerald-950
                      dark:from-emerald-950/60
                      dark:via-slate-900
                      dark:to-lime-950/30
                    "
                  >
                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        right-[-60px]
                        top-[-80px]
                        h-44
                        w-44
                        rounded-full
                        bg-emerald-300/20
                        blur-3xl
                      "
                    />

                    <div className="relative flex items-start gap-4">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-emerald-700
                          text-white
                          shadow-[0_10px_25px_rgba(5,150,105,0.22)]
                        "
                      >
                        <Icon name="user" size={20} />
                      </div>

                      <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                          Account settings
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Manage your educator identity and
                          account security.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Row
                      title="Email address"
                      desc="Your account email address is managed through your authentication provider."
                      icon="mail"
                    >
                      <div
                        className="
                          w-full
                          max-w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-3.5
                          py-2.5
                          text-sm
                          font-semibold
                          text-slate-600
                          dark:border-slate-700
                          dark:bg-slate-800
                          dark:text-slate-300
                          sm:min-w-[240px]
                        "
                      >
                        <span className="block truncate">
                          {user?.email ||
                            draft.email ||
                            'Not available'}
                        </span>
                      </div>
                    </Row>

                    <Row
                      title="Password"
                      desc="Update your account password to keep your educator account secure."
                      icon="lock"
                    >
                      <Button
                        type="button"
                        onClick={openPasswordModal}
                        className="
                          w-full
                          !rounded-xl
                          !border-0
                          !bg-gradient-to-r
                          !from-emerald-700
                          !to-emerald-600
                          !px-5
                          !py-2.5
                          !text-sm
                          !font-bold
                          !text-white
                          !shadow-[0_8px_22px_rgba(5,150,105,0.18)]
                          transition-all
                          duration-300
                          hover:!from-emerald-800
                          hover:!to-emerald-700
                          hover:shadow-[0_10px_28px_rgba(5,150,105,0.25)]
                          sm:w-auto
                        "
                      >
                        Change password
                      </Button>
                    </Row>
                  </div>
                </div>
              )}

              {/* ===================================================
                  NOTIFICATIONS
              =================================================== */}

              {tab === 'Notifications' && (
                <div className="space-y-6">
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-[1.4rem]
                      border
                      border-emerald-100
                      bg-gradient-to-br
                      from-emerald-50
                      via-white
                      to-green-50
                      p-5
                      dark:border-emerald-950
                      dark:from-emerald-950/50
                      dark:via-slate-900
                      dark:to-green-950/30
                    "
                  >
                    <div className="relative flex items-start gap-4">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-emerald-700
                          text-white
                          shadow-[0_10px_25px_rgba(5,150,105,0.22)]
                        "
                      >
                        <Icon name="bell" size={20} />
                      </div>

                      <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                          Notification preferences
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Choose which learning and platform
                          updates you want to receive.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Row
                      title="Learning reminders"
                      desc="Receive reminders about learning activities and important tasks."
                      icon="bell"
                      compactControl
                    >
                      <Toggle
                        checked={draft.learning_reminders}
                        onChange={(value) =>
                          set(
                            'learning_reminders',
                            value
                          )
                        }
                      />
                    </Row>

                    <Row
                      title="Weekly digest"
                      desc="Receive a weekly summary of important learning activity."
                      icon="chart"
                      compactControl
                    >
                      <Toggle
                        checked={draft.weekly_digest}
                        onChange={(value) =>
                          set(
                            'weekly_digest',
                            value
                          )
                        }
                      />
                    </Row>
                  </div>
                </div>
              )}

              {/* ===================================================
                  PRIVACY
              =================================================== */}

              {tab === 'Privacy' && (
                <div className="space-y-6">
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-[1.4rem]
                      border
                      border-emerald-100
                      bg-gradient-to-br
                      from-emerald-50
                      via-white
                      to-lime-50
                      p-5
                      dark:border-emerald-950
                      dark:from-emerald-950/50
                      dark:via-slate-900
                      dark:to-lime-950/20
                    "
                  >
                    <div className="relative flex items-start gap-4">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-emerald-700
                          text-white
                          shadow-[0_10px_25px_rgba(5,150,105,0.22)]
                        "
                      >
                        <Icon name="shield" size={20} />
                      </div>

                      <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                          Privacy controls
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Control how your educator activity and
                          progress are shared.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Row
                      title="Profile visibility"
                      desc="Choose who can see your educator profile."
                      icon="users"
                    >
                      <SettingSelect
                        value={draft.profile_visibility}
                        onChange={(e) =>
                          set(
                            'profile_visibility',
                            e.target.value
                          )
                        }
                        width="180px"
                      >
                        <option value="private">
                          Only me
                        </option>
                        <option value="classmates">
                          Classmates
                        </option>
                        <option value="public">
                          Everyone
                        </option>
                      </SettingSelect>
                    </Row>

                    <Row
                      title="Activity visibility"
                      desc="Allow your learning activity to be visible to others."
                      icon="users"
                      compactControl
                    >
                      <Toggle
                        checked={draft.activity_visible}
                        onChange={(value) =>
                          set(
                            'activity_visible',
                            value
                          )
                        }
                      />
                    </Row>

                    <Row
                      title="Show progress"
                      desc="Allow your learning progress to be visible where applicable."
                      icon="chart"
                      compactControl
                    >
                      <Toggle
                        checked={draft.show_progress}
                        onChange={(value) =>
                          set(
                            'show_progress',
                            value
                          )
                        }
                      />
                    </Row>
                  </div>
                </div>
              )}

              {/* ===================================================
                  PREFERENCES
              =================================================== */}

              {tab === 'Preferences' && (
                <div className="space-y-6">
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-[1.4rem]
                      border
                      border-emerald-100
                      bg-gradient-to-br
                      from-emerald-50
                      via-white
                      to-lime-50
                      p-5
                      dark:border-emerald-950
                      dark:from-emerald-950/50
                      dark:via-slate-900
                      dark:to-lime-950/20
                    "
                  >
                    <div className="relative flex items-start gap-4">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-emerald-700
                          text-white
                          shadow-[0_10px_25px_rgba(5,150,105,0.22)]
                        "
                      >
                        <Icon name="palette" size={20} />
                      </div>

                      <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                          Workspace preferences
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Customize the appearance, language and
                          regional settings of your workspace.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Row
                      title="Appearance"
                      desc="Choose the visual theme for your educator workspace."
                      icon="palette"
                    >
                      <SettingSelect
                        value={draft.theme}
                        onChange={(e) =>
                          changeTheme(e.target.value)
                        }
                        width="200px"
                      >
                        <option value="Light">
                          Light
                        </option>
                        <option value="Dark">
                          Dark
                        </option>
                        <option value="SaaS Blue-White">
                          SaaS Blue-White
                        </option>
                      </SettingSelect>
                    </Row>

                    <Row
                      title="Dark mode"
                      desc="Use the darker interface for reduced brightness."
                      icon="moon"
                      compactControl
                    >
                      <Toggle
                        checked={draft.dark_mode}
                        onChange={(value) =>
                          set('dark_mode', value)
                        }
                      />
                    </Row>

                    <Row
                      title="Language"
                      desc="Select the language used throughout the application."
                      icon="globe"
                    >
                      <SettingSelect
                        value={draft.language}
                        onChange={(e) =>
                          changeLanguage(
                            e.target.value
                          )
                        }
                        width="200px"
                      >
                        {LANGUAGE_OPTIONS.map(
                          (option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </SettingSelect>
                    </Row>

                    <Row
                      title="Time zone"
                      desc="Used for dates, schedules, reminders and regional timestamps."
                      icon="clock"
                    >
                      <SettingSelect
                        value={draft.time_zone}
                        onChange={(e) =>
                          changeTimeZone(
                            e.target.value
                          )
                        }
                        width="200px"
                      >
                        {TIME_ZONE_OPTIONS.map(
                          (option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </SettingSelect>
                    </Row>
                  </div>
                </div>
              )}
            </div>

            {/* =====================================================
                FOOTER ACTION BAR
            ===================================================== */}

            <div
              className="
                border-t
                border-slate-200/80
                bg-gradient-to-r
                from-slate-50/80
                via-white
                to-emerald-50/40
                px-4
                py-4
                dark:border-slate-800
                dark:from-slate-900
                dark:via-slate-950
                dark:to-emerald-950/20
                sm:px-6
                sm:py-5
              "
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-[24px]">
                  {saved === 'ok' && (
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-emerald-700
                        dark:border-emerald-900
                        dark:bg-emerald-950
                        dark:text-emerald-300
                      "
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                        ✓
                      </span>
                      Settings saved successfully.
                    </div>
                  )}

                  {saved === 'error' && (
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-red-700
                        dark:border-red-900
                        dark:bg-red-950
                        dark:text-red-300
                      "
                    >
                      Unable to save settings.
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                  <Button
                    type="button"
                    onClick={onCancel}
                    className="
                      w-full
                      !rounded-xl
                      !border
                      !border-slate-300
                      !bg-white
                      !px-5
                      !py-2.5
                      !text-sm
                      !font-bold
                      !text-slate-600
                      shadow-sm
                      transition-all
                      hover:!border-slate-400
                      hover:!bg-slate-50
                      dark:!border-slate-700
                      dark:!bg-slate-900
                      dark:!text-slate-300
                      dark:hover:!bg-slate-800
                      sm:w-auto
                    "
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={onSave}
                    className="
                      w-full
                      !rounded-xl
                      !border-0
                      !bg-gradient-to-r
                      !from-emerald-700
                      !via-emerald-600
                      !to-lime-500
                      !px-6
                      !py-2.5
                      !text-sm
                      !font-bold
                      !text-white
                      !shadow-[0_10px_28px_rgba(5,150,105,0.22)]
                      transition-all
                      duration-300
                      hover:!from-emerald-800
                      hover:!via-emerald-700
                      hover:!to-lime-600
                      hover:shadow-[0_12px_32px_rgba(5,150,105,0.30)]
                      sm:w-auto
                    "
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* =====================================================
              WORKSPACE STATUS
          ===================================================== */}

          <section
            className="
              relative
              overflow-hidden
              rounded-[1.5rem]
              border
              border-emerald-100/80
              bg-gradient-to-br
              from-[#0b2f24]
              via-[#104638]
              to-[#173d2f]
              p-5
              text-white
              shadow-[0_20px_55px_rgba(5,46,36,0.18)]
              sm:p-6
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                right-[-90px]
                top-[-100px]
                h-64
                w-64
                rounded-full
                bg-emerald-300/10
                blur-3xl
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-[-100px]
                left-[35%]
                h-56
                w-56
                rounded-full
                bg-lime-300/10
                blur-3xl
              "
            />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/10
                      text-lime-300
                    "
                  >
                    <Icon name="shield" size={15} />
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                    Workspace status
                  </span>
                </div>

                <h3 className="mt-2 text-base font-black sm:text-lg">
                  Your educator preferences are ready
                </h3>

                <p className="mt-1 max-w-xl text-xs leading-5 text-emerald-100/70">
                  Your language, privacy, notification and
                  appearance preferences are stored locally
                  for this workspace.
                </p>
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-4
                  py-3
                  backdrop-blur-md
                "
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-300" />
                </span>

                <span className="text-xs font-bold text-white">
                  Preferences active
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* =========================================================
          REDESIGNED PASSWORD MODAL
      ========================================================= */}

      {passwordOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/65
            p-3
            backdrop-blur-md
            sm:p-5
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
              relative
              max-h-[94vh]
              w-full
              max-w-3xl
              overflow-y-auto
              rounded-[1.75rem]
              border
              border-white/10
              bg-white
              shadow-[0_35px_100px_rgba(0,0,0,0.30)]
              dark:border-slate-700
              dark:bg-slate-950
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            {/* Close */}
            <button
              type="button"
              onClick={closePasswordModal}
              disabled={passwordLoading}
              className="
                absolute
                right-4
                top-4
                z-20
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/10
                text-white/80
                transition
                hover:bg-white/20
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-slate-700
              "
              aria-label="Close"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>

            <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
              {/* LEFT SIDE */}
              <div
                className="
                  relative
                  overflow-hidden
                  bg-gradient-to-br
                  from-[#073b2e]
                  via-[#0b5a43]
                  to-[#174d35]
                  p-6
                  text-white
                  sm:p-8
                  lg:min-h-[560px]
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-64
                    w-64
                    rounded-full
                    bg-emerald-300/10
                    blur-3xl
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -bottom-20
                    -left-20
                    h-60
                    w-60
                    rounded-full
                    bg-lime-300/10
                    blur-3xl
                  "
                />

                <div className="relative flex h-full flex-col">
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-white/15
                      bg-white/10
                      text-lime-200
                      shadow-[0_12px_35px_rgba(0,0,0,0.12)]
                      backdrop-blur-sm
                    "
                  >
                    <Icon name="lock" size={25} />
                  </div>

                  <div className="mt-7">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                      Account security
                    </div>

                    <h2
                      id="change-password-title"
                      className="
                        mt-2
                        text-2xl
                        font-black
                        tracking-[-0.03em]
                        sm:text-3xl
                      "
                    >
                      Secure your account
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-emerald-50/75">
                      Create a new password for your educator
                      account. Your existing account and settings
                      will remain unchanged.
                    </p>
                  </div>

                  <div className="mt-auto pt-8">
                    <div className="space-y-3">
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-white/10
                          bg-white/[0.06]
                          p-3
                        "
                      >
                        <span
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white/10
                            text-lime-200
                          "
                        >
                          ✓
                        </span>

                        <span className="text-xs font-semibold text-emerald-50/80">
                          Verify your current password
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-white/10
                          bg-white/[0.06]
                          p-3
                        "
                      >
                        <span
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white/10
                            text-lime-200
                          "
                        >
                          ✓
                        </span>

                        <span className="text-xs font-semibold text-emerald-50/80">
                          Choose a different password
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-white/10
                          bg-white/[0.06]
                          p-3
                        "
                      >
                        <span
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white/10
                            text-lime-200
                          "
                        >
                          ✓
                        </span>

                        <span className="text-xs font-semibold text-emerald-50/80">
                          Confirm your new password
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="p-5 sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                    Change password
                  </p>

                  <h3 className="mt-1.5 text-xl font-black tracking-[-0.02em] text-slate-900 dark:text-white">
                    Update your password
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Enter your current password and choose a
                    new one.
                  </p>
                </div>

                {passwordError && (
                  <div
                    className="
                      mb-5
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      px-3.5
                      py-3
                      text-xs
                      font-semibold
                      leading-5
                      text-red-700
                      dark:border-red-900
                      dark:bg-red-950/60
                      dark:text-red-300
                    "
                    role="alert"
                  >
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div
                    className="
                      mb-5
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-3.5
                      py-3
                      text-xs
                      font-bold
                      text-emerald-700
                      dark:border-emerald-900
                      dark:bg-emerald-950
                      dark:text-emerald-300
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-600
                        text-white
                      "
                    >
                      ✓
                    </span>

                    Password changed successfully.
                  </div>
                )}

                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-5"
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
                        (prev) => !prev
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
                        (prev) => !prev
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
                        (prev) => !prev
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />

                  <div
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-3.5
                      py-3
                      dark:border-slate-800
                      dark:bg-slate-900
                    "
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                        <Icon name="shield" size={16} />
                      </div>

                      <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                        For security, your new password must be
                        different from your current password.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closePasswordModal}
                      disabled={passwordLoading}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-slate-600
                        shadow-sm
                        transition-all
                        hover:border-slate-400
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-slate-300
                        dark:hover:bg-slate-800
                        sm:w-auto
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        passwordLoading ||
                        passwordSuccess
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border-0
                        bg-gradient-to-r
                        from-emerald-700
                        via-emerald-600
                        to-lime-500
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-[0_10px_28px_rgba(5,150,105,0.20)]
                        transition-all
                        duration-300
                        hover:from-emerald-800
                        hover:via-emerald-700
                        hover:to-lime-600
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        sm:w-auto
                      "
                    >
                      {passwordLoading ? (
                        <>
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-white/30
                              border-t-white
                            "
                          />

                          Updating...
                        </>
                      ) : (
                        <>
                          <Icon name="lock" size={16} />
                          Update password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}