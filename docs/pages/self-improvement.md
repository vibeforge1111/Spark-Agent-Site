# Spark Self-Improvement

Spark improves best when a repeatable task has a score.

A domain chip is both a reusable tool Spark can call and a bounded specialization loop Spark Researcher can run.

Use `/docs/feedback.md` for feedback and PR routing. This page is about Researcher, OTOLO/autoloops, domain chips, benchmarks, and specialization paths.

## Loop

```text
workflow -> Researcher -> benchmark -> memory packet -> better next run
```

## Domain Chips

The chip owns:

- `evaluate`
- `suggest`
- `packets`
- `watchtower`

Spark Researcher owns loop execution, ledger, queue, memory index, vault generation, and review policy.

## Researcher Commands

```bash
spark-researcher run --command <name>
spark-researcher autoloop --command <name> --rounds 3 --suggest-limit 3
spark-researcher memory sync
spark-researcher obsidian build
spark-researcher summary
```

## Prompt

```text
Use Spark Researcher's domain-chip authoring docs to design a new Spark domain chip for <domain>.
Treat it as both a reusable tool my Spark agent can call and a bounded specialization loop Spark Researcher can run and score.
Inspect ~/.spark/modules/spark-researcher/source/docs/master_chip_v2 before writing files.
Build the smallest v0 with evaluate, suggest, packets, watchtower, and tests.
Ask before risky changes.
```

## Safety

Let Spark propose. Let benchmarks score. Let humans approve risky changes.
