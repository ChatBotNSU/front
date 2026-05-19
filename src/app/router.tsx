import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "@/app/ui/AppLayout";
import { RequireAuth } from "@/app/ui/RequireAuth";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ProjectPage } from "@/pages/projects/ProjectPage";
import { ProjectsListPage } from "@/pages/projects/ProjectsListPage";
import { Spinner } from "@/shared/ui";

// The editor pulls in React Flow — load it as a separate chunk.
const FlowEditorPage = lazy(() =>
  import("@/pages/flow-editor/FlowEditorPage").then((m) => ({ default: m.FlowEditorPage })),
);

const editorElement = (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    }
  >
    <FlowEditorPage />
  </Suspense>
);

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/projects" replace /> },
          { path: "/projects", element: <ProjectsListPage /> },
          { path: "/projects/:projectId", element: <ProjectPage /> },
        ],
      },
      // Editor is full-screen (its own toolbar) — outside the chrome layout.
      { path: "/flows/:flowId", element: editorElement },
    ],
  },
  { path: "*", element: <Navigate to="/projects" replace /> },
]);
