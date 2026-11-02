import rateLimit from "express-rate-limit";

// Many mobile users in Ethiopia can share one public address, so per-address limits must leave
// room for real people. Duplicate applications are stopped per phone number, not here.
const jsonMessage = (message: string) => ({
  error: { message },
});

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 1000 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many requests. Please try again later."),
});

export const applicationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many applications from this address. Please try again later."),
});

export const inquiryRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many messages from this address. Please try again later."),
});

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many login attempts. Please try again later."),
});
