---
title: "When Retries Make Things Worse"
slug: when-retries-make-things-worse
category: engineering
excerpt: "How an attempt to recover from a temporary failure can become the reason a distributed system stays down."
publishedDate: 2026-10-28T19:14:00.000Z
tags:
  - Java
  - Distributed Systems
  - Resilience
  - System Design
  - Retries
thumbnail: /images/covers/when-retries-make-things-worse.webp
cover: /images/covers/when-retries-make-things-worse-wide.webp
draft: false
---

*How an attempt to recover from a temporary failure can become the reason a distributed system stays down.*

A request times out. The client tries again. On the second attempt, everything works.

That is the version of retries we like. A brief network problem disappears, the user sees a successful result, and no one needs to know anything went wrong.

But there is another version. A dependency slows down. Hundreds of callers reach their timeouts and retry together. The new requests compete with the work already in progress, response times rise further, and more callers retry. A small failure becomes a feedback loop.

The retry code can be perfectly correct in isolation and still make the entire system less reliable.

This is why retries are not merely an exception-handling detail. In distributed systems, they are a decision about **load, time, and the safety of repeating work**.

## The failure that looked temporary

Imagine a fictional service that creates export jobs. Under normal conditions, it sends a request to a worker API and receives a job identifier. One afternoon, the worker API becomes slow because its database connection pool is saturated.

The caller has a 500 ms response timeout. The worker takes 700 ms to finish creating a job. The caller sees a timeout and retries immediately. The worker may now be processing the original request *and* the retry. If job creation is not idempotent, two jobs may be created. If it is idempotent, the duplicate operation can be avoided—but the extra request still consumes network, connection, and application capacity.

Neither outcome is what the engineer intended by adding a retry.

The crucial detail is that **a timeout is an observation by the caller, not a transaction rollback on the server**. A connection can fail after the server has committed work. The reply may be lost even though the operation succeeded. The HTTP specification explicitly distinguishes method semantics when deciding whether an automatic retry is safe ([RFC 9110, §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)).

![A client times out while the server may continue processing, and a retry risks duplicate work](/images/retries/timeout-is-not-cancellation.svg "A timeout is not a cancellation: the original operation may finish after the caller gives up.")

The diagram is deliberately conceptual. Whether the server actually continues depends on the framework, cancellation propagation, and implementation. **You cannot assume that a client timeout cancels downstream work.**

## When one request becomes twenty-seven

A retry is an additional attempt. Across service boundaries, attempts can multiply.

Consider a three-layer call path: a gateway calls a service, which calls a downstream API, which performs a database operation. If three separate layers each allow **three total attempts**, including the initial one, a single logical request can cause as many as:

```text
3 × 3 × 3 = 27 downstream attempts
```

That is a worst-case count in a simplified call chain where every relevant attempt fails and every layer exhausts its own retry policy. It is **not** a prediction of average traffic or simultaneous concurrency. Change the wording to *three retries* (four total attempts) at each layer and the result becomes `4³ = 64`, not 27. The distinction between *retries* and *total attempts* matters in code reviews.

![Three retrying layers can multiply one logical request into twenty-seven downstream attempts](/images/retries/retry-amplification.svg "Three attempts at each of three layers can create up to twenty-seven downstream attempts.")

