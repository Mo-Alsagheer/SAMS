import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./user/quiz/pages/Quiz";
import QuizResult from "./user/quiz/pages/QuizResult";
import HomePage from "./user/homePage/pages/HomePage";
import Application from "./user/committees/components/Application";
import SuccessPage from "./user/committees/components/SuccessPage";
import ViewCommittee from "./user/committees/components/ViewCommittee";
import CommitteeDetails from "./user/committees/components/CommitteeDetails";
function App() {
  return (
    <Routes>
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<QuizResult />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/application" element={<Application />} />
      <Route path="/committees" element={<ViewCommittee />} />
       <Route path="/committee/:id" element={<CommitteeDetails />} />
    </Routes>
  );
}

export default App;
