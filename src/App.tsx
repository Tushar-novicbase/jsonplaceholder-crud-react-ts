import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import { MainLayout } from "./layout/MainLayout";
import DashboardPage from "./pages/dashboard";
import { LoginPage } from './pages/loginpage';
import { store } from "./redux/store";
import ProtectedRoute from './utils/ProtectedRoute';

// Create a router
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          }
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 5,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
