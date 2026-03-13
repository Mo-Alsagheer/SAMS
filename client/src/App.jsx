import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./user/quiz/pages/Quiz";
import QuizResult from "./user/quiz/pages/QuizResult";
import DirectorLayout from "./director/layout/DirectorLayout";
import DashBoard from "./director/pages/DashBoard";
import Applications from "./director/pages/Applications";
import Page from "./director/pages/Page";
import WorkSpace from "./director/pages/WorkSpace";
function App() {
  return (
    <Routes>
      <Route path="/test" element={<Page />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<QuizResult />} />
      {/* Director Routes */}
      <Route path="/director" element={<DirectorLayout />}>
        <Route index element={<DashBoard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="workspace" element={<WorkSpace />} />
      </Route>
    </Routes>
  );
}

export default App;
