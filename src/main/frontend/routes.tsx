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
import AdminBookingsPage from './views/admin/bookings.js';
import AdminPaymentsPage from './views/admin/payments.js';
import AdminReportsPage from './views/admin/reports.js';
import AdminOperationsPage from './views/admin/operations.js';
import AdminAuditPage from './views/admin/audit.js';
import BarberDashboard from './views/barber/index.js';
import BarberBookingsPage from './views/barber/bookings.js';
import BarberSchedulePage from './views/barber/schedule.js';
import BarberHistoryPage from './views/barber/history.js';
import BarberProfilePage from './views/barber/profile.js';
import OwnerDashboard from './views/owner/index.js';
import OwnerProfilePage from './views/owner/profile.js';
import OwnerStaffPage from './views/owner/staff.js';
import OwnerBookingsPage from './views/owner/bookings.js';
import OwnerReportsPage from './views/owner/reports.js';
import CustomerDashboard from './views/customer/index.js';
import CustomerAddressesPage from './views/customer/addresses.js';
import CustomerProfilePage from './views/customer/profile.js';
import NewBookingPage from './views/customer/bookings-new.js';
import CustomerBookingsPage from './views/customer/bookings.js';
import CustomerBookingDetailPage from './views/customer/booking-detail.js';
import BarbershopDetailPage from './views/customer/barbershop-detail.js';
import JoinBarberPage from './views/register/join-barber.js';
import TrackingPage from './views/tracking.js';

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/customer', element: <Navigate to="/register?type=customer" replace /> },
  { path: '/register/barber', element: <Navigate to="/register?type=owner" replace /> },
  { path: '/register/owner', element: <Navigate to="/register?type=owner" replace /> },
  { path: '/join/barber/:token', element: <JoinBarberPage /> },
  {
    element: <MainLayout />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/registrations', element: <AdminRegistrationsPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/services', element: <AdminServicesPage /> },
      { path: '/admin/bookings', element: <AdminBookingsPage /> },
      { path: '/admin/payments', element: <AdminPaymentsPage /> },
      { path: '/admin/reports', element: <AdminReportsPage /> },
      { path: '/admin/operations', element: <AdminOperationsPage /> },
      { path: '/admin/audit', element: <AdminAuditPage /> },
      { path: '/barber', element: <BarberDashboard /> },
      { path: '/barber/bookings', element: <BarberBookingsPage /> },
      { path: '/barber/schedule', element: <BarberSchedulePage /> },
      { path: '/barber/history', element: <BarberHistoryPage /> },
      { path: '/barber/profile', element: <BarberProfilePage /> },
      { path: '/owner', element: <OwnerDashboard /> },
      { path: '/owner/profile', element: <OwnerProfilePage /> },
      { path: '/owner/staff', element: <OwnerStaffPage /> },
      { path: '/owner/bookings', element: <OwnerBookingsPage /> },
      { path: '/owner/reports', element: <OwnerReportsPage /> },
      { path: '/customer', element: <CustomerDashboard /> },
      { path: '/customer/addresses', element: <CustomerAddressesPage /> },
      { path: '/customer/profile', element: <CustomerProfilePage /> },
      { path: '/customer/bookings/new', element: <NewBookingPage /> },
      { path: '/customer/bookings', element: <CustomerBookingsPage /> },
      { path: '/customer/bookings/:id', element: <CustomerBookingDetailPage /> },
      { path: '/customer/bookings/:id/tracking', element: <TrackingPage /> },
      { path: '/barber/bookings/:id/tracking', element: <TrackingPage /> },
      { path: '/customer/barbershops/:id', element: <BarbershopDetailPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;
