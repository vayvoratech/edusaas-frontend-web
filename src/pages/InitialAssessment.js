import { useEffect, useState } from "react";
import {
  startInitialQuiz,
  submitInitialQuizAnswer,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const InitialAssessment = () => {
  const navigate = useNavigate();

  // Quiz loading/submission
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Quiz session
  const [sessionId, setSessionId] = useState(null);

  // Domain selected during signup
  const [domain, setDomain] = useState(null);

  // Current skill
  const [skill, setSkill] = useState(null);
  const [assessment, setAssessment] = useState(null);

  // Current adaptive question
  const [question, setQuestion] = useState(null);

  // Selected answer: A / B / C / D
  const [selectedAnswer, setSelectedAnswer] = useState("");

  // Current skill progress
  const [questionsAnswered, setQuestionsAnswered] = useState(0);



  // ----------------------------------------------------
  // Start initial quiz when page loads
  // ----------------------------------------------------
  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await startInitialQuiz();

      console.log("Initial Quiz Started:", response);

      const quiz = response.data;

      setSessionId(quiz.session_id);
      setDomain(quiz.domain);
      setAssessment(quiz.assessment);
      setSkill(quiz.skill);
      setQuestion(quiz.question);

      setQuestionsAnswered(0);
      setSelectedAnswer("");
    } catch (err) {
      console.error("Failed to start initial quiz:", err);

      setError(
        err.response?.data?.error ||
          "Failed to start the initial assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Submit current answer
  // ----------------------------------------------------
  const handleNext = async () => {
    if (!selectedAnswer || !question || !sessionId) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await submitInitialQuizAnswer({
        sessionId,
        questionId: question.question_id,
        answer: selectedAnswer,
      });

      console.log("Initial Quiz Answer Response:", response);

      const result = response.data;
      setAssessment(result.assessment);

      // ------------------------------------------------
      // Entire assessment completed
      // ------------------------------------------------
      if (result.assessment_completed) {
        // alert(
        //   `Initial assessment completed!\n\nReadiness Score: ${result.readiness_score}%`
        // );

        navigate("/app/dashboard");

        return;
      }

      // ------------------------------------------------
      // Skill completed -> backend moved to next skill
      // ------------------------------------------------
      if (result.skill_completed && result.next_skill) {
        setSkill(result.next_skill);

        setQuestionsAnswered(
          result.progress?.current ?? 0
        );

        setQuestion(result.question);

        setSelectedAnswer("");

        return;
      }

      // ------------------------------------------------
      // Continue current skill
      // ------------------------------------------------
      setQuestionsAnswered(
        result.progress?.current ?? 0
      );

      setQuestion(result.question);

      setSelectedAnswer("");
    } catch (err) {
      console.error("Failed to submit answer:", err);

      setError(
        err.response?.data?.error ||
          "Failed to submit the answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Convert backend question into UI options
  // ----------------------------------------------------
  const options = question
    ? [
        {
          key: "A",
          text: question.option_a,
        },
        {
          key: "B",
          text: question.option_b,
        },
        {
          key: "C",
          text: question.option_c,
        },
        {
          key: "D",
          text: question.option_d,
        },
      ]
    : [];

  // Each skill currently has 10 questions
  const questionNumber = assessment?.overall_question ?? 1;

  const skillProgress =
    assessment
        ? (
            (questionNumber -
             assessment.current_skill_index *
             assessment.questions_per_skill)
            /
            assessment.questions_per_skill
          ) * 100
        : 0;

  // ----------------------------------------------------
  // Loading screen
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-10">
            Loading assessment...
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Start error
  // ----------------------------------------------------
  if (error && !question) {
    return (
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

          <h1 className="text-3xl font-bold">
            Initial Skill Assessment
          </h1>

          <div className="mt-8 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>

          <button
            onClick={loadAssessment}
            className="mt-6 px-6 py-2 rounded bg-blue-600 text-white"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">

      <div className="max-w-6xl mx-auto">

        {/* ------------------------------------------------ */}
        {/* Heading */}
        {/* ------------------------------------------------ */}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">

          <div className="flex flex-wrap items-baseline justify-between gap-2">

            <h1 className="text-3xl font-bold">
              Initial Skill Assessment
            </h1>

            {domain?.domain_name && (
              <span className="text-sm font-medium text-gray-500">
                <strong className="text-gray-700">Domain:</strong>{" "}
                {domain.domain_name}
              </span>
            )}

          </div>

          <p className="mt-2 text-gray-500">
            Complete this assessment to personalize your learning path.
          </p>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
              {error}
            </div>
          )}

        </div>

        {/* ------------------------------------------------ */}
        {/* Main layout: question (left) + roadmap (right) */}
        {/* ------------------------------------------------ */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ------------------------------------------------ */}
          {/* Question column */}
          {/* ------------------------------------------------ */}

          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">

            {question ? (
              <>
                <div>

                  <div className="flex justify-between mb-2">

                    <span>

                      Question

                      {" "}

                      {questionsAnswered + 1}

                      {" / "}

                      {assessment?.questions_per_skill}

                    </span>

                    <span className="font-semibold">
                      {skill?.skill_name}
                    </span>

                  </div>

                  {/* Progress bar */}

                  <div className="w-full bg-gray-200 rounded-full h-2">

                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${skillProgress}%`,
                      }}
                    />

                  </div>

                </div>

                {/* ------------------------------------------------ */}
                {/* Question text */}
                {/* ------------------------------------------------ */}

                <div className="mt-8">

                  <h2 className="text-xl font-semibold">
                    {question.question_text}
                  </h2>

                  {/* ------------------------------------------------ */}
                  {/* Options */}
                  {/* ------------------------------------------------ */}

                  <div className="mt-6 space-y-4">

                    {options.map((option) => (

                      <label
                        key={option.key}
                        className={`block border rounded-lg p-4 cursor-pointer transition ${
                          selectedAnswer === option.key
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >

                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          value={option.key}
                          checked={
                            selectedAnswer === option.key
                          }
                          onChange={() =>
                            setSelectedAnswer(option.key)
                          }
                          disabled={submitting}
                          className="mr-3"
                        />

                        <span className="font-semibold mr-2">
                          {option.key}.
                        </span>

                        {option.text}

                      </label>

                    ))}

                  </div>

                </div>

                {/* ------------------------------------------------ */}
                {/* Navigation */}
                {/* ------------------------------------------------ */}

                <div className="mt-10 flex justify-end">

                  <button
                    onClick={handleNext}
                    disabled={
                      !selectedAnswer ||
                      submitting
                    }
                    className="px-6 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Next"}
                  </button>

                </div>

              </>
            ) : (
              <p>
                No question available.
              </p>
            )}

          </div>

          {/* ------------------------------------------------ */}
          {/* Sidebar: progress + roadmap */}
          {/* ------------------------------------------------ */}

          <aside className="lg:col-span-1 lg:sticky lg:top-10 space-y-6">

            <div className="bg-white rounded-xl shadow-lg p-6">

                <p className="font-semibold">

                    Overall Progress

                </p>

                <p className="text-sm text-gray-500 mt-1">

                    Question {assessment?.overall_question}

                    {" / "}

                    {assessment?.total_questions}

                </p>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                    <div

                        className="bg-blue-600 h-2 rounded-full"

                        style={{

                            width: `${
                                assessment
                                    ? (
                                        assessment.overall_question /
                                        assessment.total_questions
                                      ) * 100
                                    : 0
                            }%`

                        }}

                    />

                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">

                    <p className="text-sm">

                        <strong>Current Skill:</strong>{" "}

                        {skill?.skill_name}

                    </p>

                    <p className="text-sm text-gray-500">

                        Question

                        {" "}

                        {questionsAnswered + 1}

                        {" / "}

                        {assessment?.questions_per_skill}

                    </p>

                </div>

            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">

                <h3 className="font-semibold mb-3">

                    Assessment Roadmap

                </h3>

                <div className="space-y-2">

                    {assessment?.skills?.map((item) => (

                        <div
                            key={item.skill_id}
                            className="flex justify-between items-center border rounded-lg px-4 py-2 text-sm"
                        >

                            <span
                                className={
                                    item.status === "current"
                                        ? "font-semibold text-gray-900"
                                        : "text-gray-700"
                                }
                            >

                                {item.skill_name}

                            </span>

                            <span
                                className={
                                    item.status === "completed"
                                        ? "text-green-600"

                                        : item.status === "current"

                                        ? "text-blue-600"

                                        : "text-gray-400"
                                }
                            >

                                {item.status}

                            </span>

                        </div>

                    ))}

                </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
};

export default InitialAssessment;