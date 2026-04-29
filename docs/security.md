# Spark Security

Spark is local-first. Installers should be inspectable, secrets should stay local, and support reports should be reviewed before sharing.

## Checks

```bash
spark security audit
spark verify --provenance
spark verify --installers --hosted-installers
spark secrets list
spark support bundle
```

## Access Levels

- Level 1: Chat Only. Spark can talk and remember.
- Level 2: Build When Asked. Spark can start missions after an explicit request.
- Level 3: Research + Build. Recommended. Spark can inspect public links, docs, and repos when asked, and can use Spawner for explicit missions.
- Level 4: Full Access. For trusted local use. Spark may use broader operating-system tools, but should still ask before destructive actions.

Change access in Telegram:

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
