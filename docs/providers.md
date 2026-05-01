# Spark LLM Providers

Human page: `/docs/providers/`

Spark should be easy first and customizable later. Start with one provider for the whole agent, then split roles only when you have a reason.

## Recommended Setup For Most People

Choose one provider during `spark setup`. Use it for both Agent and Mission:

- Agent: Telegram chat, runtime decisions, and memory.
- Mission: Spawner builds, research work, and longer tracked tasks.

That avoids surprise fallback behavior. Spark should not call Ollama, LM Studio, or another local endpoint unless the user selected it.

## Useful Commands

```bash
spark recommend llms
spark setup
spark providers status
spark providers test --role chat
spark verify --onboarding
```

## Provider Families

- OpenAI Codex: best for users who already use Codex or ChatGPT. Use the Codex CLI sign-in path, then choose Codex in Spark setup.
- Anthropic Claude: best for users who already use Claude Code. Spark can use the Claude CLI route, including `claude -p` style prompts where the local Claude CLI supports them.
- Z.AI GLM, Kimi, MiniMax, OpenRouter, and OpenAI-compatible providers: use API keys stored locally by Spark.
- Ollama and LM Studio: local-first endpoints. The local app must be running, and Spark must use only the selected endpoint.
- Hugging Face Router: hosted router path using an HF token and an OpenAI-compatible chat endpoint.

## What Good Looks Like

- `spark providers status` shows the provider selected for Agent and Mission.
- `spark providers test --role chat` returns a real response.
- `spark verify --onboarding` passes.
- A normal Telegram message gets a real answer.
- `/run say exactly OK` starts a mission and returns a result through Mission Control.

Advanced users can later rerun `spark setup` and choose separate Agent and Mission providers.
