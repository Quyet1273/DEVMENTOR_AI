// import { createBrowserRouter } from "react-router-dom";
// import { Root } from "./components/Root";
// import { Landing } from "./components/Landing";
// // import { Login } from "./components/Login";
// // import { Register } from "./components/Register";
// import AuthPage from "./components/pages/AuthPage";
// import { Onboarding } from "./components/Onboarding";
// import { Dashboard } from "./components/Dashboard";
// import { Roadmap } from "./components/Roadmap";
// import { Courses } from "./components/Courses";
// import { Learning } from "./components/Learning";
// import { Chat } from "./components/Chat";
// import { Quiz } from "./components/Quiz";
// import { MockInterview } from "./components/MockInterview";
// import { Resources } from "./components/Resources";
// import { Profile } from "./components/Profile";
// import { AdminCourses } from "./components/AdminCourses";
// import { AdminReport } from "./components/AdminReport";

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     Component: Root,
//     children: [
//       { index: true, Component: Landing },
//       { path: "login", Component: AuthPage },
//       { path: "onboarding", Component: Onboarding },
//       { path: "dashboard", Component: Dashboard },
//       { path: "roadmap/:id?", Component: Roadmap },
//       { path: "courses", Component: Courses },
//       { path: "learning/:courseId", Component: Learning },
//       { path: "chat", Component: Chat },
//       { path: "quiz", Component: Quiz },
//       { path: "mock-interview", Component: MockInterview },
//       { path: "resources", Component: Resources },
//       { path: "manage-courses", Component: AdminCourses },
//       { path: "reports", Component: AdminReport },
//       { path: "profile", Component: Profile },
//     ],
//   },
// ]);
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Root } from "./components/Root";
import { Landing } from "./components/Landing";
import AuthPage from "./components/pages/AuthPage";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { Roadmap } from "./components/Roadmap";
import { Courses } from "./components/Courses";
import { Learning } from "./components/Learning";
import { Chat } from "./components/Chat";
import { Quiz } from "./components/Quiz";
import { MockInterview } from "./components/MockInterview";
import { Resources } from "./components/Resources";
import { Profile } from "./components/Profile";
import { AdminCourses } from "./components/AdminCourses";
import { AdminReport } from "./components/AdminReport";

// --- CHỐT CHẶN ADMIN ---
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ color: '#22d3ee', padding: '20px' }}>Đang xác thực...</div>;
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <React.Fragment>{children}</React.Fragment>;
};

// --- ROUTER CHUẨN ---
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: AuthPage },
      { path: "onboarding", Component: Onboarding },
      { path: "dashboard", Component: Dashboard },
      { path: "roadmap/:id?", Component: Roadmap },
      { path: "courses", Component: Courses },
      { path: "learning/:courseId", Component: Learning },
      { path: "chat", Component: Chat },
      { path: "quiz", Component: Quiz },
      { path: "mock-interview", Component: MockInterview },
      { path: "resources", Component: Resources },
      { path: "profile", Component: Profile },
      { 
        path: "manage-courses", 
        element: <AdminRoute><AdminCourses /></AdminRoute> 
      },
      { 
        path: "reports", 
        element: <AdminRoute><AdminReport /></AdminRoute> 
      }
    ]
  }
]);