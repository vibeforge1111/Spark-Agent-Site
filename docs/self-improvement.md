# Spark Self-Improvement

Human page: `/docs/self-improvement/`

Spark improves best when a repeatable task has a clear score, a small loop, and a memory record.

This page is about Researcher, OTOLO/autoloops, domain chips, benchmarks, and specialization paths.

Use `/docs/feedback.md` when the goal is to report feedback or open a PR.

## Core Idea

A normal skill helps once.

A benchmarked specialization path can improve over repeated runs.

A domain chip is both:

- a reusable tool Spark can call for one task family
- a bounded specialization loop Spark Researcher can run and score

## Improvement Loop

```text
workflow -> Researcher -> benchmark -> memory packet -> better next run
```

The score is the important part.

Spark should not promote a change because it sounds clever.

Spark should promote a change because it improves a benchmark, rubric, replay, or workflow outcome.

## Researcher And OTOLO / Autoloops

Spark Researcher is the local lab runner.

OTOLO/autoloops are bounded loops:

- one task
- one score
- a few rounds
- a review before risky changes

## Domain Chip Contract

The chip owns specialist behavior:

- `evaluate`: score the task with a benchmark or rubric
- `suggest`: propose the next small experiment or repair
- `packets`: emit memory-ready doctrine, boundaries, evidence, and frontier ideas
- `watchtower`: produce a readable status page or report

Spark Researcher owns the generic runtime:

- loop execution
- ledger
- queue
- memory index
- vault generation
- self-edit and review policy

Keep Spark core generic. Keep domain logic in the chip.

## What Gets Better

Examples:

- startup operations: better founder decisions, launch plans, customer follow-up, investor updates
- marketing: better hooks, evidence, audience fit, distribution plans, and outcome reviews
- automations: better tool choice, workflow reliability, failure repair, and replay checks
- projects: better file selection, commands, plugins, tests, and completion reviews

Every real improvement should map to a better score, better decision, better tool use, better reasoning path, or better project execution.

## Spark Researcher Commands

Common commands:

```bash
spark-researcher run --command <name>
spark-researcher autoloop --command <name> --rounds 3 --suggest-limit 3
spark-researcher memory sync
spark-researcher obsidian build
spark-researcher summary
```

If Spark was installed through the starter bundle, the local module usually lives at:

```text
~/.spark/modules/spark-researcher/source
```

## Ask Your Local Agent To Build A Chip

Use this prompt with Codex, Claude Code, Cursor, or another local agent:

```text
Use Spark Researcher's domain-chip authoring docs to design a new Spark domain chip for <domain>.

Treat it as both:
1. a reusable tool my Spark agent can call
2. a bounded specialization loop Spark Researcher can run and score

Ground it in the real Spark chip contract:
- Spark Researcher owns loop execution, ledger, queue, memory index, vault generation, and review policy.
- The chip owns evaluate, suggest, packets, and watchtower hooks.
- Keep benchmark-grounded evidence separate from exploratory frontier ideas.
- Add tests for evaluator, suggestions, packets, watchtower, and one runtime integration path.

First inspect the installed Spark Researcher docs at:
~/.spark/modules/spark-researcher/source/docs/master_chip_v2/MASTER_CHIP_OPERATOR_PROMPT.md
~/.spark/modules/spark-researcher/source/docs/master_chip_v2/MASTER_CHIP_TESTING_PROMPT.md
~/.spark/modules/spark-researcher/source/docs/AUTOLOOP.md
~/.spark/modules/spark-researcher/source/docs/CHIP_ONE_LOOP_FLYWHEEL.md

Then propose the smallest v0 chip and ask before writing files.
```

## Good First Specialization Paths

Useful first paths are narrow:

- score one recurring marketing workflow
- improve one startup operating cadence
- benchmark one kind of agent answer
- replay one automation and repair weak tool usage
- inspect one project type before Mission work starts
- improve one research packet shape

Avoid broad chips like "make Spark smarter at everything."

## Safety Rule

Self-improvement should stay reviewable.

Let Spark propose.

Let benchmarks score.

Let humans approve risky changes.

Risky areas include file deletion, public publishing, production writes, secret handling, and unattended code changes.
