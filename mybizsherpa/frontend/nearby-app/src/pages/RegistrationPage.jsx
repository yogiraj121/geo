import React, { useState } from "react";
import { registerUserApi } from "../services/api";

export default function RegistrationPage({ onRegisterSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUserApi({
        name,
        email,
        password,
        info: info || undefined,
        radiusKm: Number(radiusKm) || 5,
      });

      // Call success callback with user data and nearby users
      onRegisterSuccess({
        user: data.user,
        nearby: data.nearby || null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Register to find nearby users in your area
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="Re-enter your password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              About (Optional)
            </label>
            <textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-slate-500 mt-1">
              {info.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Search Radius (km)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Show users within {radiusKm} km of your location
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-950/40 border border-red-900 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Register & Find Nearby Users"
            )}
          </button>

          <p className="text-xs text-center text-slate-500 mt-4">
            By registering, you allow us to use your location to find nearby
            users. Your location is only used for this purpose.
          </p>
        </form>
      </div>
    </div>
  );
}

