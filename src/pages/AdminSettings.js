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

/* =========================================================
   LANGUAGE OPTIONS
========================================================= */

const LANGUAGE_OPTIONS = [
  {
    value: 'en-US',
    label: 'English (US)',
    nativeLabel: 'English',
  },
  {
    value: 'en-GB',
    label: 'English (UK)',
    nativeLabel: 'English',
  },
  {
    value: 'hi-IN',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
  },
  {
    value: 'te-IN',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
  },
  {
    value: 'ta-IN',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
  },
  {
    value: 'kn-IN',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
  },
  {
    value: 'ml-IN',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
  },
  {
    value: 'bn-IN',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
  },
  {
    value: 'mr-IN',
    label: 'Marathi',
    nativeLabel: 'मराठी',
  },
  {
    value: 'gu-IN',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
  },
  {
    value: 'pa-IN',
    label: 'Punjabi',
    nativeLabel: 'ਪੰਜਾਬੀ',
  },
  {
    value: 'or-IN',
    label: 'Odia',
    nativeLabel: 'ଓଡ଼ିଆ',
  },
];

/* =========================================================
   TIME ZONE OPTIONS
========================================================= */

const TIME_ZONE_OPTIONS = [
  {
    value: 'UTC',
    label: 'UTC — Coordinated Universal Time',
  },

  {
    value: 'Asia/Kolkata',
    label: 'India — Asia/Kolkata (IST)',
  },
  {
    value: 'Asia/Karachi',
    label: 'Pakistan — Asia/Karachi (PKT)',
  },
  {
    value: 'Asia/Dhaka',
    label: 'Bangladesh — Asia/Dhaka (BST)',
  },
  {
    value: 'Asia/Kathmandu',
    label: 'Nepal — Asia/Kathmandu (NPT)',
  },
  {
    value: 'Asia/Colombo',
    label: 'Sri Lanka — Asia/Colombo',
  },
  {
    value: 'Asia/Dubai',
    label: 'UAE — Asia/Dubai (GST)',
  },
  {
    value: 'Asia/Riyadh',
    label: 'Saudi Arabia — Asia/Riyadh',
  },
  {
    value: 'Asia/Qatar',
    label: 'Qatar — Asia/Qatar',
  },
  {
    value: 'Asia/Muscat',
    label: 'Oman — Asia/Muscat',
  },
  {
    value: 'Asia/Bangkok',
    label: 'Thailand — Asia/Bangkok',
  },
  {
    value: 'Asia/Singapore',
    label: 'Singapore — Asia/Singapore',
  },
  {
    value: 'Asia/Kuala_Lumpur',
    label: 'Malaysia — Asia/Kuala_Lumpur',
  },
  {
    value: 'Asia/Jakarta',
    label: 'Indonesia — Asia/Jakarta',
  },
  {
    value: 'Asia/Manila',
    label: 'Philippines — Asia/Manila',
  },
  {
    value: 'Asia/Shanghai',
    label: 'China — Asia/Shanghai',
  },
  {
    value: 'Asia/Hong_Kong',
    label: 'Hong Kong — Asia/Hong_Kong',
  },
  {
    value: 'Asia/Taipei',
    label: 'Taiwan — Asia/Taipei',
  },
  {
    value: 'Asia/Tokyo',
    label: 'Japan — Asia/Tokyo (JST)',
  },
  {
    value: 'Asia/Seoul',
    label: 'South Korea — Asia/Seoul (KST)',
  },
  {
    value: 'Asia/Almaty',
    label: 'Kazakhstan — Asia/Almaty',
  },
  {
    value: 'Asia/Tashkent',
    label: 'Uzbekistan — Asia/Tashkent',
  },
  {
    value: 'Asia/Baku',
    label: 'Azerbaijan — Asia/Baku',
  },
  {
    value: 'Asia/Tbilisi',
    label: 'Georgia — Asia/Tbilisi',
  },
  {
    value: 'Asia/Yerevan',
    label: 'Armenia — Asia/Yerevan',
  },

  {
    value: 'Europe/London',
    label: 'United Kingdom — Europe/London',
  },
  {
    value: 'Europe/Dublin',
    label: 'Ireland — Europe/Dublin',
  },
  {
    value: 'Europe/Paris',
    label: 'France — Europe/Paris',
  },
  {
    value: 'Europe/Berlin',
    label: 'Germany — Europe/Berlin',
  },
  {
    value: 'Europe/Rome',
    label: 'Italy — Europe/Rome',
  },
  {
    value: 'Europe/Madrid',
    label: 'Spain — Europe/Madrid',
  },
  {
    value: 'Europe/Amsterdam',
    label: 'Netherlands — Europe/Amsterdam',
  },
  {
    value: 'Europe/Brussels',
    label: 'Belgium — Europe/Brussels',
  },
  {
    value: 'Europe/Zurich',
    label: 'Switzerland — Europe/Zurich',
  },
  {
    value: 'Europe/Vienna',
    label: 'Austria — Europe/Vienna',
  },
  {
    value: 'Europe/Stockholm',
    label: 'Sweden — Europe/Stockholm',
  },
  {
    value: 'Europe/Oslo',
    label: 'Norway — Europe/Oslo',
  },
  {
    value: 'Europe/Copenhagen',
    label: 'Denmark — Europe/Copenhagen',
  },
  {
    value: 'Europe/Helsinki',
    label: 'Finland — Europe/Helsinki',
  },
  {
    value: 'Europe/Warsaw',
    label: 'Poland — Europe/Warsaw',
  },
  {
    value: 'Europe/Athens',
    label: 'Greece — Europe/Athens',
  },
  {
    value: 'Europe/Istanbul',
    label: 'Turkey — Europe/Istanbul',
  },
  {
    value: 'Europe/Moscow',
    label: 'Russia — Europe/Moscow',
  },

  {
    value: 'Africa/Cairo',
    label: 'Egypt — Africa/Cairo',
  },
  {
    value: 'Africa/Johannesburg',
    label: 'South Africa — Africa/Johannesburg',
  },
  {
    value: 'Africa/Nairobi',
    label: 'Kenya — Africa/Nairobi',
  },
  {
    value: 'Africa/Lagos',
    label: 'Nigeria — Africa/Lagos',
  },

  {
    value: 'America/New_York',
    label: 'US Eastern — America/New_York',
  },
  {
    value: 'America/Chicago',
    label: 'US Central — America/Chicago',
  },
  {
    value: 'America/Denver',
    label: 'US Mountain — America/Denver',
  },
  {
    value: 'America/Los_Angeles',
    label: 'US Pacific — America/Los_Angeles',
  },
  {
    value: 'America/Anchorage',
    label: 'US Alaska — America/Anchorage',
  },
  {
    value: 'Pacific/Honolulu',
    label: 'US Hawaii — Pacific/Honolulu',
  },
  {
    value: 'America/Toronto',
    label: 'Canada Eastern — America/Toronto',
  },
  {
    value: 'America/Vancouver',
    label: 'Canada Pacific — America/Vancouver',
  },
  {
    value: 'America/Mexico_City',
    label: 'Mexico — America/Mexico_City',
  },

  {
    value: 'America/Sao_Paulo',
    label: 'Brazil — America/Sao_Paulo',
  },
  {
    value: 'America/Argentina/Buenos_Aires',
    label:
      'Argentina — America/Argentina/Buenos_Aires',
  },

  {
    value: 'Australia/Sydney',
    label: 'Australia Eastern — Australia/Sydney',
  },
  {
    value: 'Australia/Melbourne',
    label:
      'Australia Melbourne — Australia/Melbourne',
  },
  {
    value: 'Australia/Brisbane',
    label:
      'Australia Brisbane — Australia/Brisbane',
  },
  {
    value: 'Australia/Perth',
    label:
      'Australia Western — Australia/Perth',
  },
  {
    value: 'Pacific/Auckland',
    label: 'New Zealand — Pacific/Auckland',
  },
];

