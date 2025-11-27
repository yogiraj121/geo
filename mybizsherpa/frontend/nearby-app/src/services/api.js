export async function getCurrentPosition() {
  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation not supported in this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve({ latitude, longitude });
      },
      (err) => {
        reject(new Error(err.message || "Failed to get location"));
      }
    );
  });
}

export async function registerUserApi({ name, email, password, radiusKm }) {
  const { latitude, longitude } = await getCurrentPosition();

  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      latitude,
      longitude,
      radiusKm,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to register user");
  }

  return res.json();
}

export async function fetchNearbyApi({ radiusKm }) {
  const { latitude, longitude } = await getCurrentPosition();

  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
    radiusKm: String(radiusKm),
  });

  const res = await fetch(`/api/users/nearby?${params.toString()}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load nearby users");
  }

  return res.json();
}

export async function updateLocationApi(userId) {
  const { latitude, longitude } = await getCurrentPosition();

  const res = await fetch(`/api/users/${userId}/location`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude,
      longitude,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update location");
  }

  return res.json();
}
