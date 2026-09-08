import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/react';
import { Button } from '../components/ui/Button';
import { getDomainRoles } from '../services/api';

const roles = [
  { id: 'student', label: 'Student', emoji: '🎓', desc: 'Access AI-driven learning paths, earn badges.' },
  { id: 'educator', label: 'Educator', emoji: '👩‍🏫', desc: 'Create courses, track students and skill gaps.' },
  { id: 'employer', label: 'Employer', emoji: '🏢', desc: 'Post candidate jobs to reach and upskill students.' },
  { id: 'admin', label: 'Admin', emoji: '⚙️', desc: 'Manage users, courses, and platform settings.' },
];

const RoleSelector = ({ selectedRole, onSelectRole }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
    {roles.map((r) => (
      <button
        key={r.id}
        type="button"
        onClick={() => onSelectRole(r.id)}
        className={`text-left p-4 rounded-xl border-2 transition ${
          selectedRole === r.id
            ? 'border-brand-blue-500 bg-brand-blue-50'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{r.emoji}</span>
          <span className="font-semibold text-sm text-slate-800">
            {r.label}
          </span>
        </div>
        <div className="text-xs text-slate-500 leading-snug">
          {r.desc}
        </div>
      </button>
    ))}
  </div>
);

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('student');
  const [domainRoles, setDomainRoles] = useState([]);
  const [domainRoleId, setDomainRoleId] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.role) {
      navigate('/app/dashboard');
    }
  }, [isLoaded, user, navigate]);

  useEffect(() => {
    const loadDomainRoles = async () => {
      try {
        const data = await getDomainRoles();
        if (data) {
          setDomainRoles(data);
          if (data.length > 0) {
            setDomainRoleId(data[0].domain_role_id);
          }
        }
      } catch (err) {
        console.error('Failed to load career goals', err);
      }
    };
    loadDomainRoles();
  }, []);

  const handleCompleteOnboarding = async () => {
    if (role === 'student' && !domainRoleId) {
      setError("Please select a career goal.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 1. Get Clerk token
      const clerkToken = await getToken();
      
      // 2. Call the new backend sync endpoint FIRST
      const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, domainRoleId }) // We should pass these so backend knows what they selected
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sync with backend: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // 3. Store custom JWTs so legacy API endpoints keep working perfectly!
      localStorage.setItem('edu_token', data.accessToken);
      localStorage.setItem('edu_refresh', data.refreshToken);
      localStorage.setItem('edu_user', JSON.stringify(data.user));

      // 4. Update the user's unsafe metadata in Clerk ONLY after backend succeeds
      await user.update({
        unsafeMetadata: {
          role: role,
          domain_role_id: role === 'student' ? domainRoleId : null
        }
      });      

      // Redirect to dashboard
      navigate('/app/dashboard');
    } catch (err) {
      console.error("ONBOARDING ERROR:", err);
      alert("Error during sync: " + err.message);
      setError("Something went wrong saving your setup: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Welcome to EduSaaS!
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Let's finish setting up your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          
          <div className="mb-2 text-sm font-medium text-slate-700">I am joining as a...</div>
          <RoleSelector selectedRole={role} onSelectRole={setRole} />

          {role === 'student' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                What is your career goal?
              </label>
              <select
                value={domainRoleId}
                onChange={(e) => setDomainRoleId(e.target.value)}
                disabled={domainRoles.length === 0}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm bg-white"
              >
                {domainRoles.length === 0 ? (
                  <option value="">Loading career goals...</option>
                ) : (
                  domainRoles.map((domain) => (
                    <option key={domain.domain_role_id} value={domain.domain_role_id}>
                      {domain.domain_name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-slate-500 mt-2">This helps us recommend the right courses and learning paths for you.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <Button type="button" size="lg" className="w-full py-3" onClick={handleCompleteOnboarding} disabled={submitting}>
            {submitting ? 'Setting up…' : 'Complete Setup'}
          </Button>

        </div>
      </div>
    </div>
  );
}