/* =========================================================
   ICONS
========================================================= */

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

    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />
          <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
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
          <path d="M5 12h13" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        group/toggle
        relative
        h-8
        w-[54px]
        shrink-0
        rounded-full
        border
        p-1
        transition-all
        duration-300
        focus:outline-none
        focus:ring-4
        focus:ring-orange-400/15

        ${
          checked
            ? `
              border-transparent
              bg-[linear-gradient(135deg,#ff6b35,#f43f5e_45%,#8b5cf6)]
              shadow-[0_0_0_1px_rgba(244,63,94,0.12),0_6px_22px_rgba(244,63,94,0.30),0_0_30px_rgba(249,115,22,0.18)]
            `
            : `
              border-slate-300
              bg-slate-200
              hover:border-slate-400
              hover:bg-slate-300
              dark:border-slate-600
              dark:bg-slate-700
            `
        }
      `}
    >
      <span
        className={`
          block
          h-6
          w-6
          rounded-full
          bg-white
          shadow-[0_2px_8px_rgba(15,23,42,0.22)]
          transition-all
          duration-300
          ${
            checked
              ? 'translate-x-[22px] shadow-[0_2px_10px_rgba(15,23,42,0.25)]'
              : 'translate-x-0'
          }
        `}
      />
    </button>
  );
}

/* =========================================================
   SETTING SELECT
========================================================= */

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
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-4
        py-3
        text-sm
        font-semibold
        text-slate-700
        outline-none
        transition-all
        duration-300
        shadow-[0_4px_18px_rgba(15,23,42,0.04)]

        hover:-translate-y-0.5
        hover:border-orange-200
        hover:bg-orange-50/40
        hover:shadow-[0_8px_25px_rgba(249,115,22,0.10)]

        focus:border-orange-400
        focus:ring-4
        focus:ring-orange-400/10

        dark:border-slate-700
        dark:bg-slate-900
        dark:text-slate-100
        dark:hover:border-orange-500/40
        dark:hover:bg-slate-800
        ${className}
      `}
    >
      {children}
    </select>
  );
}

/* =========================================================
   LOAD PREFS
========================================================= */

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

/* =========================================================
   LANGUAGE HELPERS
========================================================= */

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

/* =========================================================
   TIME ZONE HELPERS
========================================================= */

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

    const [, sign, hours, minutes = '00'] =
      match;

    return `${countryName} — UTC${sign}${Number(
      hours
    )}:${minutes}`;
  } catch {
    return `${countryName} — UTC+0:00`;
  }
}

/* =========================================================
   APPLY LANGUAGE
========================================================= */

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

