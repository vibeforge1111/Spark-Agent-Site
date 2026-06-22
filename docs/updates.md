# Spark Update: Spark OS Registry And R28 Installer

Human page: `/docs/updates/`

This update publishes the safe public surfaces we can share now, without making Spark Swarm a public dependency.

## Included

- Spark R28 installer convergence with hosted checksums, release manifest, command metadata, attestations, the 10-module registry, deterministic CLI root wrappers, stable public registry pin verification, and self-consistent installed-checkout release metadata.
- Telegram recursive loops now have a local-only public path for Builder chip loops: `/recursive start <chipKey> rounds <n>`, `/recursive sessions`, `/recursive report`, and `/recursive trace` work from local status files without Spark Swarm.
- `spark-domain-chip-labs` as the public creator lab for domain chips, benchmark packs, specialization paths, autoloop policies, tool integrations, and publish packet standards.
- `spark-character` as the public character and voice-consistency layer.
- `spark-personality-chip-labs` as the public personality chip experiment space.
- `spark-voice-comms` as the public voice communication chip with voice hooks, profiles, and provider examples.
- Docs that explain which pieces are starter modules and which pieces are public builder labs.

## Not Included

- Spark Swarm hosted workspace, network submission, and review flow.
- Private Spark Swarm workspace APIs.
- Hosted Workspace review/decision dashboards for public recursive loops.
- Automatic starter-bundle install of every public lab.

## Boundary

The default installer stays conservative. It installs the `telegram-starter` bundle only from repos that expose Spark's installable module contract. Voice remains opt-in through `telegram-voice-starter`.

The public labs are for builders to experiment, standardize chips, and prepare future modules. Spark Swarm comes later.

Telegram recursive mode is local-first in this release. Builder chip loop status stays on the user's machine; Workspace sync, shared review queues, and network submission remain private/upcoming.

## Verify

Use:

```bash
spark verify --installers --hosted-installers
```

The expected Spark CLI release is:

```text
spark-cli-public-installer-2026-06-22-r28
eb3de2084b408c84653c5116953be20c5a71227c
```
