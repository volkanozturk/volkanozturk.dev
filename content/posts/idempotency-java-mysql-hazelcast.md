---
title: "Idempotency in Java: Making Retries Safe Across Multiple Instances"
slug: idempotency-java-mysql-hazelcast
category: engineering
excerpt: "A production-minded approach to idempotent APIs with Java, MySQL, and Hazelcast—without pretending a distributed cache can replace a database constraint."
publishedDate: 2026-10-05
tags:
  - Java
  - Distributed Systems
  - MySQL
  - Hazelcast
  - Architecture
thumbnail: /images/covers/idempotency-java-hazelcast.webp
cover: /images/covers/idempotency-java-hazelcast-wide.webp
draft: false
---

A request timing out does not mean it failed.

That sentence is the reason idempotency matters.

Imagine an order endpoint. The client sends `POST /orders`. The server creates the order and commits it to MySQL, but the connection disappears before the response reaches the client. From the client's point of view, nothing came back. Retrying is the only sensible thing to do.

Now imagine the service runs as three Java instances behind a load balancer. The retry may not even reach the instance that handled the first request.

Without an idempotency design, a perfectly normal retry can become a second order, a second payment, a second email, or a second message published to another system.

The interesting part is not stopping users from double-clicking. The interesting part is making **uncertain outcomes safe** in a distributed system.

![Three Java instances coordinate through Hazelcast while MySQL remains the durable idempotency boundary.](/images/idempotency-java-hazelcast/01-architecture.webp)

## Idempotency is about effects, not requests

An operation is idempotent when applying the same logical operation more than once leaves the system in the same state as applying it once.

That distinction matters. We are not trying to guarantee that a request physically crosses the network only once. We cannot. Networks retry, clients retry, queues redeliver, processes crash and load balancers route requests to different instances.

What we can control is the effect.

If the same logical `CreateOrder` operation arrives five times:

- one order should exist,
- inventory should be reserved once,
- a payment should be initiated once,
- and retries should be able to discover the result of the original operation.

This is why "exactly once" is usually the wrong mental model at the application boundary. A more useful model is **at-least-once delivery plus idempotent processing**.

## Where duplicates really come from

Duplicates are not an edge case. They are a normal consequence of failure handling.

A client may retry after a timeout. A user may click twice. A gateway may retry a request. A message consumer may finish its database work and crash before acknowledging the message. A pod may disappear after committing a transaction but before returning the HTTP response.

The hardest case is always the same:

> The operation may have succeeded, but the caller cannot know whether it succeeded.

A reliable API must make that uncertainty recoverable.

## Start with natural idempotency

Before adding infrastructure, check whether the operation can be made naturally idempotent.

Setting an absolute value is easier to retry than applying a relative change:

```sql
-- Repeating this changes the value every time.
UPDATE product
SET stock = stock - 1
WHERE id = ?;

-- Repeating this converges to the same state.
UPDATE product
SET stock = ?
WHERE id = ?;
```

That only holds while nothing else writes the row in between. A late retry of an absolute write can overwrite a newer value, so in practice it usually needs a version check, much like the guard below.

State transitions can also carry their own guard:

```sql
UPDATE orders
SET status = 'CANCELLED'
WHERE id = ?
  AND status = 'PENDING';
```

The second execution updates zero rows. That does not automatically mean "success"—the order may already be cancelled or may be in a state that cannot be cancelled—but the transition itself is protected from being applied twice.

Business uniqueness belongs in the database too. If one cart is allowed to produce only one order, a unique constraint on `cart_id` is stronger than an application-level `SELECT` followed by `INSERT`.

These techniques are cheap and should be preferred when the domain allows them.

## When POST needs an Idempotency-Key

Some operations are inherently command-like. `POST /orders` or `POST /payments` may legitimately create something new on every independent call.

For those endpoints, the client can attach a key that identifies the **logical operation**:

```http
POST /orders
Idempotency-Key: 8e03978e-40d5-43e8-bc93-6894a57f9324
Content-Type: application/json

{
  "cartId": "c-4821",
  "addressId": "a-17"
}
```

The key is not generated for every retry. It is generated once for the operation and reused by every retry of that operation. A genuinely new order gets a new key.

I scope keys by client or tenant rather than treating them as globally unique. The durable identity becomes:

