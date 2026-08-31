# Spark Feedback

Human page: `/docs/feedback/`

Use this page when a human or agent finds something Spark should improve: docs, installer, provider setup, Telegram behavior, Mission Control, memory, Researcher, domain chips, or another module.

Do not paste secrets into GitHub.

Secrets include:

- Telegram bot tokens
- LLM provider keys
- local `.env` files
- private memory
- private repo content
- raw logs that include tokens, paths, names, or customer data

## Pick The Right Repo

If you are not sure, start with `Spark-Agent-Site`. Maintainers can reroute the report to the right repo.

**Quick guide for common scenarios:**

- Install stuck or wrong command? → `spark-cli`
- Site layout, docs wording, or registration form? → `Spark-Agent-Site`
- Telegram bot quiet or wrong reply? → `spark-telegram-bot`
- Memory not working? → `domain-chip-memory`
- Agent refused or wrong role? → `spark-character` or `spark-intelligence-builder`
- Competition, bounty, or team registration? → `Spark-Agent-Site`

| Area | Repo |
| --- | --- |
| Site, docs, install page, LLM indexes | `https://github.com/vibeforge1111/Spark-Agent-Site` |
| CLI, installer, setup, dry-run, providers, autostart | `https://github.com/vibeforge1111/spark-cli` |
| Researcher, evidence packets, OTOLO/autoloops, chip authoring | `https://github.com/vibeforge1111/spark-researcher` |
| Runtime routing, Agent/Mission providers, memory bridge | `https://github.com/vibeforge1111/spark-intelligence-builder` |
| Memory chip, memory packets, memory benchmarks | `https://github.com/vibeforge1111/spark-domain-chip-labs` |
| Telegram commands and bot behavior | `https://github.com/vibeforge1111/spark-telegram-bot` |
| Mission Control, Spawner UI, Kanban, Canvas | `https://github.com/vibeforge1111/vibeship-spawner-ui` |
| Spark role, voice, permission behavior | `https://github.com/vibeforge1111/spark-character` |
| Domain chips, chip quality, methodology, and specialization paths | `https://github.com/vibeforge1111/spark-domain-chip-labs` |

## Good Issue Shape

```text
Repo: <target repo>
Area: <docs | installer | provider | module | benchmark>
Expected: <what should have happened>
Actual: <what happened instead>
Evidence: <redacted command, screenshot, route, or output>
Suggested fix: <smallest useful change>
GitHub route: <issue or PR, after user approval>
```

## Good PR Shape

For pull requests:

1. Keep the change narrow.
2. Explain the user problem.
3. Include the command, page, or module that was confusing.
4. Add or update tests when behavior changes.
5. Keep generated files and unrelated edits out of the PR.
6. Say what you verified.

## Agent Instructions

When a user asks you to share feedback upstream:

1. Identify the repo.
2. Redact secrets.
3. Write a short issue or PR body.
4. Prefer a small patch if the fix is obvious.
5. Ask the user before opening a browser, pushing a branch, or submitting anything.

Use this prompt:

```text
Read https://agent.sparkswarm.ai/docs/feedback/ and prepare upstream feedback for Spark.

Choose the right repo.
Write:
- expected behavior
- actual behavior
- safe reproduction
- smallest suggested improvement
- files changed if this is a PR

Do not include secrets, private memory, private repo content, or raw unredacted logs.
Ask before submitting anything.
```
