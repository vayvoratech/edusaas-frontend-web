
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getAdminSubscriptions,
  getAdminSubscriptionSummary,
  getSubscriptionPlans,
  updateAdminSubscriptionPlan,
  extendAdminSubscription
} from '../services/api';

const formatDate = (value) => {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
};

const statusClasses = {
  Active: 'bg-brand-green-100 text-brand-green-700',
  'Expiring Soon': 'bg-brand-orange-100 text-brand-orange-700',
  Expired: 'bg-red-100 text-red-700',
  Pending: 'bg-slate-100 text-slate-700',
};

export default function SubscriptionManagement() {
  const [summary, setSummary] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryData, subscriptionData, planData] = await Promise.all([
        getAdminSubscriptionSummary(),
        getAdminSubscriptions(),
        getSubscriptionPlans(),
      ]);

      setSummary(summaryData);
      setSubscriptions(Array.isArray(subscriptionData) ? subscriptionData : []);
      setPlans(Array.isArray(planData) ? planData : []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to load subscriptions'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const user = subscription.user || {};

      const matchesSearch =
        !query ||
        String(user.name || '').toLowerCase().includes(query) ||
        String(user.email || '').toLowerCase().includes(query) ||
        String(subscription.plan_type || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' || subscription.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, search, statusFilter]);

  const planCount = (plan) => summary?.plans?.[plan] ?? 0;

  const handleChangePlan = async (subscription) => {
  const planType = window.prompt(
    `Enter the new plan for ${subscription.user?.name || 'this user'}: free, basic, pro, or enterprise`,
    subscription.plan_type || 'free'
  );

  if (!planType) return;

  const normalizedPlan = planType.trim().toLowerCase();

  if (!plans.some((plan) => plan.code === normalizedPlan)) {
    setError('Please enter one of the available subscription plans.');
    return;
  }

  try {
    setActionLoading(`${subscription.id}-plan`);
    setError(null);

    await updateAdminSubscriptionPlan(subscription.id, normalizedPlan);
    await loadSubscriptions();
  } catch (err) {
    setError(
      err.response?.data?.error ||
        err.message ||
        'Failed to change subscription plan'
    );
  } finally {
    setActionLoading(null);
  }
};

const handleExtendSubscription = async (subscription) => {
  const value = window.prompt(
    `Extend ${subscription.user?.name || 'this subscription'} by how many months?`,
    '1'
  );

  if (!value) return;

  const months = Number(value);

  if (!Number.isInteger(months) || months < 1 || months > 36) {
    setError('Extension must be a whole number between 1 and 36 months.');
    return;
  }

  try {
    setActionLoading(`${subscription.id}-extend`);
    setError(null);

    await extendAdminSubscription(subscription.id, months);
    await loadSubscriptions();
  } catch (err) {
    setError(
      err.response?.data?.error ||
        err.message ||
        'Failed to extend subscription'
    );
  } finally {
    setActionLoading(null);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Subscription Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage EduSaaS subscription plans and user subscriptions.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadSubscriptions}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Total Subscriptions</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">
            {summary?.total ?? 0}
          </div>
        </Card>

        <Card className="!p-4">
          <div className="text-xs text-slate-500">Active</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">
            {summary?.active ?? 0}
          </div>
        </Card>

        <Card className="!p-4">
          <div className="text-xs text-slate-500">Expiring Soon</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">
            {summary?.expiringSoon ?? 0}
          </div>
        </Card>

        <Card className="!p-4">
          <div className="text-xs text-slate-500">Expired</div>
          <div className="text-3xl font-bold text-red-600 mt-1">
            {summary?.expired ?? 0}
          </div>
        </Card>
      </div>

      {/* Plans */}
      <Card title="Subscription Plans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.code}
              className="rounded-xl border border-slate-200 p-4 bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900 capitalize">
                  {plan.name}
                </h3>

                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white border border-slate-200">
                  {planCount(plan.code)}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {plan.code === 'free'
  ? 'Basic platform access'
  : `${plan.name} subscription`}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Subscription table */}
      <Card title="User Subscriptions">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, email or plan..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading subscriptions...
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-3xl mb-2">💳</div>
            <div className="text-sm font-medium text-slate-700">
              No subscriptions yet
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Subscription records will appear here once users subscribe.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 px-2 font-medium text-slate-500">
                    User
                  </th>
                  <th className="py-3 px-2 font-medium text-slate-500">
                    Plan
                  </th>
                  <th className="py-3 px-2 font-medium text-slate-500">
                    Status
                  </th>
                  <th className="py-3 px-2 font-medium text-slate-500">
                    Start
                  </th>
                  <th className="py-3 px-2 font-medium text-slate-500">
                    End
                  </th>
                  <th className="py-3 px-2 font-medium text-slate-500">
                  Actions
                 </th>
                </tr>
              </thead>

              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 px-2">
                      <div className="font-medium text-slate-800">
                        {subscription.user?.name || 'Unknown user'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {subscription.user?.email || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-2">
                      <span className="capitalize font-medium">
                        {subscription.plan_type || '—'}
                      </span>
                    </td>

                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusClasses[subscription.status] ||
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {subscription.status || 'Unknown'}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-slate-600">
                      {formatDate(subscription.start_date)}
                    </td>

                    <td className="py-3 px-2 text-slate-600">
                      {formatDate(subscription.end_date)}
                    </td>
                    <td className="py-3 px-2">
  <div className="flex flex-wrap gap-2">
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleChangePlan(subscription)}
      disabled={actionLoading === `${subscription.id}-plan`}
    >
      {actionLoading === `${subscription.id}-plan`
        ? 'Updating...'
        : 'Change Plan'}
    </Button>

    <Button
      size="sm"
      variant="accent"
      onClick={() => handleExtendSubscription(subscription)}
      disabled={actionLoading === `${subscription.id}-extend`}
    >
      {actionLoading === `${subscription.id}-extend`
        ? 'Extending...'
        : 'Extend'}
    </Button>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}