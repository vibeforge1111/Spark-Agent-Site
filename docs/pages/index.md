---
title: Spark Docs
slug: index
status: published
verified_at: "2026-04-29T00:00:00Z"
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
- Read `/docs/commands/` for current Spark CLI and Telegram commands.
- Read `/docs/providers/` for LLM provider setup.
- Read `/docs/suites/` to understand what gets installed.
- Read `/docs/feedback/` to route feedback, issues, and PRs.
- Read `/docs/self-improvement/` to understand domain chips, recursive loops, and benchmarks.
- Read `/docs/lifecycle/` for Spark Live, startup, and local lifecycle.
- Read `/docs/troubleshooting/` when Telegram, memory, providers, or missions need help.
- Read `/docs/security/` for permissions, provenance, audits, and safe support sharing.

Agents can use the matching Markdown pages:

- `/docs/install-safety.md`
- `/docs/commands.md`
- `/docs/providers.md`
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

- Release: `spark-cli-launch-2026-05-05`
- Installed Spark CLI runtime commit: `1bd44f5e56b395329102fdd889ff3e3473d75f83`
- Local installer hashes match the committed release manifest.
- Hosted installer verification should be rerun after deploy.
- Windows and WSL sandbox install checks should be rerun after deploy.
- Provenance verification should be rerun in hosted sandbox installs after deploy.

The docs now include human-friendly inner pages, agent-readable Markdown routes, simple schemas, visual flow diagrams, and command pages for Spark Live, providers, troubleshooting, and security.
