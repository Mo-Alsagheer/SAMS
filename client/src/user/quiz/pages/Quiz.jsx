//! Edit this file style + test logic
import React, { useEffect, useState } from "react";
import QuizCard from "../components/QuizCard";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../../../hooks/useQuiz";
import { questions } from "../../../data/questions";
function Quiz() {
  const navigate = useNavigate();
  const {
    currentQuestion,
    currentIndex,
    selectedOption,
    selectAnswer,
    next,
    back,
    isFirst,
    isLast,
    progress,
  } = useQuiz(questions);
  function handleNext() {
    const result = next();
    if (result) {
      navigate("/result", { state: { answers: result } });
    }
  }
  const progressPercent = progress;
  return (
    <div className="min-h-screen bg-white md:bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-xl bg-white md:shadow-lg rounded-xl p-6 space-y-6">
        <div className=" w-1/4 rounded-lg p-2 flex justify-center bg-sky-800 text-white ">
          {currentQuestion.id} /{questions.length}
        </div>
        {/* Progress */}
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div
            className="bg-sky-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <QuizCard
          {...currentQuestion}
          onSelect={selectAnswer}
          selectedOption={selectedOption}
        />
        <div className="flex justify-between">
          <button
            onClick={back}
            disabled={isFirst}
            className="p-4 cursor-pointer border rounded-2xl text-black font-semibold bg-white"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={` p-4 rounded-2xl text-white font-semibold ${
              selectedOption
                ? "bg-sky-500 hover:bg-sky-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isLast ? "Submit" : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
