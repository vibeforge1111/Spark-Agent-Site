# Spark Lifecycle Runbook

Use this page after Spark is installed or when the Telegram bot is quiet.

## First Checks

```bash
spark guide
spark status
spark providers status
spark verify --onboarding
```

Expected result:

- Spark CLI opens or prints the onboarding guide.
- Provider roles are configured.
- Telegram setup is complete.
- Autostart is installed unless the user opted out.

## Telegram Smoke Test

In Telegram, open the bot and try:

```text
/start
/myid
/diagnose
```

Then send a normal message. Spark should answer through the configured LLM provider.

Memory checks:

```text
/remember launch test memory
/recall launch test memory
```

Mission checks:

```text
/run summarize the current Spark setup
/board
```

## Repair Commands

```bash
spark doctor
spark fix telegram
spark verify --deep
spark autostart status
```

If Telegram receives commands but every normal response looks like a memory label or empty status line, check the LLM provider role and the memory bridge:

```bash
spark providers status
spark verify --deep
```

## Autostart

Autostart is on by default in the public installer.

Useful commands:

```bash
spark autostart status
spark autostart install telegram-starter --now
spark autostart remove
```

## Uninstall

Prefer the Spark command when available:

```bash
spark autostart remove
spark uninstall
```

Manual fallback:

1. Stop Spark.
2. Remove autostart files.
3. Back up any local memory or config the user wants to keep.
4. Remove the Spark prefix, usually `~/.spark` or `%USERPROFILE%\.spark`.

Deleting local files is destructive. A local agent should ask the user before removing the prefix.

## Secret Rotation

Rotate credentials if a token or key appears in chat, shell history, logs, screenshots, GitHub issues, commits, or support messages.

Telegram:

1. Message `@BotFather`.
2. Use `/revoke` or generate a new token for the bot.
3. Update Spark setup locally.

LLM providers:

1. Revoke the exposed key in the provider console.
2. Create a new scoped key.
3. Update Spark setup locally.
