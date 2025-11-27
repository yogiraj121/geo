import React, { useState } from "react";
import RegistrationPage from "./pages/RegistrationPage";
import NearbyUsersPage from "./pages/NearbyUsersPage";

export default function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);

  function handleRegisterSuccess(data) {
    setUserData(data);
    setIsRegistered(true);
  }

  function handleUserUpdate(updatedUser) {
    setUserData((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  }

  // Show registration page if not registered, otherwise show nearby users page
  if (!isRegistered) {
    return <RegistrationPage onRegisterSuccess={handleRegisterSuccess} />;
  }

  return (
    <NearbyUsersPage
      user={userData?.user}
      initialNearby={userData?.nearby}
      onUserUpdate={handleUserUpdate}
    />
  );
}
