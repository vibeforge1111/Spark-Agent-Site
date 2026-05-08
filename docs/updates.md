# Spark Update: Public Labs And May 9 Installer

Human page: `/docs/updates/`

This update publishes the safe public surfaces we can share now, without making Spark Swarm a public dependency.

## Included

- May 9 Spark CLI installer pin with hosted checksums, release manifest, command metadata, attestations, and production smoke checks.
- `spark-domain-chip-labs` as the public creator lab for domain chips, benchmark packs, specialization paths, autoloop policies, tool integrations, and publish packet standards.
- `spark-character` as the public character and voice-consistency layer.
- `spark-personality-chip-labs` as the public personality chip experiment space.
- `spark-voice-comms` as the public voice communication chip with voice hooks, profiles, and provider examples.
- Docs that explain which pieces are starter modules and which pieces are public builder labs.

## Not Included

- Spark Swarm hosted workspace, network submission, and review flow.
- Private Spark Swarm workspace APIs.
- Automatic starter-bundle install of every public lab.

## Boundary

The default installer stays conservative. It installs the `telegram-starter` bundle only from repos that expose Spark's installable module contract.

The public labs are for builders to experiment, standardize chips, and prepare future modules. Spark Swarm comes later.

## Verify

Use:

```bash
spark verify --installers --hosted-installers
```

The expected Spark CLI release is:

```text
spark-cli-launch-2026-05-09
899dca9911d59bb4576aa6601b171689fdf315af
```
