import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Dashboard imports
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardProjects from './pages/dashboard/DashboardProjects';
import DashboardAddProject from './pages/dashboard/DashboardAddProject';
import DashboardEditProject from './pages/dashboard/DashboardEditProject';
import DashboardVisitProjects from './pages/dashboard/DashboardVisitProjects';
import DashboardProfile from './pages/dashboard/DashboardProfile';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';
import DashboardViewProject from './pages/dashboard/DashboardViewProject';
import AdminPage from './pages/admin/AdminPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/get-started',
    element: <SignUpPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/signin',
    element: <SignInPage />,
  },
  {
    path: '/login',
    element: <SignInPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/projects/add-project',
    element: <DashboardAddProject />,
  },
  {
    path: '/add-project',
    element: <DashboardAddProject />,
  },
  {
    path: '/projects/edit-project/:id',
    element: <DashboardEditProject />,
  },
  {
    path: '/projects/edit/:id',
    element: <DashboardEditProject />,
  },
  {
    path: '/dashboard/projects/edit/:id',
    element: <DashboardEditProject />,
  },
  {
    path: '/project/view-project/:id',
    element: <DashboardViewProject />,
  },
  {
    path: '/project/view-project',
    element: <DashboardViewProject />,
  },
  {
    path: '/projects/view-project/:id',
    element: <DashboardViewProject />,
  },
  {
    path: '/projects/view-project',
    element: <DashboardViewProject />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: 'projects',
        element: <DashboardProjects />,
      },
      {
        path: 'analytics',
        element: <DashboardAnalytics />,
      },
      {
        path: 'visit-projects',
        element: <DashboardVisitProjects />,
      },
      {
        path: 'profile',
        element: <DashboardProfile />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
