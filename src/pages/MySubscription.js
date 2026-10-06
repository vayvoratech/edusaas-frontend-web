import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import {
  getMySubscription,
  getSubscriptionPlans,
  updateSubscription,
} from '../services/api';

/* =========================================================
   FONT
========================================================= */

const fontFamily =
  '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/* =========================================================
   STATUS STYLES
========================================================= */

const statusClasses = {
  Active:
    'bg-emerald-50 text-emerald-700 border-emerald-200',

  'Expiring Soon':
    'bg-amber-50 text-amber-700 border-amber-200',

  Expired:
    'bg-red-50 text-red-700 border-red-200',

  Pending:
    'bg-slate-50 text-slate-600 border-slate-200',
};

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatDate = (value) => {
  if (!value) return '–';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '–';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

/* =========================================================
   ICON SYSTEM
========================================================= */

const Icon = ({
  name,
  size = 20,
  strokeWidth = 1.8,
}) => {
  const commonProps = {
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

  switch (name) {
    case 'credit-card':
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2.5"
          />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="4.5"
            width="18"
            height="16"
            rx="2.5"
          />
          <path d="M16 2.5v4" />
          <path d="M8 2.5v4" />
          <path d="M3 9h18" />
          <path d="M8 13h.01" />
          <path d="M12 13h.01" />
          <path d="M16 13h.01" />
          <path d="M8 17h.01" />
          <path d="M12 17h.01" />
        </svg>
      );

    case 'check-circle':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'refresh':
      return (
        <svg {...commonProps}>
          <path d="M20 11a8 8 0 0 0-14.9-3.8L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.9 3.8L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg {...commonProps}>
          <path d="m12 3-1.2 4.1L7 8.5l3.8 1.4L12 14l1.2-4.1L17 8.5l-3.8-1.4L12 3Z" />
          <path d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13Z" />
          <path d="m5 14-.6 2L2 17l2.4.7L5 20l.6-2.3L8 17l-2.4-.7L5 14Z" />
        </svg>
      );

    case 'shield':
      return (
        <svg {...commonProps}>
          <path d="M12 3 20 6v5.5c0 4.7-3.2 8.2-8 9.5-4.8-1.3-8-4.8-8-9.5V6l8-3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-4.8" />
        </svg>
      );

    case 'crown':
      return (
        <svg {...commonProps}>
          <path d="m3 7 4.2 4L12 5l4.8 6L21 7l-2 11H5L3 7Z" />
          <path d="M5 21h14" />
        </svg>
      );

    case 'zap':
      return (
        <svg {...commonProps}>
          <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      );

    case 'infinity':
      return (
        <svg {...commonProps}>
          <path d="M7.5 17C4.5 17 3 14.8 3 12s1.5-5 4.5-5c2.1 0 3.6 1.4 4.5 2.7C12.9 8.4 14.4 7 16.5 7 19.5 7 21 9.2 21 12s-1.5 5-4.5 5c-2.1 0-3.6-1.4-4.5-2.7C11.1 15.6 9.6 17 7.5 17Z" />
        </svg>
      );

    case 'lock':
      return (
        <svg {...commonProps}>
          <rect
            x="5"
            y="10"
            width="14"
            height="11"
            rx="2"
          />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );

    case 'tag':
      return (
        <svg {...commonProps}>
          <path d="M20 13 13 20 4 11V4h7l9 9Z" />
          <path d="M8 8h.01" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MySubscription() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  /* =======================================================
     ACTIVATE FREE PLAN
  ======================================================= */

  const activateFreePlan = async () => {
    setSubscribing(true);
    setError(null);

    try {
      const subscriptionData = await updateSubscription({
        plan_type: 'free',
        months: 1,
      });

      setSubscription(subscriptionData);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to activate the Free plan'
      );
    } finally {
      setSubscribing(false);
    }
  };

  /* =======================================================
     LOAD SUBSCRIPTION
  ======================================================= */

  const loadSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const [subscriptionData, planData] =
        await Promise.all([
          getMySubscription(),
          getSubscriptionPlans(),
        ]);

      setSubscription(subscriptionData || null);

      setPlans(
        Array.isArray(planData)
          ? planData
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to load subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  return (
    <div
      className="relative min-h-full overflow-hidden bg-[#f6f8fc]"
      style={{ fontFamily }}
    >

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-500/[0.055] blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-violet-500/[0.045] blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-cyan-400/[0.035] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1400px] space-y-6 px-1 pb-12">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/90 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.30)] backdrop-blur-xl">

          {/* Subtle gradient accent */}

          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />

          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">

            <div className="flex items-center gap-4">

              {/* Gradient icon */}

              <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_12px_30px_-15px_rgba(79,70,229,0.65)]">

                <Icon
                  name="credit-card"
                  size={23}
                  strokeWidth={1.7}
                />

                <div className="absolute inset-0 rounded-[17px] bg-white/10" />

              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                  Account & Billing
                </p>

            <h1
  className="mt-1 text-[28px] font-extrabold tracking-[-0.045em] sm:text-[32px]"
  style={{
    background:
      'linear-gradient(90deg, #111827 0%, #111827 22%, #2563eb 48%, #7c3aed 72%, #0ea5e9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }}
>
  My Subscription
</h1>

                <p className="mt-1.5 text-[12px] font-medium leading-5 text-slate-500 sm:text-[13px]">
                  Manage your subscription and explore available plans.
                </p>

              </div>

            </div>

            <Button
              variant="outline"
              onClick={loadSubscription}
              disabled={loading}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
            >

              <span
                className={
                  loading
                    ? 'animate-spin'
                    : 'transition-transform duration-300 group-hover:rotate-180'
                }
              >

                <Icon
                  name="refresh"
                  size={15}
                />

              </span>

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </Button>

          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[12px] text-red-700 shadow-sm"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Icon
                  name="shield"
                  size={16}
                />
              </div>

              <span className="font-semibold">
                {error}
              </span>

            </div>

          </div>
        )}

        {/* =================================================
            CURRENT SUBSCRIPTION
        ================================================= */}

        {loading ? (

          <section className="rounded-[26px] border border-white bg-white p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.25)]">

            <div className="animate-pulse">

              <div className="h-5 w-52 rounded-lg bg-slate-200" />

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                    >

                      <div className="h-3 w-20 rounded bg-slate-200" />

                      <div className="mt-4 h-5 w-28 rounded bg-slate-200" />

                    </div>
                  )
                )}

              </div>

            </div>

          </section>

        ) : subscription ? (

          <section className="relative overflow-hidden rounded-[26px] border border-white bg-white/95 shadow-[0_18px_50px_-32px_rgba(37,99,235,0.30)] backdrop-blur-xl">

            {/* Subtle accent */}

            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />

            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                  <Icon
                    name="check-circle"
                    size={20}
                    strokeWidth={1.7}
                  />

                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">
                    Subscription Overview
                  </p>

                  <h2 className="mt-0.5 text-[19px] font-bold tracking-[-0.025em] text-slate-900">
                    Current Subscription
                  </h2>

                </div>

              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold shadow-sm ${
                  statusClasses[
                    subscription.status
                  ] ||
                  'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >

                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    subscription.status ===
                    'Active'
                      ? 'bg-emerald-500'
                      : subscription.status ===
                        'Expiring Soon'
                      ? 'bg-amber-500'
                      : subscription.status ===
                        'Expired'
                      ? 'bg-red-500'
                      : 'bg-slate-400'
                  }`}
                />

                {subscription.status ||
                  'Unknown'}

              </span>

            </div>

            {/* Subscription details */}

            <div className="p-6 sm:p-7">

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

                {/* PLAN */}

                <div className="group relative overflow-hidden rounded-[20px] border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_35px_-25px_rgba(37,99,235,0.40)]">

                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/[0.07] blur-2xl" />

                  <div className="relative">

                    <div className="flex items-center gap-2.5">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Icon
                          name="crown"
                          size={15}
                        />
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Plan
                      </span>

                    </div>

                    <p className="mt-4 text-[20px] font-extrabold capitalize tracking-[-0.03em] text-slate-900">
                      {subscription.plan_type ||
                        '–'}
                    </p>

                    <p className="mt-1 text-[10px] font-medium text-blue-600">
                      Current plan
                    </p>

                  </div>

                </div>

                {/* STATUS */}

                <div className="group relative overflow-hidden rounded-[20px] border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_35px_-25px_rgba(16,185,129,0.35)]">

                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/[0.06] blur-2xl" />

                  <div className="relative">

                    <div className="flex items-center gap-2.5">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">

                        <Icon
                          name="shield"
                          size={15}
                        />

                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Status
                      </span>

                    </div>

                    <div className="mt-4">

                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                          statusClasses[
                            subscription.status
                          ] ||
                          'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {subscription.status ||
                          'Unknown'}
                      </span>

                    </div>

                    <p className="mt-2 text-[10px] font-medium text-emerald-600">
                      Account status
                    </p>

                  </div>

                </div>

                {/* START DATE */}

                <div className="group relative overflow-hidden rounded-[20px] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_35px_-25px_rgba(124,58,237,0.35)]">

                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/[0.06] blur-2xl" />

                  <div className="relative">

                    <div className="flex items-center gap-2.5">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">

                        <Icon
                          name="calendar"
                          size={15}
                        />

                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Start Date
                      </span>

                    </div>

                    <p className="mt-4 text-[17px] font-bold tracking-[-0.025em] text-slate-900">
                      {formatDate(
                        subscription.start_date
                      )}
                    </p>

                    <p className="mt-1.5 text-[10px] font-medium text-violet-600">
                      Subscription started
                    </p>

                  </div>

                </div>

                {/* END DATE */}

                <div className="group relative overflow-hidden rounded-[20px] border border-cyan-100 bg-gradient-to-br from-cyan-50/70 via-white to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_18px_35px_-25px_rgba(6,182,212,0.35)]">

                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-500/[0.06] blur-2xl" />

                  <div className="relative">

                    <div className="flex items-center gap-2.5">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">

                        <Icon
                          name="clock"
                          size={15}
                        />

                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        End Date
                      </span>

                    </div>

                    <p className="mt-4 text-[17px] font-bold tracking-[-0.025em] text-slate-900">
                      {formatDate(
                        subscription.end_date
                      )}
                    </p>

                    <p className="mt-1.5 text-[10px] font-medium text-cyan-600">
                      Subscription validity
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </section>

        ) : (

          /* =================================================
             NO ACTIVE SUBSCRIPTION
          ================================================= */

          <section className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_15px_45px_-30px_rgba(15,23,42,0.25)]">

            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />

            <div className="px-6 py-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_14px_35px_-15px_rgba(79,70,229,0.50)]">

                <Icon
                  name="credit-card"
                  size={27}
                  strokeWidth={1.6}
                />

              </div>

              <h2 className="mt-5 text-[20px] font-bold tracking-[-0.03em] text-slate-900">
                No active subscription
              </h2>

              <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-5 text-slate-500">
                Choose a plan below to get started.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-600">

                <Icon
                  name="sparkles"
                  size={13}
                />

                Explore available plans

              </div>

            </div>
          </section>
        )}

        {/* =================================================
            AVAILABLE PLANS
        ================================================= */}

        <section className="relative overflow-hidden rounded-[26px] border border-white bg-white/95 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl">

          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />

          {/* Header */}

          <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-[0_8px_22px_-12px_rgba(79,70,229,0.55)]">

                <Icon
                  name="sparkles"
                  size={19}
                />

              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
                  Subscription Options
                </p>

                <h2 className="mt-0.5 text-[19px] font-bold tracking-[-0.025em] text-slate-900">
                  Available Plans
                </h2>

              </div>

            </div>

            <p className="ml-[52px] mt-1 text-[12px] font-medium text-slate-500">
              Select the subscription that fits your needs.
            </p>

          </div>

          {/* Plans */}

          <div className="p-6 sm:p-7">

            {plans.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">

                  <Icon
                    name="tag"
                    size={21}
                  />

                </div>

                <p className="mt-4 text-[12px] font-semibold text-slate-600">
                  No subscription plans are currently available.
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Please check again later.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {plans.map(
                  (plan, index) => {

                    const isFree =
                      plan.code === 'free';

                    const planStyles = [
                      {
                        border:
                          'border-blue-200',
                        background:
                          'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40',
                        icon:
                          'bg-blue-100 text-blue-600',
                        accent:
                          'bg-blue-600',
                        button:
                          'from-blue-600 to-indigo-600',
                      },
                      {
                        border:
                          'border-violet-200',
                        background:
                          'bg-gradient-to-br from-violet-50/80 via-white to-purple-50/40',
                        icon:
                          'bg-violet-100 text-violet-600',
                        accent:
                          'bg-violet-600',
                        button:
                          'from-violet-600 to-purple-600',
                      },
                      {
                        border:
                          'border-cyan-200',
                        background:
                          'bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/40',
                        icon:
                          'bg-cyan-100 text-cyan-600',
                        accent:
                          'bg-cyan-600',
                        button:
                          'from-cyan-600 to-blue-600',
                      },
                      {
                        border:
                          'border-emerald-200',
                        background:
                          'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40',
                        icon:
                          'bg-emerald-100 text-emerald-600',
                        accent:
                          'bg-emerald-600',
                        button:
                          'from-emerald-600 to-teal-600',
                      },
                    ];

                    const style =
                      planStyles[
                        index %
                          planStyles.length
                      ];

                    return (
                      <div
                        key={plan.code}
                        className={`group relative flex min-h-[270px] flex-col overflow-hidden rounded-[22px] border p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_-28px_rgba(15,23,42,0.38)] ${
                          isFree
                            ? `${style.border} ${style.background}`
                            : 'border-slate-200 bg-white'
                        }`}
                      >

                        {/* Top Accent */}

                        <div
                          className={`absolute inset-x-0 top-0 h-[3px] ${style.accent}`}
                        />

                        {/* Soft Glow */}

                        {isFree && (
                          <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-blue-500/[0.08] blur-3xl transition-opacity duration-300 group-hover:bg-blue-500/[0.13]" />
                        )}

                        <div className="relative flex h-full flex-col">

                          {/* Plan Header */}

                          <div className="flex items-start justify-between gap-3">

                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${style.icon}`}
                            >

                              <Icon
                                name={
                                  isFree
                                    ? 'infinity'
                                    : 'crown'
                                }
                                size={19}
                                strokeWidth={1.7}
                              />

                            </div>

                            {isFree && (
                              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-blue-600 shadow-sm">
                                Available
                              </span>
                            )}

                          </div>

                          {/* Plan Name */}

                          <h3 className="mt-5 text-[17px] font-bold tracking-[-0.025em] text-slate-900">
                            {plan.name}
                          </h3>

                          <p className="mt-2 min-h-[42px] text-[11px] font-medium leading-5 text-slate-500">
                            {isFree
                              ? 'Basic platform access'
                              : `${plan.name} subscription`}
                          </p>

                          {/* Divider */}

                          <div className="my-4 h-px bg-slate-200/70" />

                          {/* Action */}

                          {isFree &&
                            !subscription && (
                              <Button
                                className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r ${style.button} px-3 py-2.5 text-[11px] font-bold text-white shadow-[0_8px_20px_-12px_rgba(37,99,235,0.65)] transition-all duration-300 hover:brightness-105 hover:shadow-lg`}
                                onClick={
                                  activateFreePlan
                                }
                                disabled={
                                  subscribing
                                }
                              >

                                <Icon
                                  name="zap"
                                  size={14}
                                  strokeWidth={1.8}
                                />

                                {subscribing
                                  ? 'Activating...'
                                  : 'Activate Free Plan'}

                              </Button>
                            )}

                          {plan.code !==
                            'free' && (
                            <div className="mt-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-[10px] font-semibold text-slate-500">

                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">

                                <Icon
                                  name="lock"
                                  size={13}
                                />

                              </span>

                              Payment required

                            </div>
                          )}

                          {isFree &&
                            subscription && (
                              <div className="mt-auto flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-[10px] font-semibold text-emerald-700">

                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">

                                  <Icon
                                    name="check-circle"
                                    size={13}
                                  />

                                </span>

                                Current plan

                              </div>
                            )}

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        </section>

        {/* =================================================
            INFORMATION CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Secure */}

          <div className="group rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_28px_-24px_rgba(15,23,42,0.30)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_15px_35px_-25px_rgba(37,99,235,0.30)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-105">

                <Icon
                  name="shield"
                  size={17}
                />

              </div>

              <div>

                <h3 className="text-[12px] font-bold text-slate-800">
                  Secure Access
                </h3>

                <p className="mt-0.5 text-[10px] font-medium leading-4 text-slate-500">
                  Subscription status is protected.
                </p>

              </div>

            </div>
          </div>

          {/* Flexible */}

          <div className="group rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_28px_-24px_rgba(15,23,42,0.30)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_15px_35px_-25px_rgba(124,58,237,0.30)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-105">

                <Icon
                  name="sparkles"
                  size={17}
                />

              </div>

              <div>

                <h3 className="text-[12px] font-bold text-slate-800">
                  Flexible Plans
                </h3>

                <p className="mt-0.5 text-[10px] font-medium leading-4 text-slate-500">
                  Choose from available access options.
                </p>

              </div>

            </div>
          </div>

          {/* Updated */}

          <div className="group rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_28px_-24px_rgba(15,23,42,0.30)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_15px_35px_-25px_rgba(6,182,212,0.30)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-transform duration-300 group-hover:scale-105">

                <Icon
                  name="refresh"
                  size={17}
                />

              </div>

              <div>

                <h3 className="text-[12px] font-bold text-slate-800">
                  Always Updated
                </h3>

                <p className="mt-0.5 text-[10px] font-medium leading-4 text-slate-500">
                  Refresh to view the latest details.
                </p>

              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            CURRENT PLAN FOOTER
        ================================================= */}

        {subscription && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400">

            <span className="font-medium">
              Current plan
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 font-semibold capitalize text-blue-700">

              <Icon
                name="crown"
                size={12}
              />

              {subscription.plan_type ||
                'free'}

            </span>

            <span className="text-slate-300">
              •
            </span>

            <span className="font-semibold text-slate-500">
              {subscription.status ||
                'Unknown'}
            </span>

          </div>
        )}

      </div>
    </div>
  );
}