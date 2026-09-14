---
title: "AI Can Write the Code. But Who Will Become the Next Senior Engineer?"
slug: ai-can-write-the-code-but-who-will-become-the-next-senior-engineer
category: engineering
excerpt: "AI can generate code faster than ever, but the work it removes was also how junior developers learned to become senior engineers. What happens to engineering judgment when the learning path disappears?"
publishedDate: 2026-09-14
tags:
  - AI
  - Career
  - Production
summary: "What happens to engineering judgment when the learning path disappears?"
thumbnail: /images/covers/ai-next-senior-engineer.webp
cover: /images/covers/ai-next-senior-engineer-cover.webp
draft: false
---

I've been writing software professionally for more than ten years.
During that time, the tools have changed a lot, but the way engineers
gained experience stayed surprisingly consistent.

You started with smaller tasks. You broke things. You read code you
didn't understand. You spent too long debugging problems that, years
later, would take you ten minutes to spot.

None of that looked particularly productive at the time.

It was also how you learned.

AI is starting to change that path.

I use AI in software development myself, so this isn't an argument
against it. It can remove repetitive work, help explore an unfamiliar
codebase, generate tests, explain an API, or get you through a
well-defined implementation much faster.

I don't want to go back to working without those tools.

But there is a part of this shift that I think we're underestimating.

We're automating many of the tasks that used to teach engineers how
software actually behaves.

## The boring work wasn't wasted time

Think about the kind of work developers usually did early in their
careers.

Following a stack trace through code they didn't write.

Trying to understand why a SQL query suddenly became slow.

Reading a service that had been modified by twenty different people over
eight years.

Writing an implementation, getting it rejected in code review, and
having someone explain why the abstraction was wrong.

Deploying something that looked perfectly fine in development and
discovering that production had a completely different opinion.

At the time, most of this felt like friction.

Looking back, the friction was the training.

![A developer learning through debugging, system design, production work and trade-offs.](/images/ai-next-senior-engineer/01-learning-journey.webp)

You slowly built a mental library of failure modes.

After seeing enough incidents, you stopped looking only at the line of
code in front of you. You started thinking about connections, timeouts,
retries, queues, database locks, concurrency, downstream dependencies
and the assumptions nobody wrote down.

There wasn't a course that suddenly made you senior.

You accumulated scars.

## AI gives you the answer before you take the journey

Now imagine starting your career today.

You open an unfamiliar service and instead of spending an afternoon
tracing the flow, you ask an agent to explain the architecture.

An exception appears and instead of following it through the
application, you paste it into an AI tool.

You need to implement something in a framework you've never used. The
agent creates the implementation, tests and documentation.

This is incredibly useful.

It also changes what you learn along the way.

The problem isn't that the answer is necessarily wrong. Quite often it
will be good.

The problem is that getting the answer and understanding why it is the
answer are two different things.

That distinction doesn't matter much when everything works.

It matters a lot when it doesn't.

![The same tools can lead either to copying and shipping or to understanding, investigation and better questions.](/images/ai-next-senior-engineer/02-engineering-mindset.webp)

## Production doesn't care how quickly you generated the code

This becomes obvious during production incidents.

Suppose an API that normally responds in 200 milliseconds suddenly takes
five seconds.

There are dozens of places you could start.

Is the application slow?

Did a database query change?

Is the connection pool exhausted?

Is a downstream service taking 4.5 seconds?

Are retries multiplying the traffic?

Is a Kafka consumer falling behind?

Did something change in the last deployment?

Is this even our problem?

You don't solve this by generating more code.

You solve it by narrowing the problem.

Experienced engineers often look fast during incidents because they
don't investigate everything. They have seen enough systems fail to know
which questions eliminate the largest number of possibilities.

That instinct is difficult to see in a pull request.

It's also difficult to generate with a prompt.

![An engineer investigating a production incident across application, database, Kafka, downstream services and deployments.](/images/ai-next-senior-engineer/03-production-judgment.webp)

## AI makes experienced engineers extremely productive

This is where the situation gets interesting.

