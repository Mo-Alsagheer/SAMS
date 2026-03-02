import { useState } from "react";

export function useQuiz(questions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const selectedOption =
    answers.find((a) => a.questionId === currentQuestion.id)?.answerId ?? null;

  function selectAnswer(optionId) {
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id, answerId: optionId },
    ]);
    console.log(answers);
  }

  function next() {
    if (!selectedOption) return null;

    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return null;
    }

    return answers;
  }

  function back() {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
      
    }
  }

  return {
    currentQuestion,
    currentIndex,
    selectedOption,
    selectAnswer,
    next,
    back,
    isFirst,
    isLast,
    progress: ((currentIndex + 1) / questions.length) * 100,
  };
}
