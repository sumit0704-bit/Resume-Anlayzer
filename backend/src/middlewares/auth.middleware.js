const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  try {
    let token;

    // ✅ 1. Try getting token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // ✅ 2. If not in cookies, check Authorization header
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;

      // Format: Bearer TOKEN
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // ❌ If still no token
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    // ✅ Check blacklist
    const isBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Unauthorized: Token is invalid",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
}

module.exports = { authUser };