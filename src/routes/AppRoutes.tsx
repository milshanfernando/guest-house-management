import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Reservations from "../pages/Reservations";
import Rooms from "../pages/Rooms";
import IncomesPage from "../pages/IncomesPage";
import TodayMovements from "../pages/TodayMovements";
import Guests from "../pages/Guests";
import ExpensesPage from "../pages/ExpensesPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="incomes" element={<IncomesPage />} />
        <Route path="today-movements" element={<TodayMovements />} />
        <Route path="guests" element={<Guests />} />
        <Route path="expenses" element={<ExpensesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
