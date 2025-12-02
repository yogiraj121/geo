const User = require("../models/User");
const { haversineDistanceKm } = require("../utils/geo");

// POST /api/users/register
async function registerUser(req, res, next) {
  try {
    const { name, email, password, info, latitude, longitude, radiusKm } = req.body || {};

    if (!name || !email || !password || latitude == null || longitude == null)
      return res.status(400).json({ message: "Missing required fields: name, email, password, latitude, longitude." });

    // 🧩 Validate Email & Password
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ message: "Invalid email format." });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters long." });

    // 🧩 Validate Coordinates
    const lat = +latitude, lng = +longitude;
    if ([lat, lng].some(isNaN))
      return res.status(400).json({ message: "Latitude and longitude must be numbers." });
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
      return res.status(400).json({ message: "Latitude must be -90 to 90, longitude -180 to 180." });

    // 🧩 Sanitize Inputs
    const safeUserData = {
      name: name.trim().slice(0, 80),
      email: email.trim().toLowerCase(),
      password,
      info: info?.trim().slice(0, 200),
      location: { type: "Point", coordinates: [lng, lat] },
    };

    // 🧩 Check for Duplicate Email
    if (await User.exists({ email: safeUserData.email }))
      return res.status(409).json({ message: "Email already registered." });

    // 🧩 Create New User (password hashed by pre-save)
    const user = await User.create(safeUserData);
    const userObj = (({ _id, name, email, info, location, createdAt, updatedAt }) => ({
      _id, name, email, info, location, createdAt, updatedAt
    }))(user.toObject());

    // 🌍 Optional Nearby Users
    if (radiusKm != null) {
      const radius = +radiusKm;
      if (isNaN(radius) || radius <= 0 || radius > 50)
        return res.status(400).json({ message: "radiusKm must be a number between 0 and 50." });

      const nearby = await User.find({
        _id: { $ne: user._id },
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radius * 1000,
          },
        },
      }).lean();

      const users = nearby.map(u => ({
        ...u,
        distanceKm: haversineDistanceKm(lat, lng, u.location.coordinates[1], u.location.coordinates[0]),
      }));

      return res.status(201).json({
        user: userObj,
        nearby: { center: { latitude: lat, longitude: lng }, radiusKm: radius, count: users.length, users },
      });
    }

    // ✅ Success Response (no nearby)
    res.status(201).json({ user: userObj });

  } catch (err) {
    next(err);
  }
}

// GET /api/users/nearby?lat=..&lng=..&radiusKm=..
async function getNearbyUsers(req, res, next) {
  try {
    const { lat, lng, radiusKm } = req.query;

    if (lat === undefined || lng === undefined || radiusKm === undefined) {
      return res.status(400).json({
        message: "Missing query params. Please provide lat, lng and radiusKm.",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radius = parseFloat(radiusKm);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      Number.isNaN(radius)
    ) {
      return res.status(400).json({
        message: "Invalid query params. lat, lng and radiusKm must be numbers.",
      });
    }

    if (radius <= 0 || radius > 50) {
      return res.status(400).json({
        message: "radiusKm must be between 0 and 50.",
      });
    }

    // Convert radiusKm to meters for MongoDB $near
    const radiusMeters = radius * 1000;

    const rawNearby = await User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude], // [lng, lat]
          },
          $maxDistance: radiusMeters,
        },
      },
    });

    // Add distanceKm from fixed point (lat,lng) to each user and ensure all data is included (no password)
    const nearbyUsers = rawNearby.map((user) => {
      const [userLng, userLat] = user.location.coordinates;
      const distanceKm = haversineDistanceKm(
        latitude,
        longitude,
        userLat,
        userLng
      );
      const userObj = user.toObject();
      return {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        info: userObj.info,
        location: userObj.location,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt,
        distanceKm: distanceKm,
      };
    });

    return res.json({
      center: { latitude, longitude },
      radiusKm: radius,
      count: nearbyUsers.length,
      users: nearbyUsers,
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/users/:id/nearby?radiusKm=..
// Uses one fixed user (by id) as center and shows how far others are
async function getNearbyFromUser(req, res, next) {
  try {
    const { id } = req.params;
    const { radiusKm } = req.query;

    if (!radiusKm) {
      return res.status(400).json({
        message: "Missing query param radiusKm.",
      });
    }

    const radius = parseFloat(radiusKm);

    if (Number.isNaN(radius)) {
      return res.status(400).json({
        message: "Invalid radiusKm. It must be a number.",
      });
    }

    if (radius <= 0 || radius > 50) {
      return res.status(400).json({
        message: "radiusKm must be between 0 and 50.",
      });
    }

    const centerUser = await User.findById(id);

    if (!centerUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const [lng, lat] = centerUser.location.coordinates;
    const radiusMeters = radius * 1000;

    const rawNearby = await User.find({
      _id: { $ne: centerUser._id },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radiusMeters,
        },
      },
    });

    const nearbyUsers = rawNearby.map((user) => {
      const [userLng, userLat] = user.location.coordinates;
      const distanceKm = haversineDistanceKm(lat, lng, userLat, userLng);
      const userObj = user.toObject();
      return {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        info: userObj.info,
        location: userObj.location,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt,
        distanceKm: distanceKm,
      };
    });

    return res.json({
      centerUser,
      center: { latitude: lat, longitude: lng },
      radiusKm: radius,
      count: nearbyUsers.length,
      users: nearbyUsers,
    });
  } catch (err) {
    return next(err);
  }
}

// PUT /api/users/:id/location
// Body: { latitude, longitude }
// Updates a user's location
async function updateUserLocation(req, res, next) {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body || {};

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Missing body fields. Please provide latitude and longitude.",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        message: "Invalid coordinates. latitude and longitude must be numbers.",
      });
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        message: "Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        location: {
          type: "Point",
          coordinates: [lng, lat], // [longitude, latitude]
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userObj = user.toObject();
    return res.json({
      message: "Location updated successfully.",
      user: {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        info: userObj.info,
        location: userObj.location,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerUser,
  getNearbyUsers,
  getNearbyFromUser,
  updateUserLocation,
};
