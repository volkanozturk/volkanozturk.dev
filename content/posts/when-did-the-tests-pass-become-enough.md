---
title: "When Did “The Tests Pass” Become Enough?"
slug: when-did-the-tests-pass-become-enough
category: engineering
excerpt: "AI can write the implementation, generate the tests, and review the diff. When all three agree, it feels reassuring. But agreement is not the same as independent evidence."
publishedDate: 2026-09-29
tags:
  - AI
  - Testing
  - Code Review
thumbnail: /images/covers/when-tests-pass-thumbnail.webp
cover: /images/covers/when-tests-pass-cover.webp
draft: false
---

There is a workflow I have started to notice more often.

I ask an AI coding tool to make a change. It reads the repository, proposes an implementation, adds a few tests, and explains what it changed. I run the test suite. Everything is green. Then I ask it to review the diff, and it comes back with something close to: no major issues found.

At that point the change feels surprisingly safe.

Implementation: done. Tests: passing. Review: clean.

But there is an uncomfortable question hiding behind those three green signals: **how many independent checks actually happened?**

If the implementation, the tests, and the review all came from the same interpretation of the requirement, they may not be three pieces of evidence. They may be one assumption repeated three times.

That distinction matters more to me as AI becomes a normal part of development.

## Three green checks can still come from one assumption

Suppose I ask an AI tool to change how a service selects the latest record for a customer.

The requirement sounds simple, but there is an ambiguity in it. Maybe “latest” means the newest creation timestamp. Maybe it means the newest active record. Maybe records in a terminal state should be ignored.

The model chooses one interpretation and writes the implementation around it.

Then I ask it to add tests. Unless I give it another source of truth, it is likely to write tests around the same interpretation. Those tests pass.

Finally, I ask it to review the change. The reviewer sees code and tests that agree with each other. That agreement itself becomes evidence that the implementation is coherent.

Everything can look consistent while the original interpretation is still wrong.

![Several checks can share the same source and therefore the same blind spot.](/images/when-tests-pass/same-source.webp)

This is not really an AI-specific failure. Developers have always written tests that accidentally confirm their own assumptions. What AI changes is how quickly we can produce the implementation, the supporting tests, and even the review around the same assumption.

The loop becomes much faster, but not necessarily more independent.

## Tests prove what we encoded

“The tests pass” is useful information. I do not want to diminish that.

But it answers a narrower question than we sometimes pretend it does.

A test tells us that the system behaves as the test expects under the conditions the test creates. It does not automatically tell us that the expectation matches the business rule, that our test data represents production, or that another service depends on behavior we just changed.

This is easy to forget when generated tests look thorough.

An AI tool can produce parameterized tests, edge cases, mocks, fixtures, and descriptive method names in seconds. The result can look more complete than a small test suite written manually.

Yet volume is not independence.

Ten generated tests based on the same misunderstood rule do not give me ten times the confidence.

The first question I now want to ask is not “How many tests were added?” but “Where did the expected behavior in these tests come from?”

Sometimes the answer is the requirement. Sometimes it is an existing contract, production behavior, documentation, or a test that existed before the change.

And sometimes the honest answer is: from the implementation we just generated.

That last case deserves more attention.

## I want at least one source of evidence outside the generated loop

The most useful change in my own workflow has been simple: look for evidence that did not originate from the same generation step.

That evidence depends on the kind of change.

For a small refactor, the existing test suite may be enough. The important point is that those tests existed before the refactor and describe behavior independently of the new implementation.

For an API change, I care about the contract and the consumers. Does the response still match what downstream services expect? Are nullability, ordering, status codes, and optional fields still correct?

For a database change, I want to look at actual constraints, representative data, migration behavior, and what happens when old and new versions run at the same time.

For asynchronous systems, a green unit test tells only part of the story. Message ordering, retries, duplicate delivery, lag, and failure recovery may matter more than the happy path.

And for some production changes, the strongest evidence arrives only after deployment through logs, metrics, traces, or a controlled rollout.

![Confidence becomes stronger when evidence comes from different parts of the system.](/images/when-tests-pass/independent-evidence.webp)

The point is not that every pull request needs every kind of verification. That would be slow and wasteful.

The point is that the evidence should match the risk.

## Different changes deserve different proof

One thing I do not want AI-assisted development to create is a universal checklist where every change gets the same treatment.

