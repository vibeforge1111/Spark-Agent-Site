# Spark Security

Human page: `/docs/security/`

Spark is local-first. Installers should be inspectable, secrets should stay local, and support reports should be reviewed before sharing.

## Checks

```bash
spark security audit
spark verify --provenance
spark verify --installers --hosted-installers
spark secrets list
spark support bundle
```

## What Spark Can Do

- 1: Spark can talk and remember.
- 2: Spark can start missions after an explicit request.
- 3: Recommended. Spark can inspect public links, docs, and repos when asked, and can use Spawner for explicit missions.
- 4: For trusted local use. Spark may use broader operating-system tools, but should still ask before destructive actions.

Change what Spark can do in Telegram:

```text
/access 3
```

## Never Share

- Telegram bot tokens
- LLM provider API keys
- Local env files
- Personal memory
- Private repo content
- Raw logs that have not been reviewed

## Upstream Fixes

If Spark Doctor finds a fix that could help other users, it may draft an upstream report or PR candidate. The user must review and opt in before sharing anything.
