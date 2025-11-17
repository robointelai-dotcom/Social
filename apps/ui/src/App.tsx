import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { lazy } from "react";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import Loader from "@/components/ui/loader";

import HorizontalLayout from "@/layout/horizontal-layout";

const Acccounts = lazy(() => import("@/pages/accounts"));
const Posts = lazy(() => import("@/pages/posts"));
const Tasks = lazy(() => import("@/pages/tasks"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader size="large" />}>
        <Routes>
          <Route path="/" element={<HorizontalLayout />}>
            <Route index element={<Navigate to="/accounts" />} />
            <Route path="accounts" element={<Acccounts />} />
            <Route path="posts" element={<Posts />} />
            <Route path="tasks" element={<Tasks />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ duration: 2000 }}
      />
    </BrowserRouter>
  );
};

export default App;
