# Spark LLM Providers

Human page: `/docs/providers/`

Spark should be easy first and customizable later. Start with one provider for the whole agent, then split roles only when you have a reason.

## Recommended Setup For Most People

Choose one provider during `spark setup`. Use it for both Agent and Mission:

- Agent: Telegram chat, runtime decisions, and memory.
- Mission: Spawner builds, research work, and longer tracked tasks.

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

## Supported Providers

- `codex`: OpenAI Codex CLI sign-in route for Codex/ChatGPT users.
- `anthropic`: Claude Code CLI or Anthropic API key route.
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

Advanced users can later rerun `spark setup` and choose separate Agent and Mission providers.
