import express, { type Express } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();
const externalDeployment = process.env.EXTERNAL_DEPLOYMENT === "true";

if (externalDeployment) {
  for (const key of [
    "EXTERNAL_CLERK_PUBLISHABLE_KEY",
    "EXTERNAL_CLERK_SECRET_KEY",
    "EXTERNAL_ADMIN_USER_ID",
    "NEON_DATABASE_URL",
    "BREVO_API_KEY",
    "BREVO_FROM_EMAIL",
  ]) {
    if (!process.env[key]) throw new Error(`${key} is required for external deployment.`);
  }
  if (process.env.NODE_ENV !== "production") {
    throw new Error("External deployment requires NODE_ENV=production.");
  }
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

if (!externalDeployment) app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  clerkMiddleware((req) => ({
    publishableKey: externalDeployment
      ? process.env.EXTERNAL_CLERK_PUBLISHABLE_KEY
      : publishableKeyFromHost(
          getClerkProxyHost(req) ?? "",
          process.env.CLERK_PUBLISHABLE_KEY,
        ),
    ...(externalDeployment ? { secretKey: process.env.EXTERNAL_CLERK_SECRET_KEY } : {}),
  })),
);

app.use("/api", router);

if (externalDeployment) {
  const siteDir = path.resolve(
    process.cwd(),
    "artifacts/greyton-murder-mysteries/dist/public",
  );
  const indexFile = path.join(siteDir, "index.html");
  if (!existsSync(indexFile)) {
    throw new Error("Website build is missing. Run the external build before starting.");
  }
  app.use(express.static(siteDir, { index: false }));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api/") || path.extname(req.path)) return next();
    res.sendFile(indexFile);
  });
}

export default app;
