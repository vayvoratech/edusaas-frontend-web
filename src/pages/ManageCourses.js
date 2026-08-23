import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getCourses, createCourse, updateCourse, deleteCourse, createLesson, updateLesson, getLessonsForCourse, deleteLesson
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];
const STATUSES = ['', 'active', 'draft', 'archived'];

export default function ManageCourses() {
  const { user } = useAuth();
  // State for storing course data and UI status
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('Last Updated');
  const [creating, setCreating] = useState(false); // True when create modal is open
  const [editing, setEditing] = useState(null); // Holds course data for editing/creating
  const [step, setStep] = useState(1); // Controls the multi-step modal
  const [lessons, setLessons] = useState([]); // Holds lesson data for a course
  const [error, setError] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Fetches courses from the API based on current filters
  const load = async () => {
    try {
      const filters = user?.role === 'educator' ? { educator_id: user.id } : {};
      if (status) filters.status = status;
      setCourses(await getCourses(filters));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Reloads courses when status filter or user changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [status, user?.id]);

  // Data for the course summary pie chart
  const summary = {
    active: courses.filter((c) => c.status === 'active').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    archived: courses.filter((c) => c.status === 'archived').length,
  };
  const pieData = [
    { name: 'Active', value: summary.active },
    { name: 'Draft', value: summary.draft },
    { name: 'Archived', value: summary.archived },
  ];

  // Handles saving a new or edited course and its lessons
  const onSave = async (e) => {
    e.preventDefault();
    // This function now handles the final "Create Course" click from Step 2
    console.log({
      title: editing.title,
      category: editing.category,
      difficulty: editing.difficulty,
      status: editing.status,
      description: editing.description,
      lessons,
    });

    try {
        let course;
        
        const formData = new FormData();
        if (editing.title) formData.append('title', editing.title);
        if (editing.category) formData.append('category', editing.category);
        if (editing.difficulty) formData.append('difficulty', editing.difficulty);
        if (editing.status) formData.append('status', editing.status);
        if (editing.description) formData.append('description', editing.description);
        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

        if (editing.id) {
            course = await updateCourse(editing.id, formData);
        } else {
            course = await createCourse(formData);
        }

      // Save lessons
      if (lessons.length > 0) {
        // Validate quizzes
        for (let i = 0; i < lessons.length; i++) {
          const l = lessons[i];
          if (!l.quiz || l.quiz.length < 5 || l.quiz.length > 20) {
            throw new Error(`Lesson ${i + 1} must have between 5 and 20 quiz questions.`);
          }
          // Basic validation for questions
          for (let j = 0; j < l.quiz.length; j++) {
            const q = l.quiz[j];
            if (!q.question || !q.options || q.options.length !== 4 || q.correct_option === undefined) {
              throw new Error(`Question ${j + 1} in Lesson ${i + 1} is incomplete.`);
            }
          }
        }

        await Promise.all(
          lessons.map((lesson, index) => {
            const lessonPayload = {
              title: lesson.title,
              video_url: lesson.video_url,
              duration: Number(lesson.duration),
              order_index: index + 1,
              quiz: lesson.quiz,
            };
            if (lesson.id) {
              return updateLesson(lesson.id, lessonPayload);
            } else {
              return createLesson(course.id, lessonPayload);
            }
          })
        );
      }
      // Reset state and close modal
      setEditing(null);
      setCreating(false);
      setStep(1); setLessons([]);
      setThumbnailFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Handles deleting a course after confirmation
  const onDelete = async (c) => {
    if (!window.confirm(`Delete "${c.title}"?`)) return;
    try {
      await deleteCourse(c.id);
      setCourses((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Sorts courses based on the selected sort option
  const sorted = [...courses].sort((a, b) => {
    if (sort === 'Title') return a.title.localeCompare(b.title);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="space-y-6">
      {/* Page header and main action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Courses</h2>
          <p className="text-sm text-slate-500">Create, edit, archive, and track engagement.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s || 'all'} value={s}>{s ? `Status: ${s}` : 'Status: All'}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            <option>Last Updated</option>
            <option>Title</option>
          </select>
          <Button onClick={() => { setEditing({ status: 'active', difficulty: 'beginner' }); setCreating(true); setStep(1); setLessons([]); }}>
            + Create Course
          </Button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Courses table */}
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Course Title</th>
                  <th className="text-left px-5 py-3 font-medium">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Difficulty</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No courses.</td></tr>
                ) : (
                  sorted.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium text-slate-800">{c.title}</td>
                      <td className="px-5 py-3 text-slate-600">{c.category || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          c.status === 'active' ? 'bg-brand-green-100 text-brand-green-700'
                          : c.status === 'draft' ? 'bg-brand-orange-100 text-brand-orange-700'
                          : 'bg-slate-200 text-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-600">{c.difficulty || 'beginner'}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 mr-1"
                          onClick={async () => {
                            setEditing({ ...c });
                            setStep(1);
                              try {
                                  const lessonData = await getLessonsForCourse(c.id);
                                  const mappedLessons = lessonData.map(l => ({
                                      ...l,
                                      quiz: l.quizzes && l.quizzes.length > 0 ? l.quizzes[0].questions : []
                                  }));
                                  setLessons(mappedLessons);
                              } catch (err) {
                                console.error(err);
                                setLessons([]);
                            }
                        }}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(c)}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Course summary pie chart */}
        <Card title="Course Summary">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} innerRadius={40}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 text-sm space-y-1.5">
            <li className="flex justify-between">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-blue-500 mr-2"/>Active</span>
              <strong>{summary.active}</strong>
            </li>
            <li className="flex justify-between">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-green-500 mr-2"/>Draft</span>
              <strong>{summary.draft}</strong>
            </li>
            <li className="flex justify-between">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-orange-500 mr-2"/>Archived</span>
              <strong>{summary.archived}</strong>
            </li>
          </ul>
        </Card>
      </div>

      {/* Create/Edit Course Modal */}
      {(creating || editing) && (
        <div className="fixed inset-0 bg-slate-900/40 grid place-items-center z-50 p-4">
          {/* Use a div instead of form for step 1 to prevent submission */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Step 1: Course Details */}
            {step === 1 && (
              <div className="flex flex-col h-full min-h-0">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">

                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {editing?.id ? "Edit Course" : "Create Course"}
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        Create the basic information for your course before building the curriculum.
                      </p>
                    </div>

                    <div className="flex items-center gap-4">

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          1
                        </div>
                        <span className="text-xs mt-2 font-medium text-blue-600">
                          Course
                        </span>
                      </div>

                      <div className="w-20 h-[2px] bg-slate-300"></div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-semibold">
                          2
                        </div>
                        <span className="text-xs mt-2 text-slate-400">
                          Curriculum
                        </span>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

                    <div className="grid grid-cols-2 gap-6">

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Course Title
                        </label>

                        <input
                          value={editing.title || ""}
                          onChange={(e) =>
                            setEditing({ ...editing, title: e.target.value })
                          }
                          required
                          placeholder="Enter course title"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Category
                        </label>

                        <input
                          value={editing.category || ""}
                          onChange={(e) =>
                            setEditing({ ...editing, category: e.target.value })
                          }
                          placeholder="Example: Web Development"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Difficulty
                        </label>

                        <select
                          value={editing.difficulty || "beginner"}
                          onChange={(e) =>
                            setEditing({ ...editing, difficulty: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Status
                        </label>

                        <select
                          value={editing.status || "active"}
                          onChange={(e) =>
                            setEditing({ ...editing, status: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Course Description
                      </label>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Course Description
                        </label>

                        <textarea
                          rows={5}
                          value={editing.description || ""}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe what students will learn in this course..."
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      
                      <div className="md:col-span-2 mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Course Thumbnail (Optional)
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setThumbnailFile(e.target.files[0])}
                            />
                          </label>
                          {thumbnailFile && (
                            <span className="text-sm text-slate-500 truncate max-w-xs">{thumbnailFile.name}</span>
                          )}
                          {editing.id && !thumbnailFile && editing.thumbnail_url && (
                            <span className="text-sm text-slate-500 truncate max-w-xs">Current thumbnail kept</span>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-white px-8 py-5 flex items-center justify-between shrink-0">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(null);
                      setCreating(false);
                      setStep(1);
                      setLessons([]);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!editing?.title?.trim()}
                  >
                    Continue to Curriculum →
                  </Button>

                </div>

              </div>
            )}

            {/* Step 2: Curriculum Builder */}
            {step === 2 && (

              <form
                  onSubmit={onSave}
                  className="flex flex-col flex-1 overflow-hidden"
              >

              <div className="p-8 flex justify-between items-center border-b">

                  <div>

                      <h3 className="text-xl font-semibold">
                          Curriculum
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                          Organize your lessons before publishing.
                      </p>

                  </div>

                  <Button
                      type="button"
                      onClick={() =>
                          setLessons([
                              ...lessons,
                              {
                                  title: "",
                                  video_url: "",
                                  duration: "",
                                  quiz: []
                              }
                          ])
                      }
                  >
                      + Add Lesson
                  </Button>

              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

              {
              lessons.length===0 ?

              (

              <div className="border-2 border-dashed rounded-2xl p-16 text-center bg-white">

              <h3 className="text-lg font-semibold">
              No Lessons Yet
              </h3>

              <p className="text-slate-500 mt-2">
              Click "Add Lesson" to start building your curriculum.
              </p>

              </div>

              )

              :

              (

              <div className="space-y-5">

              {lessons.map((lesson,index)=>(

              <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border p-8"
              >

              <div className="flex justify-between">

              <div>

              <p className="font-semibold text-lg">

              Lesson {index+1}

              </p>

              <p className="text-slate-500 mt-1">

              {lesson.title || "Untitled Lesson"}

              </p>

              </div>

              <div className="flex gap-2">

              <Button
              variant="outline"
              type="button"
              >

              Edit

              </Button>

              <Button
              variant="outline"
              type="button"
              onClick={async () => {
                if (lesson.id) {
                  if (!window.confirm(`Delete lesson "${lesson.title}"?`)) return;
                  try {
                    await deleteLesson(lesson.id);
                  } catch (err) {
                    alert("Failed to delete lesson: " + (err.response?.data?.error || err.message));
                    return;
                  }
                }
                const updated = [...lessons];
                updated.splice(index, 1);
                setLessons(updated);
              }}
              >

              Delete

              </Button>

              </div>

              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">

              <input
                value={lesson.title}
                onChange={(e) => {
                    const updated = [...lessons];
                    updated[index].title = e.target.value;
                    setLessons(updated);
                }}
                placeholder="Lesson Title"
                className="border rounded-lg px-3 py-2"
              />

              <input
                value={lesson.video_url}
                onChange={(e) => {
                    const updated = [...lessons];
                    updated[index].video_url = e.target.value;
                    setLessons(updated);
                }}
                placeholder="Video URL"
                className="border rounded-lg px-3 py-2"
             />

              <input
              type="number"
              value={lesson.duration}
              onChange={(e) => {
                  const updated = [...lessons];
                  updated[index].duration = e.target.value;
                  setLessons(updated);
              }}
              placeholder="Duration in Minutes"
              className="border rounded-lg px-3 py-2"
          />

              </div>

              {/* QUIZ BUILDER UI */}
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-800">Mandatory Quiz ({lesson.quiz?.length || 0}/20 Questions)</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="text-xs py-1"
                    onClick={() => {
                      const updated = [...lessons];
                      if (!updated[index].quiz) updated[index].quiz = [];
                      if (updated[index].quiz.length >= 20) return alert("Maximum 20 questions allowed.");
                      updated[index].quiz.push({ question: "", options: ["", "", "", ""], correct_option: 0 });
                      setLessons(updated);
                    }}
                  >
                    + Add Question
                  </Button>
                </div>
                
                {lesson.quiz && lesson.quiz.length < 5 && (
                  <p className="text-red-500 text-xs mb-3 font-medium">⚠️ Minimum 5 questions required.</p>
                )}

                <div className="space-y-4">
                  {(lesson.quiz || []).map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between mb-3">
                        <span className="font-medium text-sm text-slate-700">Question {qIndex + 1}</span>
                        <button type="button" className="text-red-500 hover:text-red-700 text-sm font-medium"
                          onClick={() => {
                            const updated = [...lessons];
                            updated[index].quiz.splice(qIndex, 1);
                            setLessons(updated);
                          }}
                        >Remove</button>
                      </div>
                      
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                        placeholder="Enter question text..."
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...lessons];
                          updated[index].quiz[qIndex].question = e.target.value;
                          setLessons(updated);
                        }}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map((optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name={`correct_${index}_${qIndex}`} 
                              checked={q.correct_option === optIndex}
                              onChange={() => {
                                const updated = [...lessons];
                                updated[index].quiz[qIndex].correct_option = optIndex;
                                setLessons(updated);
                              }}
                            />
                            <input
                              className={`w-full border rounded-lg px-3 py-1.5 text-sm ${q.correct_option === optIndex ? 'border-brand-green-500 bg-brand-green-50' : ''}`}
                              placeholder={`Option ${['A','B','C','D'][optIndex]}`}
                              value={q.options[optIndex]}
                              onChange={(e) => {
                                const updated = [...lessons];
                                updated[index].quiz[qIndex].options[optIndex] = e.target.value;
                                setLessons(updated);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* END QUIZ BUILDER UI */}

              </div>

              ))}

              </div>

              )

              }

              </div>

              <div className="border-t p-8 flex justify-between">

              <Button
              type="button"
              variant="outline"
              onClick={()=>setStep(1)}
              >

              ← Back

              </Button>

              <Button type="submit">

              Create Course

              </Button>

              </div>

              </form>

              )}
            {/* Common Cancel button for both steps, placed outside the conditional rendering */}
            {/* This is a design choice. The user request has cancel inside step 1 and back in step 2. I will follow that. */}
            {/* The user has a cancel button in step 1, and a back button in step 2. I will follow this. */}
            {/* The user also has a cancel button in the original form. I will make sure the modal can be closed from any step. */}
            {/* The cancel button in step 1 handles closing. The back button in step 2 goes to step 1. This is correct. */}
            {/* The main onClick to close the modal is on the backdrop. I will add it to the cancel button as well. */}
            {/* The original code has `onClick={() => { setEditing(null); setCreating(false); setStep(1)}}` on the cancel button. I will add `setLessons([])` to it. */}
            {/* The user said "Back (disabled or hidden)" for step 1. I will hide it. */}
            {/* The user said "Back" and "Create Course" for step 2. I have implemented this. */}
            {/* The user said "Remove the Create button" from step 1 and replace with "Next". I have done this. */}
            {/* The user said "Clicking Next should NOT call any API". My implementation does this. */}
            {/* The user said "Clicking 'Add Lesson' should create an empty lesson card in React state". My implementation does this. */}
            {/* The user said "When Create Course is clicked: For now only log the following object". My `onSave` function does this. */}
            {/* The user said "Do NOT change the API yet". My `onSave` function still calls the original `createCourse` with only course data. */}
            {/* The user said "Reset both when the modal closes". I've added `setStep(1)` and `setLessons([])` to the close/cancel handlers. */}
          </div>
        </div>
      )}
    </div>
  );
}
