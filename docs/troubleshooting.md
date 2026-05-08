# Spark Troubleshooting

Human page: `/docs/troubleshooting/`

Do not guess. Check one layer at a time.

## First Five Checks

```bash
spark live status
spark status
spark providers status
spark providers test --role chat
spark verify --onboarding
```

## Common Symptoms

### Bot Is Quiet

```bash
spark fix telegram
spark logs spark-telegram-bot --lines 80
```

Check token, admin ID, and duplicate long polling.

### Bot Says Private Or Admin Only

Send `/myid`, add that ID during `spark setup`, then restart Spark Live.

### LLM Replies Fail

```bash
spark providers test --role chat
spark providers status
```

Rerun setup if the selected provider is missing or pointing to the wrong endpoint.

### Hosted Railway Provider Fails

Full hosted operations page: `/docs/railway-vps/`

Installed is not the same as authenticated. A hosted Spawner can have `codex`,
`claude`, or another CLI on `PATH` and still fail if the service has no usable
provider auth.

- Codex hosted path: use a dedicated `OPENAI_API_KEY`, not a copied desktop OAuth session.
- Claude hosted path: use `ANTHROPIC_API_KEY`; keep Claude Code OAuth local.
- MiniMax, Z.AI, OpenRouter, Kimi, Hugging Face, and OpenAI-compatible providers need valid API keys and the right base URL.
- Ollama and LM Studio must point to an endpoint reachable from the container, not `localhost` inside Railway.

Run `/diagnose`, then test the exact Mission provider:

```bash
spark providers status
spark providers test --role mission
spark verify --hosted --deep
```

### Memory Does Not Stick

```bash
spark verify --deep
```

Then test `/remember` and `/recall` with a unique phrase.

### Spawner Is Unreachable

```bash
spark fix spawner
spark live status
spark logs spawner-ui --lines 80
```

User-facing wording: "Mission Control is offline."

## LLM Doctor

Use after the basic checks show a real problem and normal fixes did not solve it.

```bash
spark doctor llm "Telegram bot is quiet after restart" --save-report
spark doctor llm "Spawner says ECONNREFUSED on 5173" --include-logs --save-report
```

Doctor redacts secrets before using the user's configured LLM. Logs are excluded unless the user opts in.
