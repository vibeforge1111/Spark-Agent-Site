---
title: Spark Docs
slug: index
status: published
verified_at: "2026-05-11T00:00:00Z"
verified_by: codex@sparkswarm.ai
authority_level: L3
canonical_for:
  - spark-installer-overview
do_not_infer: false
sources:
  - id: 1efb45e4-b0b9-4143-8ac7-0346f5c91429
    url: "https://agent.sparkswarm.ai/install/release-manifest.json"
    type: release-manifest
    fetched_at: "2026-04-29T00:00:00Z"
---

# Spark Docs

Spark's docs are written for humans first.

They also include clean Markdown files for agents.

## Start here

- Install Spark from `/install`.
- Read `/docs/install-safety/` before running installers.
- Read `/docs/updates/` for the May 29 public labs and installer update.
- Read `/docs/commands/` for current Spark CLI and Telegram commands.
- Read `/docs/providers/` for LLM provider setup.
- Read `/docs/railway-vps/` for always-on Railway or VPS operations.
- Read `/docs/suites/` to understand what gets installed.
- Read `/docs/feedback/` to route feedback, issues, and PRs.
- Read `/docs/self-improvement/` to understand domain chips, recursive loops, and benchmarks.
- Read `/docs/lifecycle/` for Spark Live, startup, and local lifecycle.
- Read `/docs/troubleshooting/` when Telegram, memory, providers, or missions need help.
- Read `/docs/security/` for permissions, provenance, audits, and safe support sharing.

Agents can use the matching Markdown pages:

- `/docs/install-safety.md`
- `/docs/updates.md`
- `/docs/commands.md`
- `/docs/providers.md`
- `/docs/railway-vps.md`
- `/docs/suites.md`
- `/docs/feedback.md`
- `/docs/self-improvement.md`
- `/docs/lifecycle.md`
- `/docs/troubleshooting.md`
- `/docs/security.md`

## What Spark is

Spark is a local-first personal agent.

You talk to it from Telegram.

It uses your LLM provider.

It can remember things and run missions.

It can also run bounded improvement loops when a task has a clear score.

Domain chips teach Spark how to improve one specialist area without bloating the core system.

## Current status

The installer has checksums, a release manifest, pinned managed runtimes, immutable Spark CLI source, GitHub Artifact Attestations, Sigstore keyless release signatures, multi-OS dry-run CI, and disposable real-install CI.

Current public installer state:

- Release: `spark-cli-public-installer-2026-05-29-r17`
- Installed Spark CLI runtime commit: `c4b9a909402ff1a14d810529b5625802a4d47f28`
- Local installer hashes match the committed release manifest.
- Hosted installer verification passed after deploy.
- Windows and WSL sandbox install checks are part of the release gate.
- Provenance verification is part of hosted installer verification.

Public labs available now:

- `spark-domain-chip-labs` for domain chips, benchmark packs, autoloops, specialization paths, local review packets, and standardization docs.
- `spark-character` for Spark identity, voice consistency, permission posture, and character evolution.
- `spark-personality-chip-labs` for modular personality chips and profile experiments.
- `spark-voice-comms` for voice communication hooks and profiles.

These labs are public experimentation surfaces. They are not all installed by the default `telegram-starter` bundle yet, because starter modules must expose the installable Spark module contract.

The docs now include human-friendly inner pages, agent-readable Markdown routes, simple schemas, visual flow diagrams, and command pages for Spark Live, providers, Railway/VPS hosting, troubleshooting, and security.