```text
(client_id, idempotency_key)
```

I also store a request fingerprint. Reusing the same key with a different payload is a client bug, not a retry.

A useful record contains:

```text
client_id
idempotency_key
request_hash
status
response_code
response_body
resource_id
created_at
expires_at
```

`response_body` is optional. For large responses, storing a stable resource identifier and rebuilding the response may be cheaper. What matters is that a retry can resolve to the same logical result.

## The multi-instance problem

On one JVM it is tempting to use a `ConcurrentHashMap` or a local lock. That stops working as soon as the service has more than one instance.

Instance A does not know what Instance B has in memory.

This is where Hazelcast is useful—but it is also where it is easy to give Hazelcast too much responsibility.

In this design:

- **MySQL is the source of truth for idempotency.**
- **Hazelcast is the shared fast path and optional coordination layer.**
- A Hazelcast miss never means "this operation has not happened."
- A MySQL unique constraint is the final authority on who owns a key.

That last point is the important one.

## The MySQL table is the correctness boundary

A minimal table can look like this:

```sql
CREATE TABLE idempotency_record (
    client_id        VARCHAR(64)  NOT NULL,
    idempotency_key  VARCHAR(255) NOT NULL,
    request_hash     CHAR(64)     NOT NULL,
    status           VARCHAR(16)  NOT NULL,
    response_code    INT          NULL,
    response_body    JSON         NULL,
    resource_id      VARCHAR(128) NULL,
    created_at       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    expires_at       TIMESTAMP(6) NOT NULL,

    PRIMARY KEY (client_id, idempotency_key),
    INDEX idx_idempotency_expiry (expires_at)
) ENGINE=InnoDB;
```

The primary key is not just an index for faster reads. It is part of the concurrency design.

Do not implement ownership as:

```text
SELECT key
if missing:
    INSERT key
```

Two instances can both observe "missing" before either insert becomes visible.

Instead, let MySQL make the decision atomically.

For example:

```sql
INSERT IGNORE INTO idempotency_record (
    client_id,
    idempotency_key,
    request_hash,
    status,
    expires_at
)
VALUES (?, ?, ?, 'PROCESSING', ?);
```

Then inspect whether the insert actually created the row.

If the first transaction has not committed yet, InnoDB makes the second insert wait for it. When the first commits, the second sees a duplicate and inserts nothing. When the first rolls back, the second becomes the owner.

`IGNORE` also turns other errors into warnings. A key longer than the column is truncated instead of rejected, so validate the key length before you get here.

`INSERT ... ON DUPLICATE KEY UPDATE` is another option, but I prefer not to hide the ownership decision inside an unrelated update. The important property is the same: a `PRIMARY KEY` or `UNIQUE` constraint arbitrates the race.

![Request flow, concurrent duplicate handling, and the main retry/failure cases across Java, Hazelcast, and MySQL.](/images/idempotency-java-hazelcast/02-request-concurrency-failures.webp)

## The simplest safe path: keep local side effects in one transaction

If creating an order only changes data in the same MySQL database, keep the idempotency record and the business mutation in one transaction.

Conceptually:

```text
BEGIN

claim idempotency key
if duplicate:
    read existing result
    return it

create order
reserve inventory
store successful response
mark idempotency record COMPLETED

COMMIT
```

The valuable property is not the status field. It is the transaction boundary.

Either the order and its idempotency result commit together, or neither commits.

If the JVM crashes before commit, MySQL rolls the transaction back and a retry can become the new owner. If it crashes after commit but before the HTTP response reaches the client, the retry reads the committed result instead of creating another order.

This is the case where adding a distributed lock usually buys very little.

## A Java service implementation

