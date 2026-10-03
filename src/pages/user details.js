import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAllUsers } from '../services/api';

const ROLES = ['', 'student', 'educator', 'employer', 'admin'];
const STATUSES = ['', 'active', 'suspended'];

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

function fmtDate(iso) {
  if (!iso) return '—';

  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

function toCsv(users) {
  const header =
    'Name,Email,Role,Domain Role,Status,Date Joined\n';

  const rows = users
    .map(
      (u) =>
        `"${(u.name || '').replace(/"/g, '""')}","${(
          u.email || ''
        ).replace(/"/g, '""')}","${(u.role || '').replace(
          /"/g,
          '""'
        )}","${(u.domain_role || '').replace(
          /"/g,
          '""'
        )}","${(u.status || 'active').replace(
          /"/g,
          '""'
        )}","${fmtDate(u.created_at)}"`
    )
    .join('\n');

  return header + rows;
}

function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/* =========================================================
   ICON SYSTEM
========================================================= */

const Icon = ({
  name,
  size = 18,
  strokeWidth = 1.8,
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
    'aria-hidden': true,
  };

  const icons = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 21h16" />
      </>
    ),

    filter: (
      <>
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
      </>
    ),

    calendar: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </>
    ),

    chevron: (
      <path d="m6 9 6 6 6-6" />
    ),

    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.7-4L4 9" />
        <path d="M4 4v5h5" />
        <path d="M4 13a8 8 0 0 0 14.7 4L20 15" />
        <path d="M20 20v-5h-5" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" />
      </>
    ),

    activity: (
      <>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </>
    ),

    mail: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="m3 7 9 6 9-6" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),

    alert: (
      <>
        <path d="M10.3 3.8 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
  };

  return (
    <svg {...common}>
      {icons[name] || icons.users}
    </svg>
  );
};

/* =========================================================
   ROLE COLORS
========================================================= */

const roleStyles = {
  student: {
    bg: 'bg-[#E7EDFF]',
    text: 'text-[#3048A8]',
    dot: 'bg-[#3048A8]',
    label: 'Student',
  },

  educator: {
    bg: 'bg-[#E5F3EA]',
    text: 'text-[#2D704B]',
    dot: 'bg-[#3E9564]',
    label: 'Educator',
  },

  employer: {
    bg: 'bg-[#FBE4DD]',
    text: 'text-[#A63D2C]',
    dot: 'bg-[#D75C43]',
    label: 'Employer',
  },

  admin: {
    bg: 'bg-[#EEE6FA]',
    text: 'text-[#6C4297]',
    dot: 'bg-[#8154B1]',
    label: 'Admin',
  },
};

/* =========================================================
   ROLE BADGE
========================================================= */

