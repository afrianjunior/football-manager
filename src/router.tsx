import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import Home from "./pages/Home";
import ScreenshotAI from "./pages/ScreenshotAI";
import KeyMonitor from "./pages/KeyMonitor";
import Navigation from "./components/Navigation";
import PlayersPage from "./pages/Players";

function Layout() {
  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <Outlet />
    </div>
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
        path: "/players",
        element: <PlayersPage />,
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