---
title: "AI Harnesses and Deterministic Verification"
slug: ai-harnesses-and-deterministic-verification
category: engineering
excerpt: "Why reliable AI engineering depends on the system around the model—and on evidence the model does not get to invent."
publishedDate: 2026-11-04T21:50:00.000Z
tags:
  - AI Engineering
  - Java
  - Software Architecture
  - Testing
  - AI Agents
thumbnail: /images/covers/ai-harness-deterministic-verification.webp
cover: /images/covers/ai-harness-deterministic-verification-wide.webp
draft: false
---

*Why reliable AI engineering depends on the system around the model—and on evidence the model does not get to invent.*

An AI coding agent finishes a task and reports: “Implemented the fix. Tests passed. Ready to merge.”

The explanation sounds reasonable. The patch is small. The agent even lists the commands it claims to have run.

But the implementation changed an unrelated configuration file, one of the tests was quietly weakened, and the success message came from the agent's own summary rather than an independent test run.

The problem is not necessarily that the model produced bad code. **The problem is that the system treated the model's account of its work as proof that the work was correct.**

This is where AI harnesses and deterministic verification become important. The model can still explore, reason, write code, and recover from mistakes. The surrounding system defines what it may touch, what counts as evidence, and what must be checked before a result is accepted.

## The model is not the whole agent

A language model generates possible next actions. It does not, by itself, provide a repository, a terminal, tool permissions, durable task state, a test runner, or a release process.

An **agent harness** supplies the execution environment and control loop around the model. Depending on the system, that may include context selection, tool adapters, sandboxing, memory, state transitions, tracing, retry limits, and approval gates. An **evaluation harness** has a different job: it runs tasks or scenarios, captures what happens, and grades the results across trials. The two can share infrastructure, but they are not the same thing.

This distinction is useful because changing the prompt, swapping the model, or adding a new tool does not automatically improve the safety of the whole workflow. What the agent can actually accomplish depends on the model, the harness, and the environment together.

![Agent exploration is bounded by a harness and evaluated through independently collected evidence](/images/ai-harness/harness-boundaries.svg "The agent proposes actions; the harness controls execution and collects evidence.")

The diagram is conceptual, not a claim that every agent framework uses precisely these components.

## Start with a contract, not a prompt

Imagine a fictional Java service that generates customer invoices. A developer asks an agent to fix a rounding bug. “Fix the rounding” is a useful request, but it is not enough to approve a production change.

A stronger task contract could specify:

- **Goal:** Correct the calculation for a documented set of invoice examples.
- **Scope:** Change only Java application and test files related to the calculation.
- **Invariants:** Keep the public API and stored data format unchanged.
- **Verification:** Run trusted regression cases, compilation, and relevant contract tests.
- **Permissions:** No production credentials, deployments, or external writes.
- **Completion:** Return a patch and machine-generated evidence; require human approval before merging.

The agent still has freedom over *how* to solve the problem. The contract constrains *what qualifies as an acceptable result*.

A model instruction such as “do not edit configuration files” is helpful context. It is not the same as a permission boundary. If editing those files is forbidden, the tool layer should prevent or detect it independently of the model's willingness to follow instructions.

## A completed task is not a convincing transcript

A successful-looking trajectory can be misleading. An agent might run many commands, explain its reasoning clearly, and finish with a confident summary. None of those facts proves that the desired change exists in the resulting repository.

For engineering tasks, the more useful question is: **What changed in the environment, and which checks were actually executed against that change?**

Consider two observations:

```text
Agent message:
  "The API remains backward compatible. All tests pass."

Independent verifier:
  - API contract snapshot: FAILED
  - Trusted regression suite: PASSED
  - Changed-file policy: PASSED
```

The result is **REJECT**, even though two checks passed and the agent said everything was fine. The verifier uses the observable repository state, not the wording of the final message.

This is an example of *deterministic verification*: given the same verified inputs, policy, tool versions, and controlled execution conditions, a particular check produces a reproducible pass or fail. It does **not** mean the agent's next answer is deterministic, or that passing all checks proves the implementation universally correct.

