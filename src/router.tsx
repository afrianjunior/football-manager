import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import Home from "./pages/Home";
import ScreenshotAI from "./pages/ScreenshotAI";
import KeyMonitor from "./pages/KeyMonitor";
import Navigation from "./components/Navigation";

function Layout() {
  return (
    <>
      <Navigation />
      <div style={{ paddingTop: '80px' }}>
        <Outlet />
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/screenshot-ai",
        element: <ScreenshotAI />,
      },
      {
        path: "/key-monitor",
        element: <KeyMonitor />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}