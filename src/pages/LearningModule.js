import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getCourse,
  getLessonsForCourse,
  getMyProgress,
  updateProgress,
  submitQuiz as apiSubmitQuiz,
  rateCourse,
  getMyCourseRating,
  getCourseRatings,
  resolveAssetUrl,
} from '../services/api';

function ReviewerAvatar({ name, avatarUrl, size = "w-8 h-8", textClass = "text-xs" }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';

  const resolved = !imgError && avatarUrl ? resolveAssetUrl(avatarUrl) : null;

  if (resolved) {
    return (
      <img
        src={resolved}
        alt=""
        onError={() => setImgError(true)}
        className={`${size} rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs`}
      />
    );
  }

  const bgColors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];
  const charSum = (name || 'S').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colorClass = bgColors[charSum % bgColors.length];

  return (
    <div
      className={`${size} rounded-full ${colorClass} border flex items-center justify-center font-bold tracking-wider shrink-0 select-none shadow-2xs ${textClass}`}
      title={name}
    >
      {initials}
    </div>
  );
}

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

  // Rating and Feedback state
  const [myRating, setMyRating] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 5, review: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [courseRatings, setCourseRatings] = useState({ average_rating: 0, total_reviews: 0, reviews: [], distribution: {} });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, ls, p, myR, allR] = await Promise.all([
          getCourse(courseId),
          getLessonsForCourse(courseId),
          getMyProgress().catch(() => []),
          getMyCourseRating(courseId).catch(() => null),
          getCourseRatings(courseId).catch(() => ({ average_rating: 0, total_reviews: 0, reviews: [] })),
        ]);
        setCourse(c);
        setLessons(ls);
        const byLesson = {};
        for (const row of p) byLesson[row.lesson_id] = row;
        setProgress(byLesson);
        setActiveLessonId(ls[0]?.id || null);

        if (myR && myR.rating) {
          setMyRating(myR);
          setRatingData({ rating: myR.rating, review: myR.review || '' });
        }
        if (allR) {
          setCourseRatings(allR);
        }
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

  const onSubmitRating = async (e) => {
    if (e) e.preventDefault();
    if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
      alert("Please select a rating between 1 and 5 stars");
      return;
    }
    setSavingRating(true);
    try {
      await rateCourse(courseId, {
        rating: ratingData.rating,
        review: ratingData.review,
      });
      setMyRating({ rating: ratingData.rating, review: ratingData.review });
      setRatingMessage("Your rating & feedback have been successfully submitted!");
      // Refresh course ratings
      const updated = await getCourseRatings(courseId);
      if (updated) setCourseRatings(updated);
      setTimeout(() => {
        setShowRatingModal(false);
        setRatingMessage(null);
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to submit rating");
    } finally {
      setSavingRating(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (myRating) {
                setRatingData({ rating: myRating.rating, review: myRating.review || '' });
              }
              setShowRatingModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium text-sm transition-all shadow-sm"
            title="Rate this course and leave feedback for instructor"
          >
            <span className="text-base">⭐</span>
            <span>{myRating ? `Your Rating: ${myRating.rating}★` : 'Rate Course'}</span>
            {courseRatings.average_rating > 0 && (
              <span className="text-xs bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded-md font-semibold">
                Avg {courseRatings.average_rating}★ ({courseRatings.total_reviews})
              </span>
            )}
          </button>

          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 text-sm">
            <span className="font-bold">{overall}%</span>{' '}
            <span className="text-slate-500">Complete</span>
            <div className="h-1.5 bg-slate-100 rounded-full mt-1 w-32 sm:w-40">
              <div className="h-full bg-brand-blue-500 rounded-full" style={{ width: `${overall}%` }} />
            </div>
          </div>
        </div>
      </div>

      {overall === 100 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <div className="font-bold text-lg">Course Completed!</div>
              <div className="text-sm text-emerald-100">
                You've completed 100% of this course. Share your feedback with the educator and fellow learners!
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (myRating) {
                setRatingData({ rating: myRating.rating, review: myRating.review || '' });
              }
              setShowRatingModal(true);
            }}
            className="px-5 py-2.5 bg-white text-emerald-800 font-bold rounded-xl hover:bg-emerald-50 transition-colors shrink-0 shadow text-sm"
          >
            {myRating ? "Edit Your Review" : "⭐ Leave Course Feedback"}
          </button>
        </div>
      )}

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

      {/* Course Ratings & Student Reviews Section */}
      <Card className="!p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>💬</span> Learner Reviews & Ratings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified feedback from learners enrolled in this course
            </p>
          </div>
          <button
            onClick={() => {
              if (myRating) {
                setRatingData({ rating: myRating.rating, review: myRating.review || '' });
              }
              setShowRatingModal(true);
            }}
            className="px-4 py-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-blue-600/20 flex items-center gap-2 self-start sm:self-auto"
          >
            <span>⭐</span>
            <span>{myRating ? 'Update Your Review' : 'Rate This Course'}</span>
          </button>
        </div>

        {/* Stats summary banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100 items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col items-center justify-center font-black">
              <span className="text-2xl leading-none">{courseRatings.average_rating ? courseRatings.average_rating.toFixed(1) : '—'}</span>
              <span className="text-[10px] uppercase font-bold text-amber-600 mt-0.5">out of 5</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= Math.round(courseRatings.average_rating || 0) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                {courseRatings.total_reviews} total review{courseRatings.total_reviews === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = courseRatings.distribution?.[s] || 0;
              const pct = courseRatings.total_reviews > 0 ? Math.round((count / courseRatings.total_reviews) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-slate-500 font-medium">{s} stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews list */}
        <div className="pt-6">
          <h4 className="text-sm font-bold text-slate-800 mb-4">
            Student Feedback ({courseRatings.reviews?.length || 0})
          </h4>
          {courseRatings.reviews && courseRatings.reviews.length > 0 ? (
            <div className="space-y-4">
              {courseRatings.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition hover:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <ReviewerAvatar name={rev.user_name} avatarUrl={rev.avatar_url} />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{rev.user_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <span key={st}>{st <= rev.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                  {rev.review ? (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                      "{rev.review}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic pl-11">Rated {rev.rating} stars without written comments.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <span className="text-3xl mb-2 block">⭐</span>
              <p className="text-sm font-semibold text-slate-700">No student reviews yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Be the first to share your thoughts and rate this course!
              </p>
              <button
                onClick={() => setShowRatingModal(true)}
                className="mt-3 px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>
      </Card>

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

      {/* RATING & FEEDBACK MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {myRating ? "Update Your Course Review" : "Rate & Review Course"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{course?.title}</p>
                </div>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 grid place-items-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={onSubmitRating} className="p-6 space-y-5">
              {ratingMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <span>✓</span>
                  <span>{ratingMessage}</span>
                </div>
              )}

              {/* Interactive Star Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeVal = hoverRating || ratingData.rating;
                    const isFilled = star <= activeVal;
                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRatingData((prev) => ({ ...prev, rating: star }))}
                        className="text-4xl transition-transform hover:scale-125 focus:outline-none"
                      >
                        <span className={isFilled ? "text-amber-400 drop-shadow-sm" : "text-slate-200"}>
                          ★
                        </span>
                      </button>
                    );
                  })}
                  <span className="text-sm font-semibold text-slate-700 ml-2">
                    {(() => {
                      const v = hoverRating || ratingData.rating;
                      if (v === 5) return "⭐⭐⭐⭐⭐ Excellent";
                      if (v === 4) return "⭐⭐⭐⭐ Very Good";
                      if (v === 3) return "⭐⭐⭐ Good / Average";
                      if (v === 2) return "⭐⭐ Fair";
                      if (v === 1) return "⭐ Poor";
                      return "Select a rating";
                    })()}
                  </span>
                </div>
              </div>

              {/* Feedback Comments */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Written Feedback for Instructor & Peers <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={ratingData.review}
                  onChange={(e) => setRatingData((prev) => ({ ...prev, review: e.target.value }))}
                  placeholder="What did you learn? What was clear or what could the educator improve in the curriculum?"
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRatingModal(false)}
                  disabled={savingRating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingRating || !ratingData.rating}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  {savingRating ? "Saving..." : myRating ? "Update Feedback" : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
