import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getMySubscription,
  getSubscriptionPlans,
  updateSubscription,
} from '../services/api';

const statusClasses = {
  Active: 'bg-brand-green-100 text-brand-green-700',
  'Expiring Soon': 'bg-brand-orange-100 text-brand-orange-700',
  Expired: 'bg-red-100 text-red-700',
  Pending: 'bg-slate-100 text-slate-700',
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

export default function MySubscription() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

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

  const loadSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const [subscriptionData, planData] = await Promise.all([
        getMySubscription(),
        getSubscriptionPlans(),
      ]);

      setSubscription(subscriptionData || null);
      setPlans(Array.isArray(planData) ? planData : []);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            My Subscription
          </h2>

          <p className="text-sm text-slate-500">
            View your current subscription and available plans.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadSubscription}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Current Subscription */}
      {loading ? (
        <Card>
          <div className="py-10 text-center text-sm text-slate-500">
            Loading subscription...
          </div>
        </Card>
      ) : subscription ? (
        <Card title="Current Subscription">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-500">
                Plan
              </div>

              <div className="text-lg font-semibold text-slate-900 capitalize mt-1">
                {subscription.plan_type || '—'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                Status
              </div>

              <div className="mt-1">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusClasses[subscription.status] ||
                    'bg-slate-100 text-slate-700'
                  }`}
                >
                  {subscription.status || 'Unknown'}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                Start Date
              </div>

              <div className="font-medium text-slate-800 mt-1">
                {formatDate(subscription.start_date)}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                End Date
              </div>

              <div className="font-medium text-slate-800 mt-1">
                {formatDate(subscription.end_date)}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Current Subscription">
          <div className="py-8 text-center">
            <div className="text-3xl mb-2">
              💳
            </div>

            <div className="font-medium text-slate-700">
              No active subscription
            </div>

            <div className="text-sm text-slate-400 mt-1">
              Choose a plan below to get started.
            </div>
          </div>
        </Card>
      )}

      {/* Available Plans */}
      <Card title="Available Plans">
        {plans.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No subscription plans are currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.code}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50"
              >
                <h3 className="font-semibold text-slate-900">
                  {plan.name}
                </h3>

                <p className="text-xs text-slate-500 mt-2">
                  {plan.code === 'free'
                    ? 'Basic platform access'
                    : `${plan.name} subscription`}
                </p>

                {/* Free plan can be activated without payment */}
                {plan.code === 'free' && !subscription && (
                  <Button
                    className="w-full mt-4"
                    onClick={activateFreePlan}
                    disabled={subscribing}
                  >
                    {subscribing
                      ? 'Activating...'
                      : 'Activate Free Plan'}
                  </Button>
                )}

                {/* Paid plans will use payment flow later */}
                {plan.code !== 'free' && (
                  <div className="mt-4 text-xs text-slate-400">
                    Payment required
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}