![An agent's reported success is compared with independently measured repository state](/images/ai-harness/self-report-vs-evidence.svg "Self-reported success and verified outcome are different kinds of evidence.")

## What should the verifier actually check?

A useful gate is layered. Each layer answers a narrower question than “Is this change good?”

| Layer | Example check | What it establishes |
| --- | --- | --- |
| Execution boundary | Restricted workspace, approved tools, network policy | Which actions were allowed or denied |
| Change scope | Actual Git diff and untracked-file inventory | Which files changed, including unexpected additions |
| Mechanical quality | Formatting, compilation, static analysis | Whether specified mechanical constraints hold |
| Behavioral tests | Unit, integration, and contract tests | Whether tested behaviors match assertions |
| Domain invariants | Golden cases, property checks, independent reference tests | Whether selected business rules still hold |
| Delivery gate | Base revision, artifact hashes, human approval | Whether the verified artifact is the one being promoted |

The order matters. Expensive tests should not be the first place we discover that a tool wrote outside the authorized workspace. Conversely, a clean diff and a green build do not establish domain correctness.

Where possible, the verifier should run in a **fresh, controlled environment** against a pinned revision and independently maintained checks. If the agent is allowed to change the tests and the test runner without constraint, it may accidentally—or strategically—make an invalid patch appear green. Treat the verification scripts and their results as part of the trusted computing base.

## A small Java verification policy

We can express the final acceptance decision as ordinary, testable Java logic. This example deliberately leaves actual evidence collection to a separate trusted runner. That runner inspects the Git workspace, runs the protected tests, compares contracts, and supplies the resulting values. **The model must not be trusted to populate this record from its own narrative.**

```java
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class VerificationGate {
    record Evidence(
        String checkedRevision,
        Set<String> changedPaths,
        int buildExitCode,
        int protectedTestsExitCode,
        boolean apiContractMatches
    ) {}

    static List<String> violations(Evidence e, String expectedRevision) {
        List<String> errors = new ArrayList<>();

        if (!expectedRevision.equals(e.checkedRevision())) {
            errors.add("Wrong revision verified");
        }
        for (String name : e.changedPaths()) {
            Path path = Path.of(name).normalize();
            boolean safePath = !path.isAbsolute()
                && path.toString().equals(name)
                && (path.startsWith("src/main/java")
                    || path.startsWith("src/test/java"));
            if (!safePath) errors.add("Out-of-scope file: " + name);
        }
        if (e.buildExitCode() != 0) errors.add("Build failed");
        if (e.protectedTestsExitCode() != 0) {
            errors.add("Protected tests failed");
        }
        if (!e.apiContractMatches()) errors.add("API contract changed");

        return List.copyOf(errors);
    }
}
```

This policy is intentionally small and **not a sandbox**. It assumes trusted, normalized repository paths and a trusted evidence collector; it is not responsible for securely executing arbitrary commands, handling symlinks in a live filesystem, collecting every possible change, or approving deployment. Those responsibilities belong to the surrounding harness and CI environment.

The interesting property is that the gate is not another language-model opinion. It has explicit inputs and a testable rule: **a nonempty list of violations blocks acceptance**.

A protected API contract test failing will reject the patch even if the code compiles. A modified file outside the allowlist will reject it even if every unit test passes. And an apparently valid result checked against the wrong revision is not accepted.

## Deterministic does not mean infallible

This distinction deserves care. A deterministic test proves only that its implemented assertion held under the conditions in which it ran.

A unit test may omit an edge case. A snapshot may preserve an existing bug. A mocked service may behave differently from the real dependency. Integration tests can be flaky. Environment variables, time, network calls, mutable fixtures, concurrency, and nondeterministic scheduling can make results vary unless controlled.

Even if every check is reproducible, the checks can be incomplete.

This is why a production-ready strategy needs more than a binary “all green” badge:

- **Test validity:** Are the expected outcomes independently justified?
- **Coverage of failure modes:** Do cases include negative paths and boundary conditions, not just the happy path?
- **Isolation:** Are external calls, clocks, random seeds, dependencies, and test data controlled where appropriate?
- **Artifact identity:** Was the exact commit or image that passed verification promoted, or did it change afterward?
- **Human judgment:** Are security, architectural trade-offs, and high-impact side effects reviewed where automated checks cannot settle them?

Tests are evidence of specified behavior. Formal proofs can establish stronger properties under explicit assumptions; ordinary test suites cannot provide the same guarantee. The phrase *deterministic verification* should not be used as a shortcut for “the AI is guaranteed to be correct.”

## Where model-based evaluation still belongs

Not every valuable requirement has a simple yes-or-no oracle. Consider whether a refactor is understandable, whether a migration plan is sensible, or whether documentation gives a newcomer enough context. These questions may need human review, rubric-based evaluation, or model-assisted grading.

The useful architecture is not “deterministic tests instead of all other evaluation.” It is **deterministic checks for objective invariants, calibrated evaluations for subjective quality, and explicit human decisions for irreversible or high-impact actions**.

An evaluation suite should include repeatable tasks and record outcomes across multiple trials. A model might solve the same task differently on two runs; the gate can remain stable even when the candidate patches differ. When reporting an agent's success rate, distinguish *how often an acceptable result was produced* from *how often the verifier itself ran successfully*.

Anthropic's evaluation guidance emphasizes observing the final environment outcome, not just the transcript, and rerunning trials because agent behavior varies. OpenAI's agent testing guidance similarly distinguishes deterministic orchestration tests with scripted model responses from end-to-end integration tests against real providers.

## Safe tool use is a separate control plane

Verification after execution is valuable, but it is too late to rely on it for every safety boundary. An agent with deployment credentials could perform an irreversible action before a post-run test notices.

A robust harness therefore controls capabilities *before* the action:

- Read-only tools by default for investigation.
- Explicit allowlists for filesystem and network access.
- Sandboxed execution for untrusted generated code.
- Credential scoping and secret redaction at tool boundaries.
- Approval gates for deployments, data deletion, external messages, and other sensitive writes.
- Bounded steps, time, tokens, and tool calls to prevent infinite repair loops.

Tool output is also an untrusted input. A web page, repository comment, or test log may contain text that looks like an instruction to the model. That text should not be able to grant permissions or change verification policy. The trusted harness must own those decisions.

Importantly, a string filter or prompt instruction is not an operating-system security boundary. Actual isolation requires appropriate process, filesystem, network, and credential controls.

## An architecture that keeps the evidence separate

The operational flow can be expressed as a small state machine:

```text
Task contract
    ↓
Agent works in restricted environment
    ↓
Candidate patch + trace
    ↓
Independent verification on pinned revision
    ├── FAIL → feedback, bounded repair, or escalation
    └── PASS → review / approval gate
                       ↓
                Promote verified artifact
```

![A bounded repair loop produces a verified artifact or an explicit rejection](/images/ai-harness/verification-loop.svg "The verifier—not the agent's summary—decides whether the artifact passes the defined gate.")

There are two subtle requirements here.

First, **the verifier should not trust the agent's final answer as its evidence source**. The agent may provide useful context, but the build logs, file list, test results, and checksums should originate from independent execution.

Second, **the approved artifact must be the verified artifact**. A patch can pass every check and still be unsafe to deploy if another commit is merged, a dependency changes, or a mutable build input produces a different result. Pin the tested revision and promote immutable build artifacts where the delivery platform supports it.

## Measure the whole system, not just the model

Once an agent can perform multistep work, isolated prompt quality is a poor proxy for reliability. Measure outcomes and the surrounding process:

| Metric | What it tells you |
| --- | --- |
| Accepted-task rate | Share of evaluated tasks producing artifacts that meet the defined gate |
| Constraint-violation rate | How often actions or changes fall outside the contract |
| Verification failure categories | Build, test, scope, policy, and environment failure patterns |
| Repair attempts per accepted task | How much repeated work is needed to reach acceptance |
| False-accept discoveries | Defects found after an apparently successful gate |
| Cost and time per accepted task | Whether automation is actually efficient |

Instrument traces and verification receipts, but avoid leaking source secrets, credentials, or personal data into telemetry. Keep model, prompt, tool versions, policy version, base revision, and test-environment identity when necessary for reproducibility.

Do not optimize only for a higher pass rate. An agent that changes tests until they pass, avoids difficult tasks, or finds loopholes in a grader may improve an evaluation score without improving the product. Evaluation quality is part of system design.

## Build the smallest harness that makes failure visible

You probably do not need a custom agent platform on day one. Existing coding tools already provide a model loop, command execution, context handling, and some permissions or tracing. Begin by identifying which invariants are not currently enforced.

For a Java service, the first useful improvements might be a task contract, a constrained workspace, protected regression tests, a trusted build-and-test runner, a changed-file policy, and a publish gate requiring independent evidence. Only add custom orchestration when a real failure mode justifies it.

The engineering effort then shifts from writing ever more elaborate prompts to creating an environment where incorrect work is detectable and harmful actions are constrained.

The goal is not to eliminate the model's creativity. It is to let the model be flexible **inside boundaries that do not depend on the model's self-assessment**.

## Final thoughts

A capable AI model can write convincing explanations, generate code, navigate a repository, and respond to failing tests. Those abilities are useful. They are not, by themselves, a release criterion.

A harness turns model output into controlled work. Deterministic verification turns selected requirements into repeatable evidence. Evaluation tells us how the whole system behaves across tasks. Human approval remains necessary where the consequences exceed what the checks can responsibly decide.

**The question is not whether the agent says the work is done. It is whether the system can show what changed, what was checked, and why the result is safe enough to accept.**

## Further reading

- [Anthropic — Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [OpenAI — Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [OpenAI Agents SDK — Testing](https://openai.github.io/openai-agents-python/testing/)
- [OpenAI Agents SDK — Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- [OpenAI — Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals)