AWS describes this amplification problem in its [Builders' Library discussion of timeouts and retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/). Google SRE also warns that retries at multiple levels can turn overload into a cascading failure ([Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)).

Even without nested retries, traffic can grow rapidly. Suppose 1,000 logical calls arrive during an incident. If every call uses all three attempts, the dependency may receive 3,000 physical requests instead of 1,000. Backoff changes *when* those attempts arrive; it does not erase their total cost.

This suggests the first architectural question: **Which layer owns the retry?**

## Retry where the outcome is understood

A mobile client may retry an HTTP call. An API gateway may retry it again. The service's HTTP client might have its own policy. A cloud SDK may silently add further attempts. A message broker may redeliver the same command after an acknowledgement is lost.

These mechanisms are not automatically wrong, but they do not share a common understanding of what a successful business operation looks like.

A useful default for synchronous request chains is to choose **one deliberate retry owner**, preferably at a layer that knows the operation's semantics and available deadline. Disable or account for overlapping retries in gateways, clients, service libraries, and SDKs. This is guidance, not an absolute rule: different boundaries can sometimes retry independently, but their budgets and effects must be designed together.

For asynchronous work, the durable queue or worker may own redelivery instead. The important property is that retry ownership is explicit rather than an accidental combination of defaults.

There is also a difference between *a request that failed* and *a request that is worth repeating*. The response code alone cannot answer that question.

## Classify failure before adding traffic

A useful retry policy begins with two questions: **Could this failure be temporary?** And **can repeating this operation be safe?** Both must be answered.

| Observed outcome | Typical interpretation | Retry decision |
| --- | --- | --- |
| Validation failure, malformed input | Same input is unlikely to work later | Usually stop |
| Authentication or authorization failure | Repeating unchanged credentials does not fix permissions | Usually stop |
| HTTP `429` | Request was rate-limited | Potentially, after an appropriate delay |
| HTTP `503` | Service may be temporarily unavailable | Potentially, if the operation is replay-safe |
| HTTP `502` or `504` | Gateway or upstream failure; final effect may be unknown | Conditional on operation semantics |
| Network timeout or dropped connection | Response is unknown; the server may have acted | Retry only with a safe replay contract |
| Domain conflict (`409`) | Could be permanent or state-dependent | Follow the API's documented contract |

These are **examples, not universal status-code rules**. An API's error contract matters more than a generic table. Some `5xx` failures should not be blindly replayed; some state-dependent `4xx` outcomes may change after a delay.

For HTTP methods, RFC 9110 defines `GET`, `PUT`, and `DELETE` as idempotent in their *intended effect*. It does not mean that every implementation is bug-free or that repeated requests create literally identical logs or responses. An ordinary `POST` does not acquire idempotency just because a client wants to retry it. The API must provide an appropriate contract, often through a stable request identifier.

On `429` and `503`, a server may provide `Retry-After`. It can be a number of seconds or an HTTP date. A client should interpret the header according to the HTTP specification, observe the API's policy, and **never wait beyond the operation's useful deadline simply to satisfy a retry schedule** ([RFC 9110, §10.2.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3); [RFC 6585, §4](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)).

## Idempotency makes a retry safer—not free

Suppose a client requests a new export with an `Idempotency-Key`. If it loses the response, it sends the *same key* with the *same intended operation*. The server can recognize the replay and return a semantically equivalent result instead of creating a second export.

But that guarantee needs careful implementation. Simply attaching a UUID to each request does not provide idempotency.

The server needs a durable, appropriately scoped key; an atomic way to claim or recognize that key under concurrent requests; a rule for rejecting the same key with a different payload; and a policy for requests still in progress, failures, retention, and expiry. If the actual side effect happens in another system, a database uniqueness constraint by itself cannot make both systems atomic. An outbox, transactional boundary, or reconciliation flow may be necessary.

The AWS Builders' Library explores the subtle requirement for a repeat request to preserve the caller's *intent*, not just its bytes ([Making Retries Safe with Idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)).

Idempotency reduces the risk of duplicate **business effects**. It does not remove the load of duplicate **network requests**, nor does it prevent every other resource from becoming overloaded.

## Backoff helps. Jitter reduces synchronization.

Immediate retries are particularly dangerous when many clients encounter the same failure at once. Fixed delays are an improvement, but can still synchronize callers into repeating waves.

Exponential backoff increases the waiting window after consecutive failures. **Full jitter** draws a random delay inside that window, distributing attempts over time.

For retry number `n` starting at 1, one illustrative formulation is:

```text
ceiling(n) = min(cap,
                 base × 2^(n - 1))
wait(n)    = random between
             0 and ceiling(n)
```

For a 100 ms base and 2,000 ms cap, the first three windows are `0–100 ms`, `0–200 ms`, and `0–400 ms`. Those are **illustrative windows**, not recommended values for every dependency. The actual random waits vary, and a zero draw is possible. Jitter reduces synchronization; it does not guarantee that overload disappears.

![Fixed-delay retries line up, while jitter spreads retries across the available windows](/images/retries/backoff-and-jitter.svg "Fixed delays can synchronize clients; randomized backoff spreads attempts through time.")

The delays also need an upper bound, a maximum attempt count, and a **retry budget**. Google SRE recommends both randomized exponential backoff and budgets to limit additional traffic during overload. A token bucket is one way to cap local retries, but coordination still matters when thousands of processes each have their own bucket.

And if a service explicitly says to wait 120 seconds, adding a random 50 ms delay is not compliance. `Retry-After` and client-side backoff need to be reconciled while respecting the overall deadline. If the wait cannot fit, stop rather than sleep pointlessly.

## The deadline is the real boundary

A connection timeout answers how long to wait for a connection. A per-attempt timeout bounds one call. Neither tells us how long the *user's entire operation* is allowed to take.

A request with an 800 ms overall deadline cannot afford three 700 ms attempts plus two long waits. Every retry spends part of the original latency budget. Propagating a deadline or remaining time to downstream calls helps avoid useful-looking work that finishes after the caller has already given up.

Asynchronous services may not be able to cancel work reliably. Even when they receive a cancellation signal, they might have completed an irreversible effect. Cancellation and idempotency solve different problems.

The following small Java 21 example demonstrates a **retry planner**, not a complete HTTP client. It calculates a capped full-jitter delay and decides whether another attempt is permitted. The caller must still classify errors, establish whether the operation is replay-safe, track a monotonic deadline, account for shared retry budgets, and execute or cancel calls correctly.

```java
import java.util.Objects;
import java.util.random.RandomGenerator;

public final class RetryPlanner {
    private static final long BASE_MS = 100;
    private static final long CAP_MS = 2_000;

    private RetryPlanner() {}

    // retryNumber is 1 for the first retry after the initial call.
    public static long fullJitterMillis(
            int retryNumber, RandomGenerator random) {
        if (retryNumber < 1) {
            throw new IllegalArgumentException("retryNumber must be >= 1");
        }
        Objects.requireNonNull(random);

        long ceiling = BASE_MS;
        for (int i = 1; i < retryNumber && ceiling < CAP_MS; i++) {
            ceiling = Math.min(CAP_MS, ceiling * 2);
        }
        return random.nextLong(ceiling + 1);
    }

    // maxAttempts counts the initial call as attempt 1.
    public static boolean mayRetry(
            boolean transientFailure,
            boolean safeToReplay,
            int attemptsCompleted,
            int maxAttempts,
            long remainingMs,
            long waitMs,
            long minimumAttemptBudgetMs) {
        if (maxAttempts < 1 || attemptsCompleted < 1
                || waitMs < 0 || minimumAttemptBudgetMs < 1) {
            throw new IllegalArgumentException("invalid retry arguments");
        }
        return transientFailure && safeToReplay
                && attemptsCompleted < maxAttempts
                && remainingMs > waitMs
                && remainingMs - waitMs >= minimumAttemptBudgetMs;
    }
}
```

Notice what the method does **not** do: it does not catch every exception, start a retry loop, or declare that an HTTP timeout was safe. Those decisions belong to the caller's semantic policy. `minimumAttemptBudgetMs` is a local guard, not a guarantee of successful execution. In a real service, the available time must be measured against a monotonic deadline immediately before each attempt, and the planned wait must not violate server-provided retry timing.

Before adding a framework, check the retry behavior that the framework, SDK, HTTP client, and infrastructure already provide. Resilience4j supports exception predicates, retry attempt limits, and configurable interval functions; its defaults are not a substitute for a domain-specific policy ([Retry documentation](https://resilience4j.readme.io/docs/retry)).

## A circuit breaker cannot fix every overload problem

Retry, circuit breaker, bulkhead, and rate limiter are related—but they protect different things.

A **retry** gives an operation another chance. A **circuit breaker** can stop calls temporarily when failures or slow-call rates cross a threshold. A **bulkhead** limits concurrent work. A **rate limiter** controls the rate at which work is admitted. A **bounded queue** prevents unlimited backlog, at the cost of rejecting or postponing requests when full.

![A decision flow asks whether replay is safe, whether time and retry budget remain, and whether to schedule another attempt](/images/retries/safer-retry-decision.svg "A safer retry decision checks replay safety, failure type, deadline, and available budget before scheduling another attempt.")

These controls should not be confused. A circuit breaker is not a concurrency limit: when it is closed, many calls may still run at once. Resilience4j explicitly recommends a bulkhead for limiting concurrency ([CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker), [Bulkhead](https://resilience4j.readme.io/docs/bulkhead)).

Circuit breakers also introduce state transitions and recovery behavior that must be tested. Opening a breaker can protect a failing dependency; closing it too aggressively can cause another surge. A small, controlled retry budget and good admission control may sometimes be a simpler choice. There is no universal resilience annotation stack that fits every workload.

## Messages are retries too

HTTP retries are the visible part of the problem. Event-driven systems have their own forms of repeated work.

A consumer can process a message, commit a database change, and crash before acknowledging the message. On redelivery, the consumer sees the same command again. Depending on the broker, consumer configuration, and transactional boundaries, this can be a normal at-least-once delivery scenario—not necessarily a broker bug.

Acknowledging before a durable effect risks lost work; acknowledging after the effect risks replay. The design therefore needs an idempotent consumer, a deduplication key or operation identifier, an appropriate transaction/outbox boundary, and a deliberate plan for permanently failing messages. Delayed retry topics or queues should use backoff and bounded retry policies rather than immediately recycling a poison message forever.

Claims of “exactly once” require careful scope: a broker guarantee does not automatically make arbitrary external side effects exactly once.

The same question applies to both HTTP and messaging: **who owns repeated attempts, and what happens if the first attempt already took effect?**

## What production metrics reveal

A dashboard that shows only request success rate can hide a dangerous situation. A system might still return successful responses while each logical request consumes two or three downstream attempts. Latency and resource usage deteriorate before the public error rate changes.

I would monitor **logical operations** separately from **physical attempts**. Their ratio—physical attempts divided by logical operations over a consistent scope and window—is a useful *retry amplification factor*. A value near 1 suggests few extra attempts; a rising ratio means the dependency is doing more work per user operation. It is a diagnostic metric, not a universal service-level objective.

Other useful signals are attempts per logical operation, retry classification, retries suppressed by the budget, deadline expirations, exhausted attempts, downstream queue depth, concurrent in-flight calls, breaker state changes, and idempotency replays. Break them down by dependency and operation type, but avoid high-cardinality identifiers or personal information in metric labels.

Tracing should connect attempts to their **one logical operation** without logging sensitive payloads. If retries are invisible in telemetry, a retry storm can look like unexplained organic traffic growth.

## What I would check before shipping a retry policy

The review starts with semantics: is the operation safe to repeat, including after a lost response? Then ownership: which layer will retry, and which implicit retries are already enabled? Then limits: max **total** attempts, overall deadline, per-attempt timeout, backoff, jitter, and budget. Only after those questions are settled do I choose a library configuration.

I would also test the uncomfortable cases: the server commits but the response vanishes; every attempt returns `503`; `429` asks for a wait longer than the remaining deadline; multiple callers retry simultaneously; the idempotency key is reused with a different payload; and a message is redelivered after its business effect has completed.

An especially valuable load test is a **failure-injection test under realistic concurrency**. Measure whether the retry policy makes the dependency's recovery faster or slower. A retry strategy that improves a single happy-path test but destabilizes an overloaded dependency is not a resilience improvement.

## Final thoughts

Retries are useful because distributed systems have temporary failures. But they are dangerous for precisely the same reason: when a dependency is in trouble, additional attempts may be the last thing it needs.

The mature question is not *How many times should we retry?*

It is *When is another attempt safe, useful, and affordable within the time and capacity we still have?*

A good retry policy treats failure classification, idempotency, deadlines, backoff, budgets, and admission control as one design problem. Sometimes the correct response to a failure is to try again. Sometimes it is to stop quickly and let the system recover.

**Resilience is not the number of retries a service can make. It is the amount of failure the system can absorb without making the failure worse.**

---

### Further reading

- [AWS Builders' Library — Timeouts, Retries, and Backoff with Jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [AWS Builders' Library — Making Retries Safe with Idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
- [Google SRE — Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)
- [Google SRE — Handling Overload](https://sre.google/sre-book/handling-overload/)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 6585 — Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585.html)
- [Resilience4j — Retry](https://resilience4j.readme.io/docs/retry)
