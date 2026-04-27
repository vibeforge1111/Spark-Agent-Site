# Spark Self-Improvement

Spark can get better at a task when the task has a score.

The score is what keeps the loop honest.

Without a score, the agent is only guessing.

## The Simple Loop

Spark's improvement loop is:

```text
run -> score -> record -> remember -> suggest next try
```

That is the whole idea.

Spark runs something.

It checks the result.

It writes down what happened.

It saves the useful lesson.

Then it suggests the next small experiment.

## What A Domain Chip Is

A domain chip is a specialist module.

It teaches Spark how to work in one area.

Examples:

- startup advice
- crypto trading research
- content systems
- coding review
- browser tasks
- prompt testing
- research quality

The chip owns the domain-specific logic.

Spark owns the loop, ledger, memory, and review policy.

## What A Good Chip Needs

A useful chip needs four things.

1. A task.
2. A score.
3. Allowed changes.
4. A way to save lessons.

Example:

```text
Task: improve startup diagnosis memos.
Score: startup_score.
Goal: maximize.
Allowed changes: memo style, evidence depth, question order.
Lessons: grounded doctrine, boundaries, benchmark evidence, frontier ideas.
```

Keep this small at first.

Small loops are easier to trust.

## What Benchmarks Do

A benchmark is the truth meter.

It answers:

```text
Did this change make the system better?
```

For startup work, a benchmark might score founder decisions across cash, product, customer, team, and strategy outcomes.

For trading work, a benchmark might score walk-forward results, holdout decay, risk, and regime fit.

For research work, a benchmark might score evidence quality, contradiction handling, and whether claims are grounded.

Benchmarks protect the system from fake progress.

## What Recursive Loops Mean

Recursive sounds intense.

In Spark, it should mean boring in a good way.

Spark repeats a bounded cycle.

It does not get unlimited permission.

It does not silently edit production.

It does not promote every idea into doctrine.

Good recursive loops have:

- a round limit
- a fixed score
- a mutation list
- a ledger
- human review for risky changes
- clear failure notes

## What To Ask Spark

Use this when you want Spark to create a chip:

```text
Create a Spark domain chip for <task>.

The chip should improve <specific workflow>.
Primary metric: <metric_name>.
Goal: <maximize|minimize>.
Allowed mutations: <field list>.

Implement:
- evaluate
- suggest
- packets
- watchtower

Keep the Spark core generic.
Keep domain logic inside the chip.
Add tests for scoring, packets, and watchtower truthfulness.
Save useful lessons as grounded doctrine, grounded boundary, benchmark evidence, or exploratory frontier.
```

Use this when you want a loop:

```text
Run a bounded self-improvement loop for <task>.

Use <benchmark or metric> as the score.
Try at most <number> rounds.
Only change <allowed fields>.
After each round, show:
- what changed
- score before and after
- why it helped or failed
- what should be tried next

Do not auto-apply risky changes without review.
```

Use this when you want a benchmark:

```text
Design a benchmark for <task>.

It should be programmatic where possible.
It should score the real outcome, not vibes.
Include:
- scenarios
- allowed tools or actions
- scoring dimensions
- hard-failure gates
- example passing and failing runs
- hidden cases later, if we need anti-gaming
```

## Real Spark Patterns

`spark-researcher` is the local loop runtime.

It runs commands, reads scores, writes ledgers, saves memory, and suggests next trials.

`spark-domain-chip-labs` is the meta-chip lab.

It studies how to build better chips, better benchmarks, and better graduation rules.

`domain-chip-startup-yc` is a startup advice chip.

It uses startup doctrine, founder-state rituals, and startup benchmarks.

`domain-chip-crypto-trading` is a trading chip.

It uses doctrine discovery, walk-forward backtesting, and paper-trading style validation.

`startup-bench` is a benchmark system.

It tests whether agents can operate a simulated startup over time, not just write a nice answer.

## Why People Want This

Normal AI help is one conversation.

Spark-style improvement is a memory-bearing loop.

The system can learn which patterns worked, where they failed, and what should be tried next.

That is how an agent becomes useful in a domain instead of starting from zero every time.

## Safety Rule

Self-improvement should stay reviewable.

Let Spark propose.

Let benchmarks score.

Let humans approve risky changes.
