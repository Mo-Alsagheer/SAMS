import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./user/quiz/pages/Quiz"
import QuizResult from "./user/quiz/pages/QuizResult";
function App() {
  return (
    <Routes>
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<QuizResult />} />
    </Routes>
  );
}

export default App;
