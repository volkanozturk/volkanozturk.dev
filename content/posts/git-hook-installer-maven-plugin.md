---
title: "The Small Automation That Stopped Dependency Updates from Becoming Jira Work"
slug: git-hook-installer-maven-plugin
category: engineering
excerpt: "How a recurring version-update problem led me from Git hooks to a Maven plugin, and eventually to a CI check that puts dependency updates directly in front of pull-request reviewers."
publishedDate: 2026-09-15
tags:
  - Maven
  - Git
  - CI/CD
summary: "From a local Git hook to a dependency check that reviewers actually see."
thumbnail: /images/covers/git-hook-installer-maven-plugin.webp
cover: /images/covers/git-hook-installer-maven-plugin-cover.webp
draft: false
---

When I joined the team, one type of Jira ticket kept coming back.

A service was using an older version of another service or a shared dependency. Someone noticed it. A ticket was created. A developer updated a version. The ticket was closed.

Then, sooner or later, another one appeared.

There was nothing particularly difficult about the work. That was exactly what made it interesting.

If a task is simple, repetitive, and easy to forget, I usually do not want a better checklist. I want to understand why a person is still part of the loop.

That question eventually became a small internal Maven plugin, and later a CI check that made outdated versions visible directly on pull requests.

## The problem was not updating a version

The obvious problem looked like this:

> A dependency has a newer version. Update it.

But that was only the visible part.

The real problem was **when we discovered it**.

If we noticed an outdated version only after somebody created a Jira ticket, the feedback loop was already too long. A developer had written the code, opened or merged other changes, and moved on. We were turning something Maven could detect into planning work for a human.

So I started looking for a point in the development flow where the check could happen naturally.

Not in a separate dashboard.

Not in another reminder.

Somewhere developers were already passing every day.

## Git hooks were the first useful answer

Git hooks are programs that Git can run at specific points in its workflow. A `pre-commit` hook, for example, runs before a commit is created.

That made the commit boundary interesting.

The plugin's default hook changes to the repository root and runs the Maven Versions Plugin goals `versions:display-property-updates` and `versions:display-parent-updates`. It then filters the output to keep actual version changes and removes pre-release versions such as alpha, beta, RC, and snapshot releases.

The core idea is deliberately simple:

```sh
dependency_updates=$(
  mvn versions:display-property-updates \
      versions:display-parent-updates \
      -DgenerateBackupPoms=false \
  | grep '\->' \
  | awk -F ' ' '{if ($2 != $4) print $0}'
)

filtered_updates=$(
  echo "$dependency_updates" \
  | grep -i -vE '[0-9]+\.[0-9]+\.[0-9]+-?(beta|alpha|rc|snapshot)[0-9]*'
)
```

This was enough to prove the idea.

Before a developer finished a commit, the repository could tell them that a newer dependency or parent version was available.

But there was a practical problem: a useful hook in one repository is not yet a useful engineering standard.

## A hook is local; the solution had to be repeatable

Git looks for traditional hooks under the repository's Git hooks directory unless another hooks path is configured. That local nature is useful, but it also means that simply writing a shell script does not automatically distribute the behavior across every developer checkout.

I wanted the repository itself to describe which hook it needed.

Because these were Maven projects, Maven became the distribution mechanism.

I built the **Git Hook Installer Maven Plugin**.

A project can declare the plugin in its `pom.xml`, bind its `install` goal, and configure either the default hooks or hook scripts supplied as resources:

```xml
<plugin>
    <groupId>com.leovegas</groupId>
    <artifactId>githook-maven-plugin</artifactId>
    <version>0.0.9</version>
    <executions>
        <execution>
            <goals>
                <goal>install</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <hooks>
            <pre-commit/>
        </hooks>
    </configuration>
</plugin>
```

For teams that need a different script, the plugin also supports resource-based hooks:

```xml
<configuration>
    <resourceHooks>
        <pre-commit>src/main/resources/pre-commit-hook.sh</pre-commit>
    </resourceHooks>
</configuration>
```

That changed the shape of the solution.

The check was no longer a shell script somebody had to remember to copy. It became project configuration that could be added consistently across Maven repositories.

## I deliberately did not make local development the only gate

At this point it would have been tempting to treat the local hook as enforcement.

I did not want to rely on that.

Local developer environments are not a trustworthy final control point. A hook may not be installed in a particular checkout, a developer can bypass some commit-time hooks with Git's `--no-verify` option, and local tooling can differ.

More importantly, I did not want a dependency update check to become friction that blocked every commit.

The local hook was valuable because it gave **early feedback**.

But early feedback and reliable visibility are different requirements.

That led to the second part of the solution.

## The same check moved into the pull-request path

I reused the dependency-version check in a Jenkins stage that runs when a pull request is opened.

If newer versions are found, the result is added to the pull request as a comment.

That small change mattered more than making the local hook stricter.

A developer might miss or bypass the local check. The pull request, however, is already where another engineer is reading the change and deciding whether it is ready to merge. Putting the information there changes the check from a private terminal message into shared review context.

The flow became:

```text
developer commit
      |
      v
local pre-commit check
      |
      v
pull request
      |
      v
Jenkins runs the dependency check
      |
      +-- no relevant update --> nothing to review
      |
      +-- update found -------> PR comment
                                   |
                                   v
                                reviewer
```

The CI stage did not need a new dependency-analysis concept. It reused the same idea that had already worked locally and changed where the result was surfaced.

That is an important distinction.

The automation was not valuable because Jenkins ran a script. It was valuable because the result appeared at the moment somebody was already making a review decision.

## Why a PR comment instead of another Jira ticket?

The original workflow created work *after* the dependency drift had already become somebody's problem.

The new workflow moves the information closer to the code change.

A pull-request comment has a few useful properties:

- it is attached to the change being reviewed;
- both the author and reviewer can see it;
- it does not require somebody to remember a separate dashboard;
- it keeps the update visible even when the local hook was skipped.

GitHub supports general comments on pull requests, so CI systems can surface this kind of repository feedback directly in the pull-request conversation.

The important part is not the comment API itself. The important part is reducing the distance between **detection** and **decision**.

## The architecture stayed intentionally small

There are more sophisticated ways to manage dependency updates. This plugin was not trying to replace all of them.

It solved a narrower internal problem:

1. detect newer dependency and parent versions with Maven;
2. filter versions we did not want to suggest;
3. give developers feedback around commit time;
4. make hook installation repeatable through Maven configuration;
5. run the same check in CI;
6. surface relevant results on the pull request for review.

The plugin documentation also makes one constraint explicit: the default hook is intended for projects where versions are managed through `pom.xml` dependency management.

That limitation is healthy. Internal tooling becomes dangerous when a narrow solution quietly pretends to be a universal platform.

## What I learned from it

The most useful lesson was not about Git hooks or Maven plugins.

It was about where automation belongs.

My first instinct was to automate the repetitive task. The better solution was to automate the **feedback loop**.

The progression looked like this:

**Jira ticket → local warning → reusable project tooling → review-time visibility**

Each step moved the same information closer to the moment where it could prevent work instead of creating work.

That is now one of the questions I ask when I see recurring engineering chores:

> Are we automating the task, or are we moving the feedback to the place where the mistake can be avoided?

Sometimes the best internal developer tool is not a large platform.

Sometimes it is a small piece of automation placed at exactly the right boundary.
