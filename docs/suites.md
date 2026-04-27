# Spark Suites

Spark installs a starter kit called `telegram-starter`.

This page explains what each part does.

## Telegram Bot

This is the front door.

You message Spark in Telegram.

Spark replies there.

## Intelligence Builder

This is the brain router.

It decides which LLM provider Spark should use.

It also connects tools, memory, and setup roles.

## Domain Chip Memory

This is Spark's starter memory.

It lets Spark save useful facts and recall them later.

Use:

```text
/remember I like concise warm replies
/recall concise replies
```

## Spawner UI

This is Mission Control.

It helps Spark create and track bigger work.

Use:

```text
/run write a short launch checklist
/board
```

## Spark Researcher

This helps Spark gather context.

Use it when you want Spark to be careful, cite sources, or prepare work before building.

## Autostart

Autostart starts Spark again after login.

It is on by default.

Turn it off with:

```bash
spark autostart remove
```