The exact repository and transaction APIs will differ, but the service boundary should make the ownership rule obvious.

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final IdempotencyRepository idempotencyRepository;
    private final OrderRepository orderRepository;
    private final IdempotencyCache idempotencyCache;

    @Transactional
    public CreateOrderResult createOrder(
            String clientId,
            String idempotencyKey,
            CreateOrderCommand command) {

        String requestHash = RequestHasher.sha256(command);

        var cached = idempotencyCache.get(clientId, idempotencyKey);
        if (cached != null) {
            return cached.requireSameRequest(requestHash);
        }

        boolean claimed = idempotencyRepository.tryClaim(
                clientId,
                idempotencyKey,
                requestHash);

        if (!claimed) {
            var existing = idempotencyRepository.getForKey(
                    clientId,
                    idempotencyKey);

            existing.requireSameRequest(requestHash);

            if (existing.isCompleted()) {
                return existing.toResult();
            }

            throw new OperationInProgressException();
        }

        Order order = orderRepository.create(command);

        CreateOrderResult result =
                CreateOrderResult.created(order.id());

        idempotencyRepository.complete(
                clientId,
                idempotencyKey,
                result);

        return result;
    }
}
```

To keep the example in one place, the cache lookup sits inside the `@Transactional` method. In a real service I would do it before entering that method: Spring begins the transaction, and by default takes a connection from the pool, as soon as the method is called, so a cache hit inside it is not free.

There is one deliberate omission: I do **not** update Hazelcast inside this transaction and pretend it is atomic with MySQL.

It is not.

The cache should be populated after a successful commit. In Spring, that can be done with transaction synchronization or an application event handled in `AFTER_COMMIT`.

```java
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void cacheCompleted(IdempotencyCompleted event) {
    idempotencyCache.put(
            event.clientId(),
            event.idempotencyKey(),
            event.result());
}
```

If the application crashes after MySQL commits but before Hazelcast is populated, nothing breaks. The next request misses the cache and falls back to MySQL.

That is exactly how a cache should fail.

## What Hazelcast should do

Hazelcast gives all service instances a shared view that local memory cannot provide.

For this problem I use it for two things.

### 1. Completed-response cache

A distributed `IMap` can cache recently completed idempotency results:

```java
IMap<IdempotencyCacheKey, CachedResult> map =
        hazelcastInstance.getMap("idempotency-results");
```

A duplicate request can often be answered without touching MySQL.

The cache TTL should not define the idempotency guarantee. It can be shorter than the MySQL retention period because a miss simply falls back to durable storage.

### 2. Optional in-flight coordination

If the protected operation is expensive, a distributed lock can reduce duplicate work while several instances are racing.

For strong distributed locking, use Hazelcast's CP subsystem and `FencedLock` rather than assuming a normal distributed map lock has the same failure semantics.

```java
// A fixed set of locks, created once at startup and reused.
FencedLock lock = lockStripes.get(
        Math.floorMod(stableKeyHash.hashCode(), lockStripes.size()));

if (!lock.tryLock(2, TimeUnit.SECONDS)) {
    // The lock only saves work. MySQL still decides.
    return executeWithMySqlIdempotency(...);
}

try {
    return executeWithMySqlIdempotency(...);
} finally {
    lock.unlock();
}
```

The stripes are deliberate. Hazelcast does not remove CP locks automatically, and a destroyed one cannot be used again under the same name, so one `FencedLock` per idempotency key would keep growing the CP group's state. A fixed number of locks, each obtained once with `getCPSubsystem().getLock("idempotency-" + i)`, keeps that bounded. The price is that unrelated keys can share a lock, which is why a timeout falls through to MySQL instead of being reported as "in progress".

But the lock is still **not** the source of truth.

If the cluster is unavailable, a lock session expires, a node pauses, or the application is restarted, MySQL must still prevent a duplicate committed effect.

This gives us a useful rule:

> Hazelcast may prevent unnecessary duplicate work. MySQL must prevent duplicate durable effects.

Also, Hazelcast's CP subsystem must actually be configured with CP members for its strong consistency guarantees. Running CP data structures in the default unsafe mode weakens the exact property we wanted from the lock.

## Do we need `FencedLock` at all?

Often, no.

For a short MySQL-only transaction, the database unique key is simpler and usually better.

A distributed lock becomes more interesting when:

- calculating the result is expensive before the database write,
- many duplicates for the same key are expected,
- duplicate downstream preparation is costly,
- or you need cluster-wide single-flight behavior.

Even then, measure it. Every distributed coordination primitive adds latency, failure modes and operational work.

A good production design should still be correct with the Hazelcast fast path disabled.

## Same key, different payload

A key without a request fingerprint is incomplete.

Suppose the first request is:

```json
{
  "cartId": "c-4821",
  "addressId": "a-17"
}
```

and a later request accidentally reuses the same key with:

```json
{
  "cartId": "c-9000",
  "addressId": "a-44"
}
```

Returning the first order would be dangerous. Executing the second would violate the meaning of the key.

So we hash a canonical representation of the command and compare it on every duplicate.

Do not blindly hash raw JSON bytes if semantically equivalent payloads may differ in whitespace or field order. Hash a canonicalized representation or a stable DTO serialization.

For authenticated APIs, include identity in the idempotency scope. One tenant should not be able to collide with another tenant's key.

## What should a concurrent retry receive?

There is no universal status code that makes every API correct.

A practical policy is:

- completed + same request → replay the original success,
- same key + different request → reject it,
- still processing → return a documented "in progress" response or wait briefly and retry the read,
- failed before any durable effect → allow a retry to acquire ownership,
- failed after an external effect may have happened → recover; do not blindly execute again.

`409 Conflict` is a reasonable choice for "the same operation is currently in progress." `422 Unprocessable Content` is a reasonable choice for "this key belongs to a different payload." The exact contract should be documented and consistent across the API.

## The dangerous boundary: calling another system

The clean MySQL transaction model ends when the operation performs a side effect outside MySQL.

Suppose order creation also calls a payment provider.

```text
MySQL transaction commits
        ↓
