# Spark Commands

Use this when a human or coding agent needs the current command surface.

## First Day

```bash
spark setup
spark guide
spark recommend llms
spark live start
spark live status
spark providers status
spark providers test --role chat
spark verify --onboarding
```

`spark live` is the normal way to run Spark services quietly in the background.

## Telegram

- `/start`: show the basic command surface.
- `/myid`: show the Telegram ID used for admin setup.
- `/diagnose`: check Telegram, provider routing, memory, and Spawner.
- `/remember <note>`: save a useful memory.
- `/recall <topic>`: search memory.
- `/run <goal>`: start a Spawner mission.
- `/board`: show mission status.
- `/access 1|2|3|4`: change access level. Level 3 is recommended.

## Health

```bash
spark status
spark verify --deep
spark verify --provenance
spark verify --installers --hosted-installers
```

## Providers

```bash
spark providers list
spark providers status
spark providers test --role chat
spark setup --llm-provider codex
```

## Fixes

```bash
spark fix telegram
spark fix spawner
spark logs spark-telegram-bot --lines 80
spark logs spawner-ui --lines 80
```

## Security And Support

```bash
spark security audit
spark doctor llm "Telegram bot is quiet"
spark support bundle
```

Doctor and support reports must redact secrets. Logs are opt-in.