Give a strong engineer a capable AI coding tool and the result can be
impressive.

They can delegate implementation while keeping control of the decisions.

They know when the generated abstraction is unnecessary.

They notice when a retry policy will make an outage worse.

They question a database query that looks harmless.

They recognise when a solution technically satisfies the ticket but
doesn't belong in the architecture.

AI removes mechanical work while the engineer supplies judgment.

That's a very powerful combination.

But there's an uncomfortable question hiding inside it:

Where did that judgment come from?

Usually from years of doing the work we're now delegating to AI.

## Output can hide the difference

This creates another problem for engineering organisations.

A junior engineer using AI can produce code at a speed that would have
been unusual a few years ago.

More tickets close.

More pull requests appear.

Implementations arrive faster.

From a distance, productivity looks excellent.

But output and understanding aren't the same thing.

Two developers can submit similar pull requests while having completely
different mental models of what the code does.

You may not notice the difference during normal development.

You'll notice it when the requirements are ambiguous, when the generated
solution is subtly wrong, or when production behaves in a way nobody
expected.

At that point, somebody has to decide what to trust.

The code?

The tests?

The monitoring?

The documentation?

The AI?

Or their own understanding of the system?

That last one takes time to build.

## We shouldn't stop juniors from using AI

The answer isn't to tell junior developers to work as if these tools
don't exist.

That would be like asking developers twenty years ago not to use an IDE
because manually compiling code builds character.

The tools are here.

Good engineers will learn to use them.

The challenge is making sure AI accelerates learning instead of
replacing it.

That probably means being more deliberate about the experiences
engineers get early in their careers.

Let them investigate production incidents instead of only reading the
summary afterwards.

Ask them to explain why a solution works, not just whether the tests
pass.

During code review, discuss the trade-offs rather than accepting a
generated implementation because it looks clean.

Sometimes debug the problem before asking AI for the answer.

Give people ownership of systems long enough to see the consequences of
their own decisions.

Most importantly, don't measure engineering growth only by how much
someone ships.

Understanding is slower to measure.

It's also what you need when the easy answers stop working.

## The bottleneck is moving

For a long time, implementation was one of the expensive parts of
software development.

AI is making implementation cheaper.

That doesn't make engineering cheaper.

It moves the bottleneck.

If code becomes easy to generate, deciding what code should exist
becomes more important.

Review becomes more important.

Architecture becomes more important.

Production experience becomes more important.

Knowing when not to change something becomes more important.

In other words, judgment becomes more valuable at exactly the moment
when some of the traditional ways of developing that judgment are
disappearing.

That's the part I think engineering teams need to pay attention to.

## Who becomes senior next?

I don't think AI will eliminate software engineers.

I think it will change what we expect them to be good at.

The strongest engineers will probably write less code manually than
previous generations. They'll spend more time understanding systems,
defining constraints, reviewing decisions and directing tools that can
implement those decisions incredibly quickly.

That future makes sense to me.

But we still need a path that gets someone there.

Today's senior engineers learned their craft in a world where they had
to do much of the work themselves before they could delegate it.

The next generation may not have that same path.

So the question isn't whether AI can write production code.

It can.

The harder question is what happens when the engineers who learned their
craft before AI are gone.

If the next generation spends the beginning of their careers asking AI
to perform the work that taught the previous generation how systems
actually behave, who develops the judgment required to supervise it?

We may discover that code was the easiest thing to automate.

Engineering judgment might be much harder to replace.

## Further reading

- [How Artificial Intelligence Disrupts Engineering Progression](https://www.infoq.com/news/2026/08/ai-disrupts-engineering-progress/) — InfoQ
- [Who Will Become the Next Senior? How Generative AI Erodes the Development Pathway in Software Engineering](https://arxiv.org/abs/2607.17067) — Sumin Yu and Taesup Moon
- [From Junior to Senior: Allocating Agency and Navigating Professional Growth in Agentic AI-Mediated Software Engineering](https://arxiv.org/abs/2602.00496) — Dana Feng, Bhada Yun, April Yi Wang
