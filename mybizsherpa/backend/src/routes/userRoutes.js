const express = require("express");
const {
  registerUser,
  getNearbyUsers,
  getNearbyFromUser,
  updateUserLocation,
} = require("../controllers/userController");

const router = express.Router();

// Register a user (and optionally return nearby users in given radius)
router.post("/register", registerUser);

// Nearby user search (for an already-known location)
router.get("/nearby", getNearbyUsers);

// Update user location
router.put("/:id/location", updateUserLocation);

// Nearby relative to one fixed user (by id)
router.get("/:id/nearby", getNearbyFromUser);

module.exports = router;
