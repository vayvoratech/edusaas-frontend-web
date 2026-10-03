import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import {
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/api';

const fmtDate = (iso) => {
  if (!iso) return 'â€”';

  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const daysUntil = (iso) => {
  if (!iso) return null;

  return Math.ceil(
    (new Date(iso) - new Date()) / 86400000
  );
};

const TrashIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const EditIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CalendarIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
    <path d="M8 14h2" />
    <path d="M14 14h2" />
    <path d="M8 18h2" />
  </svg>
);

const CheckIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const ClockIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const PlusIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState({
    title: '',
    due_date: '',
  });

  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (t) => {
    setEditing(t);

    setEditDraft({
      title: t.title || '',
      due_date: t.due_date
        ? t.due_date.slice(0, 10)
        : '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();

    if (!editing) return;
    if (!editDraft.title.trim()) return;

    setSavingEdit(true);

    try {
      const updated = await updateTask(editing.id, {
        title: editDraft.title.trim(),
        due_date: editDraft.due_date || null,
      });

      setTasks((prev) =>
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
    } finally {
      setSavingEdit(false);
    }
  };

  const load = async () => {
    try {
      setTasks(await getMyTasks());
    } catch (e) {
      setError(
        e.response?.data?.error ||
        e.message
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      await createTask({
        title: title.trim(),
        due_date: dueDate || null,
      });

      setTitle('');
      setDueDate('');
      setAdding(false);

      load();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message
      );
    }
  };

  const onToggle = async (t) => {
    try {
      const updated = await updateTask(t.id, {
        status:
          t.status === 'done'
            ? 'pending'
            : 'done',
      });

      setTasks((prev) =>
        prev.map((x) =>
          x.id === t.id
            ? { ...x, ...updated }
            : x
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await deleteTask(pendingDelete.id);

      setTasks((prev) =>
        prev.filter(
          (x) => x.id !== pendingDelete.id
        )
      );

      setPendingDelete(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message
      );
    } finally {
      setDeleting(false);
    }
  };

  const pending = tasks.filter(
    (t) => t.status === 'pending'
  );

  const done = tasks.filter(
    (t) => t.status === 'done'
  );

  return (
    <>
      <style>{`
        .tasks-page-premium {
          position: relative;
          isolation: isolate;
          padding-bottom: 35px;
        }

        /* =========================
           PAGE BACKGROUND GLOW
        ========================== */

        .tasks-page-premium::before {
          content: "";
          position: fixed;
          width: 500px;
          height: 500px;
          top: 60px;
          right: -220px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(59,130,246,.13) 0%,
              rgba(99,102,241,.07) 32%,
              transparent 70%
            );
          filter: blur(8px);
          pointer-events: none;
          z-index: -1;
          animation: ambientGlow 9s ease-in-out infinite;
        }

        .tasks-page-premium::after {
          content: "";
          position: fixed;
          width: 400px;
          height: 400px;
          left: -220px;
          bottom: 0;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(14,165,233,.09),
              transparent 70%
            );
          pointer-events: none;
          z-index: -1;
          animation: ambientGlowReverse 11s ease-in-out infinite;
        }

        /* =========================
           HEADER
        ========================== */

        .tasks-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 30px 32px;
          border-radius: 26px;
          border: 1px solid rgba(226,232,240,.9);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.99),
              rgba(248,250,252,.97)
            );
          box-shadow:
            0 20px 50px rgba(15,23,42,.065),
            inset 0 1px 0 rgba(255,255,255,.95);
        }

        .tasks-hero::before {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          right: -180px;
          top: -200px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(59,130,246,.17),
              transparent 69%
            );
          pointer-events: none;
        }

        .tasks-hero::after {
          content: "";
          position: absolute;
          left: 5%;
          right: 5%;
          top: 0;
          height: 2px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #60a5fa,
              #6366f1,
              #8b5cf6,
              transparent
            );
          box-shadow:
            0 0 14px rgba(59,130,246,.45);
          animation: heroLine 4s ease-in-out infinite;
        }

        .tasks-hero-content {
          position: relative;
          z-index: 2;
        }

        .tasks-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
          color: #2563eb;
          font-size: 10px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .tasks-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow:
            0 0 0 4px rgba(59,130,246,.09),
            0 0 16px rgba(59,130,246,.65);
          animation: dotPulse 2s ease-in-out infinite;
        }

        .tasks-title {
          margin: 0;
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 950;
          color: #0f172a;
        }

        .tasks-title-gradient {
          background:
            linear-gradient(
              100deg,
              #2563eb 0%,
              #4f46e5 38%,
              #7c3aed 72%,
              #2563eb 100%
            );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: titleGradient 5s ease infinite;
        }

        .tasks-subtitle {
          max-width: 650px;
          margin: 10px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 550;
          letter-spacing: -.005em;
        }

        .tasks-add-button {
          position: relative;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          padding: 0 20px;
          border: 1px solid rgba(37,99,235,.75);
          border-radius: 15px;
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5 55%,
              #6366f1
            );
          box-shadow:
            0 12px 28px rgba(37,99,235,.25),
            0 0 28px rgba(59,130,246,.10),
            inset 0 1px 0 rgba(255,255,255,.28);
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          letter-spacing: -.01em;
          cursor: pointer;
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .tasks-add-button:hover {
          transform: translateY(-3px);
          box-shadow:
            0 17px 35px rgba(37,99,235,.31),
            0 0 35px rgba(59,130,246,.17),
            inset 0 1px 0 rgba(255,255,255,.3);
        }

        .tasks-add-button svg {
          width: 18px;
          height: 18px;
        }

        /* =========================
           ERROR
        ========================== */

        .task-error {
          position: relative;
          overflow: hidden;
          padding: 14px 17px;
          border: 1px solid #fecaca;
          border-radius: 15px;
          color: #b91c1c;
          background:
            linear-gradient(
              135deg,
              #fff7f7,
              #fef2f2
            );
          box-shadow:
            0 10px 25px rgba(239,68,68,.08);
          font-size: 13px;
          font-weight: 700;
        }

        .task-error::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(
            180deg,
            #ef4444,
            #dc2626
          );
          box-shadow:
            0 0 16px rgba(239,68,68,.6);
        }

        /* =========================
           ADD TASK FORM
        ========================== */

        .task-form-card {
          position: relative;
          overflow: hidden;
          border: 1px solid #dbeafe;
          border-radius: 23px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.99),
              rgba(248,250,255,.98)
            );
          box-shadow:
            0 16px 40px rgba(37,99,235,.075),
            0 0 30px rgba(59,130,246,.05);
        }

        .task-form-card::after {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          right: -130px;
          top: -150px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(59,130,246,.13),
              transparent 70%
            );
        }

        .task-form-inner {
          position: relative;
          z-index: 2;
          padding: 24px;
        }

        .task-form-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 20px;
        }

        .task-form-icon {
          position: relative;
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #2563eb;
          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
          box-shadow:
            0 0 0 5px rgba(59,130,246,.045),
            0 9px 22px rgba(37,99,235,.13);
        }

        .task-form-icon::after {
          content: "";
          position: absolute;
          inset: -5px;
          border: 1px solid rgba(96,165,250,.20);
          border-radius: 17px;
          animation: iconRing 3s ease-in-out infinite;
        }

        .task-form-icon svg {
          width: 20px;
          height: 20px;
        }

        .task-form-title {
          margin: 0;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -.025em;
          background:
            linear-gradient(
              100deg,
              #0f172a,
              #334155,
              #2563eb
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .task-form-description {
          margin: 3px 0 0;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        .task-form-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            190px
            auto
            auto;
          gap: 12px;
          align-items: end;
        }

        .task-field label {
          display: block;
          margin-bottom: 7px;
          color: #64748b;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .12em;
        }

        .task-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border: 1px solid #dbe3ee;
          border-radius: 12px;
          outline: none;
          color: #172033;
          background: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 650;
          box-shadow:
            inset 0 1px 2px rgba(15,23,42,.025);
          transition:
            border-color .22s ease,
            box-shadow .22s ease,
            transform .22s ease;
        }

        .task-input::placeholder {
          color: #a1aec0;
          font-weight: 550;
        }

        .task-input:hover {
          border-color: #bfdbfe;
        }

        .task-input:focus {
          border-color: #60a5fa;
          transform: translateY(-1px);
          box-shadow:
            0 0 0 4px rgba(59,130,246,.09),
            0 10px 24px rgba(37,99,235,.08);
        }

        .task-form-button {
          height: 44px;
          padding: 0 17px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 850;
        }

        /* =========================
           SECTION CARD
        ========================== */

        .task-section-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226,232,240,.9);
          border-radius: 23px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.99),
              rgba(248,250,252,.96)
            );
          box-shadow:
            0 14px 38px rgba(15,23,42,.055),
            inset 0 1px 0 rgba(255,255,255,.95);
        }

        .task-section-card::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          right: -190px;
          top: -190px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(59,130,246,.075),
              transparent 70%
            );
          pointer-events: none;
        }

        .task-section-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf1f6;
        }

        .task-section-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .task-section-icon {
          position: relative;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 13px;
          color: #2563eb;
          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
          box-shadow:
            0 0 0 5px rgba(59,130,246,.045),
            0 9px 20px rgba(37,99,235,.11);
        }

        .task-section-icon::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 18px;
          border: 1px solid rgba(96,165,250,.17);
          animation: iconRing 3s ease-in-out infinite;
        }

        .task-section-icon svg {
          width: 19px;
          height: 19px;
        }

        .task-section-title {
          margin: 0;
          font-size: 17px;
          line-height: 1.25;
          font-weight: 900;
          letter-spacing: -.025em;
          background:
            linear-gradient(
              100deg,
              #0f172a 0%,
              #334155 45%,
              #2563eb 100%
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .task-section-subtitle {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.4;
          font-weight: 600;
          letter-spacing: .005em;
        }

        .task-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 37px;
          height: 29px;
          padding: 0 10px;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          background: #eff6ff;
          background-clip: padding-box;
          color: #2563eb;
          font-size: 11px;
          font-weight: 900;
          box-shadow:
            0 0 18px rgba(59,130,246,.08);
        }

        /* =========================
           TASK ITEMS
        ========================== */

        .task-list {
          position: relative;
          z-index: 2;
          padding: 9px 13px 13px;
        }

        .task-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 78px;
          margin: 5px 0;
          padding: 12px 13px;
          border: 1px solid transparent;
          border-radius: 17px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.99),
              rgba(248,250,252,.72)
            );
          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .task-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 16px;
          bottom: 16px;
          width: 3px;
          border-radius: 99px;
          background:
            linear-gradient(
              180deg,
              #3b82f6,
              #6366f1,
              #8b5cf6
            );
          opacity: 0;
          box-shadow:
            0 0 15px rgba(59,130,246,.7);
          transition: opacity .25s ease;
        }

        .task-item:hover {
          transform: translateY(-3px);
          border-color: #dbeafe;
          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f8fbff
            );
          box-shadow:
            0 14px 30px rgba(37,99,235,.08),
            0 0 24px rgba(59,130,246,.045);
        }

        .task-item:hover::before {
          opacity: 1;
        }

        /* =========================
           CHECKBOX
        ========================== */

        .task-checkbox {
          position: relative;
          flex: 0 0 auto;
          width: 22px;
          height: 22px;
          appearance: none;
          border: 1.5px solid #cbd5e1;
          border-radius: 7px;
          background: #fff;
          cursor: pointer;
          transition:
            transform .2s ease,
            border-color .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .task-checkbox:hover {
          transform: scale(1.08);
          border-color: #60a5fa;
          box-shadow:
            0 0 0 5px rgba(59,130,246,.075);
        }

        .task-checkbox:checked {
          border-color: #2563eb;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          box-shadow:
            0 5px 15px rgba(37,99,235,.25),
            0 0 18px rgba(59,130,246,.13);
        }

        .task-checkbox:checked::after {
          content: "";
          position: absolute;
          left: 6px;
          top: 3px;
          width: 6px;
          height: 10px;
          border-right: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: rotate(45deg);
        }

        /* =========================
           TASK TEXT
        ========================== */

        .task-main {
          flex: 1;
          min-width: 0;
        }

        .task-title {
          overflow: hidden;
          color: #172033;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 850;
          letter-spacing: -.015em;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition:
            color .2s ease,
            transform .2s ease;
        }

        .task-item:hover .task-title {
          background:
            linear-gradient(
              90deg,
              #0f172a,
              #2563eb,
              #4f46e5
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .task-date {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          color: #7b8aa0;
          font-size: 11px;
          line-height: 1.4;
          font-weight: 650;
          letter-spacing: .005em;
        }

        .task-date svg {
          width: 13px;
          height: 13px;
          color: #94a3b8;
          flex: 0 0 auto;
        }

        /* =========================
           DEADLINE BADGES
        ========================== */

        .deadline-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex: 0 0 auto;
          min-height: 29px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .015em;
          white-space: nowrap;
        }

        .deadline-badge svg {
          width: 12px;
          height: 12px;
        }

        .deadline-normal {
          border: 1px solid #bfdbfe;
          color: #2563eb;
          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
          box-shadow:
            0 5px 15px rgba(37,99,235,.10),
            0 0 17px rgba(59,130,246,.06);
        }

        .deadline-urgent {
          border: 1px solid #fecaca;
          color: #dc2626;
          background:
            linear-gradient(
              135deg,
              #fff1f2,
              #fee2e2
            );
          box-shadow:
            0 5px 15px rgba(239,68,68,.11),
            0 0 18px rgba(239,68,68,.07);
          animation: urgentGlow 2.2s ease-in-out infinite;
        }

        .deadline-today {
          border: 1px solid #fed7aa;
          color: #ea580c;
          background:
            linear-gradient(
              135deg,
              #fff7ed,
              #ffedd5
            );
          box-shadow:
            0 5px 15px rgba(249,115,22,.12),
            0 0 18px rgba(249,115,22,.07);
        }

        .deadline-overdue {
          border: 1px solid #fecaca;
          color: #b91c1c;
          background: #fef2f2;
        }

        /* =========================
           ACTION BUTTONS
        ========================== */

        .task-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          flex: 0 0 auto;
        }

        .task-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 32px;
          padding: 0 10px;
          border-radius: 9px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }

        .task-action:hover {
          transform: translateY(-2px);
        }

        .task-action svg {
          width: 13px;
          height: 13px;
        }

        .task-edit {
          border: 1px solid #bfdbfe;
          color: #2563eb;
          background: #f8fbff;
        }

        .task-edit:hover {
          background: #eff6ff;
          box-shadow:
            0 7px 16px rgba(37,99,235,.12),
            0 0 15px rgba(59,130,246,.07);
        }

        .task-delete {
          border: 1px solid #ef4444;
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #ef4444,
              #dc2626
            );
          box-shadow:
            0 6px 14px rgba(239,68,68,.17);
        }

        .task-delete:hover {
          box-shadow:
            0 9px 20px rgba(239,68,68,.25),
            0 0 17px rgba(239,68,68,.10);
        }

        /* =========================
           EMPTY STATE
        ========================== */

        .task-empty {
          min-height: 205px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          text-align: center;
        }

        .task-empty-icon {
          position: relative;
          width: 61px;
          height: 61px;
          display: grid;
          place-items: center;
          margin-bottom: 15px;
          border-radius: 19px;
          color: #2563eb;
          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
          box-shadow:
            0 0 0 7px rgba(59,130,246,.045),
            0 13px 28px rgba(37,99,235,.12),
            0 0 30px rgba(59,130,246,.08);
        }

        .task-empty-icon::before {
          content: "";
          position: absolute;
          inset: -8px;
          border: 1px solid rgba(96,165,250,.19);
          border-radius: 24px;
          animation: emptyRing 3s ease-in-out infinite;
        }

        .task-empty-icon svg {
          width: 27px;
          height: 27px;
        }

        .task-empty-title {
          color: #334155;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -.015em;
        }

        .task-empty-text {
          margin-top: 6px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        /* =========================
           COMPLETED
        ========================== */

        .completed-section .task-section-icon {
          color: #059669;
          background:
            linear-gradient(
              135deg,
              #ecfdf5,
              #d1fae5
            );
          box-shadow:
            0 0 0 5px rgba(16,185,129,.045),
            0 9px 20px rgba(16,185,129,.10);
        }

        .completed-section .task-count {
          color: #059669;
          border-color: #a7f3d0;
          background: #ecfdf5;
        }

        .completed-task {
          opacity: .78;
        }

        .completed-task:hover {
          opacity: 1;
        }

        .completed-task .task-title {
          color: #64748b;
          text-decoration: line-through;
          text-decoration-thickness: 1.5px;
        }

        .completed-task .task-checkbox {
          border-color: #10b981;
          background:
            linear-gradient(
              135deg,
              #10b981,
              #059669
            );
          box-shadow:
            0 5px 14px rgba(16,185,129,.20),
            0 0 15px rgba(16,185,129,.09);
        }

        .completed-task .task-checkbox::after {
          content: "";
          position: absolute;
          left: 6px;
          top: 3px;
          width: 6px;
          height: 10px;
          border-right: 2px solid white;
          border-bottom: 2px solid white;
          transform: rotate(45deg);
        }

        /* =========================
           MODALS
        ========================== */

        .task-modal-backdrop {
          animation: backdropIn .22s ease-out;
        }

        .task-modal {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226,232,240,.9);
          box-shadow:
            0 30px 80px rgba(15,23,42,.22),
            0 0 50px rgba(59,130,246,.08);
          animation: modalIn .25s ease-out;
        }

        .task-modal::before {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          right: -140px;
          top: -160px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(59,130,246,.13),
              transparent 70%
            );
          pointer-events: none;
        }

        .task-modal-danger::before {
          background:
            radial-gradient(
              circle,
              rgba(239,68,68,.13),
              transparent 70%
            );
        }

        .task-modal-content {
          position: relative;
          z-index: 2;
        }

        .modal-icon-blue {
          box-shadow:
            0 0 0 6px rgba(59,130,246,.05),
            0 10px 25px rgba(37,99,235,.12);
        }

        .modal-icon-red {
          box-shadow:
            0 0 0 6px rgba(239,68,68,.05),
            0 10px 25px rgba(239,68,68,.12);
        }

        .modal-title-gradient {
          background:
            linear-gradient(
              100deg,
              #0f172a,
              #334155,
              #2563eb
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* =========================
           ANIMATIONS
        ========================== */

        @keyframes ambientGlow {
          0%, 100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(-18px,20px,0) scale(1.06);
          }
        }

        @keyframes ambientGlowReverse {
          0%, 100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(20px,-20px,0) scale(1.08);
          }
        }

        @keyframes heroLine {
          0%, 100% {
            opacity: .45;
            transform: scaleX(.75);
          }

          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: .6;
            transform: scale(.8);
          }
        }

        @keyframes titleGradient {
          0%, 100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes iconRing {
          0%, 100% {
            opacity: .35;
            transform: scale(.98);
          }

          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes urgentGlow {
          0%, 100% {
            box-shadow:
              0 5px 15px rgba(239,68,68,.11),
              0 0 14px rgba(239,68,68,.05);
          }

          50% {
            box-shadow:
              0 7px 20px rgba(239,68,68,.18),
              0 0 24px rgba(239,68,68,.12);
          }
        }

        @keyframes emptyRing {
          0%, 100% {
            opacity: .35;
            transform: scale(.98);
          }

          50% {
            opacity: .9;
            transform: scale(1.06);
          }
        }

        @keyframes backdropIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* =========================
           RESPONSIVE
        ========================== */

        @media (max-width: 850px) {
          .task-form-grid {
            grid-template-columns:
              minmax(0, 1fr)
              minmax(150px, 190px);
          }

          .task-form-button {
            width: 100%;
          }
        }

        @media (max-width: 700px) {
          .tasks-hero {
            align-items: flex-start;
            flex-direction: column;
            padding: 24px;
          }

          .tasks-add-button {
            width: 100%;
          }

          .task-form-grid {
            grid-template-columns: 1fr;
          }

          .task-item {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .task-main {
            min-width: calc(100% - 48px);
          }

          .deadline-badge {
            margin-left: 35px;
          }

          .task-actions {
            width: 100%;
            margin-left: 35px;
          }

          .task-action {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .tasks-hero {
            padding: 20px;
            border-radius: 20px;
          }

          .tasks-title {
            font-size: 27px;
          }

          .tasks-subtitle {
            font-size: 12px;
          }

          .task-section-header {
            padding: 16px;
          }

          .task-section-title {
            font-size: 15px;
          }

          .task-list {
            padding: 7px;
          }

          .task-item {
            padding: 11px 9px;
            border-radius: 14px;
          }

          .task-title {
            font-size: 13px;
          }

          .task-actions {
            margin-left: 34px;
          }

          .task-action {
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tasks-page-premium *,
          .tasks-page-premium::before,
          .tasks-page-premium::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="tasks-page-premium space-y-5">

        {/* =========================
            PAGE HEADER
        ========================== */}

        <div className="tasks-hero">
          <div className="tasks-hero-content">

            <div className="tasks-eyebrow">
              <span className="tasks-eyebrow-dot" />
              Productivity &amp; Planning
            </div>

            <h2 className="tasks-title">
              Tasks{' '}
              <span className="tasks-title-gradient">
                &amp; Deadlines
              </span>
            </h2>

            <p className="tasks-subtitle">
              Organize your work, stay focused on what matters,
              and keep every important deadline within reach.
            </p>

          </div>

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="tasks-add-button"
          >
            <PlusIcon />
            Add Task
          </button>
        </div>

        {/* =========================
            ERROR
        ========================== */}

        {error && (
          <div
            className="task-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* =========================
            ADD TASK
        ========================== */}

        {adding && (
          <div className="task-form-card">
            <div className="task-form-inner">

              <div className="task-form-heading">
                <div className="task-form-icon">
                  <PlusIcon />
                </div>

                <div>
                  <h3 className="task-form-title">
                    Create a New Task
                  </h3>

                  <p className="task-form-description">
                    Add something important to your personal
                    productivity list.
                  </p>
                </div>
              </div>

              <form
                onSubmit={onAdd}
                className="task-form-grid"
              >
                <div className="task-field">
                  <label htmlFor="new-task-title">
                    TASK TITLE
                  </label>

                  <input
                    id="new-task-title"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="What do you need to accomplish?"
                    className="task-input"
                    autoFocus
                  />
                </div>

                <div className="task-field">
                  <label htmlFor="new-task-date">
                    DEADLINE
                  </label>

                  <input
                    id="new-task-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(e.target.value)
                    }
                    className="task-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="task-form-button"
                >
                  Save
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdding(false)}
                  className="task-form-button"
                >
                  Cancel
                </Button>
              </form>

            </div>
          </div>
        )}

        {/* =========================
            UPCOMING
        ========================== */}

        <div className="task-section-card">

          <div className="task-section-header">

            <div className="task-section-title-wrap">

              <div className="task-section-icon">
                <ClockIcon />
              </div>

              <div>
                <h3 className="task-section-title">
                  Upcoming Tasks
                </h3>

                <p className="task-section-subtitle">
                  Stay ahead of your pending work
                </p>
              </div>

            </div>

            <span className="task-count">
              {pending.length}
            </span>

          </div>

          <div className="task-list">

            {pending.length === 0 ? (
              <div className="task-empty">

                <div className="task-empty-icon">
                  <CheckIcon />
                </div>

                <div className="task-empty-title">
                  All caught up! ðŸŽ‰
                </div>

                <div className="task-empty-text">
                  You have no pending tasks right now.
                </div>

              </div>
            ) : (
              pending.map((t) => {

                const d = daysUntil(t.due_date);

                const urgent =
                  d !== null && d <= 2;

                let deadlineClass =
                  'deadline-normal';

                if (d === 0) {
                  deadlineClass =
                    'deadline-today';
                } else if (
                  d !== null &&
                  d < 0
                ) {
                  deadlineClass =
                    'deadline-overdue';
                } else if (urgent) {
                  deadlineClass =
                    'deadline-urgent';
                }

                return (
                  <div
                    key={t.id}
                    className="task-item"
                  >

                    <input
                      type="checkbox"
                      checked={t.status === 'done'}
                      onChange={() =>
                        onToggle(t)
                      }
                      className="task-checkbox"
                      aria-label={`Complete ${t.title}`}
                    />

                    <div className="task-main">

                      <div
                        className="task-title"
                        title={t.title}
                      >
                        {t.title}
                      </div>

                      <div className="task-date">
                        <CalendarIcon />

                        {t.due_date
                          ? `Due ${fmtDate(t.due_date)}`
                          : 'No due date'}
                      </div>

                    </div>

                    {d !== null && (
                      <span
                        className={`deadline-badge ${deadlineClass}`}
                      >
                        <ClockIcon />

                        {d > 0
                          ? `in ${d}d`
                          : d === 0
                          ? 'today'
                          : `${Math.abs(d)}d ago`}
                      </span>
                    )}

                    <div className="task-actions">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(t)
                        }
                        className="task-action task-edit"
                        aria-label={`Edit ${t.title}`}
                        title="Edit task"
                      >
                        <EditIcon />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete(t)
                        }
                        className="task-action task-delete"
                        aria-label={`Delete ${t.title}`}
                        title="Delete task"
                      >
                        <TrashIcon />
                        Delete
                      </button>

                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* =========================
            COMPLETED
        ========================== */}

        {done.length > 0 && (
          <div className="task-section-card completed-section">

            <div className="task-section-header">

              <div className="task-section-title-wrap">

                <div className="task-section-icon">
                  <CheckIcon />
                </div>

                <div>
                  <h3 className="task-section-title">
                    Completed Tasks
                  </h3>

                  <p className="task-section-subtitle">
                    Your finished work and achievements
                  </p>
                </div>

              </div>

              <span className="task-count">
                {done.length}
              </span>

            </div>

            <div className="task-list">

              {done.map((t) => (
                <div
                  key={t.id}
                  className="task-item completed-task"
                >

                  <input
                    type="checkbox"
                    checked
                    onChange={() =>
                      onToggle(t)
                    }
                    className="task-checkbox"
                    aria-label={`Reopen ${t.title}`}
                  />

                  <div className="task-main">

                    <div
                      className="task-title"
                      title={t.title}
                    >
                      {t.title}
                    </div>

                    <div className="task-date">
                      <CheckIcon />
                      Completed task
                    </div>

                  </div>

                  <div className="task-actions">

                    <button
                      type="button"
                      onClick={() =>
                        openEdit(t)
                      }
                      className="task-action task-edit"
                      aria-label={`Edit ${t.title}`}
                      title="Edit task"
                    >
                      <EditIcon />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete(t)
                      }
                      className="task-action task-delete"
                      aria-label={`Delete ${t.title}`}
                      title="Delete task"
                    >
                      <TrashIcon />
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          </div>
        )}

        {/* =========================
            EDIT MODAL
        ========================== */}

        {editing && (
          <div
            className="task-modal-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4"
            onClick={() =>
              !savingEdit &&
              setEditing(null)
            }
          >
            <form
              onClick={(e) =>
                e.stopPropagation()
              }
              onSubmit={saveEdit}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-task-title"
              className="task-modal bg-white rounded-2xl w-full max-w-md p-6"
            >

              <div className="task-modal-content">

                <div className="flex items-start gap-3 mb-5">

                  <div className="modal-icon-blue w-11 h-11 shrink-0 rounded-xl bg-brand-blue-100 text-brand-blue-600 grid place-items-center">
                    <EditIcon className="w-5 h-5" />
                  </div>

                  <div>

                    <h3
                      id="edit-task-title"
                      className="modal-title-gradient font-extrabold text-lg"
                    >
                      Edit Task
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 font-medium">
                      Update your task title or deadline.
                    </p>

                  </div>

                </div>

                <div className="mb-4">

                  <label
                    htmlFor="edit-task-title-input"
                    className="text-xs font-extrabold text-slate-500 tracking-wider"
                  >
                    TASK TITLE
                  </label>

                  <input
                    id="edit-task-title-input"
                    value={editDraft.title}
                    onChange={(e) =>
                      setEditDraft({
                        ...editDraft,
                        title: e.target.value,
                      })
                    }
                    autoFocus
                    required
                    className="task-input mt-2"
                  />

                </div>

                <div className="mb-6">

                  <label
                    htmlFor="edit-task-date"
                    className="text-xs font-extrabold text-slate-500 tracking-wider"
                  >
                    DUE DATE
                  </label>

                  <input
                    id="edit-task-date"
                    type="date"
                    value={editDraft.due_date}
                    onChange={(e) =>
                      setEditDraft({
                        ...editDraft,
                        due_date: e.target.value,
                      })
                    }
                    className="task-input mt-2"
                  />

                </div>

                <div className="flex justify-end gap-2">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setEditing(null)
                    }
                    disabled={savingEdit}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={savingEdit}
                  >
                    {savingEdit
                      ? 'Savingâ€¦'
                      : 'Save changes'}
                  </Button>

                </div>

              </div>

            </form>
          </div>
        )}

        {/* =========================
            DELETE MODAL
        ========================== */}

        {pendingDelete && (
          <div
            className="task-modal-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4"
            onClick={() =>
              !deleting &&
              setPendingDelete(null)
            }
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-delete-title"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="task-modal task-modal-danger bg-white rounded-2xl w-full max-w-sm p-6"
            >

              <div className="task-modal-content">

                <div className="flex items-start gap-3">

                  <div className="modal-icon-red w-11 h-11 shrink-0 rounded-xl bg-red-100 text-red-600 grid place-items-center">
                    <TrashIcon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">

                    <h3
                      id="confirm-delete-title"
                      className="font-extrabold text-slate-900 text-lg"
                    >
                      Delete this task?
                    </h3>

                    <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                      Are you sure you want to delete{' '}
                      <span className="font-extrabold text-slate-800">
                        &ldquo;
                        {pendingDelete.title}
                        &rdquo;
                      </span>
                      ? This action cannot be undone.
                    </p>

                  </div>

                </div>

                <div className="flex justify-end gap-2 mt-6">

                  <Button
                    variant="outline"
                    onClick={() =>
                      setPendingDelete(null)
                    }
                    disabled={deleting}
                  >
                    Cancel
                  </Button>

                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-extrabold hover:from-red-600 hover:to-red-700 disabled:opacity-60 transition shadow-lg shadow-red-500/20"
                  >
                    {deleting
                      ? 'Deletingâ€¦'
                      : 'Yes, delete'}
                  </button>

                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}