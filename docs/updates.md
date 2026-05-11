# Spark Update: Public Labs And May 9 Installer

Human page: `/docs/updates/`

This update publishes the safe public surfaces we can share now, without making Spark Swarm a public dependency.

## Included

- May 9 Spark CLI installer pin with hosted checksums, release manifest, command metadata, attestations, and production smoke checks.
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

The default installer stays conservative. It installs the `telegram-starter` bundle only from repos that expose Spark's installable module contract.

The public labs are for builders to experiment, standardize chips, and prepare future modules. Spark Swarm comes later.

Telegram recursive mode is local-first in this release. Builder chip loop status stays on the user's machine; Workspace sync, shared review queues, and network submission remain private/upcoming.

## Verify

Use:

```bash
spark verify --installers --hosted-installers
```

The expected Spark CLI release is:

```text
spark-cli-launch-2026-05-11
c0e642c68f015cb996a0242369ee396c9326b134
```
