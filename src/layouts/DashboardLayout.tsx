import { useState } from "react";
import {
  Menu,
  X,
  Calendar,
  Bed,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Reservations", path: "/reservations", icon: Calendar },
  { name: "Rooms", path: "/rooms", icon: Bed },
  { name: "Payments", path: "/payments", icon: DollarSign },
  { name: "Incomes", path: "/incomes", icon: TrendingUp },
  { name: "Expenses", path: "/expenses", icon: TrendingDown },
  { name: "Assignments", path: "/assignments", icon: UserCheck },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50 w-64 h-full bg-white border-r border-gray-200
          transform transition-transform duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Property Manager</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4 px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>

            <div className="ml-auto flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