/* =========================================================
   APPLY TIME ZONE
========================================================= */

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

/* =========================================================
   PASSWORD INPUT
========================================================= */

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
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="group relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            px-4
            py-3.5
            pr-20
            text-sm
            text-slate-800
            outline-none
            transition-all
            duration-300

            placeholder:text-slate-400

            hover:border-orange-200
            hover:bg-white
            hover:shadow-[0_8px_25px_rgba(249,115,22,0.07)]

            focus:border-orange-400
            focus:bg-white
            focus:ring-4
            focus:ring-orange-400/10

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-100
            dark:placeholder:text-slate-500
            dark:hover:border-orange-500/40
            dark:hover:bg-slate-900
            dark:focus:bg-slate-900
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
            rounded-xl
            px-3
            py-2
            text-xs
            font-bold
            text-slate-500
            transition-all
            duration-300

            hover:bg-orange-50
            hover:text-orange-600
            hover:shadow-[0_0_20px_rgba(249,115,22,0.10)]

            dark:text-slate-400
            dark:hover:bg-orange-500/10
            dark:hover:text-orange-300
          "
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   RADIANT SETTING ROW
========================================================= */

function SettingRow({
  title,
  desc,
  icon,
  children,
  accent = 'orange',
  compactControl = false,
}) {
  const accentMap = {
    orange: {
      icon:
        'from-orange-400 via-rose-500 to-pink-500',
      glow:
        'group-hover:shadow-[0_18px_45px_rgba(249,115,22,0.12)]',
      border:
        'group-hover:border-orange-200 dark:group-hover:border-orange-500/30',
    },

    emerald: {
      icon:
        'from-emerald-400 via-teal-500 to-cyan-500',
      glow:
        'group-hover:shadow-[0_18px_45px_rgba(20,184,166,0.12)]',
      border:
        'group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30',
    },

    blue: {
      icon:
        'from-blue-500 via-indigo-500 to-violet-500',
      glow:
        'group-hover:shadow-[0_18px_45px_rgba(79,70,229,0.12)]',
      border:
        'group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30',
    },

    rose: {
      icon:
        'from-rose-400 via-pink-500 to-fuchsia-500',
      glow:
        'group-hover:shadow-[0_18px_45px_rgba(236,72,153,0.12)]',
      border:
        'group-hover:border-pink-200 dark:group-hover:border-pink-500/30',
    },
  };

  const colors =
    accentMap[accent] || accentMap.orange;

  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-[26px]
        border
        border-slate-200/80
        bg-white
        px-4
        py-4
        transition-all
        duration-500

        hover:-translate-y-1
        ${colors.glow}
        ${colors.border}

        dark:border-slate-800
        dark:bg-slate-900/80

        ${
          compactControl
            ? 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4'
            : 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'
        }
      `}
    >
      {/* radiant hover beam */}
      <div
        className={`
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-40
          w-40
          rounded-full
          bg-gradient-to-br
          ${colors.icon}
          opacity-0
          blur-3xl
          transition-all
          duration-700
          group-hover:opacity-20
          group-hover:scale-150
        `}
      />

      <div className="relative flex min-w-0 items-center gap-4">
        <div
          className={`
            relative
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            ${colors.icon}
            text-white
            shadow-[0_10px_28px_rgba(15,23,42,0.12)]
            transition-all
            duration-500
            group-hover:rotate-3
            group-hover:scale-110
            group-hover:shadow-[0_14px_35px_rgba(15,23,42,0.18)]
          `}
        >
          <Icon name={icon} size={20} />

          <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-extrabold tracking-[-0.01em] text-slate-900 dark:text-white">
            {title}
          </div>

          {desc && (
            <div className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              {desc}
            </div>
          )}
        </div>
      </div>

      <div
        className={`
          relative
          min-w-0
          ${
            compactControl
              ? 'shrink-0'
              : 'w-full lg:w-auto'
          }
        `}
      >
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function AdminSettings() {
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

  /* =====================================================
     PASSWORD STATE
  ===================================================== */

  const [passwordOpen, setPasswordOpen] =
    useState(false);

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

  /* =====================================================
     LANGUAGE SYNC
  ===================================================== */

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

  /* =====================================================
     TIME ZONE SYNC
  ===================================================== */

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

  /* =====================================================
     SET
  ===================================================== */

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

  /* =====================================================
     SAVE
  ===================================================== */

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

  /* =====================================================
     CANCEL
  ===================================================== */

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

  /* =====================================================
     THEME
  ===================================================== */

  const changeTheme = (value) => {
    set('theme', value);

    if (value === 'Dark') {
      set('dark_mode', true);
    } else {
      set('dark_mode', false);
    }
  };

  /* =====================================================
     LANGUAGE CHANGE
  ===================================================== */

  const changeLanguage = (language) => {
    set('language', language);
  };

  /* =====================================================
     TIME ZONE CHANGE
  ===================================================== */

  const changeTimeZone = (timeZone) => {
    if (!isValidTimeZone(timeZone)) {
      return;
    }

    set('time_zone', timeZone);
  };

  /* =====================================================
     PASSWORD MODAL
  ===================================================== */

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

  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

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

      if (error?.errors?.[0]?.longMessage) {
        message =
          error.errors[0].longMessage;
      } else if (error?.errors?.[0]?.message) {
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

  /* =====================================================
     TAB ICONS
  ===================================================== */

  const tabIcons = {
    Account: 'user',
    Notifications: 'bell',
    Privacy: 'users',
    Preferences: 'palette',
  };

  const tabDescriptions = {
    Account:
      'Manage your identity, security, language and regional settings.',
    Notifications:
      'Control the learning updates and messages you receive.',
    Privacy:
      'Choose what classmates and other users can see.',
    Preferences:
      'Personalize the way the application looks and behaves.',
  };

  return (
    <>
      <style>{`
        @keyframes radiantFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        @keyframes radiantPulse {
          0%, 100% {
            opacity: .45;
            transform: scale(1);
          }
          50% {
            opacity: .8;
            transform: scale(1.08);
          }
        }

        @keyframes radiantShine {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        @keyframes settingsReveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .settings-reveal {
          animation: settingsReveal .38s ease-out both;
        }

        .radiant-float {
          animation: radiantFloat 6s ease-in-out infinite;
        }

        .radiant-pulse {
          animation: radiantPulse 5s ease-in-out infinite;
        }

        .radiant-scroll::-webkit-scrollbar {
          height: 5px;
          width: 5px;
        }

        .radiant-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .radiant-scroll::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,.35);
          border-radius: 999px;
        }
      `}</style>

      <div className="relative w-full overflow-hidden pb-8">
        {/* =================================================
            BACKGROUND AURORA
        ================================================= */}

        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="
              absolute
              -left-40
              top-20
              h-[420px]
              w-[420px]
              rounded-full
              bg-orange-400/10
              blur-[110px]
              radiant-pulse
            "
          />

          <div
            className="
              absolute
              right-[-180px]
              top-[320px]
              h-[460px]
              w-[460px]
              rounded-full
              bg-indigo-500/10
              blur-[120px]
              radiant-pulse
            "
            style={{
              animationDelay: '1s',
            }}
          />

          <div
            className="
              absolute
              bottom-[-180px]
              left-[35%]
              h-[420px]
              w-[420px]
              rounded-full
              bg-emerald-400/10
              blur-[120px]
              radiant-pulse
            "
            style={{
              animationDelay: '2s',
            }}
          />
        </div>

        <div className="mx-auto w-full max-w-[1500px] space-y-6">
          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="
              relative
              overflow-hidden
              rounded-[34px]
              border
              border-white/70
              bg-white/80
              px-5
              py-6
              shadow-[0_25px_80px_rgba(15,23,42,0.08)]
              backdrop-blur-xl

              sm:px-7
              sm:py-7

              dark:border-slate-800
              dark:bg-slate-950/80
              dark:shadow-[0_25px_80px_rgba(0,0,0,0.28)]
            "
          >
            {/* Decorative gradient mesh */}
            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-28
                h-72
                w-72
                rounded-full
                bg-gradient-to-br
                from-orange-400/25
                via-rose-500/20
                to-indigo-500/25
                blur-3xl
                radiant-float
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                bottom-[-100px]
                right-[25%]
                h-64
                w-64
                rounded-full
                bg-gradient-to-br
                from-emerald-400/15
                via-cyan-400/10
                to-blue-500/15
                blur-3xl
              "
            />

            <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-br
                      from-orange-400
                      via-rose-500
                      to-indigo-600
                      text-white
                      shadow-[0_12px_35px_rgba(244,63,94,0.25)]
                    "
                  >
                    <Icon
                      name="spark"
                      size={21}
                    />
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-400">
                      Personal command center
                    </div>

                    <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Your account • Your experience
                    </div>
                  </div>
                </div>

                <h2
                  className="
                    max-w-3xl
                    text-3xl
                    font-black
                    tracking-[-0.045em]
                    text-slate-950
                    sm:text-4xl
                    dark:text-white
                  "
                >
                  {t('settings')}
                  <span
                    className="
                      ml-2
                      bg-gradient-to-r
                      from-orange-500
                      via-rose-500
                      to-indigo-600
                      bg-clip-text
                      text-transparent
                    "
                  >
                    your way.
                  </span>
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {t(
                    'manage_account_description'
                  )}
                </p>
              </div>

              {/* Current preference visual */}
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-slate-200/80
                  bg-gradient-to-br
                  from-slate-50
                  via-white
                  to-orange-50/70
                  p-5
                  shadow-[0_15px_45px_rgba(15,23,42,0.07)]
                  dark:border-slate-800
                  dark:from-slate-900
                  dark:via-slate-900
                  dark:to-orange-950/20
                "
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-400/15 blur-2xl" />

                <div className="relative flex items-center gap-4">
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-br
                      from-orange-400
                      to-rose-500
                      text-white
                      shadow-[0_10px_30px_rgba(249,115,22,0.28)]
                    "
                  >
                    <Icon
                      name={tabIcons[tab]}
                      size={24}
                    />
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Current section
                    </div>

                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                      {t(tab.toLowerCase())}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {tabDescriptions[tab]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              MAIN SETTINGS SHELL
          ================================================= */}

          <Card
            className="
              !w-full
              !max-w-full
              !overflow-hidden
              !border-0
              !bg-transparent
              !p-0
              !shadow-none
            "
          >
            <div
              className="
                grid
                gap-5
                lg:grid-cols-[245px_minmax(0,1fr)]
              "
            >
              {/* =================================================
                  SIDEBAR
              ================================================= */}

              <aside
                className="
                  relative
                  h-fit
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-slate-200/80
                  bg-white/85
                  p-3
                  shadow-[0_18px_55px_rgba(15,23,42,0.07)]
                  backdrop-blur-xl
                  dark:border-slate-800
                  dark:bg-slate-950/80
                "
              >
                <div className="mb-3 px-3 pt-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Workspace
                  </div>

                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Configure your environment
                  </div>
                </div>

                <div className="radiant-scroll flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {TABS.map((item, index) => {
                    const active = tab === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTab(item)}
                        className={`
                          group
                          relative
                          flex
                          min-w-[170px]
                          items-center
                          gap-3
                          overflow-hidden
                          rounded-[22px]
                          border
                          px-3
                          py-3
                          text-left
                          transition-all
                          duration-400
                          lg:min-w-0

                          ${
                            active
                              ? `
                                border-transparent
                                bg-slate-950
                                text-white
                                shadow-[0_15px_35px_rgba(15,23,42,0.18)]
                                dark:bg-white
                                dark:text-slate-950
                              `
                              : `
                                border-transparent
                                text-slate-600
                                hover:-translate-y-0.5
                                hover:bg-slate-50
                                hover:text-slate-950
                                hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]
                                dark:text-slate-400
                                dark:hover:bg-slate-900
                                dark:hover:text-white
                              `
                          }
                        `}
                      >
                        {active && (
                          <span
                            className="
                              absolute
                              inset-0
                              bg-gradient-to-r
                              from-orange-500/15
                              via-rose-500/10
                              to-indigo-500/15
                            "
                          />
                        )}

                        <span
                          className={`
                            relative
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            transition-all
                            duration-300

                            ${
                              active
                                ? `
                                  bg-gradient-to-br
                                  from-orange-400
                                  via-rose-500
                                  to-indigo-600
                                  text-white
                                  shadow-[0_8px_22px_rgba(244,63,94,0.30)]
                                `
                                : `
                                  bg-slate-100
                                  text-slate-500
                                  group-hover:bg-orange-50
                                  group-hover:text-orange-600
                                  dark:bg-slate-800
                                  dark:text-slate-400
                                  dark:group-hover:bg-orange-500/10
                                  dark:group-hover:text-orange-300
                                `
                            }
                          `}
                        >
                          <Icon
                            name={tabIcons[item]}
                            size={18}
                          />
                        </span>

                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">
                            {t(item.toLowerCase())}
                          </span>

                          <span
                            className={`
                              mt-0.5 block truncate text-[10px]
                              ${
                                active
                                  ? 'text-white/60 dark:text-slate-500'
                                  : 'text-slate-400'
                              }
                            `}
                          >
                            {index + 1} of {TABS.length}
                          </span>
                        </span>

                        <span
                          className={`
                            relative
                            hidden
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            transition-all
                            duration-300
                            lg:flex

                            ${
                              active
                                ? 'bg-white/10 dark:bg-slate-950/10'
                                : 'opacity-0 group-hover:opacity-100'
                            }
                          `}
                        >
                          <Icon
                            name="arrow"
                            size={14}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom accent */}
                <div
                  className="
                    mt-4
                    hidden
                    overflow-hidden
                    rounded-2xl
                    border
                    border-orange-100
                    bg-gradient-to-br
                    from-orange-50
                    via-rose-50
                    to-indigo-50
                    p-4
                    lg:block
                    dark:border-orange-500/10
                    dark:from-orange-500/5
                    dark:via-rose-500/5
                    dark:to-indigo-500/5
                  "
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,.7)]" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Preferences synced
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Your changes are stored locally and applied across the application.
                  </p>
                </div>
              </aside>

              {/* =================================================
                  CONTENT PANEL
              ================================================= */}

              <section
                className="
                  relative
                  min-w-0
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-slate-200/80
                  bg-white/90
                  shadow-[0_20px_65px_rgba(15,23,42,0.08)]
                  backdrop-blur-xl
                  dark:border-slate-800
                  dark:bg-slate-950/90
                  dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
                "
              >
                {/* top gradient line */}
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-[3px]
                    bg-gradient-to-r
                    from-orange-400
                    via-rose-500
                    via-60%
                    to-indigo-600
                  "
                />

                <div className="relative p-4 sm:p-6">
                  {/* Section heading */}
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 dark:border-orange-500/10 dark:bg-orange-500/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,.7)]" />

                        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600 dark:text-orange-300">
                          Active configuration
                        </span>
                      </div>

                      <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
                        {t(tab.toLowerCase())}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {tabDescriptions[tab]}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-orange-400
                        via-rose-500
                        to-indigo-600
                        text-white
                        shadow-[0_10px_28px_rgba(244,63,94,0.25)]
                      "
                    >
                      <Icon
                        name={tabIcons[tab]}
                        size={20}
                      />
                    </div>
                  </div>

                  {/* =================================================
                      ACCOUNT
                  ================================================= */}

                  {tab === 'Account' && (
                    <div className="settings-reveal space-y-3">
                      <SettingRow
                        title={t(
                          'profile_visibility'
                        )}
                        icon="user"
                        accent="orange"
                      >
                        <SettingSelect
                          value={
                            draft.profile_visibility
                          }
                          onChange={(e) =>
                            set(
                              'profile_visibility',
                              e.target.value
                            )
                          }
                          className="w-full sm:w-64"
                        >
                          <option value="classmates">
                            {t(
                              'visible_to_all_classmates'
                            )}
                          </option>

                          <option value="private">
                            {t('private')}
                          </option>

                          <option value="public">
                            {t('public')}
                          </option>
                        </SettingSelect>
                      </SettingRow>

                      <SettingRow
                        title={t(
                          'email_address'
                        )}
                        desc={t(
                          'email_read_only'
                        )}
                        icon="mail"
                        accent="blue"
                      >
                        <input
                          value={draft.email}
                          readOnly
                          className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-slate-600
                            outline-none
                            transition-all
                            duration-300
                            sm:w-64
                            dark:border-slate-700
                            dark:bg-slate-800
                            dark:text-slate-300
                          "
                        />
                      </SettingRow>

                      <SettingRow
                        title={t(
                          'change_password'
                        )}
                        desc="Update your account password securely."
                        icon="lock"
                        accent="rose"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={
                            openPasswordModal
                          }
                          className="
                            w-full
                            rounded-2xl
                            sm:w-auto
                            sm:min-w-[120px]
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:border-orange-300
                            hover:text-orange-600
                            hover:shadow-[0_10px_30px_rgba(249,115,22,0.14)]
                          "
                        >
                          {t('change')}
                        </Button>
                      </SettingRow>

                      <SettingRow
                        title={t(
                          'enable_dark_mode'
                        )}
                        desc={t(
                          'dark_mode_description'
                        )}
                        icon="moon"
                        accent="blue"
                      >
                        <Toggle
                          checked={
                            draft.dark_mode
                          }
                          onChange={(value) =>
                            set(
                              'dark_mode',
                              value
                            )
                          }
                        />
                      </SettingRow>

                      <SettingRow
                        title={t(
                          'learning_reminders'
                        )}
                        desc={t(
                          'receive_task_reminders'
                        )}
                        icon="bell"
                        accent="emerald"
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
                      </SettingRow>

                      <SettingRow
                        title={t('language')}
                        desc={t(
                          'choose_preferred_language'
                        )}
                        icon="globe"
                        accent="orange"
                      >
                        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                          <SettingSelect
                            value={draft.language}
                            onChange={(e) =>
                              changeLanguage(
                                e.target.value
                              )
                            }
                            className="w-full sm:w-64"
                          >
                            {LANGUAGE_OPTIONS.map(
                              (language) => (
                                <option
                                  key={
                                    language.value
                                  }
                                  value={
                                    language.value
                                  }
                                >
                                  {language.label}
                                </option>
                              )
                            )}
                          </SettingSelect>

                          <div
                            className="
                              flex
                              min-h-[64px]
                              w-full
                              min-w-0
                              flex-col
                              justify-center
                              rounded-2xl
                              border
                              border-orange-100
                              bg-gradient-to-br
                              from-orange-50
                              via-white
                              to-rose-50
                              px-4
                              py-2
                              text-center
                              shadow-[0_8px_25px_rgba(249,115,22,0.07)]
                              sm:w-52
                              dark:border-orange-500/10
                              dark:from-orange-500/10
                              dark:via-slate-900
                              dark:to-rose-500/10
                            "
                          >
                            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-500 dark:text-orange-400">
                              {t(
                                'selected_language'
                              )}
                            </span>

                            <span className="mt-1 truncate text-sm font-black text-slate-800 dark:text-slate-100">
                              {getNativeLanguageName(
                                draft.language
                              )}
                            </span>

                            <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                              {getLanguageName(
                                draft.language
                              )}
                            </span>
                          </div>
                        </div>
                      </SettingRow>

                      <SettingRow
                        title={t('time_zone')}
                        desc={
                          t(
                            'choose_time_zone'
                          ) !==
                          'choose_time_zone'
                            ? t(
                                'choose_time_zone'
                              )
                            : 'Choose the time zone used for dates and times.'
                        }
                        icon="clock"
                        accent="emerald"
                      >
                        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                          <SettingSelect
                            value={
                              draft.time_zone
                            }
                            onChange={(e) =>
                              changeTimeZone(
                                e.target.value
                              )
                            }
                            className="w-full sm:w-[260px]"
                          >
                            {TIME_ZONE_OPTIONS.map(
                              (timeZone) => (
                                <option
                                  key={
                                    timeZone.value
                                  }
                                  value={
                                    timeZone.value
                                  }
                                >
                                  {timeZone.label}
                                </option>
                              )
                            )}
                          </SettingSelect>

                          <div
                            className="
                              flex
                              min-h-[64px]
                              w-full
                              min-w-0
                              flex-col
                              justify-center
                              rounded-2xl
                              border
                              border-emerald-100
                              bg-gradient-to-br
                              from-emerald-50
                              via-white
                              to-cyan-50
                              px-4
                              py-2
                              text-center
                              shadow-[0_8px_25px_rgba(16,185,129,0.07)]
                              sm:w-[200px]
                              dark:border-emerald-500/10
                              dark:from-emerald-500/10
                              dark:via-slate-900
                              dark:to-cyan-500/10
                            "
                          >
                            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                              Selected Time Zone
                            </span>

                            <span className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
                              {getTimeZoneLabel(
                                draft.time_zone
                              )}
                            </span>
                          </div>
                        </div>
                      </SettingRow>
                    </div>
                  )}

                  {/* =================================================
                      NOTIFICATIONS
                  ================================================= */}

                  {tab === 'Notifications' && (
                    <div className="settings-reveal space-y-3">
                      <SettingRow
                        title={t(
                          'weekly_digest_email'
                        )}
                        desc={t(
                          'progress_recommendations'
                        )}
                        icon="mail"
                        accent="blue"
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
                      </SettingRow>

                      <SettingRow
                        title={t(
                          'learning_reminders'
                        )}
                        desc={t(
                          'upcoming_task_notifications'
                        )}
                        icon="bell"
                        accent="orange"
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
                      </SettingRow>

                      <div
                        className="
                          relative
                          mt-5
                          overflow-hidden
                          rounded-[26px]
                          border
                          border-orange-100
                          bg-gradient-to-br
                          from-orange-50
                          via-rose-50
                          to-indigo-50
                          p-5
                          dark:border-orange-500/10
                          dark:from-orange-500/10
                          dark:via-rose-500/5
                          dark:to-indigo-500/10
                        "
                      >
                        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-400/20 blur-3xl" />

                        <div className="relative flex gap-4">
                          <div
                            className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-2xl
                              bg-white
                              text-orange-500
                              shadow-[0_8px_25px_rgba(249,115,22,0.12)]
                              dark:bg-slate-900
                            "
                          >
                            <Icon
                              name="spark"
                              size={20}
                            />
                          </div>

                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              Stay informed, not overwhelmed.
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              These controls let you decide which learning updates should reach you.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      PRIVACY
                  ================================================= */}

                  {tab === 'Privacy' && (
                    <div className="settings-reveal space-y-3">
                      <SettingRow
                        title={t(
                          'show_activity_classmates'
                        )}
                        desc={t(
                          'recent_submissions_comments'
                        )}
                        icon="users"
                        accent="emerald"
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
                      </SettingRow>

                      <SettingRow
                        title={t(
                          'show_progress_leaderboards'
                        )}
                        icon="chart"
                        accent="blue"
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
                      </SettingRow>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div
                          className="
                            rounded-[25px]
                            border
                            border-emerald-100
                            bg-gradient-to-br
                            from-emerald-50
                            via-white
                            to-teal-50
                            p-5
                            transition-all
                            duration-400
                            hover:-translate-y-1
                            hover:shadow-[0_15px_40px_rgba(16,185,129,0.10)]
                            dark:border-emerald-500/10
                            dark:from-emerald-500/10
                            dark:via-slate-900
                            dark:to-teal-500/10
                          "
                        >
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_8px_22px_rgba(16,185,129,0.25)]">
                            <Icon
                              name="users"
                              size={18}
                            />
                          </div>

                          <div className="text-sm font-black text-slate-900 dark:text-white">
                            Social visibility
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            Control how your activity appears to classmates.
                          </p>
                        </div>

                        <div
                          className="
                            rounded-[25px]
                            border
                            border-indigo-100
                            bg-gradient-to-br
                            from-indigo-50
                            via-white
                            to-blue-50
                            p-5
                            transition-all
                            duration-400
                            hover:-translate-y-1
                            hover:shadow-[0_15px_40px_rgba(79,70,229,0.10)]
                            dark:border-indigo-500/10
                            dark:from-indigo-500/10
                            dark:via-slate-900
                            dark:to-blue-500/10
                          "
                        >
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-[0_8px_22px_rgba(79,70,229,0.25)]">
                            <Icon
                              name="chart"
                              size={18}
                            />
                          </div>

                          <div className="text-sm font-black text-slate-900 dark:text-white">
                            Progress visibility
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            Decide whether your learning progress can appear on leaderboards.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      PREFERENCES
                  ================================================= */}

                  {tab === 'Preferences' && (
                    <div className="settings-reveal space-y-3">
                      <SettingRow
                        title={t('theme')}
                        desc={t(
                          'choose_application_appearance'
                        )}
                        icon="palette"
                        accent="rose"
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
                      </SettingRow>

                      <div
                        className="
                          relative
                          mt-5
                          overflow-hidden
                          rounded-[30px]
                          border
                          border-slate-200
                          bg-slate-950
                          p-6
                          text-white
                          shadow-[0_20px_55px_rgba(15,23,42,0.18)]
                          dark:border-slate-700
                        "
                      >
                        {/* Gradient aura */}
                        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-orange-500/30 blur-3xl" />

                        <div className="absolute right-[-50px] bottom-[-70px] h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />

                        <div className="absolute left-[45%] top-1/2 h-32 w-32 rounded-full bg-rose-500/20 blur-3xl" />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                                Appearance preview
                              </div>

                              <h4 className="text-xl font-black">
                                Build your own atmosphere.
                              </h4>

                              <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">
                                Your selected theme controls the overall visual environment of the application.
                              </p>
                            </div>

                            <div
                              className="
                                hidden
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-br
                                from-orange-400
                                via-rose-500
                                to-indigo-600
                                shadow-[0_0_35px_rgba(244,63,94,0.30)]
                                sm:flex
                              "
                            >
                              <Icon
                                name="palette"
                                size={21}
                              />
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-3 gap-2">
                            <div className="h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-[0_0_25px_rgba(249,115,22,0.20)]" />

                            <div className="h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_25px_rgba(20,184,166,0.20)]" />

                            <div className="h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_25px_rgba(79,70,229,0.20)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                  className="
                    relative
                    flex
                    flex-col
                    gap-3
                    border-t
                    border-slate-200
                    bg-slate-50/70
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-end
                    sm:px-6
                    dark:border-slate-800
                    dark:bg-slate-900/60
                  "
                >
                  {saved === 'ok' && (
                    <span
                      className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-bold
                        text-emerald-600
                        sm:mr-auto
                        dark:text-emerald-400
                      "
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                        <Icon
                          name="check"
                          size={13}
                        />
                      </span>

                      {t(
                        'changes_saved_successfully'
                      )}
                    </span>
                  )}

                  {saved === 'error' && (
                    <span
                      className="
                        text-xs
                        font-bold
                        text-red-600
                        sm:mr-auto
                        dark:text-red-400
                      "
                    >
                      {t(
                        'failed_to_save_changes'
                      )}
                    </span>
                  )}

                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="
                      w-full
                      rounded-2xl
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)]
                      sm:w-auto
                    "
                  >
                    {t('cancel')}
                  </Button>

                  <Button
                    onClick={onSave}
                    className="
                      w-full
                      rounded-2xl
                      border-0
                      bg-gradient-to-r
                      from-orange-500
                      via-rose-500
                      to-indigo-600
                      font-bold
                      text-white
                      shadow-[0_10px_30px_rgba(244,63,94,0.22)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[0_16px_40px_rgba(244,63,94,0.32)]
                      sm:w-auto
                    "
                  >
                    {t('save_changes')}
                  </Button>
                </div>
              </section>
            </div>
          </Card>
        </div>
      </div>

      {/* =========================================================
          PASSWORD MODAL
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
            overflow-y-auto
            bg-slate-950/65
            px-3
            py-4
            backdrop-blur-md
            sm:px-4
            sm:py-6
          "
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !passwordLoading
            ) {
              closePasswordModal();
            }
          }}
        >
          <div
            className="
              relative
              my-auto
              w-full
              max-w-lg
              overflow-hidden
              rounded-[32px]
              border
              border-white/20
              bg-white
              shadow-[0_35px_100px_rgba(0,0,0,0.30),0_0_80px_rgba(249,115,22,0.10)]
              dark:border-slate-700
              dark:bg-slate-950
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            {/* Modal gradient header */}
            <div
              className="
                relative
                overflow-hidden
                bg-gradient-to-br
                from-orange-500
                via-rose-500
                to-indigo-600
                px-5
                py-6
                text-white
                sm:px-7
              "
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/20 blur-3xl" />

              <div className="absolute bottom-[-50px] left-[30%] h-32 w-32 rounded-full bg-orange-300/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-white/15
                      shadow-[0_0_30px_rgba(255,255,255,0.15)]
                      backdrop-blur
                    "
                  >
                    <Icon
                      name="lock"
                      size={22}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3
                      id="change-password-title"
                      className="text-xl font-black"
                    >
                      Change Password
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-white/75">
                      Protect your account with a new password.
                    </p>
                  </div>
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
                    rounded-xl
                    bg-white/10
                    text-white
                    transition-all
                    duration-300
                    hover:rotate-90
                    hover:bg-white/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Icon
                    name="close"
                    size={18}
                  />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {/* Success */}
              {passwordSuccess && (
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-emerald-200
                    bg-gradient-to-r
                    from-emerald-50
                    to-teal-50
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-emerald-700
                    shadow-[0_8px_25px_rgba(16,185,129,0.08)]
                    dark:border-emerald-500/20
                    dark:from-emerald-500/10
                    dark:to-teal-500/10
                    dark:text-emerald-300
                  "
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Icon
                      name="check"
                      size={15}
                    />
                  </span>

                  Password changed successfully.
                </div>
              )}

              {/* Error */}
              {passwordError && (
                <div
                  className="
                    mb-5
                    rounded-2xl
                    border
                    border-red-200
                    bg-gradient-to-r
                    from-red-50
                    to-rose-50
                    px-4
                    py-3
                    text-sm
                    leading-5
                    text-red-700
                    shadow-[0_8px_25px_rgba(239,68,68,0.08)]
                    dark:border-red-500/20
                    dark:from-red-500/10
                    dark:to-rose-500/10
                    dark:text-red-300
                  "
                  role="alert"
                >
                  {passwordError}
                </div>
              )}

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

                <div
                  className="
                    flex
                    flex-col-reverse
                    gap-3
                    pt-3
                    sm:flex-row
                    sm:justify-end
                  "
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      closePasswordModal
                    }
                    disabled={passwordLoading}
                    className="
                      w-full
                      rounded-2xl
                      sm:w-auto
                    "
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="
                      w-full
                      rounded-2xl
                      border-0
                      bg-gradient-to-r
                      from-orange-500
                      via-rose-500
                      to-indigo-600
                      text-white
                      shadow-[0_10px_30px_rgba(244,63,94,0.20)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[0_16px_38px_rgba(244,63,94,0.30)]
                      sm:w-auto
                    "
                  >
                    {passwordLoading
                      ? 'Changing...'
                      : 'Change Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}