const RoleBadge = ({ role }) => {
  const style = roleStyles[role] || {
    bg: 'bg-[#EAE7E0]',
    text: 'text-[#59554E]',
    dot: 'bg-[#59554E]',
    label: role || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${style.bg} ${style.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {style.label}
    </span>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const active = status !== 'suspended';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${
        active
          ? 'border-[#A5CBB5] bg-[#EDF8F1] text-[#33724D]'
          : 'border-[#E3AAA0] bg-[#FFF0EC] text-[#A74635]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? 'bg-[#3E9564]'
            : 'bg-[#D75C43]'
        }`}
      />

      {active ? 'Active' : 'Suspended'}
    </span>
  );
};

/* =========================================================
   MAIN
========================================================= */

export default function UserDetails() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [joinedDate, setJoinedDate] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllUsers();

      setAllUsers(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to load users'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =====================================================
     DERIVED FILTERED USERS
  ===================================================== */

  const users = useMemo(() => {
    return allUsers.filter((u) => {
      if (role && u.role !== role) {
        return false;
      }

      if (
        status &&
        (u.status || 'active') !== status
      ) {
        return false;
      }

      if (joinedDate && u.created_at) {
        const joined = new Date(
          u.created_at
        )
          .toISOString()
          .slice(0, 10);

        if (joined !== joinedDate) {
          return false;
        }
      }

      return true;
    });
  }, [
    allUsers,
    role,
    status,
    joinedDate,
  ]);

  /* =====================================================
     APPLY FILTERS
  ===================================================== */

  const applyFilters = () => {
    // Filters are applied client-side
    // through the derived users array.
  };

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setRole('');
    setStatus('');
    setJoinedDate('');
  };

  /* =====================================================
     CSV EXPORT
  ===================================================== */

  const handleExport = () => {
    if (users.length === 0) return;

    const csv = toCsv(users);

    const timestamp = new Date()
      .toISOString()
      .slice(0, 10);

    downloadCsv(
      `users-${timestamp}.csv`,
      csv
    );
  };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const active = allUsers.filter(
      (u) => (u.status || 'active') === 'active'
    ).length;

    const suspended = allUsers.filter(
      (u) => u.status === 'suspended'
    ).length;

    const students = allUsers.filter(
      (u) => u.role === 'student'
    ).length;

    const educators = allUsers.filter(
      (u) => u.role === 'educator'
    ).length;

    return {
      total: allUsers.length,
      active,
      suspended,
      students,
      educators,
    };
  }, [allUsers]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#E9E4DA] text-[#181818]">
      {/* =================================================
          LOCAL ANIMATIONS
      ================================================= */}

      <style>{`
        @keyframes udFade {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes udSlide {
          from {
            transform: translateX(-110%);
          }

          to {
            transform: translateX(220%);
          }
        }

        @keyframes udPulse {
          0%, 100% {
            opacity: .45;
          }

          50% {
            opacity: 1;
          }
        }

        .ud-fade {
          animation: udFade .6s ease both;
        }

        .ud-scan {
          animation: udSlide 2.8s ease-in-out infinite;
        }

        .ud-pulse {
          animation: udPulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        {/* =================================================
            TOP IDENTITY BAR
        ================================================= */}

        <div className="ud-fade mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#181818] text-[#E9E4DA] shadow-[4px_4px_0_#D75C43]">
              <Icon
                name="users"
                size={19}
              />
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#817A70]">
                Vayvora / Administration
              </div>

              <div className="mt-0.5 text-sm font-black tracking-[-0.02em]">
                People Registry
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-[#D0C9BD] bg-[#F5F1E9] px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#716A61]">
              <span className="ud-pulse h-1.5 w-1.5 rounded-full bg-[#3E9564]" />
              Directory online
            </div>

            <button
              type="button"
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D0C9BD] bg-[#F5F1E9] text-[#5D5850] transition-all duration-200 hover:rotate-180 hover:bg-[#181818] hover:text-white"
              title="Refresh users"
            >
              <Icon
                name="refresh"
                size={15}
              />
            </button>
          </div>
        </div>

        {/* =================================================
            HERO / DATA ATELIER
        ================================================= */}

        <section className="ud-fade relative overflow-hidden rounded-[32px] border border-[#CFC7BB] bg-[#F5F1E9] shadow-[0_24px_70px_rgba(40,35,28,.08)]">
          {/* gradient artwork */}

          <div className="absolute right-[-100px] top-[-130px] h-[420px] w-[620px] rotate-[-18deg] rounded-[100px] bg-gradient-to-br from-[#3149C6] via-[#D75C43] to-[#8BC8A8] opacity-95" />

          <div className="absolute right-[180px] top-[-80px] hidden h-[500px] w-[1px] rotate-[38deg] bg-white/40 lg:block" />

          <div className="absolute right-[300px] top-[-50px] hidden h-[500px] w-[1px] rotate-[38deg] bg-white/25 lg:block" />

          <div className="relative grid lg:grid-cols-[1.2fr_.8fr]">
            {/* LEFT */}

            <div className="p-7 sm:p-9 lg:p-12">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-[3px] w-10 rounded-full bg-[#D75C43]" />

                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#777066]">
                  Registry / Archive 04
                </span>
              </div>

              <h1 className="max-w-3xl text-[clamp(3rem,6vw,6.5rem)] font-black leading-[.83] tracking-[-0.08em]">
                User
                <span className="block bg-gradient-to-r from-[#3149C6] via-[#D75C43] to-[#2D8A68] bg-clip-text text-transparent">
                  Details
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-sm font-medium leading-7 text-[#706960] sm:text-base">
                A complete registry of registered
                users, roles, domain assignments,
                account status and join history.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <div className="rounded-full bg-[#181818] px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-white">
                  {stats.total} registered
                </div>

                <div className="rounded-full bg-[#DCEEE4] px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-[#2D704B]">
                  {stats.active} active
                </div>

                <div className="rounded-full bg-[#FBE4DD] px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-[#A63D2C]">
                  {stats.suspended} suspended
                </div>
              </div>
            </div>

            {/* RIGHT ARCHIVE CARD */}

            <div className="relative flex min-h-[320px] items-end p-6 sm:p-8 lg:p-10">
              <div className="relative w-full rounded-[25px] border border-white/60 bg-white/65 p-5 shadow-[0_25px_60px_rgba(20,20,20,.13)] backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7A736A]">
                      Registry composition
                    </div>

                    <div className="mt-1 text-xl font-black tracking-[-0.04em]">
                      User distribution
                    </div>
                  </div>

                  <Icon
                    name="database"
                    size={21}
                  />
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: 'Students',
                      value: stats.students,
                      width:
                        stats.total > 0
                          ? `${Math.min(
                              100,
                              (stats.students /
                                stats.total) *
                                100
                            )}%`
                          : '0%',
                      bg: 'bg-[#3149C6]',
                    },
                    {
                      label: 'Educators',
                      value: stats.educators,
                      width:
                        stats.total > 0
                          ? `${Math.min(
                              100,
                              (stats.educators /
                                stats.total) *
                                100
                            )}%`
                          : '0%',
                      bg: 'bg-[#3E9564]',
                    },
                    {
                      label: 'Other accounts',
                      value:
                        Math.max(
                          0,
                          stats.total -
                            stats.students -
                            stats.educators
                        ),
                      width:
                        stats.total > 0
                          ? `${Math.min(
                              100,
                              (Math.max(
                                0,
                                stats.total -
                                  stats.students -
                                  stats.educators
                              ) /
                                stats.total) *
                                100
                            )}%`
                          : '0%',
                      bg: 'bg-[#D75C43]',
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                        <span className="text-[#69635B]">
                          {item.label}
                        </span>

                        <span>
                          {item.value}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#DDD7CC]">
                        <div
                          className={`h-full rounded-full ${item.bg} transition-all duration-700`}
                          style={{
                            width: item.width,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FILTER LAB
        ================================================= */}

        <section className="ud-fade mt-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            {/* FILTERS */}

            <div className="rounded-[27px] border border-[#CFC7BB] bg-[#F5F1E9] p-4 shadow-[0_12px_35px_rgba(40,35,28,.05)] sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0E6FF] text-[#3149C6]">
                  <Icon
                    name="filter"
                    size={16}
                  />
                </div>

                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#817A70]">
                    Filter laboratory
                  </div>

                  <div className="text-sm font-black">
                    Refine registry
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
                {/* ROLE */}

                <div className="relative">
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.16em] text-[#777067]">
                    Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-[14px] border border-[#D1C9BD] bg-[#EAE5DC] px-4 pr-10 text-xs font-bold text-[#37332E] outline-none transition-all hover:border-[#AAA197] focus:border-[#3149C6] focus:bg-white"
                  >
                    {ROLES.map((r) => (
                      <option
                        key={r || 'all'}
                        value={r}
                      >
                        {r
                          ? r[0].toUpperCase() +
                            r.slice(1)
                          : 'All Roles'}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute bottom-3.5 right-4 text-[#777067]">
                    <Icon
                      name="chevron"
                      size={14}
                    />
                  </span>
                </div>

                {/* STATUS */}

                <div className="relative">
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.16em] text-[#777067]">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-[14px] border border-[#D1C9BD] bg-[#EAE5DC] px-4 pr-10 text-xs font-bold text-[#37332E] outline-none transition-all hover:border-[#AAA197] focus:border-[#3149C6] focus:bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option
                        key={s || 'all'}
                        value={s}
                      >
                        {s
                          ? s[0].toUpperCase() +
                            s.slice(1)
                          : 'All Statuses'}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute bottom-3.5 right-4 text-[#777067]">
                    <Icon
                      name="chevron"
                      size={14}
                    />
                  </span>
                </div>

                {/* DATE */}

                <div className="relative">
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.16em] text-[#777067]">
                    Joined date
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#777067]">
                      <Icon
                        name="calendar"
                        size={15}
                      />
                    </span>

                    <input
                      type="date"
                      value={joinedDate}
                      onChange={(e) =>
                        setJoinedDate(
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-[14px] border border-[#D1C9BD] bg-[#EAE5DC] pl-11 pr-3 text-xs font-bold text-[#37332E] outline-none transition-all hover:border-[#AAA197] focus:border-[#3149C6] focus:bg-white"
                    />
                  </div>
                </div>

                {/* APPLY */}

                <Button
                  onClick={applyFilters}
                  className="!h-12 !rounded-[14px] !bg-[#181818] !px-6 !text-xs !font-black !uppercase !tracking-[0.1em] !text-white transition-all duration-200 hover:!bg-[#3149C6]"
                >
                  Apply Filter
                </Button>
              </div>

              {(role ||
                status ||
                joinedDate) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#D8D1C6] pt-4">
                  <span className="mr-1 text-[9px] font-black uppercase tracking-[0.15em] text-[#8A8379]">
                    Active filters
                  </span>

                  {role && (
                    <span className="rounded-full bg-[#E0E6FF] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#3149C6]">
                      Role: {role}
                    </span>
                  )}

                  {status && (
                    <span className="rounded-full bg-[#E5F3EA] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#2D704B]">
                      Status: {status}
                    </span>
                  )}

                  {joinedDate && (
                    <span className="rounded-full bg-[#FBE4DD] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#A63D2C]">
                      Date: {joinedDate}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ml-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#8A8379] underline decoration-[#D75C43] underline-offset-4 transition hover:text-[#D75C43]"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* EXPORT PANEL */}

            <button
              type="button"
              onClick={handleExport}
              disabled={
                loading ||
                users.length === 0
              }
              className="group relative overflow-hidden rounded-[27px] border border-[#CFC7BB] bg-[#181818] p-5 text-left text-white shadow-[7px_7px_0_#D75C43] transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_#3149C6] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none lg:min-w-[250px]"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#3149C6] opacity-50 blur-2xl transition-all duration-500 group-hover:scale-150" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Icon
                      name="download"
                      size={18}
                    />
                  </div>

                  <Icon
                    name="arrow"
                    size={16}
                  />
                </div>

                <div className="mt-7">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                    Data export
                  </div>

                  <div className="mt-1 text-lg font-black tracking-[-0.03em]">
                    Export Users
                  </div>

                  <div className="mt-1 text-[10px] font-medium text-white/50">
                    {users.length} records ready
                  </div>
                </div>
              </div>

              <span className="ud-scan absolute bottom-0 left-[-20%] h-[2px] w-[40%] bg-gradient-to-r from-transparent via-[#8BC8A8] to-transparent opacity-70" />
            </button>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="ud-fade mt-5 flex items-start gap-4 rounded-[21px] border border-[#E3AAA0] bg-[#FFF0EC] p-5 text-[#A74635]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D75C43] text-white">
              <Icon
                name="alert"
                size={17}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.16em]">
                Registry error
              </div>

              <div className="mt-1 text-sm font-medium">
                {error}
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#A74635] transition hover:bg-[#181818] hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            DATA TABLE
        ================================================= */}

        <section className="ud-fade mt-7">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D75C43]" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#817A70]">
                  Registered directory
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-[-0.055em] text-[#181818] sm:text-3xl">
                User registry
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-[#D0C9BD] bg-[#F5F1E9] px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#716A61]">
                Showing{' '}
                <span className="text-[#181818]">
                  {users.length}
                </span>
              </div>
            </div>
          </div>

          <Card className="!overflow-hidden !rounded-[28px] !border !border-[#CFC7BB] !bg-[#F5F1E9] !p-0 !shadow-[0_18px_55px_rgba(40,35,28,.06)]">
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-sm">
                {/* HEADER */}

                <thead>
                  <tr className="border-b border-[#D3CBC0] bg-[#E2DCD2]">
                    <th className="px-6 py-4 text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#69635B]">
                        Identity
                      </span>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#69635B]">
                        Contact
                      </span>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#69635B]">
                        Role
                      </span>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#69635B]">
                        Domain
                      </span>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#69635B]">
                        Status
                      </span>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#69635B]">
                        Joined
                      </span>
                    </th>
                  </tr>
                </thead>

                {/* BODY */}

                <tbody className="divide-y divide-[#DDD6CB]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto flex max-w-xs flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E0E6FF] text-[#3149C6]">
                            <Icon
                              name="database"
                              size={23}
                            />
                          </div>

                          <div className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-[#686158]">
                            Loading registry
                          </div>

                          <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-[#D8D1C6]">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#3149C6] via-[#D75C43] to-[#8BC8A8]" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto flex max-w-md flex-col items-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-[21px] bg-[#E2DCD2] text-[#777067]">
                            <Icon
                              name="users"
                              size={25}
                            />
                          </div>

                          <div className="mt-5 text-xl font-black tracking-[-0.04em]">
                            No users match
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#817A70]">
                            No registry entries match
                            the selected filters.
                          </p>

                          <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-5 rounded-full bg-[#181818] px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#3149C6]"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u, index) => {
                      const displayName =
                        u.name &&
                        u.name.trim().toLowerCase() !==
                          'user'
                          ? u.name
                          : u.username || u.name;

                      return (
                        <tr
                          key={u.id}
                          className="group relative transition-all duration-300 hover:bg-[#FBF8F2]"
                        >
                          {/* animated top line */}

                          <td className="relative px-6 py-5">
                            <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-gradient-to-b from-[#3149C6] via-[#D75C43] to-[#8BC8A8] opacity-0 transition-opacity group-hover:opacity-100" />

                            <div className="flex items-center gap-4">
                              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#181818] text-xs font-black text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-[-3deg]">
                                {initials(
                                  displayName
                                )}

                                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#F5F1E9] bg-[#8BC8A8]" />
                              </div>

                              <div className="min-w-0">
                                <div className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#AAA399]">
                                  Entry{' '}
                                  {String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    '0'
                                  )}
                                </div>

                                <div className="max-w-[220px] truncate text-sm font-black tracking-[-0.02em] text-[#292621]">
                                  {displayName ||
                                    'Unnamed user'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-xs font-medium text-[#625C54]">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E7E2D8] text-[#777067]">
                                <Icon
                                  name="mail"
                                  size={13}
                                />
                              </span>

                              <span className="max-w-[220px] truncate">
                                {u.email || '—'}
                              </span>
                            </div>
                          </td>

                          {/* ROLE */}

                          <td className="px-6 py-5">
                            <RoleBadge
                              role={u.role}
                            />
                          </td>

                          {/* DOMAIN */}

                          <td className="px-6 py-5">
                            <div className="max-w-[170px]">
                              <div className="text-xs font-bold capitalize text-[#575149]">
                                {u.domain_role ||
                                  '—'}
                              </div>

                              {u.domain_role && (
                                <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-[#3149C6] to-[#D75C43] transition-all group-hover:w-20" />
                              )}
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                u.status ||
                                'active'
                              }
                            />
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5">
                            <div className="text-xs font-bold text-[#575149]">
                              {fmtDate(
                                u.created_at
                              )}
                            </div>

                            <div className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#AAA399]">
                              Joined
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                TABLE FOOTER
            ================================================= */}

            {!loading &&
              users.length > 0 && (
                <div className="flex flex-col justify-between gap-3 border-t border-[#D3CBC0] bg-[#E2DCD2] px-6 py-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#181818] text-white">
                      <Icon
                        name="activity"
                        size={13}
                      />
                    </div>

                    <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#777067]">
                      Registry snapshot
                    </span>
                  </div>

                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#777067]">
                    {users.length} visible records
                  </div>
                </div>
              )}
          </Card>
        </section>
      </div>
    </div>
  );
}