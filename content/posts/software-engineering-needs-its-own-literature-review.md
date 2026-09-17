---
title: "Software Engineering Needs Its Own Literature Review"
slug: software-engineering-needs-its-own-literature-review
category: engineering
excerpt: "Before we decide how to solve a problem, we need to know how others have already approached it. Reading repositories, tools, and real systems is part of becoming a better engineer."
publishedDate: 2026-09-17
tags:
  - Software Engineering
  - Learning
  - Open Source
  - Engineering Practice
thumbnail: /images/covers/software-engineering-literature-review-thumbnail.webp
cover: /images/covers/software-engineering-literature-review-cover.webp
draft: false
---

More than once, I have started thinking about how to solve a problem, only to discover later that someone else had already spent years thinking about the same thing.

Sometimes it was a library I did not know existed. Sometimes it was a feature hidden deeper in a framework I was already using. Sometimes the useful part was not even the code, but an old issue or pull request explaining why a certain design had been rejected.

Those moments are useful reminders: our solution space is limited by what we know exists.

There is a habit from academia that describes this well: the literature review.

Before starting serious research, you first try to understand what is already known. What has been tried? What worked? What failed? Where do people disagree?

I think software engineering needs its own version of that.

Not necessarily papers and formal research. For us, the literature is often source code, repositories, documentation, issues, pull requests, postmortems, and the systems other engineers have already built.

## "Obvious" often means "the solution I already know"

Experience makes us faster at solving familiar problems. But it can also make our world smaller.

If I have solved a problem three times with the same approach, that approach starts to feel natural. Maybe even obvious.

But "obvious" often just means "the solution I already know."

There may be another library, architecture, database feature, language construct, or operational pattern that approaches the same problem differently.

If I have never seen it, I cannot seriously compare it with my own approach.

I cannot reject an idea I do not know exists.

I cannot choose a tool I have never encountered.

This is why exposure matters so much in engineering.

![A visual learning loop moving from reading and learning to building and improving.](/images/software-engineering-literature-review/software-engineering-literature-review-learning-loop.webp)

## Reading code is part of engineering

For centuries, people learned by reading what others had written.

Software is no different. Except our books are often repositories.

I do not mean reading every line of a large codebase. Most of the time, that would not be useful. I am more interested in the decisions behind the code.

How is the project structured? Where are the boundaries? How are failures handled? What did the authors decide not to abstract? How do they test difficult cases?

This becomes especially useful when something feels like it needs custom code.

Imagine I need retry behaviour around an external service. I can immediately write a loop, add counters, decide which exceptions should retry, add delays, and slowly build my own little retry mechanism.

Or I can first look at how mature libraries approach the same problem.

Very quickly, the problem becomes larger than "retry three times." There is backoff, jitter, exception classification, idempotency, metrics, cancellation, and the question of whether retrying is safe at all.

Even if I still decide to write something myself, I now understand the problem differently.

That is the important part.

Reading somebody else's solution does not remove engineering judgment. It gives that judgment more material to work with.

## The industry is bigger than your feed

It is easy today to confuse following the software industry with following software content.

They are not the same thing.

Social media is useful for discovery. I have found libraries, articles, projects, and interesting discussions through it.

But a feed is only an entry point.

The most visible technology is not necessarily the most useful one. A tool can look dominant online while another quietly runs inside thousands of production systems without generating much discussion.

Sometimes the useful source is a repository with a few hundred stars and years of commits.

Sometimes it is an old mailing-list discussion.

Sometimes it is a GitHub issue where maintainers explain why they refused to add a feature.

Sometimes it is the source code of a library we have used for years without ever opening it.

The goal is not to consume more information.

It is to deliberately widen the set of things we know exist.

## Reading changes the questions you ask

The biggest benefit is not collecting more tools.

It is improving the questions you ask.

At first, the question may simply be:

> How can I build this?

After seeing several systems solve similar problems, different questions appear.

Does this need to exist at all?

Which part actually needs to be custom?

What happens when it fails?

What trade-off did this design choose?

Is this complexity coming from the problem, or from our solution?

Does the database already provide this?

Does the framework already handle it?

Has somebody tried this design before?

Those questions are difficult to learn from tutorials alone.

They tend to appear after seeing enough real systems.

## Experience is not only what happens to you

We often describe engineering experience as years spent working.

That is part of it.

But reading lets us borrow experience we have not had ourselves.

A repository can expose us to design decisions we have never needed to make. A postmortem can show us a production failure we have never experienced. A long issue discussion can reveal trade-offs that are invisible in the final API.

We do not need to make every architectural mistake ourselves.

We do not need to spend six months building something before discovering that another team tried the same idea and documented why it failed.

Other engineers cannot give us their experience directly.

But they leave traces of it everywhere.

We just have to read them.

![Progress comes from repeatedly turning what we discover into practice.](/images/software-engineering-literature-review/software-engineering-literature-review-progress.webp)

## Read, question, apply

Reading alone is not enough either.

It is easy to spend hours collecting repositories, articles, talks, and bookmarks and mistake that activity for learning.

At some point, the idea has to meet a real problem.

The loop I find useful is simple.

Read and observe.

Try to understand why something was designed that way.

Question it. Compare it with alternatives.

Then use what makes sense in something real.

Reading without applying can become entertainment.

Building without reading can become repetition.

The useful part is the movement between the two.

## Curiosity compounds

The difficult part is that we rarely know in advance which piece of knowledge will matter.

You might spend an evening looking through the internals of a library and never use that information directly.

Then months later, a production problem appears and something you saw there gives you the right mental model.

A lot of engineering knowledge works like that.

Its value is delayed.

The engineers I learn the most from are not necessarily the ones who know the longest list of technologies.

They are the ones who keep looking beyond the boundaries of the problem in front of them.

They inspect source code.

They read why decisions were made.

They compare different approaches.

They remain curious about systems they did not build.

And when a new problem arrives, they have more than one idea available.

That may be the closest thing software engineering has to a literature review.

Before building the next solution, spend some time discovering the solutions that already exist.
