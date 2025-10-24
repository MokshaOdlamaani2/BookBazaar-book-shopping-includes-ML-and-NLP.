import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded contains { id, email, name }
    next();
  } catch (error) {
    res.status(401);
    if (error.name === "TokenExpiredError") throw new Error("Token expired");
    else throw new Error("Not authorized, token invalid");
  }
});

export { protect };
