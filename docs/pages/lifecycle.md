---
title: Spark Fixes And Daily Checks
slug: lifecycle
status: published
verified_at: "2026-04-29T00:00:00Z"
verified_by: codex@sparkswarm.ai
authority_level: L3
canonical_for:
  - spark-lifecycle
do_not_infer: false
sources:
  - id: 4f686a8c-471e-4708-a563-048b33cc43fc
    url: "https://agent.sparkswarm.ai/install/commands.json"
    type: install-command-manifest
    fetched_at: "2026-04-29T00:00:00Z"
---

# Spark Fixes And Daily Checks

Use this page after Spark is installed.

It is for quiet bots, broken setup, memory issues, autostart, and uninstall.

## First Checks

```bash
spark guide
spark live status
spark providers status
spark providers test --role chat
spark verify --onboarding
```

## Telegram Test

Open your Spark bot in Telegram.

Send:

```text
/start
/myid
/diagnose
```

Then send a normal message.

Spark should answer through your LLM provider.

## Memory Test

Send:

```text
/remember launch test memory
/recall launch test memory
```

If recall fails, run:

```bash
spark verify --deep
```

## Mission Control Test

Send:

```text
/run summarize the current Spark setup
/board
```

## If Telegram Is Quiet

Run:

```bash
spark fix telegram
spark logs spark-telegram-bot --lines 80
```

Common causes:

- the bot token is wrong
- the admin Telegram ID is missing
- another process is already polling the bot
- the LLM provider is not configured

## If Mission Control Is Offline

Run:

```bash
spark fix spawner
spark logs spawner-ui --lines 80
```

## Autostart

Interactive installs offer autostart by default. Unattended `--yes` or non-interactive installer runs use no-autostart unless `--autostart` is passed explicitly.

Check it:

```bash
spark autostart status
```

Turn it off:

```bash
spark autostart uninstall
```

## Uninstall

Prefer:

```bash
spark autostart uninstall
spark uninstall
```

Deleting local files is destructive.

A local agent should ask before doing it.