payment API succeeds
        ↓
our process dies before saving the payment result
```

On retry, MySQL tells us the operation is incomplete. But calling the payment provider again may charge the customer twice.

A local rollback cannot undo a remote side effect.

![A payment call between two MySQL transactions: a timeout or a crash leaves an unknown outcome, resolved by a lookup, a retry with the same key, or reconciliation.](/images/idempotency-java-hazelcast/03-idempotency-details.webp)

The design must change.

First, persist durable intent. Then call the external system with a deterministic idempotency key or business reference. Finally, persist the result.

```text
Transaction 1
  create/claim idempotency record
  create order in PROCESSING state
COMMIT

Call downstream
  Idempotency-Key: order-1042-payment

Transaction 2
  store downstream result
  mark order ready
  mark idempotency record COMPLETED
COMMIT
```

If the process dies between the two transactions, the durable `PROCESSING` state tells a recovery worker what still needs to be reconciled.

A timeout should first become an **unknown outcome**, not an immediate failure:

```text
Did the call fail?
or
Did the call succeed and only the response disappear?
```

If the downstream API supports lookup by our reference, querying by that stable reference is safer than blindly retrying.

If the downstream system supports idempotency, pass the same deterministic key on every retry. If it supports neither, an unknown outcome is not something to retry automatically. It needs reconciliation, sometimes by a person.

## Hazelcast does not solve the external side-effect problem

This deserves its own section because distributed caches and locks can make a design feel safer than it is.

A Hazelcast lock cannot make a MySQL transaction and a remote HTTP call atomic.

A cache entry cannot prove that a remote payment did or did not happen.

Even a strongly consistent cluster lock cannot roll back an email already sent or a shipment already created.

For those flows you need durable workflow state, downstream idempotency, reconciliation, an outbox/inbox pattern, or a saga depending on the problem.

Hazelcast can coordinate workers. It cannot replace a durable protocol.

## Message consumers have the same problem

The HTTP header disappears when the same idea moves to Kafka or another broker, but the principle stays the same.

Use a stable message identifier and record it in the same transaction as the business effect.

```sql
CREATE TABLE processed_message (
    consumer_name VARCHAR(128) NOT NULL,
    message_id    VARCHAR(128) NOT NULL,
    processed_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (consumer_name, message_id)
);
```

The consumer transaction becomes:

```text
BEGIN
  claim message id
  apply business change
