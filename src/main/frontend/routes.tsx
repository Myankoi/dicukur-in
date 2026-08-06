import { createBrowserRouter, Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import MainLayout from './components/MainLayout.js';
import HomePage from './views/home.js';
import LoginPage from './views/login.js';
import RegisterPage from './views/register/index.js';
import AdminDashboard from './views/admin/index.js';
import AdminRegistrationsPage from './views/admin/registrations.js';
import AdminUsersPage from './views/admin/users.js';
import AdminServicesPage from './views/admin/services.js';
import BarberDashboard from './views/barber/index.js';
import OwnerDashboard from './views/owner/index.js';
import OwnerProfilePage from './views/owner/profile.js';
import OwnerStaffPage from './views/owner/staff.js';
import OwnerBookingsPage from './views/owner/bookings.js';
import OwnerReportsPage from './views/owner/reports.js';
import CustomerDashboard from './views/customer/index.js';
import CustomerAddressesPage from './views/customer/addresses.js';
import NewBookingPage from './views/customer/bookings-new.js';
import CustomerBookingsPage from './views/customer/bookings.js';
import BarbershopDetailPage from './views/customer/barbershop-detail.js';

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/customer', element: <Navigate to="/register?type=customer" replace /> },
  { path: '/register/barber', element: <Navigate to="/register?type=owner" replace /> },
  { path: '/register/owner', element: <Navigate to="/register?type=owner" replace /> },
  {
    element: <MainLayout />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/registrations', element: <AdminRegistrationsPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/services', element: <AdminServicesPage /> },
      { path: '/barber', element: <BarberDashboard /> },
      { path: '/owner', element: <OwnerDashboard /> },
      { path: '/owner/profile', element: <OwnerProfilePage /> },
      { path: '/owner/staff', element: <OwnerStaffPage /> },
      { path: '/owner/bookings', element: <OwnerBookingsPage /> },
      { path: '/owner/reports', element: <OwnerReportsPage /> },
      { path: '/customer', element: <CustomerDashboard /> },
      { path: '/customer/addresses', element: <CustomerAddressesPage /> },
      { path: '/customer/bookings/new', element: <NewBookingPage /> },
      { path: '/customer/bookings', element: <CustomerBookingsPage /> },
      { path: '/customer/barbershops/:id', element: <BarbershopDetailPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;