Renaming an internal method is not the same as changing a Kafka consumer's retry behavior. Updating a mapping function is not the same as changing how an account state is calculated. A CSS adjustment does not need the same evidence as a database migration.

The question should be proportional:

**If this change is wrong, where would the mistake show up?**

That question usually tells us what to verify.

If the risk is compatibility, check the contract.

If the risk is data, inspect the data path.

If the risk is concurrency, test concurrent behavior rather than adding more single-threaded unit tests.

If the risk is operational, look at what we will be able to observe after deployment.

This sounds obvious, but it is easy to lose when an AI tool can generate a very convincing test suite before we have even decided what the real risk is.

## The requirement and the implementation are different artifacts

There is another habit I find useful: keep the requirement separate from the proposed solution for as long as possible.

If I give an AI tool an existing implementation and ask it to “make the tests pass,” I have already allowed the implementation to shape the definition of correctness.

The same thing happens when I ask it to infer the intended behavior only from the surrounding code. Sometimes that is exactly what I need. But it is not an independent specification.

Whenever possible, I want to compare the result against something outside the patch: a product rule, an API schema, an existing acceptance test, a database invariant, a ticket with concrete examples, or known production behavior.

![A polished implementation can still differ from the original requirement.](/images/when-tests-pass/requirement-vs-result.webp)

The implementation can be elegant and still implement the wrong thing.

That was true long before AI. AI just makes it easier to arrive at an elegant wrong thing quickly.

## A pull request should explain why it is safe

AI-generated pull request summaries are usually good at describing what changed.

Three files updated. New validation added. Tests included. Existing behavior preserved.

Useful, but I increasingly want one more thing from a pull request: **why should the reviewer believe that last sentence?**

For a non-trivial change, a short verification note is often more valuable than a long generated summary.

For example:

- existing tests that protect the old behavior still pass;
- a new integration test covers the changed contract;
- the query was checked against representative data;
- the downstream consumer was verified;
- the failure path was exercised manually;
- a behavior could not be reproduced locally and still needs verification in staging.

That last point is important too.

A good engineering workflow should make uncertainty visible instead of asking AI to turn uncertainty into confident prose.

## AI review is useful, but it is not automatically independent review

I use AI for code review because it is genuinely useful.

It catches forgotten null cases, suspicious conditions, inconsistent naming, missing tests, and changes I did not intend to make. It can scan a diff faster than I can and point me toward areas worth a closer look.

But I try not to count “the AI reviewed its own change” as a fully independent review signal.

The same context can produce the same blind spot.

A second model, a fresh context, or a carefully written review prompt can reduce that problem, but the strongest independence often comes from somewhere else entirely: an existing contract, another service, real data, runtime behavior, or a human who understands the domain and did not participate in generating the solution.

This is less about distrusting AI and more about understanding what kind of evidence it is giving us.

## Confidence should come from evidence, not presentation

One reason this matters is that AI-generated changes often look unusually finished.

The code is formatted. The tests have good names. The pull request summary is clear. The explanation is confident. There may even be a neat list of edge cases that were supposedly considered.

Presentation affects our perception of quality.

A rough patch invites questions. A polished patch quietly answers some of those questions before we have asked them.

I think that is the part we need to resist.

Not by treating generated code as suspicious by default, and not by manually redoing everything the tool already did. That would miss the point of using it.

Instead, I want to separate two questions that are easy to merge:

**Does this change look complete?**

and

**What evidence tells me this change is correct?**

AI is becoming very good at the first one.

The second one is still engineering work.

## “The tests pass” is the beginning of the answer

I still want green tests. I want AI to write them when that saves time. I want AI to review my code, explain unfamiliar parts of a repository, suggest edge cases, and challenge an implementation.

But when the same tool participates in the implementation, the tests, and the review, I want to know where the independent evidence enters the process.

Sometimes it is already there in an old test suite.

Sometimes it is a contract.

Sometimes it is production data or an integration environment.

Sometimes it is another engineer asking the one question neither I nor the model thought to ask.

The goal is not to make AI-assisted development slower.

It is to make sure that faster feedback does not quietly become easier trust.

So when I see a generated change with a clean review and a wall of green tests, I am trying to build one new habit before I approve it:

**What here would still tell us we were wrong?**

If I cannot find anything, I probably do not have as much evidence as all those green checks make it seem.
