import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./user/quiz/pages/Quiz";
import QuizResult from "./user/quiz/pages/QuizResult";
import DirectorLayout from "./director/layout/DirectorLayout";
import DashBoard from "./director/pages/DashBoard";
import Applications from "./director/pages/Applications";
import Page from "./director/pages/Page";
import WorkSpace from "./director/pages/WorkSpace";
import HomePage from "./user/homePage/pages/HomePage";
import Login from "./auth/Login";
import { Toaster } from "sonner";
import ExecutiveLayout from "./executive/pages/ExecutiveLayout";
import Dashboard from "./executive/pages/DashBoard";
import Committees from "./executive/pages/Committees";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Page />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<QuizResult />} />
        {/* Director Routes */}
        <Route path="/director" element={<DirectorLayout />}>
          <Route index element={<DashBoard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="workspace" element={<WorkSpace />} />
        </Route>
        <Route path="/executive" element={<ExecutiveLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="committees" element={<Committees />} />
        </Route>
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;
