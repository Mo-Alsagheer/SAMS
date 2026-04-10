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
import Recruitment from "./executive/pages/Recruitment";
import Committees from "./executive/pages/Committees";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Page />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<QuizResult />} />
        <Route path="/home" element={<HomePage />} />

        <Route element={<ProtectedRoute allowedRoles={["DIRECTOR"]} />}>
          <Route path="/director" element={<DirectorLayout />}>
            <Route index element={<DashBoard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="workspace" element={<WorkSpace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["EXECUTIVE"]} />}>
          <Route path="/executive" element={<ExecutiveLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="committees" element={<Committees />} />
          </Route>
          
        </Route>
      </Routes>
    </>
  );
}

export default App;
