# Backend

NestJS REST API for Centile Grid. Runs as a standalone HTTP server locally and deploys as an AWS Lambda function.

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm start:dev` | Start dev server with ts-node      |
| `pnpm build`     | Compile TypeScript to `dist/`      |
| `pnpm start`     | Start compiled server from `dist/` |
| `pnpm test`      | Run unit tests                     |
| `pnpm lint`      | Lint source files                  |
| `pnpm typecheck` | Type-check without emitting        |
| `pnpm clean`     | Remove `dist/`                     |

## Environment Variables

| Variable   | Default                          | Description                                                                |
| ---------- | -------------------------------- | -------------------------------------------------------------------------- |
| `PORT`     | `3000`                           | HTTP listen port                                                           |
| `DATA_DIR` | `<__dirname>/../data` (dev path) | Directory containing CSV data files; set to `/var/task/src/data` on Lambda |

## API

| Method | Path      | Description                                 |
| ------ | --------- | ------------------------------------------- |
| GET    | `/health` | Health check — returns `{ "status": "ok" }` |

## Deployment

Deployed to AWS Lambda (eu-central-1) via Serverless Framework. GitHub Actions deploys automatically on every push to `main`.

### One-time AWS setup

**1. Create AWS account** at https://aws.amazon.com. Set a billing alert under Billing → Budgets to avoid surprises.

**2. Create OIDC Identity Provider** (allows GitHub Actions to authenticate without stored secrets):

- AWS Console → IAM → Identity providers → Add provider
- Type: OpenID Connect
- URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

**3. Create IAM Role for GitHub Actions:**

- IAM → Roles → Create role → Trusted entity: Web identity
- Identity provider: `token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`
- Set GitHub workspace name, repo name (centile-grid) and branch name (main)
- Attach policy: `AdministratorAccess`
- Name: `github-actions-centile-grid`
- Copy the Role ARN

**4. Add GitHub secret:**

- Repo → Settings → Secrets and variables → Actions → New secret
- Name: `AWS_ROLE_ARN`, value: the Role ARN from step 3

### First manual deploy

Install AWS CLI, then configure credentials:

```bash
# AWS Console → account menu → Security credentials → Access keys → Create access key (CLI)
aws configure
# enter Access Key ID, Secret Access Key, region: eu-central-1, output: json
```

Deploy from this directory:

```bash
pnpm exec serverless deploy --stage prod
```

Serverless prints the API Gateway URL on success. All subsequent deploys on `main` push are automatic.
