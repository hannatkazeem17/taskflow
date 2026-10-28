import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BoardPage } from './pages/BoardPage';
import { MyTasksPage } from './pages/MyTasksPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'workspaces', element: <WorkspacesPage /> },
          { path: 'workspaces/:workspaceId', element: <ProjectsPage /> },
          { path: 'projects/:projectId', element: <BoardPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);