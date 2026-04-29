# AI-First Operating Model (Founder + 1 Dev)

## Goal

Ship reliable product improvements weekly with agent-assisted execution and human review gates.

## Work model

1. Monday
- define 1 weekly objective
- define 3 measurable outcomes
- freeze non-critical scope

2. Daily cycle
- 09:00: priorities and blockers
- 13:00: implementation window
- 18:00: verification + notes

3. Friday
- release/no-release decision
- retrospective with 3 actions only

## Quality gates

1. Code gate
- lint/build/tests pass

2. Product gate
- critical flow smoke pass:
  - register -> login -> billing checkout create -> webhook processing path reachable

3. Ops gate
- synthetic monitor green
- no active P1/P2 incident

## Agent responsibilities

1. Implementation agent
- code changes + tests + local verification

2. Review agent
- bug/risk focused review only

3. Operations agent
- deploy checklist + smoke checks + rollback readiness

## Decision protocol

1. If impact high + uncertainty high: small experiment first.
2. If impact high + uncertainty low: ship with tests now.
3. If impact low: batch for next cycle.

