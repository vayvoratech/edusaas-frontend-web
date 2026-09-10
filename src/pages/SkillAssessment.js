import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { assessmentBank } from '../mocks/data';
import { submitAssessment } from '../services/api';

export default function SkillAssessment() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const total = assessmentBank.length;
  console.log("assessmentBank:", assessmentBank);
  console.log("Length:", assessmentBank?.length);
  const q = assessmentBank[idx];

  const [answer, setAnswer] = useState(q.starter);
  // record of {idx, score, skipped} per question
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);

  const progressPct = ((idx) / total) * 100;
  const isAnswerEmpty = !answer.trim() || answer.trim() === q.starter.trim();

  const getMonacoLang = (lang) => {
    const l = String(lang || "").toLowerCase();
    if (l === "sql") return "sql";
    if (l === "python") return "python";
    if (l === "javascript" || l === "js") return "javascript";
    return "plaintext";
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const goNext = (record) => {
    const next = [...results, record];
    setResults(next);
    if (idx + 1 >= total) {
      // last question; persist whole result set
      finishAssessment(next);
    } else {
      const ni = idx + 1;
      setIdx(ni);
      setAnswer(assessmentBank[ni].starter);
    }
  };

  const finishAssessment = async (allResults) => {
    setSubmitting(true);
    setError(null);
    try {
      const submitted = allResults.filter((r) => !r.skipped);
      const avg = submitted.length === 0
        ? 0
        : Math.round(submitted.reduce((s, r) => s + r.score, 0) / submitted.length);
      await submitAssessment({
        type: 'mixed-skills',
        score: avg,
        answers: allResults.map((r) => ({
          idx: r.idx, language: assessmentBank[r.idx].language, score: r.score, skipped: r.skipped,
        })),
      });
      setFinished(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitAnswer = () => {
    if (isAnswerEmpty) {
      setError('Please write an answer before submitting (the starter code doesn\'t count).');
      return;
    }
    setError(null);
    const score = q.grade(answer);
    goNext({ idx, score, skipped: false });
  };

  const onSkip = () => {
    setError(null);
    goNext({ idx, score: 0, skipped: true });
  };

  if (finished) {
    const submitted = results.filter((r) => !r.skipped);
    const avg = submitted.length === 0
      ? 0
      : Math.round(submitted.reduce((s, r) => s + r.score, 0) / submitted.length);
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-slate-900">Assessment complete</h2>
            <p className="text-sm text-slate-500 mt-1">
              You answered {submitted.length} of {total} questions.
            </p>
            <div className="text-5xl font-bold text-brand-blue-700 mt-6">{avg}%</div>
            <p className="text-xs text-slate-500 mt-1">Average score</p>

            <div className="flex justify-center gap-2 mt-6">
              <Button onClick={() => navigate('/app/gap-report')}>View Gap Report →</Button>
              <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
            Question {idx + 1} of {total}
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-brand-orange-100 text-brand-orange-600 font-medium">
            {q.language}
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-brand-blue-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-base text-slate-800 mb-4">{q.prompt}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Code Editor</span>
          <button
            type="button"
            onClick={handleFormatCode}
            disabled={submitting || !answer.trim()}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition flex items-center gap-1 disabled:opacity-50"
          >
            ✨ Format Code
          </button>
        </div>

        <div className="w-full h-56 rounded-lg overflow-hidden border border-slate-700 bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={getMonacoLang(q.language)}
            value={answer}
            theme="vs-dark"
            onMount={(editor) => { editorRef.current = editor; }}
            onChange={(val) => setAnswer(val || "")}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              tabSize: 4,
              insertSpaces: true,
              automaticLayout: true,
              padding: { top: 8, bottom: 8 },
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="primary" onClick={onSubmitAnswer} disabled={submitting || isAnswerEmpty}>
            {submitting ? 'Submitting…' : idx + 1 === total ? 'Submit & Finish' : 'Submit Answer'}
          </Button>
          <Button variant="outline" onClick={onSkip} disabled={submitting}>
            Skip Question
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => navigate('/app/gap-report')}>
            Exit to Gap Report -
          </Button>
        </div>

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
        )}
      </Card>

      <Card title="Tips">
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Replace the starter code with your real answer — empty / starter answers are blocked.</li>
          <li>You can skip questions; they don&apos;t count against your average score.</li>
          <li>Your time is tracked but not penalized for this assessment.</li>
        </ul>
      </Card>
    </div>
  );
}
