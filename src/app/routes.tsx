import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { StudentDashboard } from "./components/StudentDashboard";
import { CompanyDashboard } from "./components/CompanyDashboard";
import { Marketplace } from "./components/Marketplace";
import { TaskDetails } from "./components/TaskDetails";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { NotFound } from "./components/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./components/AdminDashboard";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "signin", Component: SignIn },
      { path: "signup", Component: SignUp },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
      {
        path: "system-admin-portal",
        element: <AdminDashboard />,
      },
      {
        path: "student",
        element: (
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "company",
        element: (
          <ProtectedRoute allowedRole="company">
            <CompanyDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "marketplace", Component: Marketplace },
      { path: "task/:id", Component: TaskDetails },
      { path: "*", Component: NotFound },
    ],
  },
]);