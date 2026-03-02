import React from "react";
import { useLocation } from "react-router-dom";

function QuizResult() {
  // Get the location object
  const location = useLocation();

  // Access the answers passed from the Quiz page
  const { answers } = location.state || { answers: [] };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4"> QuizResults</h1>
      {answers.length === 0 ? (
        <p>No answers submitted.</p>
      ) : (
        <ul className="list-disc pl-6">
          {answers.map((ans) => (
            <li key={ans.questionId}>
              Question ID: {ans.questionId}, Answer ID: {ans.answerId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default QuizResult;