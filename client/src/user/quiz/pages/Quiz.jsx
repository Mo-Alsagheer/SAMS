import React from "react";
import QuizCard from "../components/QuizCard";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../../../hooks/useQuiz";
import { questions } from "../../../data/questions";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function Quiz() {
  const navigate = useNavigate();
  const {
    currentQuestion,
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
    
      <main className="flex-grow flex items-center justify-center pt-20 pb-8 px-4">
    
        <div className="w-full max-w-lg bg-white shadow-[0_15px_40px_rgba(30,58,138,0.08)] rounded-2xl p-6 space-y-6 border border-slate-100">
          
          {/* Header: Counter & Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-blue-800 font-black text-2xl italic tracking-tighter">
                  {String(currentQuestion.id).padStart(2, "0")}
                </span>
                <span className="text-slate-400 font-bold text-sm">
                  {" "}
                  / {questions.length}
                </span>
              </div>
              <div className="text-slate-400 font-bold text-[15px] uppercase tracking-widest">
                {Math.round(progressPercent)}%
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-700 to-blue-900 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Question Area */}
          <div className="py-2">
            <QuizCard
              {...currentQuestion}
              onSelect={selectAnswer}
              selectedOption={selectedOption}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 pt-4 border-t border-slate-50">
            <button
              onClick={back}
              disabled={isFirst}
              className={`px-4 py-2 text-base font-bold transition-all flex items-center gap-1 ${
                isFirst
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-500 hover:text-blue-800"
              }`}
            >
              ← Prev
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className={`px-6 py-3 rounded-xl text-white text-base font-bold transition-all shadow-md transform active:scale-95 ${
                selectedOption
                  ? "bg-blue-800 hover:bg-blue-900 shadow-blue-900/10"
                  : "bg-slate-300 cursor-not-allowed shadow-none"
              }`}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Quiz;