COMMIT
ACK
```

If the process commits and dies before the acknowledgement, the broker may redeliver the message. The second attempt finds the message id and skips the business effect.

The broker does not need to promise "the message can physically appear only once." The consumer makes redelivery harmless.

## Failure scenarios I want the design to survive

Before calling an idempotency implementation production-ready, I test it against failures rather than only happy-path duplicates.

**Two requests hit two instances simultaneously.**  
Both miss Hazelcast. Only one MySQL claim can win.

**The winner crashes before commit.**  
Its transaction rolls back. Another request can acquire the key.

**The winner commits but dies before responding.**  
The retry reads the committed result.

**MySQL commits but the Hazelcast cache write never happens.**  
The retry misses cache and falls back to MySQL. Correctness is unchanged.

**Hazelcast is unavailable.**  
The endpoint becomes slower or loses single-flight coordination, but MySQL still protects durable effects. That assumes Hazelcast calls have short timeouts and an error is treated as a miss; otherwise a cache outage becomes an API outage.

**The same key is reused with a different payload.**  
The request hash mismatch is rejected.

**A PROCESSING record becomes old.**  
A recovery policy decides whether it is safe to retry, reconcile or fail it. We do not simply delete it and hope.

**The downstream call times out.**  
We treat the outcome as unknown and reconcile using a deterministic reference.

That is the standard I care about: not "does it work when the user double-clicks?" but "does it remain correct when components fail between any two lines?"

## Retention and cleanup

Idempotency records do not need to live forever, but expiration is part of the API contract.

The retention period must be longer than the maximum realistic retry window. If clients may retry for ten minutes, expiring keys after five minutes makes the guarantee meaningless.

I keep durable retention in MySQL and use a scheduled cleanup job with an indexed `expires_at`.

Hazelcast can use a shorter TTL because it is only a cache:

```java
map.put(key, result, 2, TimeUnit.HOURS);
```

MySQL may retain the same record for 24 hours or longer, depending on the product contract.

Never let a cache TTL silently redefine a business guarantee.

## Observability matters

Idempotency failures are difficult to debug if all we log is "duplicate request."

Useful metrics include:

```text
idempotency.claim.created
idempotency.claim.duplicate
idempotency.cache.hit
idempotency.cache.miss
idempotency.payload_mismatch
idempotency.in_progress
idempotency.recovery.started
idempotency.recovery.completed
```

I also want structured logs containing a hashed or otherwise safe idempotency identifier, client/tenant identity, resource id and final state.

Do not log sensitive request bodies just to make request hashing debuggable.

## Common mistakes

**"Hazelcast is distributed, so we can keep idempotency only there."**  
No. A cache/cluster restart or retention policy should not be able to erase the durable correctness history of a critical operation.

**"We use a distributed lock, so the database unique key is unnecessary."**  
No. The lock is coordination. The database constraint is the durable invariant.

**"We can `get()` and then `put()` if missing."**  
That is a race. Use an atomic primitive for cache coordination and still keep the database constraint.

**"Every retry gets a new idempotency key."**  
Then it is not an idempotency key. The same logical operation must reuse the same key.

**"Same key means same request."**  
Not necessarily. Compare a stable request fingerprint.

**"A timeout means the downstream call failed."**  
A timeout means the outcome is unknown.

**"Exactly-once Kafka delivery means our database effect is exactly once."**  
Broker guarantees do not automatically include your database or remote side effects.

**"We should lock every idempotent request in Hazelcast."**  
Only if it solves a measured problem. For a short local transaction, the MySQL unique constraint is often all the coordination you need.

## The architecture I would ship

For a Java service with multiple instances, MySQL and Hazelcast, I would start here:

```text
Client
  │
  │ Idempotency-Key
  ▼
Java instance
  │
  ├─ Hazelcast completed-result cache
  │      hit  → validate request hash → replay result
  │      miss → continue
  │
  ├─ MySQL transaction
  │      atomically claim (client_id, key)
  │      apply local business changes
  │      store result
  │      COMMIT
  │
  └─ after commit
         populate Hazelcast cache
```

Then I would add Hazelcast CP coordination only if duplicate in-flight work is expensive enough to justify it.

For operations that leave MySQL, I would stop pretending a transaction or lock is enough and introduce durable stages, deterministic downstream keys and recovery.

That separation keeps the architecture understandable:

**Hazelcast optimizes. MySQL decides. The workflow recovers.**

## Final thought

Idempotency is not a duplicate-request feature.

It is a failure-recovery contract.

The network is allowed to lose responses. Clients are allowed to retry. Pods are allowed to restart. Brokers are allowed to redeliver. Hazelcast is allowed to be temporarily unavailable.

A production system should still know whether an operation happened, should still be able to return or reconstruct its result, and should still prevent the same durable side effect from being committed twice.

Once idempotency is designed that way, retries stop being dangerous. They become one of the mechanisms that make the system reliable.
