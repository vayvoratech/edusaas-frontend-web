import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { assessmentQuestion } from '../mocks/data';
import { submitAssessment } from '../services/api';

export default function SkillAssessment() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState(assessmentQuestion.starter);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const progressPct = (assessmentQuestion.number / assessmentQuestion.total) * 100;

  const onSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Demo scoring: full mark if answer mentions ORDER BY + LIMIT
      const txt = answer.toLowerCase();
      const score =
        txt.includes('order by') && txt.includes('limit')
          ? 100
          : txt.includes('order by') || txt.includes('limit')
          ? 70
          : 40;
      await submitAssessment({
        type: assessmentQuestion.language || 'sql-basics',
        score,
        answers: [{ q: assessmentQuestion.number, answer }],
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || err.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Skill Assessment</h2>
        <p className="text-sm text-slate-500">
          Answer each question to map your current skill level.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold text-slate-700">
            Question {assessmentQuestion.number} of {assessmentQuestion.total}
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-brand-orange-100 text-brand-orange-600 font-medium">
            {assessmentQuestion.language}
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-brand-blue-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-base text-slate-800 mb-4">{assessmentQuestion.prompt}</p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          spellCheck={false}
          rows={8}
          className="w-full font-mono text-sm rounded-lg bg-slate-900 text-green-300 p-4 outline-none focus:ring-2 focus:ring-brand-blue-500"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Answer'}
          </Button>
          <Button variant="outline">Skip Question</Button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => navigate('/app/gap-report')}>
            View Results →
          </Button>
        </div>

        {submitted && (
          <div className="mt-5 p-3 rounded-lg bg-brand-green-100 text-brand-green-600 flex items-center gap-2 text-sm font-medium animate-fade-in">
            <span>✅</span>
            <span>Submitted — your score has been recorded.</span>
          </div>
        )}
        {submitError && (
          <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {submitError}
          </div>
        )}
      </Card>

      <Card title="Tips">
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Read the question carefully — small wording changes matter.</li>
          <li>You can skip questions; they don&apos;t count against your score.</li>
          <li>Your time is tracked but not penalized for this assessment.</li>
        </ul>
      </Card>
    </div>
  );
}
