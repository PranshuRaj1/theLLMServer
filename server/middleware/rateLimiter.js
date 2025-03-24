import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000 * 60, // 1 hr
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

export default limiter;
