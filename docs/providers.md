# Spark LLM Providers

Human page: `/docs/providers/`

Spark should be easy first and customizable when the user wants control. Start with one provider for Agent and Mission, or split them during setup if the user already knows they want separate models.

## Recommended Setup For Most People

Choose one provider during `spark setup`. Use it for both Agent and Mission unless the user already wants a split:

- Agent: Telegram chat, runtime reasoning, memory synthesis, and recall.
- Mission: Spawner/Mission Control builds, research, coding work, and longer tracked missions.

When the provider is Anthropic, Spark keeps the default split inside that provider: Claude Sonnet 4.6 for Agent and Claude Opus 4.7 for Mission.

That avoids surprise fallback behavior. Spark should not call Ollama, LM Studio, or another local endpoint unless the user selected it.

## Provider Types

- Subscription CLI: OpenAI Codex (`codex`) and Anthropic Claude (`anthropic`). Best when the user already has Codex/ChatGPT or Claude Code signed in locally.
- API key: Z.AI GLM (`zai`), Kimi/Moonshot (`kimi`), MiniMax (`minimax`), OpenRouter (`openrouter`), Hugging Face Router (`huggingface`), and OpenAI API (`openai`). Spark stores keys locally and masks secret input.
- Local model: LM Studio (`lmstudio`) and Ollama (`ollama`). The local app/server must be running while Spark uses it.

## Default Versus Split Roles

Default path:

```bash
spark setup --llm-provider codex
spark providers status
spark providers test --role chat
```

Split Agent and Mission:

```bash
spark setup --agent-llm-provider anthropic --mission-llm-provider codex
spark providers status
spark providers test --role chat
spark providers test --role mission
```

Expert split:

```bash
spark setup --chat-llm-provider codex --builder-llm-provider zai --memory-llm-provider lmstudio --mission-llm-provider anthropic
```

## Useful Commands

```bash
spark recommend llms
spark setup
spark providers list
spark providers status
spark providers test --role chat
spark providers test --role mission
spark verify --onboarding
```

## Railway / Docker Notes

Local setup is the easiest first path. For always-on Railway or Docker installs,
run Spark as two services:

- Spark Telegram Bot: Telegram long polling, Agent chat, and the private mission relay.
- Spawner UI: Mission Control, state, workspaces, and provider execution.

Use private service URLs between the two services:

```bash
SPAWNER_UI_URL=http://spawner-ui.railway.internal:<port>
TELEGRAM_RELAY_HOST=::
TELEGRAM_RELAY_URL=http://spark-telegram-bot.railway.internal:8788/spawner-events
MISSION_CONTROL_WEBHOOK_URLS=http://spark-telegram-bot.railway.internal:8788/spawner-events
SPARK_BRIDGE_API_KEY=<same long value in both services>
```

Mount persistent storage for bot state, Spawner state, and workspaces. Do not
put provider keys, Telegram tokens, or relay secrets in Docker images.

For staging smoke tests, set `TELEGRAM_SMOKE_MODE=1` on the bot service and run
a tiny Mission from Spawner. That verifies the private relay without calling the
Telegram API. Production Telegram chat still needs a real BotFather token.

API-backed Mission providers such as Z.AI and MiniMax can run in hosted
containers with provider keys. CLI executors such as Codex CLI and Claude Code
also need their CLI binaries and auth available inside the container.

## Supported Providers

- `codex`: OpenAI Codex CLI sign-in route for Codex/ChatGPT users.
- `anthropic`: Claude Code CLI or Anthropic API key route. Defaults to Sonnet 4.6 for Agent and Opus 4.7 for Mission.
- `zai`: Z.AI GLM API-key route.
- `kimi`: Kimi/Moonshot API-key route.
- `minimax`: MiniMax API-key route.
- `openrouter`: OpenRouter gateway route.
- `huggingface`: Hugging Face Router route.
- `lmstudio`: local LM Studio server route.
- `ollama`: local Ollama server route.
- `openai`: OpenAI API-key route.

## What Good Looks Like

- `spark providers status` shows the provider selected for Agent and Mission.
- `spark providers test --role chat` returns a real response.
- `spark verify --onboarding` passes.
- A normal Telegram message gets a real answer.
- `/run say exactly OK` starts a mission and returns a result through Mission Control.

Users can choose separate Agent and Mission providers during first setup, or rerun `spark setup` later to change the split.
