import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers/AppProviders";
import { router } from "@/app/router";
import { ToastViewport } from "@/shared/ui";

import "@/app/styles/index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found");

createRoot(rootEl).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
      <ToastViewport />
    </AppProviders>
  </StrictMode>,
);
