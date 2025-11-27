import React, { useState } from "react";
import { fetchNearbyApi, updateLocationApi } from "../services/api";
import { NearbyList } from "../components/NearbyList";

export default function NearbyUsersPage({ user, initialNearby, onUserUpdate }) {
  const [radiusKm, setRadiusKm] = useState(5);
  const [loading, setLoading] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nearby, setNearby] = useState(initialNearby);
  const [currentUser, setCurrentUser] = useState(user);

  async function handleRefresh() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await fetchNearbyApi({
        radiusKm: Number(radiusKm) || 5,
      });
      setNearby(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLocation() {
    if (!currentUser?._id) {
      setError("User ID not found. Please register again.");
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingLocation(true);
    try {
      const data = await updateLocationApi(currentUser._id);
      setCurrentUser(data.user);
      setSuccess("Location updated successfully! Your new location has been saved.");
      
      // Also refresh nearby users with new location
      setTimeout(async () => {
        try {
          const nearbyData = await fetchNearbyApi({
            radiusKm: Number(radiusKm) || 5,
          });
          setNearby(nearbyData);
        } catch (err) {
          // Silently fail - user can manually refresh
        }
      }, 500);
      
      // Call parent callback if provided
      if (onUserUpdate) {
        onUserUpdate(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingLocation(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">
                Welcome, {currentUser?.name || user?.name}!
              </h1>
              {(currentUser?.email || user?.email) && (
                <p className="text-sm text-slate-400 mt-1">
                  {currentUser?.email || user?.email}
                </p>
              )}
              {currentUser?.location && (
                <p className="text-xs text-slate-500 mt-1">
                  Location: {currentUser.location.coordinates[1]?.toFixed(6)},{" "}
                  {currentUser.location.coordinates[0]?.toFixed(6)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-300">Radius:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="text-sm text-slate-400">km</span>
              </div>
              <button
                onClick={handleUpdateLocation}
                disabled={updatingLocation}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-50 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                title="Update your location if you've moved to a new place"
              >
                {updatingLocation ? (
                  <span className="flex items-center gap-2">
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
                    Updating...
                  </span>
                ) : (
                  "Update My Location"
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Loading..." : "Refresh Nearby"}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-emerald-950/40 border border-emerald-900 px-4 py-3">
            <p className="text-sm text-emerald-400">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-950/40 border border-red-900 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Nearby Users List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-6 shadow-xl">
          <NearbyList nearby={nearby} />
        </div>

        {/* Info Card */}
        {nearby && nearby.count === 0 && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
            <p className="text-sm text-slate-400 text-center">
              No users found in your radius. Try increasing the radius or check
              back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

