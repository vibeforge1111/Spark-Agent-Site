---
title: Spark Suites
slug: suites
status: published
verified_at: "2026-04-29T00:00:00Z"
verified_by: codex@sparkswarm.ai
authority_level: L3
canonical_for:
  - spark-suites
do_not_infer: false
sources:
  - id: 2f11fb59-8b61-4e1f-a9fd-31512902d874
    url: "https://agent.sparkswarm.ai/install/commands.json"
    type: install-command-manifest
    fetched_at: "2026-04-29T00:00:00Z"
---

# Spark Suites

Spark installs a starter kit called `telegram-starter`.

This page explains what each part does.

The default installer stays conservative: it installs only modules that expose Spark's installable module contract. Public labs such as `spark-domain-chip-labs`, `spark-personality-chip-labs`, and `spark-voice-comms` are available for builders, but they are not automatic starter-bundle modules yet.

## Spark Telegram Bot

This is the front door.

You message Spark in Telegram.

Spark replies there.

## Spark Intelligence Builder

This is the runtime router.

It decides which LLM provider Spark should use.

It also connects tools, memory, and setup roles.

## Domain Chip Memory

This is Spark's starter memory.

It lets Spark save useful facts and recall them later.

## Spawner UI

This is Mission Control.

It helps Spark create and track bigger work.

## Spark Researcher

This helps Spark gather context.

Use it when you want Spark to be careful, cite sources, or prepare work before building.

## Spark Character

This keeps Spark's identity, role, voice, and permission behavior stable.

## Spark Live

This runs Spark services quietly in the background and can autostart after login.

## Public Builder Labs

These are public for experimentation and standardization:

- `spark-domain-chip-labs`: domain chips, benchmark packs, specialization paths, autoloop policies, and publish packet standards.
- `spark-personality-chip-labs`: modular personality chips and profile experiments.
- `spark-voice-comms`: voice communication hooks, voice profiles, and local or paid provider examples.

Spark Swarm network submission and hosted workspace features are not public installer dependencies yet.
