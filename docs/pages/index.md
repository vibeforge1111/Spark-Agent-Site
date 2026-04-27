---
title: Spark Install Trust Center
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

# Install Spark with receipts

Spark's public installer is designed to be inspectable before it touches your machine.

The default homepage command downloads an installer file, shows a no-write plan, and asks before install. The advanced path verifies SHA-256 checksums, GitHub Artifact Attestations, and the release manifest first.

## What the trust center covers

- What the installer may download.
- What files it may write.
- Where Telegram and LLM provider secrets stay.
- How to run dry-run, repair, autostart, and uninstall checks.
- What a local agent should read before helping with setup.

## Primary docs

- [Install safety](install-safety): exact hashes, pinned inputs, network allowlist, and agent procedure.
- [Lifecycle](lifecycle): post-install checks, Telegram smoke tests, repair commands, autostart, and uninstall.

## Current status

The installer now has checksums, a release manifest, pinned managed runtimes, immutable Spark CLI source, GitHub Artifact Attestations, and multi-OS dry-run CI.

The next supply-chain step is an external signing and protected release process for published archives.
