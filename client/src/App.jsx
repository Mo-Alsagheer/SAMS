import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./user/quiz/pages/Quiz";
import QuizResult from "./user/quiz/pages/QuizResult";
import DirectorLayout from "./director/layout/DirectorLayout";
import DashBoard from "./director/pages/DashBoard";
function App() {
  return (
    <Routes>
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<QuizResult />} />
      <Route path="/director" element={<DirectorLayout />}>
        <Route index element={<DashBoard />} />
        {/* <Route path="committee" element={<MyCommittee />} />
        <Route path="tasks" element={<Quiz />} />
        <Route path="blog" element={<Quiz />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
