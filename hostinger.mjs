// Hostinger's Node.js Web App entry file, run from the workspace root.
process.env.EXTERNAL_DEPLOYMENT = "true";
process.env.NODE_ENV = "production";
await import("./artifacts/api-server/dist/index.mjs");