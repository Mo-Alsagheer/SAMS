import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./pages/public/Quiz";
import QuizResult from "./pages/public/QuizResult";
function App() {
  return (
    <Routes>
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<QuizResult />} />
    </Routes>
  );
}

export default App;
