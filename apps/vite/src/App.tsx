import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import type {
  RouteHealth,
  RouteLoginResponse,
  RouteRegisterResponse,
  RouteUserCurrentResponse,
} from "@apps/hono";

import "./App.css";

const API_URL = "http://localhost:3000";

enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

interface User {
  email: string;
  name?: string;
  role?: UserRole;
}

async function fetchClientSide<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  // Bearer token
  const token = localStorage.getItem("auth_token");
  if (token) {
    options = {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${token}` },
    };
  }
  const url = new URL(path, API_URL);
  return fetch(url, options).then((res) => res.json() as Promise<T>);
}

function App() {
  // Backend health check state
  const [data, setData] = useState<RouteHealth | null>(null);

  // Auth state
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifyEmailSuccess, setVerifyEmailSuccess] = useState<boolean | null>(
    null
  );

  // Form state
  const [view, setView] = useState<"login" | "signup" | "home">("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Fetch current user
  useEffect(() => {
    fetchClientSide<RouteUserCurrentResponse>("/api/v1/user/current")
      .then((data) => {
        console.log(data);
        setUser({ ...data, role: data.role as UserRole });
      })
      .catch(console.error);
  }, []);

  // Check for verify-email-success query parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifySuccess = urlParams.get("verify-email-success");

    if (verifySuccess === "true") {
      setVerifyEmailSuccess(true);
      // Remove the query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch backend health status
  useEffect(() => {
    fetchClientSide<RouteHealth>("/api/v1/health")
      .then(setData)
      .catch(console.error);
  }, []);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const response = await fetchClientSide<RouteLoginResponse>(
        "/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.error) {
        setAuthError(response.error);
      } else if (response.token) {
        setToken(response.token);
        setView("home");
        setUser({ email });
      }
    } catch (err) {
      setAuthError("Failed to connect to the server");
    }
  };

  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const response = await fetchClientSide<RouteRegisterResponse>(
        "/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      if (response.error) {
        setAuthError(response.error);
      } else if (response.token) {
        if (response.emailVerificationNeeded) {
          setAuthError(
            "Please check your email to verify your account before logging in"
          );
          setView("login");
        } else {
          setToken(response.token);
          setView("home");
          setUser({ email, name });
        }
      }
    } catch (err) {
      setAuthError("Failed to connect to the server");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  // Render login form
  const renderLoginForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to your account
          </h2>
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setView("home")}
          >
            Back to home
          </a>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => setView("signup")}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </button>
          </p>
          {authError && (
            <div className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">
              {authError}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render signup form
  const renderSignupForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setView("home")}
          >
            Back to home
          </a>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="signup-email" className="sr-only">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="sr-only">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setView("login")}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </button>
          </p>
          {authError && (
            <div className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">
              {authError}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render home view
  const renderHome = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center space-x-4">
          <a
            href="https://vite.dev"
            target="_blank"
            className="hover:opacity-80"
          >
            <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            className="hover:opacity-80"
          >
            <img src={reactLogo} className="h-16 w-16" alt="React logo" />
          </a>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900">
          {data?.message || "Loading..."}
        </h1>

        {verifyEmailSuccess && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
            Your email has been successfully verified! You can now log in.
          </div>
        )}

        {token ? (
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.name || user?.email || "User"}!
            </h2>
            <p className="mt-2 text-gray-600">
              You are logged in with {user?.email} as {user?.role}
            </p>
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <button
              onClick={() => setView("login")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
            <button
              onClick={() => setView("signup")}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  );

  // Main render logic
  return (
    <>
      {view === "login" && renderLoginForm()}
      {view === "signup" && renderSignupForm()}
      {view === "home" && renderHome()}
    </>
  );
}

export default App;
