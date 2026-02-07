import express, { Express } from "express";
import path from "path";
import helmet from "helmet";
import xss from "xss-clean";
import ExpressMongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";
import httpStatus from "http-status";
import session from "express-session";
import config from "./config";
import { morgan } from "./modules/logger";
import { authLimiter } from "./modules/utils";
import { ApiError, errorConverter, errorHandler } from "./modules/errors";
import routes from "./routes/v1";

const app: Express = express();

if (process.env.NODE_ENV !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "https://images.unsplash.com", "https://flagcdn.com"
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);


// Enable CORS
app.use(cors());
app.options("*", cors());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Sanitize request data
app.use(xss());
app.use(ExpressMongoSanitize());

// Gzip compression
app.use(compression());

// Session management
app.use(
  session({
    secret: config.jwt.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Limit repeated failed requests to auth endpoints in non-development environments
if (process.env.NODE_ENV !== "development") {
  app.use("/api/v1/auth", authLimiter);
}

// API routes
app.use("/api/v1", routes);

// Serve the React app from the build directory
app.use(express.static(path.join(__dirname, "../client")));

app.use((req, res, next) => {
  // Check if request starts with /api but wasn't handled by API routes
  if (req.path.startsWith('/api')) {
    return next(new ApiError(httpStatus.NOT_FOUND, "API endpoint not found"));
  }
  next();
});

// SPA fallback (must point to dist/index.html)
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../client", "index.html")
  );
});

// Default route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: `ping me, server is running on port ${config.port}` });
});

// Send back a 404 error for any unknown API request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Request Endpoint Not found"));
});

// Convert errors to ApiError, if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

export default app;
