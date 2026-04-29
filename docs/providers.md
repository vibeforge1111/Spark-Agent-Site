# Spark LLM Providers

Spark should be easy first and customizable later.

## Recommended Setup

Choose one provider during `spark setup`. Use it for:

- Agent chat
- Runtime decisions
- Memory shaping
- Spawner missions

Advanced users can later split agent and mission providers.

## Useful Commands

```bash
spark recommend llms
spark setup
spark providers status
spark providers test --role chat
spark verify --onboarding
```

## Provider Families

- OpenAI Codex: best for users who already use Codex or ChatGPT. Use the Codex CLI sign-in path.
- Anthropic Claude: best for users who already use Claude Code. Use the Claude CLI sign-in path, including `claude -p` style prompts where available.
- Z.AI GLM, MiniMax, OpenRouter, and OpenAI-compatible providers: use API keys stored locally by Spark.
- Ollama and LM Studio: local-first endpoints. Spark must use only the selected endpoint.
- Hugging Face Router: hosted router path using an HF token.

## Role Names

- Agent: chat, runtime, and memory.
- Mission: Spawner build and research work.

Default for non-technical users: one provider for everything.
