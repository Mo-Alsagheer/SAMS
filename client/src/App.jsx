import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./user/quiz/pages/Quiz";
import QuizResult from "./user/quiz/pages/QuizResult";
import DirectorLayout from "./director/layout/DirectorLayout";
import DashBoard from "./director/pages/DashBoard";
import MemberApplications from "./director/pages/Applications";
import DirectorApplications from "./executive/pages/Applications";
import Page from "./director/pages/Page";
import WorkSpace from "./director/pages/WorkSpace";
import HomePage from "./user/homePage/pages/HomePage";
import Application from "./user/committees/components/Application";
import ViewCommittee from "./user/committees/components/ViewCommittee";
import UserCommitteeDetails from "./user/committees/components/CommitteeDetails";

import Login from "./auth/Login";
import { Toaster } from "sonner";
import ExecutiveLayout from "./executive/pages/ExecutiveLayout";
import Dashboard from "./executive/pages/DashBoard";
import Recruitment from "./executive/pages/Recruitment";
import Committees from "./executive/pages/Committees";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CommitteeDetails from "./executive/pages/CommitteeDetails";
import ApplicationDetails from "./director/pages/ApplicationDetails";
import ManageRoadmap from "./director/pages/ManageRoadmap";
import TaskManagement from "./director/pages/TaskManagement";
import Members from "./director/pages/Members";

import MemberLayout from "./member/layout/MemberLayout";
function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<QuizResult />} />

        {/* Committees & Applications */}
        <Route path="/committees" element={<ViewCommittee />} />
        <Route path="/committee/:id" element={<UserCommitteeDetails />} />
        <Route path="/application/:id" element={<Application />} />

        {/* Test Route */}
        <Route path="/test" element={<Page />} />

        {/* Director Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["DIRECTOR"]} />}>
          <Route path="/director" element={<DirectorLayout />}>
            <Route index element={<DashBoard />} />
            <Route path="applications" element={<MemberApplications />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="workspace" element={<WorkSpace />} />
            <Route path="manageRoadmap" element={<ManageRoadmap />} />
            <Route path="taskManagement" element={<TaskManagement />} />
            <Route path="members" element={<Members />} />
          </Route>
        </Route>
        {/* Member Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["MEMBER"]} />}>
          <Route path="/member" element={<MemberLayout />}></Route>
        </Route>

        {/* Executive Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["EXECUTIVE"]} />}>
          <Route path="/executive" element={<ExecutiveLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="applications" element={<DirectorApplications />} />
            <Route path="committees" element={<Committees />} />
            <Route
              path="committees/:committeeId"
              element={<CommitteeDetails />}
            />
          </Route>
        </Route>

        {/* Fallback route for 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
}
export default App;
