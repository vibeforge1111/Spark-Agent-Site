# Spark Fixes And Daily Checks

Use this page after Spark is installed.

It is for quiet bots, broken setup, memory issues, autostart, and uninstall.

Human page: `/docs/lifecycle/`

## First Checks

Run these in Terminal:

```bash
spark guide
spark status
spark providers status
spark verify --onboarding
```

What you want:

- Spark opens or prints the guide.
- Your LLM provider is connected.
- Telegram setup is complete.
- Autostart is installed unless you turned it off.

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

If missions do not show up, run:

```bash
spark verify --deep
```

## If Telegram Is Quiet

Run:

```bash
spark fix telegram
spark logs spark-telegram-bot
```

Common causes:

- the bot token is wrong
- the admin Telegram ID is missing
- another process is already polling the bot
- the LLM provider is not configured

## If Replies Look Like Memory Labels

Run:

```bash
spark providers status
spark verify --deep
```

This usually means Spark can receive Telegram messages, but the LLM role or memory bridge is not wired correctly.

## Autostart

Autostart is on by default.

Check it:

```bash
spark autostart status
```

Turn it off:

```bash
spark autostart uninstall
```

Turn it back on:

```bash
spark autostart install telegram-starter --now
```

## Uninstall

Prefer:

```bash
spark autostart uninstall
spark uninstall
```

Manual fallback:

1. Stop Spark.
2. Remove autostart files.
3. Back up memory or config you want to keep.
4. Remove `~/.spark` or `%USERPROFILE%\.spark`.

Deleting local files is destructive.

A local agent should ask before doing it.

## Rotate A Leaked Token

Telegram:

1. Message `@BotFather`.
2. Use `/revoke`.
3. Put the new token into local Spark setup.

LLM provider:

1. Open your provider dashboard.
2. Revoke the exposed key.
3. Create a new key.
4. Put the new key into local Spark setup.
