# External deployment: Hostinger Node.js Web App

This is an **alternative** deployment to Replit Publish. It serves the website
and `/api` from one Express process. Do not change the live DNS until login,
registrations, and notifications work on the new host. The original managed
production database must remain available until late registrations are checked
and reconciled after cutover.

## Deploy from GitHub (preferred for ongoing updates)

Repository: https://github.com/hurst2001-commits/murdermystery

The repository must have a first commit before Hostinger can import it. Use the
curated `deliverables/greyton-github-source.zip` as the source for that commit.
Extract it into a fresh checkout of the empty GitHub repository, then commit
and push to `main` with a GitHub account that has write access. Do **not** push
this Replit workspace's existing Git history: it tracks internal workspace
metadata, raw uploaded files, and an archive that do not belong in a public
deployment repository. The curated ZIP has no `.git` history, `.env` files,
workspace secrets, or `node_modules`.

In Hostinger, go to **Websites → Add Website → Node.js web app → Import Git
repository**. Connect the Hostinger GitHub App to the repository, then select:

- Branch: `main`
- Framework: **Express** or **Other**
- Root directory: `/` (keep the monorepo root so the workspace packages build)
- Node.js: **24**
- Package manager: **pnpm**
- Build script: `build:external`
- Entry file: `hostinger.mjs`
- Output directory: leave empty for a server app

Set the environment variables below in Hostinger's secure controls before the
first build. On this GitHub connection, pushes to `main` trigger automatic
install, build, and restart; see the deployment and runtime logs in Hostinger.
The generic **Websites → Git** feature only copies files and is not suitable for
this app's Node build. Do not point live DNS at the new app until the checks
under **Verify before DNS cutover** pass.

## Alternative: upload an archive

Use **Websites → Add Website → Deploy Web App**, and upload the source archive
from this workspace. On the build settings screen select:

- Application type: **Express** or **Other**
- Root directory: `/`
- Node.js: **24**
- Package manager: **pnpm** (the archive includes `pnpm-lock.yaml`)
- Build script: `build:external`
- Entry file: `hostinger.mjs`
- Output directory: leave empty for a server app

Do not upload `node_modules`, `.env` files, or workspace secrets. The archive
must contain the workspace root, including `package.json`, `pnpm-lock.yaml`,
`pnpm-workspace.yaml`, `hostinger.mjs`, `tsconfig*`, `lib/`, the website artifact,
the API artifact, and `attached_assets/generated_images/`. Hostinger installs
packages and builds the website and API during deployment.

## Environment variables

Add these in **Hostinger's Node.js Web App → Environment Variables**. Copy the
values through the hosts' secure controls yourself; never put secret values
in the source archive, chat, or a public repository.

| Name | Purpose |
| --- | --- |
| `EXTERNAL_CLERK_PUBLISHABLE_KEY` | Publishable key from your own Clerk application; used at build time and runtime |
| `EXTERNAL_CLERK_SECRET_KEY` | Secret key from that same Clerk application; server only |
| `EXTERNAL_ADMIN_USER_ID` | Clerk user ID of the one administrator allowed to access the admin API |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string; server only |
| `BREVO_API_KEY` | Brevo API key for transactional owner notifications; server only |
| `BREVO_FROM_EMAIL` | Sender address verified in Brevo for transactional email |

Hostinger supplies `PORT` at runtime. The entry file sets `NODE_ENV=production`
and `EXTERNAL_DEPLOYMENT=true` before starting the server. The build script
builds the website at `/` with the external Clerk publishable key and **without**
the Replit Clerk proxy. Production database selection uses Neon and fails if
the URL is missing; it never falls back to the managed database.

The new Clerk tenant does **not** automatically contain accounts from the
Replit-managed Clerk tenant. Create the administrator in the external Clerk
tenant, copy that user's ID from its Users page into `EXTERNAL_ADMIN_USER_ID`,
and verify the admin dashboard before cutover. Other signed-in accounts are
denied access to the admin API on the external deployment.

## Verify before DNS cutover

1. Use Hostinger's preview to confirm `/`, `/sign-in`, and `/api/healthz` load.
2. Sign in with the **external** Clerk account; verify admin access.
3. Submit a controlled registration, confirm it is in Neon, and verify the
   notification arrives through Brevo. Delete test records only with explicit
   authorization.
4. Confirm HTTPS and custom domain configuration in Hostinger, then switch
   traffic to the new app. Check the old production database for registrations
   submitted since the Neon copy and reconcile those without overwriting Neon.

SSH is not necessary for the upload-based deployment. The provided SSH port
timed out from the Replit workspace, so this document does not assume it works.