import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hotel, Lock, User } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
// import { auth } from "../utility/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(form, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 text-center border-b">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
            <Hotel className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Property Manager</h1>
          <p className="text-gray-600 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {loginMutation.isError && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
              Invalid username or password
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loginMutation.isPending ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
