import React from "react";

function formatDistance(km) {
  if (km == null) return "-";
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(2)} km`;
}

export function NearbyList({ nearby }) {
  if (!nearby || !nearby.users) return null;

  if (!nearby.users.length) {
    return (
      <p className="mt-4 text-sm text-slate-300">
        No users found in this radius.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-50">
          Found {nearby.count} user{nearby.count !== 1 ? "s" : ""}
        </h2>
        {nearby.center && (
          <p className="text-xs text-slate-400">
            Center: {nearby.center.latitude.toFixed(4)},{" "}
            {nearby.center.longitude.toFixed(4)}
          </p>
        )}
      </div>
      {nearby.users.map((u) => {
        const [lng, lat] = u.location?.coordinates || [];
        return (
          <div
            key={u._id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-50">{u.name}</p>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {u._id}
                  </span>
                </div>
                {u.email && (
                  <p className="text-xs text-slate-400 mb-1">
                    Email: {u.email}
                  </p>
                )}
                {u.info && (
                  <p className="text-sm text-slate-400 mb-2">{u.info}</p>
                )}
                {u.location && (
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>
                      <span className="text-slate-400">Location:</span>{" "}
                      {lat?.toFixed(6)}, {lng?.toFixed(6)}
                    </p>
                    <p>
                      <span className="text-slate-400">Coordinates:</span> [
                      {lng?.toFixed(6)}, {lat?.toFixed(6)}]
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-medium text-emerald-400">
                  {formatDistance(u.distanceKm)}
                </p>
                <p className="text-xs text-slate-500 mt-1">away</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
