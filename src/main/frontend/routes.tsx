import { createBrowserRouter, Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import MainLayout from './components/MainLayout.js';
import HomePage from './views/home.js';
import LoginPage from './views/login.js';
import RegisterPage from './views/register/index.js';
import AdminDashboard from './views/admin/index.js';
import BarberDashboard from './views/barber/index.js';
import OwnerDashboard from './views/owner/index.js';
import CustomerDashboard from './views/customer/index.js';

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/customer', element: <Navigate to="/register?type=customer" replace /> },
  { path: '/register/barber', element: <Navigate to="/register?type=barber" replace /> },
  { path: '/register/owner', element: <Navigate to="/register?type=owner" replace /> },
  {
    element: <MainLayout />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/barber', element: <BarberDashboard /> },
      { path: '/owner', element: <OwnerDashboard /> },
      { path: '/customer', element: <CustomerDashboard /> },
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;
