# Spark Commands

Use this when a human or coding assistant needs to know where Spark commands go.

Human page: `/docs/commands/`

## Command Surfaces

Spark has three command surfaces.

1. Computer terminal: CMD, PowerShell, macOS Terminal, Linux shell, WSL, Codex, Claude Code, or another local coding assistant.
2. Telegram bot: slash commands typed inside the Spark bot.
3. Mission Control: browser UI for Kanban, Canvas, and build progress.

## First-Day Path

Run setup in the computer terminal:

```bash
spark setup
spark guide
```

Choose and test the model path:

```bash
spark recommend llms
spark providers status
spark providers test --role chat
```

Turn Spark on quietly:

```bash
spark live start
spark live status
spark autostart install --now
```

Confirm in Telegram:

```text
/diagnose
/remember I like concise warm replies
/recall concise warm replies
```

Start a small build from Telegram:

```text
/run say exactly OK
/board
```

Open Mission Control in the browser:

```text
http://127.0.0.1:5173/kanban
http://127.0.0.1:5173/canvas
```

## Terminal Commands

Setup and guidance:

```bash
spark setup
spark guide
spark recommend llms
```

Running Spark:

```bash
spark live start
spark live status
spark live stop
spark autostart install --now
```

LLM providers:

```bash
spark providers list
spark providers status
spark providers test --role chat
spark setup --llm-provider codex
```

Proof and repair:

```bash
spark status
spark verify --onboarding
spark verify --deep
spark fix telegram
spark fix spawner
```

Telegram and secrets:

```bash
spark telegram connect
spark secrets list
spark secrets get telegram.bot_token
```

Secret values stay masked unless the user explicitly asks to reveal them.

Updates:

```bash
spark update
spark update --skip-dirty
spark verify --onboarding
```

Logs, security, and support:

```bash
spark logs spark-telegram-bot --lines 80
spark logs spawner-ui --lines 80
spark security audit
spark doctor llm "Telegram bot is quiet"
spark support bundle
```

## Telegram Commands

- `/start`: show the basic Telegram command surface.
- `/myid`: show the Telegram ID used for admin setup.
- `/diagnose`: check Telegram, provider routing, memory, and Spawner.
- `/remember <note>`: save a useful memory.
- `/recall <topic>`: search memory.
- `/run <goal>`: start a Spawner mission.
- `/board`: show mission status.
- `/mission status <id>`: inspect a mission.
- `/access 1|2|3|4`: change access level. Level 3 is recommended.

## Browser Surfaces

- `http://127.0.0.1:5173/kanban`: see build work as a board.
- `http://127.0.0.1:5173/canvas`: see the build plan and output canvas.

## Rule Of Thumb

If it starts with `spark`, type it in a terminal.

If it starts with `/`, type it in Telegram.

If it starts with `http://127.0.0.1:5173`, open it in a browser.
