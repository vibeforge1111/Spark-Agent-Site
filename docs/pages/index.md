---
title: Spark Docs
slug: index
status: published
verified_at: "2026-04-27T00:00:00Z"
verified_by: codex@sparkswarm.ai
authority_level: L3
canonical_for:
  - spark-installer-overview
do_not_infer: false
sources:
  - id: 1efb45e4-b0b9-4143-8ac7-0346f5c91429
    url: "https://agent.sparkswarm.ai/install/release-manifest.json"
    type: release-manifest
    fetched_at: "2026-04-27T00:00:00Z"
---

# Spark Docs

Spark's docs are written for humans first.

They also include clean Markdown files for agents.

## Start here

- Install Spark from `/install`.
- Read `/docs/install-safety.md` before running installers.
- Read `/docs/suites.md` to understand what gets installed.
- Read `/docs/self-improvement.md` to understand domain chips, recursive loops, and benchmarks.
- Read `/docs/lifecycle.md` when Telegram, memory, missions, or autostart need help.

## What Spark is

Spark is a local-first personal agent.

You talk to it from Telegram.

It uses your LLM provider.

It can remember things and run missions.

It can also run bounded improvement loops when a task has a clear score.

Domain chips teach Spark how to improve one specialist area without bloating the core system.

## Current status

The installer has checksums, a release manifest, pinned managed runtimes, immutable Spark CLI source, GitHub Artifact Attestations, Sigstore keyless release signatures, multi-OS dry-run CI, and disposable real-install CI.

The next operational step is a dedicated live Telegram/LLM smoke bot with test-only secrets.
