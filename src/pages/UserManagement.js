import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getDomainRoles,
  registerUser,
} from '../services/api';

const ROLES = ['', 'student', 'educator', 'employer', 'admin'];
const STATUSES = ['', 'active', 'suspended'];

const fmtDate = (iso) => {
  if (!iso) return '–';

  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
};

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================================================
   ICON SYSTEM
   ========================================================= */

function Icon({
  name,
  className = 'h-5 w-5',
  strokeWidth = 1.8,
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const icons = {
    users: (
      <>
        <circle {...common} cx="9" cy="7" r="4" />
        <path {...common} d="M3 21v-2a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v2" />
        <path {...common} d="M16 3.5a4 4 0 0 1 0 7.5" />
        <path {...common} d="M19 14a5 5 0 0 1 3 4.5V21" />
      </>
    ),

    plus: (
      <>
        <path {...common} d="M12 5v14" />
        <path {...common} d="M5 12h14" />
      </>
    ),

    search: (
      <>
        <circle {...common} cx="11" cy="11" r="7" />
        <path {...common} d="m20 20-4-4" />
      </>
    ),

    filter: (
      <>
        <path {...common} d="M4 6h16" />
        <path {...common} d="M7 12h10" />
        <path {...common} d="M10 18h4" />
      </>
    ),

    edit: (
      <>
        <path {...common} d="M4 20h4L19 9l-4-4L4 16z" />
        <path {...common} d="m13.5 6.5 4 4" />
      </>
    ),

    trash: (
      <>
        <path {...common} d="M4 7h16" />
        <path {...common} d="M10 11v6" />
        <path {...common} d="M14 11v6" />
        <path {...common} d="M6 7l1 14h10l1-14" />
        <path {...common} d="M9 7V4h6v3" />
      </>
    ),

    pause: (
      <>
        <rect {...common} x="5" y="4" width="14" height="16" rx="2" />
        <path {...common} d="M10 9v6" />
        <path {...common} d="M14 9v6" />
      </>
    ),

    refresh: (
      <>
        <path {...common} d="M20 11a8 8 0 0 0-14-5L4 8" />
        <path {...common} d="M4 4v4h4" />
        <path {...common} d="M4 13a8 8 0 0 0 14 5l2-2" />
        <path {...common} d="M20 20v-4h-4" />
      </>
    ),

    chevron: (
      <>
        <path {...common} d="m9 6 6 6-6 6" />
      </>
    ),

    down: (
      <>
        <path {...common} d="m6 9 6 6 6-6" />
      </>
    ),

    close: (
      <>
        <path {...common} d="m6 6 12 12" />
        <path {...common} d="m18 6-12 12" />
      </>
    ),

    shield: (
      <>
        <path
          {...common}
          d="M12 3 20 6v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z"
        />
        <path {...common} d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),

    mail: (
      <>
        <rect {...common} x="3" y="5" width="18" height="14" rx="2" />
        <path {...common} d="m4 7 8 6 8-6" />
      </>
    ),

    calendar: (
      <>
        <rect {...common} x="3" y="5" width="18" height="16" rx="2" />
        <path {...common} d="M16 3v4" />
        <path {...common} d="M8 3v4" />
        <path {...common} d="M3 10h18" />
      </>
    ),

    key: (
      <>
        <circle {...common} cx="8" cy="15" r="4" />
        <path {...common} d="m11 12 8-8" />
        <path {...common} d="m16 5 3 3" />
        <path {...common} d="m14 7 3 3" />
      </>
    ),

    warning: (
      <>
        <path
          {...common}
          d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"
        />
        <path {...common} d="M12 9v4" />
        <path {...common} d="M12 16h.01" />
      </>
    ),

    check: (
      <>
        <circle {...common} cx="12" cy="12" r="9" />
        <path {...common} d="m8 12 2.5 2.5L16 9" />
      </>
    ),

    activity: (
      <>
        <path {...common} d="M3 12h4l2-7 4 14 2-7h6" />
      </>
    ),

    arrow: (
      <>
        <path {...common} d="M5 12h13" />
        <path {...common} d="m13 6 6 6-6 6" />
      </>
    ),

    lock: (
      <>
        <rect {...common} x="5" y="10" width="14" height="11" rx="2" />
        <path {...common} d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),

    userPlus: (
      <>
        <circle {...common} cx="9" cy="8" r="3.5" />
        <path {...common} d="M3 20a6 6 0 0 1 12 0" />
        <path {...common} d="M18 8v6" />
        <path {...common} d="M15 11h6" />
      </>
    ),

    spark: (
      <>
        <path
          {...common}
          d="m12 3-1.2 4.3a5 5 0 0 1-3.5 3.5L3 12l4.3 1.2a5 5 0 0 1 3.5 3.5L12 21l1.2-4.3a5 5 0 0 1 3.5-3.5L21 12l-4.3-1.2a5 5 0 0 1-3.5-3.5z"
        />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[name] || icons.users}
    </svg>
  );
}

/* =========================================================
   ROLE CONFIG
   ========================================================= */

const ROLE_META = {
  student: {
    label: 'Student',
    bg: '#EEF2FF',
    text: '#4054C8',
    accent: '#536DFE',
  },
  educator: {
    label: 'Educator',
    bg: '#EAFBF4',
    text: '#147B57',
    accent: '#18A66A',
  },
  employer: {
    label: 'Employer',
    bg: '#FFF0E9',
    text: '#C9572E',
    accent: '#F26B38',
  },
  admin: {
    label: 'Admin',
    bg: '#FFF0F6',
    text: '#C53B6A',
    accent: '#E4477A',
  },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const pageSize = 10;

  // Modals
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const [createDraft, setCreateDraft] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    domain_role_id: '',
  });

  const [domainRoles, setDomainRoles] = useState([]);
  const [createError, setCreateError] = useState(null);
  const [submittingCreate, setSubmittingCreate] =
    useState(false);

  // Unified confirm modal
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  /* =========================================================
     LOAD USERS
     ========================================================= */

  const load = async (filters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllUsers(filters || {});
      setUsers(data);
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

  /* =========================================================
     LOAD DOMAIN ROLES
     ========================================================= */

  useEffect(() => {
    if (!creating) return;

    const loadDomainRoles = async () => {
      try {
        const data = await getDomainRoles();
        setDomainRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          'Failed to load domain roles:',
          err
        );

        setCreateError(
          'Failed to load domain roles.'
        );
      }
    };

    loadDomainRoles();
  }, [creating]);

  /* =========================================================
     FILTERS
     ========================================================= */

  const applyFilters = () => {
    setPage(1);

    load({
      role: role || undefined,
      status: status || undefined,
      q: q || undefined,
    });
  };

  /* =========================================================
     STATUS
     ========================================================= */

  const askToggleStatus = (u) => {
    const next =
      u.status === 'suspended'
        ? 'active'
        : 'suspended';

    setConfirm({
      user: u,
      action: 'toggle',
      label:
        next === 'suspended'
          ? 'Suspend'
          : 'Reactivate',
      title:
        next === 'suspended'
          ? 'Suspend this user?'
          : 'Reactivate this user?',
      description:
        next === 'suspended'
          ? `Are you sure you want to suspend ${u.name}? They won't be able to sign in until reactivated.`
          : `Reactivate ${u.name}? They'll be able to sign in again immediately.`,
      danger: next === 'suspended',
      next,
    });
  };

  /* =========================================================
     DELETE
     ========================================================= */

  const askDelete = (u) => {
    setConfirm({
      user: u,
      action: 'delete',
      label: 'Delete',
      title: 'Delete this user?',
      description: `Are you sure you want to delete ${u.name}? This can't be undone.`,
      danger: true,
    });
  };

  /* =========================================================
     CONFIRM ACTION
     ========================================================= */

  const runConfirm = async () => {
    if (!confirm) return;

    setConfirmBusy(true);

    try {
      if (confirm.action === 'delete') {
        await deleteUser(confirm.user.id);

        setUsers((prev) =>
          prev.filter(
            (x) => x.id !== confirm.user.id
          )
        );
      } else if (confirm.action === 'toggle') {
        const updated = await updateUser(
          confirm.user.id,
          {
            status: confirm.next,
          }
        );

        setUsers((prev) =>
          prev.map((x) =>
            x.id === confirm.user.id
              ? { ...x, ...updated }
              : x
          )
        );
      }

      setConfirm(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message
      );
    } finally {
      setConfirmBusy(false);
    }
  };

  /* =========================================================
     EDIT
     ========================================================= */

  const onSaveEdit = async (e) => {
    e.preventDefault();

    try {
      const updated = await updateUser(
        editing.id,
        {
          name: editing.name,
          role: editing.role,
          status: editing.status,
        }
      );

      setUsers((prev) =>
        prev.map((x) =>
          x.id === editing.id
            ? { ...x, ...updated }
            : x
        )
      );

      setEditing(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message
      );
    }
  };

  /* =========================================================
     CREATE
     ========================================================= */

  const onCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);

    const d = createDraft;

    if (!d.name.trim()) {
      return setCreateError(
        'Name is required'
      );
    }

    if (!EMAIL_RE.test(d.email.trim())) {
      return setCreateError(
        'Enter a valid email'
      );
    }

    if (!PWD_RE.test(d.password)) {
      return setCreateError(
        'Password must be at least 8 chars with uppercase, lowercase, and a digit.'
      );
    }

    if (
      d.role === 'student' &&
      !d.domain_role_id
    ) {
      return setCreateError(
        'Please select a domain role for the student.'
      );
    }

    setSubmittingCreate(true);

    try {
      await registerUser({
        name: d.name.trim(),
        email: d.email.trim().toLowerCase(),
        password: d.password,
        role: d.role,
        domain_role_id:
          d.role === 'student'
            ? d.domain_role_id
            : null,
      });

      setCreating(false);

      setCreateDraft({
        name: '',
        email: '',
        password: '',
        role: 'student',
        domain_role_id: '',
      });

      await load();
    } catch (err) {
      setCreateError(
        err.response?.data?.error ||
          err.message
      );
    } finally {
      setSubmittingCreate(false);
    }
  };

  /* =========================================================
     PAGINATION
     ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(users.length / pageSize)
  );

  const visible = users.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const activeCount = users.filter(
    (u) => u.status !== 'suspended'
  ).length;

  const suspendedCount = users.filter(
    (u) => u.status === 'suspended'
  ).length;

  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div className="relative min-h-full overflow-hidden bg-[#F7F5F1] text-[#191B25]">

      {/* =====================================================
          DECORATIVE BACKGROUND
          ===================================================== */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#536DFE]/10 blur-3xl" />

      <div className="pointer-events-none absolute right-[-140px] top-[260px] h-96 w-96 rounded-full bg-[#F26B38]/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-150px] left-[35%] h-96 w-96 rounded-full bg-[#18A66A]/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================================
            TOP HEADER
            ===================================================== */}

        <section className="relative mb-6 overflow-hidden rounded-[34px] border border-[#DDD8CF] bg-white shadow-[0_16px_55px_rgba(32,35,45,0.07)]">

          {/* Gradient stripe */}
          <div className="h-2 bg-gradient-to-r from-[#536DFE] via-[#E4477A] to-[#F26B38]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_350px]">

            {/* Main heading */}
            <div className="relative overflow-hidden px-6 py-8 sm:px-9 sm:py-10 lg:px-12">

              <div className="absolute -right-10 -top-20 select-none text-[190px] font-black leading-none tracking-[-0.1em] text-[#F5F3EF]">
                U
              </div>

              <div className="relative z-10">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E0DBD2] bg-[#FBFAF7] px-3 py-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#536DFE] text-white">
                    <Icon
                      name="users"
                      className="h-3 w-3"
                    />
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6D6970]">
                    Identity registry
                  </span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                  Manage the people
                  <br />
                  <span className="bg-gradient-to-r from-[#536DFE] via-[#A346C8] to-[#F26B38] bg-clip-text text-transparent">
                    behind Vayvora.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-[#77736D] sm:text-base">
                  Control user identities, roles, access
                  status and account activity from one
                  centralized registry.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">

                  <div className="flex items-center gap-2 rounded-full border border-[#DCEFE5] bg-[#F0FBF5] px-3 py-2 text-xs font-bold text-[#177B58]">
                    <span className="h-2 w-2 rounded-full bg-[#18A66A]" />
                    {activeCount} active
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-[#F3D7D7] bg-[#FFF5F5] px-3 py-2 text-xs font-bold text-[#B64B4B]">
                    <span className="h-2 w-2 rounded-full bg-[#E05252]" />
                    {suspendedCount} suspended
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-[#DDD8F7] bg-[#F5F3FF] px-3 py-2 text-xs font-bold text-[#6150B8]">
                    <Icon
                      name="shield"
                      className="h-3.5 w-3.5"
                    />
                    Role controlled
                  </div>

                </div>
              </div>
            </div>

            {/* Add user panel */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#536DFE] via-[#6849D8] to-[#A63DA4] p-7 text-white sm:p-9">

              <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full border-[24px] border-white/10" />

              <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full border-[18px] border-[#F26B38]/35" />

              <div className="relative flex h-full flex-col justify-between">

                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Icon
                      name="userPlus"
                      className="h-6 w-6"
                    />
                  </div>

                  <p className="mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                    Create identity
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">
                    Add a new user
                  </h2>

                  <p className="mt-2 text-xs font-medium leading-5 text-white/60">
                    Create an account and assign its
                    platform role.
                  </p>
                </div>

                <button
                  onClick={() => setCreating(true)}
                  className="group mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#4E4BC4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)]"
                >
                  <Icon
                    name="plus"
                    className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
                  />
                  Add New User
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH + FILTER COMMAND BAR
            ===================================================== */}

        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-[#DDD8CF] bg-white shadow-[0_10px_35px_rgba(32,35,45,0.045)]">

          <div className="border-b border-[#ECE8E1] px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F2FF] text-[#536DFE]">
                  <Icon
                    name="filter"
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B877F]">
                    Registry controls
                  </p>

                  <p className="text-sm font-black text-[#282A34]">
                    Find exactly who you need
                  </p>
                </div>
              </div>

              <div className="rounded-full bg-[#F5F3EF] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#77736D]">
                {users.length} records
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 lg:grid-cols-[1.4fr_0.65fr_0.65fr_auto]">

            {/* Search */}
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#8A867F]">
                Search
              </label>

              <div className="relative">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09B93]"
                />

                <input
                  type="search"
                  placeholder="Search by name or email..."
                  value={q}
                  onChange={(e) =>
                    setQ(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    applyFilters()
                  }
                  className="h-11 w-full rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] pl-10 pr-4 text-sm font-medium text-[#252731] outline-none transition-all placeholder:text-[#AAA59C] focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#8A867F]">
                Role
              </label>

              <div className="relative">
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] px-3.5 pr-9 text-sm font-bold capitalize text-[#393B45] outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
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

                <Icon
                  name="down"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8980]"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#8A867F]">
                Status
              </label>

              <div className="relative">
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] px-3.5 pr-9 text-sm font-bold capitalize text-[#393B45] outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
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

                <Icon
                  name="down"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8980]"
                />
              </div>
            </div>

            {/* Apply */}
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="group flex h-11 w-full items-center justify-center rounded-xl bg-[#191B25] px-5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#536DFE] hover:shadow-[0_10px_25px_rgba(83,109,254,0.22)] lg:w-auto"
              >
                <Icon
                  name="filter"
                  className="mr-2 h-4 w-4"
                />
                Apply Filter
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  <Icon
                    name="arrow"
                    className="h-3.5 w-3.5"
                  />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-[20px] border border-[#F0C6C6] bg-[#FFF5F5] px-5 py-4 text-[#A94242]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDE4E4]">
              <Icon
                name="warning"
                className="h-4 w-4"
              />
            </div>

            <div>
              <p className="text-sm font-black">
                Something went wrong
              </p>

              <p className="mt-1 text-xs font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            USER REGISTRY
            ===================================================== */}

        <section className="overflow-hidden rounded-[30px] border border-[#DDD8CF] bg-white shadow-[0_14px_50px_rgba(32,35,45,0.055)]">

          {/* Table heading */}
          <div className="flex flex-col gap-4 border-b border-[#ECE8E1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

            <div className="flex items-center gap-3">

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#536DFE] to-[#A346C8] text-white shadow-[0_8px_20px_rgba(83,109,254,0.18)]">
                <Icon
                  name="users"
                  className="h-5 w-5"
                />

                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#18A66A]" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B877F]">
                  User registry
                </p>

                <h2 className="mt-0.5 text-xl font-black tracking-[-0.035em]">
                  All platform identities
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#77736D]">
              <span className="h-2 w-2 rounded-full bg-[#18A66A]" />
              Live account data
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-sm">

              <thead>
                <tr className="border-b border-[#ECE8E1] bg-[#FAF9F6]">

                  <th className="px-6 py-4 text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8C877F]">
                      Identity
                    </span>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8C877F]">
                      Role
                    </span>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8C877F]">
                      Account status
                    </span>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8C877F]">
                      Last activity
                    </span>
                  </th>

                  <th className="px-6 py-4 text-right">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8C877F]">
                      Actions
                    </span>
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0ECE5]">

                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16"
                    >
                      <div className="flex flex-col items-center justify-center">

                        <div className="relative h-12 w-12">
                          <div className="absolute inset-0 rounded-full border-4 border-[#E9E7F5]" />

                          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#536DFE]" />
                        </div>

                        <p className="mt-4 text-sm font-black text-[#454750]">
                          Loading user registry
                        </p>

                        <p className="mt-1 text-xs font-medium text-[#99948C]">
                          Fetching account records...
                        </p>

                      </div>
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16"
                    >
                      <div className="flex flex-col items-center justify-center text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#F1F2FF] text-[#536DFE]">
                          <Icon
                            name="search"
                            className="h-6 w-6"
                          />
                        </div>

                        <p className="mt-5 text-base font-black">
                          No users found
                        </p>

                        <p className="mt-1 max-w-sm text-xs font-medium leading-5 text-[#99948C]">
                          Try changing your search,
                          role or status filters.
                        </p>

                      </div>
                    </td>
                  </tr>
                ) : (
                  visible.map((u, index) => {

                    const roleKey = String(
                      u.role || ''
                    ).toLowerCase();

                    const meta =
                      ROLE_META[roleKey] ||
                      {
                        label:
                          u.role || 'Unknown',
                        bg: '#F3F2EE',
                        text: '#66625B',
                        accent: '#88837A',
                      };

                    const displayName =
                      u.name &&
                      u.name
                        .trim()
                        .toLowerCase() !==
                        'user'
                        ? u.name
                        : u.username ||
                          u.name;

                    return (
                      <tr
                        key={u.id}
                        className="group relative transition-all duration-200 hover:bg-[#FCFBF8]"
                      >

                        {/* Identity */}
                        <td className="relative px-6 py-5">

                          <div
                            className="absolute left-0 top-0 h-full w-0 transition-all duration-300 group-hover:w-1"
                            style={{
                              background:
                                `linear-gradient(to bottom, ${meta.accent}, #536DFE)`,
                            }}
                          />

                          <div className="flex items-center gap-4">

                            <div
                              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] text-xs font-black text-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                              style={{
                                background:
                                  `linear-gradient(135deg, ${meta.accent}, #536DFE)`,
                              }}
                            >
                              {initials(
                                displayName
                              )}

                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                  u.status ===
                                  'suspended'
                                    ? 'bg-[#E05252]'
                                    : 'bg-[#18A66A]'
                                }`}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-black text-[#252731]">
                                {displayName}
                              </div>

                              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#918C84]">
                                <Icon
                                  name="mail"
                                  className="h-3 w-3"
                                />

                                <span className="truncate">
                                  {u.email}
                                </span>
                              </div>
                            </div>

                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-5">

                          <span
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider"
                            style={{
                              backgroundColor:
                                meta.bg,
                              color: meta.text,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  meta.accent,
                              }}
                            />

                            {meta.label}
                          </span>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">

                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                              u.status ===
                              'suspended'
                                ? 'bg-[#FFF0F0] text-[#B84848]'
                                : 'bg-[#ECFAF3] text-[#177B58]'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.status ===
                                'suspended'
                                  ? 'bg-[#E05252]'
                                  : 'bg-[#18A66A]'
                              }`}
                            />

                            {u.status ||
                              'active'}
                          </div>

                        </td>

                        {/* Last Login */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3EF] text-[#8A867F]">
                              <Icon
                                name="calendar"
                                className="h-3.5 w-3.5"
                              />
                            </div>

                            <span className="text-xs font-semibold text-[#67635C]">
                              {fmtDate(
                                u.last_login
                              )}
                            </span>

                          </div>

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              className="group/action inline-flex items-center gap-1.5 rounded-xl border border-[#D9DDF7] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#5360B8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#536DFE] hover:bg-[#F3F4FF] hover:text-[#4054C8]"
                              onClick={() =>
                                setEditing({
                                  ...u,
                                })
                              }
                            >
                              <Icon
                                name="edit"
                                className="h-3.5 w-3.5"
                              />

                              Edit
                            </button>

                            <button
                              className={`inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 ${
                                u.status ===
                                'suspended'
                                  ? 'border-[#CFEBDD] text-[#168159] hover:bg-[#F0FBF5]'
                                  : 'border-[#F2DAB1] text-[#A26B18] hover:bg-[#FFF8E9]'
                              }`}
                              onClick={() =>
                                askToggleStatus(
                                  u
                                )
                              }
                            >
                              <Icon
                                name={
                                  u.status ===
                                  'suspended'
                                    ? 'refresh'
                                    : 'pause'
                                }
                                className="h-3.5 w-3.5"
                              />

                              {u.status ===
                              'suspended'
                                ? 'Reactivate'
                                : 'Suspend'}
                            </button>

                            <button
                              className="inline-flex items-center justify-center rounded-xl bg-[#FFF0F0] px-3 py-2 text-[#C44545] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E05252] hover:text-white"
                              onClick={() =>
                                askDelete(u)
                              }
                              title="Delete user"
                            >
                              <Icon
                                name="trash"
                                className="h-3.5 w-3.5"
                              />
                            </button>

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
              PAGINATION
              ================================================= */}

          <div className="flex flex-col gap-4 border-t border-[#ECE8E1] bg-[#FBFAF7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="text-[11px] font-bold text-[#858078]">
              Showing{' '}
              <span className="font-black text-[#353740]">
                {users.length === 0
                  ? 0
                  : (page - 1) *
                      pageSize +
                    1}
              </span>
              —
              <span className="font-black text-[#353740]">
                {Math.min(
                  page * pageSize,
                  users.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-black text-[#353740]">
                {users.length}
              </span>{' '}
              users
            </div>

            <div className="flex items-center gap-1.5">

              <button
                className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-[#DED9D0] bg-white text-xs font-black text-[#77736D] transition-all hover:border-[#536DFE] hover:text-[#536DFE] disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                disabled={page === 1}
              >
                &lt;
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, i) => i + 1
              )
                .slice(0, 3)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      setPage(p)
                    }
                    className={`flex h-8 min-w-8 items-center justify-center rounded-lg text-[11px] font-black transition-all ${
                      p === page
                        ? 'bg-[#536DFE] text-white shadow-[0_6px_15px_rgba(83,109,254,0.22)]'
                        : 'border border-[#DED9D0] bg-white text-[#77736D] hover:border-[#536DFE] hover:text-[#536DFE]'
                    }`}
                  >
                    {p}
                  </button>
                ))}

              {totalPages > 3 && (
                <span className="px-1 text-xs font-black text-[#99948C]">
                  …
                </span>
              )}

              <button
                className="flex h-8 items-center justify-center rounded-lg border border-[#DED9D0] bg-white px-3 text-[10px] font-black uppercase tracking-wide text-[#77736D] transition-all hover:border-[#536DFE] hover:text-[#536DFE] disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
                disabled={
                  page === totalPages
                }
              >
                Next
                <Icon
                  name="arrow"
                  className="ml-1.5 h-3 w-3"
                />
              </button>

            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
            ===================================================== */}

        <div className="mt-6 flex flex-col gap-2 border-t border-[#DDD8CF] pt-5 text-[9px] font-black uppercase tracking-[0.18em] text-[#99948C] sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#18A66A]" />
            Vayvora Identity Registry
          </div>

          <div className="flex items-center gap-4">
            <span>
              {users.length} total records
            </span>

            <span className="hidden h-3 w-px bg-[#D4CFC6] sm:block" />

            <span>
              Page {page} / {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* =======================================================
          EDIT USER MODAL
          ======================================================= */}

      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#171A24]/35 p-4 backdrop-blur-md"
          onClick={() =>
            setEditing(null)
          }
        >
          <form
            onSubmit={onSaveEdit}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(25,28,40,0.2)]"
          >

            <div className="h-2 bg-gradient-to-r from-[#536DFE] via-[#A346C8] to-[#F26B38]" />

            <div className="relative overflow-hidden px-6 py-6 sm:px-8">

              <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-[#536DFE]/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#536DFE]">
                    <Icon
                      name="edit"
                      className="h-5 w-5"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B877F]">
                      Identity editor
                    </p>

                    <h3 className="mt-1 text-xl font-black tracking-[-0.035em]">
                      Edit user
                    </h3>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditing(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F3EF] text-[#77736D] transition-all hover:bg-[#ECE9E2] hover:text-[#191B25]"
                >
                  <Icon
                    name="close"
                    className="h-4 w-4"
                  />
                </button>

              </div>

              <div className="mt-7 space-y-5">

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                    Name
                  </label>

                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        name: e.target
                          .value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] px-3.5 text-sm font-semibold outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                    Role
                  </label>

                  <select
                    value={editing.role}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        role: e.target
                          .value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] px-3.5 text-sm font-bold capitalize outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                  >
                    {ROLES.slice(1).map(
                      (r) => (
                        <option
                          key={r}
                          value={r}
                        >
                          {r}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                    Status
                  </label>

                  <select
                    value={
                      editing.status ||
                      'active'
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        status: e.target
                          .value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] px-3.5 text-sm font-bold capitalize outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                  >
                    {STATUSES.slice(
                      1
                    ).map((s) => (
                      <option
                        key={s}
                        value={s}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="mt-7 flex justify-end gap-2 border-t border-[#ECE8E1] pt-5">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setEditing(null)
                  }
                >
                  Cancel
                </Button>

                <Button type="submit">
                  Save Changes
                </Button>

              </div>

            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          CREATE USER MODAL
          ======================================================= */}

      {creating && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#171A24]/35 p-4 backdrop-blur-md"
          onClick={() =>
            !submittingCreate &&
            setCreating(false)
          }
        >
          <form
            onSubmit={onCreate}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(25,28,40,0.2)]"
          >

            <div className="h-2 bg-gradient-to-r from-[#536DFE] via-[#A346C8] to-[#F26B38]" />

            <div className="relative px-6 py-6 sm:px-8">

              <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-[#A346C8]/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#536DFE] to-[#A346C8] text-white shadow-[0_8px_20px_rgba(83,109,254,0.2)]">
                    <Icon
                      name="userPlus"
                      className="h-5 w-5"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B877F]">
                      Identity creation
                    </p>

                    <h3 className="mt-1 text-xl font-black tracking-[-0.035em]">
                      Add new user
                    </h3>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    !submittingCreate &&
                    setCreating(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F3EF] text-[#77736D] transition-all hover:bg-[#ECE9E2]"
                >
                  <Icon
                    name="close"
                    className="h-4 w-4"
                  />
                </button>

              </div>

              <div className="relative mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                    Full name
                  </label>

                  <div className="relative">
                    <Icon
                      name="users"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A958C]"
                    />

                    <input
                      value={
                        createDraft.name
                      }
                      onChange={(e) =>
                        setCreateDraft({
                          ...createDraft,
                          name: e.target
                            .value,
                        })
                      }
                      autoFocus
                      className="h-11 w-full rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] pl-10 pr-3.5 text-sm font-semibold outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                    Email
                  </label>

                  <div className="relative">
                    <Icon
                      name="mail"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A958C]"
                    />

                    <input
                      type="email"
                      value={
                        createDraft.email
                      }
                      onChange={(e) =>
                        setCreateDraft({
                          ...createDraft,
                          email: e.target
                            .value,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] pl-10 pr-3.5 text-sm font-semibold outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                    Temporary password
                  </label>

                  <div className="relative">
                    <Icon
                      name="key"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A958C]"
                    />

                    <input
                      type="text"
                      value={
                        createDraft.password
                      }
                      onChange={(e) =>
                        setCreateDraft({
                          ...createDraft,
                          password:
                            e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] pl-10 pr-3.5 font-mono text-sm outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                      placeholder="Min 8 chars, mixed case + digit"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] font-medium text-[#99948C]">
                    Must contain uppercase,
                    lowercase and a digit.
                  </p>
                </div>

                {/* Role */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                    Role
                  </label>

                  <div className="relative">
                    <select
                      value={
                        createDraft.role
                      }
                      onChange={(e) =>
                        setCreateDraft({
                          ...createDraft,
                          role: e.target
                            .value,
                          domain_role_id:
                            e.target
                              .value ===
                            'student'
                              ? createDraft.domain_role_id
                              : '',
                        })
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] px-3.5 pr-9 text-sm font-bold capitalize outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                    >
                      {ROLES.slice(1).map(
                        (r) => (
                          <option
                            key={r}
                            value={r}
                          >
                            {r}
                          </option>
                        )
                      )}
                    </select>

                    <Icon
                      name="down"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8980]"
                    />
                  </div>
                </div>

                {/* Domain role */}
                {createDraft.role ===
                  'student' && (
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#858078]">
                      Domain role
                    </label>

                    <div className="relative">
                      <select
                        value={
                          createDraft.domain_role_id
                        }
                        onChange={(e) =>
                          setCreateDraft({
                            ...createDraft,
                            domain_role_id:
                              e.target
                                .value,
                          })
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-[#DDD8CF] bg-[#FBFAF7] px-3.5 pr-9 text-sm font-bold outline-none transition-all focus:border-[#536DFE] focus:bg-white focus:ring-4 focus:ring-[#536DFE]/10"
                      >
                        <option value="">
                          Select domain role
                        </option>

                        {domainRoles.map(
                          (domain) => (
                            <option
                              key={
                                domain.domain_role_id
                              }
                              value={
                                domain.domain_role_id
                              }
                            >
                              {
                                domain.domain_name
                              }
                            </option>
                          )
                        )}
                      </select>

                      <Icon
                        name="down"
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8980]"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Create error */}
              {createError && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#F0C6C6] bg-[#FFF5F5] p-4 text-[#A94242]">

                  <Icon
                    name="warning"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />

                  <p className="text-xs font-bold leading-5">
                    {createError}
                  </p>

                </div>
              )}

              {/* Security note */}
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#DCE0F6] bg-[#F4F5FF] p-4">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#536DFE]">
                  <Icon
                    name="lock"
                    className="h-3.5 w-3.5"
                  />
                </div>

                <div>
                  <p className="text-xs font-black text-[#353A62]">
                    Account security
                  </p>

                  <p className="mt-1 text-[10px] font-medium leading-5 text-[#737798]">
                    The account will be created with
                    the selected role and access settings.
                  </p>
                </div>

              </div>

              <div className="mt-7 flex justify-end gap-2 border-t border-[#ECE8E1] pt-5">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCreating(false)
                  }
                  disabled={
                    submittingCreate
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    submittingCreate
                  }
                >
                  {submittingCreate
                    ? 'Creating…'
                    : 'Create User'}
                </Button>

              </div>

            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          CONFIRM MODAL
          ======================================================= */}

      {confirm && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-[#171A24]/40 p-4 backdrop-blur-md"
          onClick={() =>
            !confirmBusy &&
            setConfirm(null)
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(25,28,40,0.22)]"
          >

            <div
              className={`h-2 ${
                confirm.danger
                  ? 'bg-gradient-to-r from-[#E05252] via-[#E4477A] to-[#F26B38]'
                  : 'bg-gradient-to-r from-[#536DFE] via-[#18A66A] to-[#536DFE]'
              }`}
            />

            <div className="p-6 sm:p-7">

              <div className="flex items-start gap-4">

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    confirm.danger
                      ? 'bg-[#FFF0F0] text-[#D84B4B]'
                      : 'bg-[#FFF7E6] text-[#B77A18]'
                  }`}
                >
                  <Icon
                    name={
                      confirm.action ===
                      'delete'
                        ? 'trash'
                        : confirm.next ===
                          'suspended'
                        ? 'pause'
                        : 'refresh'
                    }
                    className="h-5 w-5"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8C877F]">
                    Confirm action
                  </p>

                  <h3 className="mt-1 text-xl font-black tracking-[-0.035em] text-[#191B25]">
                    {confirm.title}
                  </h3>

                  <p className="mt-2 text-sm font-medium leading-6 text-[#77736D]">
                    {confirm.description}
                  </p>
                </div>

              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-[#ECE8E1] pt-5">

                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirm(null)
                  }
                  disabled={confirmBusy}
                >
                  Cancel
                </Button>

                <button
                  type="button"
                  onClick={runConfirm}
                  disabled={confirmBusy}
                  className={`inline-flex items-center rounded-xl px-4 py-2.5 text-xs font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    confirm.danger
                      ? 'bg-[#D94D4D] hover:bg-[#C63E3E] hover:shadow-[0_8px_20px_rgba(217,77,77,0.2)]'
                      : 'bg-[#536DFE] hover:bg-[#4359E8] hover:shadow-[0_8px_20px_rgba(83,109,254,0.22)]'
                  }`}
                >
                  {confirmBusy
                    ? 'Working…'
                    : `Yes, ${confirm.label.toLowerCase()}`}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
