# Spark Commands

Use this when a human or coding assistant needs to know where Spark commands go.

Human page: `/docs/commands/`

## Command Surfaces

Spark has three command surfaces.

1. Computer terminal: CMD, PowerShell, macOS Terminal, Linux shell, WSL, Codex, Claude Code, or another local coding assistant.
2. Telegram bot: slash commands typed inside the Spark bot.
3. Mission Control: browser UI for Kanban, Canvas, and build progress.

## Command Coach

If the command list feels too large, start from the user goal.

- Turn Spark on: use `spark live start` in the computer terminal.
- Bot is quiet: use `spark fix telegram` in the computer terminal, then `/diagnose` in Telegram.
- Choose model: use `spark recommend llms`, then `spark providers status`.
- Build something: use `/run <goal>` inside Telegram.
- Use memory: use `/remember <note>` and `/recall <topic>` inside Telegram.
- Update safely: use `spark update --skip-dirty`, then `spark verify --onboarding`.

## Find By Need

Search terms that should map to commands:

- `quiet`, `bot`, `telegram`: `spark fix telegram`, `/diagnose`
- `model`, `provider`, `llm`: `spark recommend llms`, `spark providers status`
- `memory`, `remember`, `recall`: `/remember <note>`, `/recall <topic>`
- `build`, `mission`, `app`: `/run <goal>`, `/board`
- `logs`, `error`, `support`: `spark logs ...`, `spark support bundle`
- `update`, `latest`, `missing command`: `spark update --skip-dirty`

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

```bash
spark live status
```

Then copy the Mission Control URL it prints and add:

```text
<mission-control-url>/kanban
<mission-control-url>/canvas
```

Do not assume the port is always the same. Spark Live may choose another local port when the default is busy.

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
- `/access 1|2|3|4`: choose what Spark can do. Use 3 when you want Spark to research and build only when asked.

## Browser Surfaces

- Mission Control URL + `/kanban`: see build work as a board.
- Mission Control URL + `/canvas`: see the build plan and output canvas.

Use `spark live status` or `spark status` to find the current Mission Control URL. If the browser says connection refused, run `spark fix spawner`.

## Rule Of Thumb

If it starts with `spark`, type it in a terminal.

If it starts with `/`, type it in Telegram.

If it starts with `http://127.0.0.1`, open it in a browser only after Spark Live or Spawner UI is running.
