---
title: "Java Experience Beyond the Code"
slug: java-experience-beyond-the-code
category: engineering
excerpt: "Eight production situations where better questions matter more than quick fixes, from slow APIs and connection pools to retries and duplicate messages."
publishedDate: 2026-09-13T11:20:00.000Z
tags:
  - Java
  - Production
  - Architecture
summary: "Better questions for real production problems."
thumbnail: /images/covers/java-experience.webp
draft: false
---

After ten years of writing Java, I'm comfortable with the language. That doesn't mean the next production problem will be obvious.

Knowing how a connection pool works is one thing. Working out why every connection is busy, while requests are piling up, takes a different kind of understanding.

That's the part of experience I want to focus on here: deciding what to investigate, what to change, and what that change might cost. These eight examples are hypothetical, but each shows how a reasonable fix can miss the problem.

## 1. A slow API: where did the time go?

A slow endpoint can send you straight into the code, looking for an expensive loop or a stream worth rewriting.

Suppose the request takes 4.8 seconds, and a trace shows that 4.5 seconds are spent waiting for a payment provider. There isn't much to gain from that loop.

Start with traces, latency metrics, and relevant logs. Is the application doing work, waiting for a connection, or waiting for another service? Is this happening across most requests or only the slowest ones?

The answer determines the next step. Local code may need attention. A slow dependency may call for a tighter timeout and a sensible failure response. That timeout won't make the provider faster, but it can stop your application from waiting longer than it can afford.

## 2. An exhausted pool: why are connections still busy?

When all 20 database connections are in use, increasing the pool to 100 is tempting. Before changing it, look at how long connections are held, how many requests are waiting, and how much capacity the database has left.

Imagine a transaction that acquires a connection, runs a query, and then waits five seconds for an HTTP response. Depending on how connections are managed, it may hold that connection for the entire wait.

Slow queries and lock contention can produce the same symptom. Moving the HTTP call outside the transaction may free connections sooner, but you also need to decide what happens if the remote call succeeds and the database update fails.

Sometimes a larger pool is the right choice. Just count connections across all application replicas, and check whether the database can handle the extra concurrency. [HikariCP's pool-sizing guide](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing) explains why adding connections can actually reduce throughput.

## 3. More threads: what resource is limiting us?

More threads can help when tasks spend much of their time waiting for I/O. For CPU-heavy work, thousands of runnable platform threads still have to share the available cores, with scheduling overhead on top.

Virtual threads make it cheaper to support many blocking tasks. They don't make calculations faster, and they don't increase the capacity of the database those tasks are calling.

You still need to limit how much work reaches a dependency at once. Otherwise, making concurrency cheaper in the application can simply move the queue somewhere else.

Before changing the thread count, find out what is running out: CPU, connections, downstream capacity, or something else. [Oracle's virtual-thread guide](https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html) is useful background on where virtual threads help.

## 4. Growing memory: a leak or a sizing problem?

A rising memory graph doesn't tell you much on its own. The heap normally fills and is reclaimed as the application runs. What matters is how much remains in use after garbage collection, especially once the application has warmed up and the load is stable.

If that baseline keeps rising, investigate what is still reachable. An unbounded cache or request data retained longer than intended could explain it.

Increasing `-Xmx` can be a valid fix for an undersized heap, provided the container has room for both the heap and the JVM's other memory needs. It won't fix every `OutOfMemoryError`, and it won't stop a leak from continuing.

Heap dumps can show what is retaining objects. Collecting one can also disrupt a busy process, and its contents may include sensitive data, so choose how and where to collect it carefully. [Oracle's memory troubleshooting guide](https://docs.oracle.com/en/java/javase/25/troubleshoot/troubleshooting-memory-leaks.html) covers the distinction between leaks and other memory problems.

## 5. A concurrent collection: is the whole operation atomic?

A `ConcurrentHashMap` supports thread-safe access, but these two calls are still separate operations:

```java
if (!map.containsKey(key)) {
    map.put(key, value);
}
```

Two threads can both see that the key is missing. They can then both call `put`, with one replacing the other's value.

For insert-if-absent behaviour, use `map.putIfAbsent(key, value)`. It performs that check and insertion atomically.

The guarantee has a boundary, though. It doesn't make mutable objects stored in the map thread-safe, or protect a business rule involving several keys. You need to identify the whole operation that must stay consistent, then choose how to protect it.

The [ConcurrentHashMap API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html) describes the guarantees of each operation.

## 6. A failed request: will retrying help?

A retry is useful when the failure is temporary. If the service is overloaded, another attempt may make recovery harder.

First decide which failures are worth retrying. A validation error usually needs a different request, not another copy of the same one.

For retryable failures, use timeouts, limited attempts, exponential backoff, and jitter. Keep the attempts within the caller's overall time budget. Also check whether the HTTP client, SDK, or another service layer already retries; those attempts can multiply quickly.

For operations with side effects, establish how retries will be handled safely. A payment request that times out may already have succeeded. Retrying it needs an idempotency mechanism, not an assumption that nothing happened.

A circuit breaker can help stop repeated calls to a failing dependency, but you still have to make these decisions. [AWS's retry guidance](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_limit_retries.html) explains how uncontrolled retries add to overload.

## 7. A repeated message: can we process it safely?

A consumer commits a database update, then crashes before acknowledging the message or committing its Kafka offset. When processing resumes, that message may be delivered again.

The database change has already happened. Running the handler again must account for that.

One approach is to record a stable event ID and apply the business update in the same database transaction. A uniqueness constraint prevents the same event from being applied twice. Acknowledge the message or commit the offset only after the database transaction commits.

The event record and the update need to succeed or fail together. Recording the event first in a separate transaction could cause a later delivery to be skipped even though the business update never happened.

External side effects need their own strategy, such as an idempotency key accepted by the receiving service. Kafka transactions don't automatically make an arbitrary HTTP call part of the same atomic operation.

The [Kafka consumer documentation](https://kafka.apache.org/40/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html) and [RabbitMQ reliability guide](https://www.rabbitmq.com/docs/reliability) cover these redelivery and recovery scenarios.

## 8. It worked locally: what changed?

A service handling ten requests per second may behave very differently at a thousand. Production also brings larger datasets, uneven traffic, slower dependencies, and requests that arrive together.

Compare those conditions before assuming the code or the infrastructure is at fault. Look at pool saturation, query behaviour, dependency latency, and garbage collection.

Check the resources the process can actually use, too. In Kubernetes, CPU limits can cause throttling, and exceeding a memory limit can lead to an OOM kill. A container needs memory for more than the Java heap, including thread stacks, metaspace, and native buffers. The [Kubernetes resource-management documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) explains how those limits are enforced.

Once you have a likely constraint, try to reproduce it with representative traffic and data. A local test is much more useful when it includes the conditions that caused the failure.

## Before changing anything

During an incident, you may need to act before you have a complete explanation. A rollback, reduced traffic, or a temporary capacity increase can be the right way to protect users.

The investigation still matters once the service has recovered. If a larger pool helped, find out why. If a restart cleared the memory problem, check whether usage is climbing again.

That's what I value in production experience: being able to explain why a change should help, what could go wrong, and which measurements will tell us whether it worked.
