import { useEffect, useState } from "react";
import { getInitialAssessmentQuestions, submitInitialAssessment,} from "../services/api";
import { useNavigate } from "react-router-dom";

const InitialAssessment = () => {
    // State to manage loading status of the assessment data
    const [loading, setLoading] = useState(true);
    // State to store the user's career goal
    const [careerGoal, setCareerGoal] = useState("");
    // State to store the list of skills related to the career goal
    const [skills, setSkills] = useState([]);
    // State to store all assessment questions
    const [questions, setQuestions] = useState([]);
    // State to track the current question being displayed
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // State to store user's answers, mapping question ID to selected option index
    const [answers, setAnswers] = useState({});
    // State to manage the submission process
    const [submitting, setSubmitting] = useState(false);
    // Hook for navigation
    const navigate = useNavigate()

    // Effect hook to load assessment questions when the component mounts
  useEffect(() => {
    loadAssessment();
    }, []);

    // Function to fetch initial assessment questions from the API
    const loadAssessment = async () => {
    try {
        const data = await getInitialAssessmentQuestions();

        setCareerGoal(data.careerGoal);
        setSkills(data.skills);

        const flattened = [];
        // Flatten the questions object into a single array for easier navigation

        Object.entries(data.questions).forEach(([skill, skillQuestions]) => {
        skillQuestions.forEach((question) => {
            flattened.push({
            ...question,
            skill,
            });
        });
        });

            setQuestions(flattened);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the submission of the assessment
    const handleSubmit = async () => {
    try {
        setSubmitting(true);

        const payload = Object.entries(answers).map(
        ([questionId, selectedIndex]) => ({
            questionId,
            selectedIndex,
        })
        );

        const response = await submitInitialAssessment(payload);

        console.log("Assessment Submitted:", response);
        alert("Assessment submitted successfully!");
        // Navigate to the dashboard after successful submission
        navigate("/app/dashboard");
        
    } catch (error) {
        console.error(error);
        alert("Failed to submit assessment.");
    } finally {
        setSubmitting(false);
    }
    };

    // Get the current question based on the index
    const currentQuestion = questions[currentQuestionIndex];
    // Calculate the progress percentage for the progress bar
    const progress =
    questions.length === 0
        ? 0
        : ((currentQuestionIndex + 1) / questions.length) * 100;

    return(
        <>
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

                <h1 className="text-3xl font-bold">
                Initial Skill Assessment
                </h1>
                {/* Description of the assessment */}
                <p className="mt-2 text-gray-500">
                Complete this assessment to personalize your learning path.
                </p>
                {/* Display career goal and skills */}
                <div className="mt-6">
                <p>
                    <strong>Career Goal:</strong> {careerGoal}
                </p>
                {/* Display skills, joined by a comma */}
                <p className="mt-2">
                    <strong>Skills:</strong> {skills.join(", ")}
                </p>
                </div>
                {/* Conditional rendering based on loading state and existence of questions */}
                {loading ? (
                <div className="mt-10 text-center">
                    Loading assessment...
                </div>
                ) : currentQuestion ? (
                <>
                    <div className="mt-8">

                    {/* Question navigation and skill display */}
                    <div className="flex justify-between mb-2">
                        <span>
                        Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className="font-semibold capitalize">
                        {currentQuestion.skill}
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                        />

                    </div>

                    </div>

                    {/* Current question text */}
                    <div className="mt-8">
                    <h2 className="text-xl font-semibold">
                        {currentQuestion.text}
                    </h2>
                    {/* Options for the current question */}
                    <div className="mt-6 space-y-4">
                        {currentQuestion.options.map((option, index) => (
                        // Each option is a clickable label
                        <label
                            key={index}
                            className={`block border rounded-lg p-4 cursor-pointer transition ${
                            answers[currentQuestion.id] === index
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-300 hover:border-blue-400"
                            }`}
                        > {/* Radio button for selecting an option */}

                            <input
                            type="radio"
                            name={currentQuestion.id}
                            checked={answers[currentQuestion.id] === index}
                            onChange={() =>
                                setAnswers((prev) => ({
                                ...prev,
                                [currentQuestion.id]: index,
                                }))
                            }
                            className="mr-3"
                            />

                            {/* Option text */}
                            {option}
                        </label>
                        ))}
                    </div>
                    </div>
                   {/* Navigation buttons (Previous, Next, Submit) */}
                   <div className="mt-10 flex justify-between">
                    {/* Previous button, disabled if on the first question */}
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() =>
                        setCurrentQuestionIndex((prev) => prev - 1)
                        }
                        className="px-6 py-2 rounded bg-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {/* Next button, displayed if not on the last question */}
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button
                        onClick={() =>
                            setCurrentQuestionIndex((prev) => prev + 1)
                        }
                        disabled={answers[currentQuestion.id] === undefined}
                        className="px-6 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                        >
                        Next
                        </button>
                    // Submit button, displayed if on the last question
                    ) : (
                        <button
                        onClick={handleSubmit}
                        disabled={
                            answers[currentQuestion.id] === undefined ||
                            submitting
                        }
                        className="px-6 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                        >
                        {/* Button text changes based on submission status */}
                        {submitting ? "Submitting..." : "Submit Assessment"}
                        </button>
                    )}
                    </div>
                </>
                ) : (
                <p>No questions found.</p>
                )}
            </div>
            </div>
        </>
    )
};

export default InitialAssessment;