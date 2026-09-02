import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getCourse, getLessonsForCourse, getMyProgress, updateProgress, submitQuiz as apiSubmitQuiz } from '../services/api';

// Helper to convert standard YouTube links to embed format
const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    // Handle youtu.be/ID
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // Handle youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    return url;
  } catch (err) {
    return url;
  }
};

export default function LearningModule() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [error, setError] = useState(null);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null); // { score, passed }

  useEffect(() => {
    (async () => {
      try {
        const [c, ls, p] = await Promise.all([
          getCourse(courseId),
          getLessonsForCourse(courseId),
          getMyProgress().catch(() => []),
        ]);
        setCourse(c);
        setLessons(ls);
        const byLesson = {};
        for (const row of p) byLesson[row.lesson_id] = row;
        setProgress(byLesson);
        setActiveLessonId(ls[0]?.id || null);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    })();
  }, [courseId]);

  const overall = lessons.length === 0
    ? 0
    : Math.round((lessons.filter((l) => progress[l.id]?.completion_flag).length / lessons.length) * 100);
  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  const onToggleComplete = async () => {
    if (!activeLesson) return;
    const current = !!progress[activeLesson.id]?.completion_flag;
    if (current) {
      // If already complete, we can mark incomplete (mostly for debugging)
      try {
        const updated = await updateProgress(activeLesson.id, {
          completion_flag: false,
          watched_duration: 0,
        });
        setProgress((prev) => ({ ...prev, [activeLesson.id]: updated }));
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
      return;
    }

    // If trying to complete, they MUST take the quiz.
    if (!activeLesson?.quizzes || activeLesson.quizzes.length === 0) {
      alert("This lesson does not have a quiz attached. Please contact your instructor.");
      return;
    }

    setShowQuiz(true);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const submitQuiz = async () => {
    const quizData = activeLesson?.quizzes?.[0];
    if (!quizData || !quizData.questions) return;
    
    try {
      const result = await apiSubmitQuiz(activeLesson.id, quizAnswers);
      setQuizResult({ score: result.score, passed: result.passed });

      if (result.passed) {
        // Optimistically update local progress so UI reflects it immediately
        setProgress((prev) => ({ 
          ...prev, 
          [activeLesson.id]: {
            ...prev[activeLesson.id],
            completion_flag: true,
            quiz_score: result.score
          } 
        }));
        
        // Auto-unlock next lesson (find next lesson index)
        const curIdx = lessons.findIndex(l => l.id === activeLesson.id);
        if (curIdx >= 0 && curIdx < lessons.length - 1) {
          setTimeout(() => setActiveLessonId(lessons[curIdx + 1].id), 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (error) {
    return <div className="p-4 rounded-lg bg-red-50 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="text-xs uppercase text-slate-400">Learning Module</div>
          <h2 className="text-2xl font-bold text-slate-900">{course?.title || 'Loading…'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            <Link to="/app/courses" className="hover:underline">← Back to Courses</Link>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 text-sm">
          <span className="font-bold">{overall}%</span>{' '}
          <span className="text-slate-500">Complete</span>
          <div className="h-1.5 bg-slate-100 rounded-full mt-1 w-40">
            <div className="h-full bg-brand-blue-500 rounded-full" style={{ width: `${overall}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-2">
            {activeLesson ? `Welcome to ${course?.title}` : 'No lesson selected'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Dive into advanced concepts and enhance your skills.
          </p>
          {activeLesson && (
            <>
              <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video grid place-items-center text-white relative shadow-lg">
                {activeLesson.video_url ? (
                  <iframe 
                    className="w-full h-full"
                    src={getEmbedUrl(activeLesson.video_url)} 
                    title={activeLesson.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center">
                    <div className="text-5xl mb-3">🎥</div>
                    <div className="text-sm">{activeLesson.title}</div>
                    <div className="text-xs text-slate-400 mt-1">No video URL provided</div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  onClick={onToggleComplete}
                  variant={progress[activeLesson.id]?.completion_flag ? 'outline' : 'primary'}
                >
                  {progress[activeLesson.id]?.completion_flag
                    ? '↺ Mark as incomplete'
                    : 'Take Mandatory Quiz ✓'}
                </Button>
                {/* Download hidden until real video hosting (S3/Azure Blob/Vimeo) is wired. */}
              </div>
            </>
          )}
        </Card>

        <Card>
          <h4 className="text-xs uppercase text-slate-400 mb-3">Module Overview</h4>
          <ul className="space-y-1.5">
            {lessons.map((l, i) => {
              const done = progress[l.id]?.completion_flag;
              const active = l.id === activeLessonId;
              
              // Lesson is locked if it's not the first lesson, and the previous lesson is NOT complete
              const isLocked = i > 0 && !progress[lessons[i - 1].id]?.completion_flag;

              return (
                <li key={l.id}>
                  <button
                    onClick={() => !isLocked && setActiveLessonId(l.id)}
                    disabled={isLocked}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                      active
                        ? 'bg-brand-blue-50 border border-brand-blue-200 text-brand-blue-700'
                        : isLocked
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border border-transparent grayscale'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      done ? 'bg-brand-green-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {done ? '✓' : isLocked ? '🔒' : i + 1}
                    </span>
                    <span className="flex-1 truncate">{l.title}</span>
                    {active && <span className="text-[10px] text-brand-blue-600">●</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* QUIZ MODAL */}
      {showQuiz && activeLesson?.quizzes?.[0] && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-slate-50">
              <h2 className="text-xl font-bold">Mandatory Quiz: {activeLesson.title}</h2>
              <p className="text-sm text-slate-500">Score 80% or higher to unlock the next lesson.</p>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {quizResult ? (
                <div className={`p-8 rounded-2xl text-center border-2 ${quizResult.passed ? 'bg-brand-green-50 border-brand-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="text-5xl mb-4">{quizResult.passed ? '🎉' : '❌'}</div>
                  <h3 className={`text-2xl font-bold mb-2 ${quizResult.passed ? 'text-brand-green-700' : 'text-red-700'}`}>
                    You scored {quizResult.score}%
                  </h3>
                  <p className="text-slate-600">
                    {quizResult.passed 
                      ? "Congratulations! You've passed the quiz and unlocked the next lesson." 
                      : "You need an 80% to pass. Please review the material and try again."}
                  </p>
                </div>
              ) : (
                activeLesson.quizzes[0].questions.map((q, i) => (
                  <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                    <p className="font-medium text-slate-800 mb-4">{i + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${quizAnswers[i] === optIdx ? 'bg-brand-blue-50 border-brand-blue-500' : 'hover:bg-slate-50 border-slate-200'}`}>
                          <input 
                            type="radio" 
                            name={`q_${i}`} 
                            checked={quizAnswers[i] === optIdx}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [i]: optIdx }))}
                            className="w-4 h-4 text-brand-blue-600 border-slate-300 focus:ring-brand-blue-500"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-3 bg-white">
              <Button variant="outline" onClick={() => setShowQuiz(false)}>
                {quizResult?.passed ? 'Continue' : 'Cancel'}
              </Button>
              {!quizResult && (
                <Button 
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== activeLesson.quizzes[0].questions.length}
                >
                  Submit Quiz
                </Button>
              )}
              {quizResult && !quizResult.passed && (
                <Button onClick={() => { setQuizResult(null); setQuizAnswers({}); }}>
                  Retry Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
