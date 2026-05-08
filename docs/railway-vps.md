# Spark Railway and VPS Operations

Human page: `/docs/railway-vps/`

Use this when Spark is hosted outside a personal laptop. Local install is still
the normal first path. Railway or a VPS is for always-on Telegram, Mission
Control, and persistent workspaces.

## Recommended Shape

Run Spark as two services:

- Spark Live / Spawner service: public Mission Control, workspaces, providers,
  previews, and board state.
- Spark Telegram Bot service: Telegram long polling, access control, and the
  private mission relay.

Keep both services on the same private network. Use private service URLs for
service-to-service calls and a protected public Spawner URL only for human
mission links.

## Railway Basics

- Deploy application code with `railway up`, not `railway deploy`. Railway uses
  `railway deploy` for templates.
- Use `railway logs --lines 100` or `railway service logs --lines 100` for a
  bounded log pull before streaming.
- Configure a healthcheck path that returns HTTP 200 when Spark is ready.
- Listen on Railway's `PORT` variable.
- Use `RAILWAY_HEALTHCHECK_TIMEOUT_SEC` when the first boot needs more time.
- Use `RAILWAY_DEPLOYMENT_OVERLAP_SECONDS` when you want old and new deploys to
  overlap during activation.

Railway references:

- `https://docs.railway.com/cli/deploying`
- `https://docs.railway.com/reference/healthchecks`
- `https://docs.railway.com/networking/private-networking`
- `https://docs.railway.com/reference/variables`

## Required Environment

Use long random values for every key. Do not reuse browser passwords or personal
desktop tokens.

Spawner service:

```text
SPARK_HOSTED_PRIVATE_PREVIEW=1
SPARK_WORKSPACE_ID=<workspace-id>
SPARK_ALLOWED_HOSTS=<public-spawner-host>
SPARK_UI_API_KEY=<browser-login-key>
SPARK_BRIDGE_API_KEY=<shared-bot-spawner-key>
SPAWNER_STATE_DIR=/data/spawner
SPARK_WORKSPACE_ROOT=/data/spark/workspaces
CODEX_HOME=/data/codex
```

Telegram bot service:

```text
TELEGRAM_BOT_TOKEN=<botfather-token>
SPARK_TELEGRAM_ADMIN_IDS=<telegram-user-id>
TELEGRAM_RELAY_HOST=::
TELEGRAM_RELAY_PORT=8788
SPAWNER_UI_URL=http://<spawner-service>.railway.internal:<port>
SPAWNER_UI_PUBLIC_URL=https://<protected-spawner-public-domain>
MISSION_CONTROL_WEBHOOK_URLS=http://<bot-service>.railway.internal:8788/spawner-events
SPARK_BRIDGE_API_KEY=<same-shared-bot-spawner-key>
```

Provider keys:

```text
ZAI_API_KEY=<key>
OPENAI_API_KEY=<key>
ANTHROPIC_API_KEY=<key>
OPENROUTER_API_KEY=<key>
KIMI_API_KEY=<key>
MINIMAX_API_KEY=<key>
HUGGINGFACE_API_KEY=<key>
```

Only configure the providers you actually use.

## Provider Rules

- Hosted Spark should use API-key providers or reachable private model endpoints.
- Codex CLI can run hosted with a dedicated `OPENAI_API_KEY` and persistent
  `CODEX_HOME`.
- Claude hosted use should use `ANTHROPIC_API_KEY`.
- Do not copy personal Codex OAuth, Claude Code OAuth, browser profiles,
  `~/.codex`, or local desktop auth into Railway or a VPS.
- Ollama, LM Studio, vLLM, TGI, and llama.cpp must be reachable network
  endpoints. Do not expect the Spark app container to download and serve large
  local models.

## Production Smoke

First check the public surface:

```bash
curl -fsS https://<spawner-public-domain>/api/health/live
curl -fsS https://<spawner-public-domain>/api/providers
curl -fsS https://<spawner-public-domain>/api/mission-control/board
```

Then check Telegram:

```text
/diagnose
/run Build a tiny static HTML page called Spark Production Smoke. It should have one file, index.html, with a dark Mission Control panel, a green "Spark Live OK" status, and the text "Telegram to Spawner relay worked on May 8, 2026". Do not add package files, do not install dependencies, and keep it simple enough to finish fast.
```

Pass criteria:

- Spawner UI is reachable.
- `/diagnose` shows the current Telegram user is allowed.
- Spawner mission ping succeeds for at least one configured Mission provider.
- The mission completes.
- The workspace contains exactly the expected static file shape when the prompt
  asked for one file.

## Common Fixes

### Spawner UI is HTTP 401

Check that `SPARK_UI_API_KEY` is set for browser access and that the bot uses
`SPARK_BRIDGE_API_KEY` for service-to-service calls. Do not make the Spawner
publicly unauthenticated to fix this.

### Mission board is unreachable

Check `SPAWNER_UI_URL` from the bot service. On Railway this should normally be
the private DNS URL, not the public domain.

### Telegram links open an internal hostname

Set `SPAWNER_UI_PUBLIC_URL` to the protected public Spawner domain. Keep
`SPAWNER_UI_URL` private.

### Plain chat fails but missions work

Treat chat and Mission providers separately. `/run` can still be healthy when
plain chat has a provider timeout. Fix the chat provider key, base URL, or model,
then restart the Telegram service.

### Provider CLI exists but cannot complete

Installed does not mean authenticated. Use hosted API keys. Do not copy personal
desktop OAuth state into a hosted service.

### A deploy restarts but old code still appears

Check deployment IDs, service selection, and logs. On Railway, use `railway up`
for code deploys and `railway redeploy` only when applying environment changes
or restarting the same deployed code.

## VPS Notes

Use the same two-service shape with Docker Compose or a process supervisor.

- Keep persistent directories on a mounted volume.
- Put Nginx, Caddy, or another reverse proxy in front of Spawner.
- Terminate TLS at the proxy.
- Keep the bot relay private to the host or overlay network.
- Back up `/data/spawner`, `/data/spark/workspaces`, and provider config before
  upgrades.

## Release Rule

Do not point the public installer or `agent.sparkswarm.ai` release manifest at a
new Spark CLI commit until registry pins, provenance, installer verification,
Railway smoke, and at least one Telegram `/run` smoke are green.
