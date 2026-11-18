---
title: "Unknown Is Not Zero: The Hidden Problem in Monitoring Dashboards"
slug: unknown-is-not-zero
category: engineering
excerpt: "Missing data and measured zero are different facts. Here's why dashboards must carry coverage, provenance, and uncertainty alongside their numbers."
publishedDate: 2026-11-18T05:00:00.000Z
tags:
  - Observability
  - Data Quality
  - Monitoring
  - Java
  - System Design
thumbnail: /images/covers/unknown-is-not-zero.webp
cover: /images/covers/unknown-is-not-zero-cover.webp
draft: false
---

*Missing data and measured zero are different facts. Here's why dashboards must carry coverage, provenance, and uncertainty alongside their numbers.*

A dashboard can be wrong without displaying a single incorrect number.

That sounds contradictory. We tend to judge a dashboard by whether its calculations add up and whether the chart agrees with its data source. But there is another question: **what does the dashboard know about the data it never received?**

While working on a small dashboard for home electricity, gas, and water consumption, I kept running into the same distinction. Some measurements arrived continuously. Others came from occasional meter readings or historical bills. Certain periods were well covered; others were not. And there were moments when the system had no observation at all.

It would have been easy to turn an absent reading into zero. It would also have been wrong.

The problem is not specific to energy monitoring. We make the same mistake with microservice metrics, background jobs, payment flows, and operational reports. The chart may be simple. The meaning of an empty space is not.

## Zero, missing, and partial are different claims

Consider a daily usage chart.

If the device recorded a value of zero, that is information. It tells us that, according to the measurement, no usage occurred in that interval.

If the device never reported a reading, we have no basis for that conclusion. The correct value is **unknown**, not zero.

A third case is easy to overlook: we might receive some readings for a day but not all of them. We can calculate a sum of the observed values. But we cannot automatically call it the day's total.

![Three panels distinguish a measured zero, an absent reading, and a partially observed interval.](/images/articles/unknown-is-not-zero/zero-missing-partial.webp "An observed zero is data. A missing measurement is the absence of data. Partial coverage is a measurement with an explicit limitation.")

These distinctions affect what we can say about an interval:

- **Complete:** all expected measurements are present and considered valid.
- **Partial:** some, but not all, of the expected measurements are present and valid.
- **Missing:** no valid measurement is available for the interval.

The classification should be based on what the source actually guarantees. For instance, a smart meter might report cumulative readings rather than one independent usage measurement per minute. A delayed reading can still allow an accurate difference across a larger interval. Completeness therefore cannot always be measured by simply counting messages.

The important part is to make the assumption visible instead of hiding it in the chart component.

## When aggregation starts lying

Imagine a dashboard that expects one valid daily total for four days:

| Day | Usage |
| --- | ---: |
| Monday | 12 kWh |
| Tuesday | 18 kWh |
| Wednesday | No reading |
| Thursday | 14 kWh |

A sum over the observed values gives us **44 kWh**. The addition is correct: 12 + 18 + 14 = 44.

But what should the dashboard call that number?

Not the total usage for the four-day period. We do not know Wednesday's usage. Reporting “44 kWh in four days” silently makes an assertion that the missing day contributed nothing.

What we actually know is more limited: **44 kWh observed across three of four expected daily buckets; one day is missing.** With non-negative consumption values, this is also a lower bound on the complete period's usage, not a complete total.

Three of four buckets is 75% day coverage. That describes how much of the calendar we observed, not how much of the energy. It does not mean 44 kWh is 75% of the real total, and it does not justify scaling 44 up to a four-day figure.

![A four-day usage chart shows 12, 18, a missing value, and 14 kilowatt-hours; the 44 kilowatt-hour subtotal has 75 percent day coverage.](/images/articles/unknown-is-not-zero/aggregation-trap.webp "Both summaries show 44 kWh. Only the second tells the reader what that number means.")

The trap becomes worse when we calculate averages. Dividing 44 by four creates an apparent daily average of 11 kWh by treating Wednesday as zero. Dividing by three gives an average of about 14.7 kWh **for observed days**. Neither figure proves what happened on Wednesday.

You can estimate missing periods, but an estimate should be labelled as an estimate. It should never quietly replace a measurement.

## Historical readings have their own level of precision

Suppose a gas meter reads 820 m³ on one date and 880 m³ roughly three months later. We know that the cumulative reading increased by 60 m³ during that interval, assuming both are actual readings (not estimates) from the same meter, with no replacement or rollover in between.

We do not know the exact daily distribution of that 60 m³.

A dashboard could spread the consumption evenly across all the days. That might produce a smooth graph, but it would describe a model, not observed daily usage. It could also turn a winter-heavy interval into a misleadingly flat line.

Historical bills introduce similar questions. Their dates may not align with calendar months, some are based on estimates, and a billing period may overlap with a live sensor's measurements. Combining sources without tracking their provenance can lead to double-counting or false precision.

A useful model records not only a number and unit, but also its **time interval, source, and granularity**. The question changes from “Do I have a value?” to “What kind of statement can this value support?”

Sometimes the honest answer is a 60 m³ period total with no daily breakdown. That is better than manufacturing ninety daily readings.

## Make coverage part of the data model

This is not something I would leave for the frontend to guess.

A response that contains only `total: 44` forces the UI to assume that the number is complete. The backend already knows which measurements were used. That context should travel with the result.

In Java, a small model can make the distinction explicit:

```java
import java.math.BigDecimal;
import java.util.Optional;

enum CoverageStatus {
    COMPLETE, PARTIAL, MISSING
}

record UsageWindow(
        BigDecimal observedTotal,
        int observedBuckets,
        int expectedBuckets
) {
    UsageWindow {
        if (observedTotal == null || observedBuckets < 0 ||
                expectedBuckets <= 0 || observedBuckets > expectedBuckets) {
            throw new IllegalArgumentException("Invalid usage window");
        }
        if (observedBuckets == 0 && observedTotal.signum() != 0) {
            throw new IllegalArgumentException("A window without observations cannot have a total");
        }
    }

    CoverageStatus status() {
        if (observedBuckets == 0) return CoverageStatus.MISSING;
        if (observedBuckets < expectedBuckets) return CoverageStatus.PARTIAL;
        return CoverageStatus.COMPLETE;
    }

    Optional<BigDecimal> completeTotal() {
        return status() == CoverageStatus.COMPLETE
                ? Optional.of(observedTotal)
                : Optional.empty();
    }
}
```

Here, `observedTotal` means exactly what it says: the sum of the available observations. An internal sum of zero for a missing window is not a claim that consumption was zero. The status distinguishes those cases, and `completeTotal()` only returns a value when every expected bucket was observed, so a caller cannot quietly present a subtotal as the total.

This sample assumes each bucket represents one expected, independently valid observation. Real systems might track timestamp coverage, source freshness, overlapping intervals, estimated values, or quality flags instead. The representation should follow the measurement semantics rather than the other way around. Treat it as an illustration of the idea (it needs Java 16 or later for records), not as a production model.

![Readings pass through validation and aggregation into a dashboard while complete, partial and missing coverage statuses remain attached.](/images/articles/unknown-is-not-zero/coverage-through-the-pipeline.webp "Coverage should survive the entire pipeline, not be reconstructed from an empty-looking chart.")

The presentation can then make a deliberate choice:

- Complete window: show the total normally.
- Partial window: show the observed subtotal together with coverage and a clear qualifier.
- Missing window: show “No data” rather than a numeric zero.

For cumulative meters, the model may need a separate state for the difference between two verified readings. For real-time systems, freshness can be just as important as coverage. The general rule remains: the UI should not discard evidence about how a value was obtained.

## The same mistake appears in production monitoring

Think about an HTTP request-rate graph for a microservice. A flat line at zero means the counter was scraped and did not increase: no requests were recorded. A gap means something else. In Prometheus, when a scrape fails or a target disappears, its series are marked stale and queries stop returning values for them ([staleness](https://prometheus.io/docs/prometheus/latest/querying/basics/#staleness)), while the target's `up` series drops to `0` ([jobs and instances](https://prometheus.io/docs/concepts/jobs_instances/)). A query that matches no series returns an empty result, not zero.

Those are very different operational situations. They only look the same when something turns the gap into a zero. A common way is appending `or vector(0)` to a PromQL query. That is reasonable when no data genuinely means nothing happened, and [Grafana's missing-data guide](https://grafana.com/docs/grafana/latest/alerting/guides/missing-data/) suggests it for that case. On a request-rate panel, it makes a failed scrape look like a quiet service.

Likewise, an empty error-rate chart is not proof that error rates are healthy. A labelled error counter may not exist at all until the first error is recorded, which is why the Prometheus instrumentation guide recommends exporting a default `0` for series you know may exist ([avoid missing metrics](https://prometheus.io/docs/practices/instrumentation/#avoid-missing-metrics)). That zero is a real observation: the counter exists and was scraped. A series can also go missing after a metric or label is renamed in a deployment, or because of a gap in telemetry. Without a separate signal for availability, the monitoring system may confuse “nothing failed” with “nothing was observed.”

This is why a reliable monitoring setup looks at both **the behaviour being measured** and **whether the measurement process is working**. Data freshness, scrape success, ingestion lag, and missing-series alerts can provide that second layer of context.

Both tools can make that second layer explicit, at different levels. In Prometheus, `absent()` and `absent_over_time()` return `1` when the series you expect is not there ([query functions](https://prometheus.io/docs/prometheus/latest/querying/functions/#absent)), so “this metric stopped arriving” becomes something you can alert on. In Grafana-managed alert rules, a query that succeeds but returns nothing leads to a No Data state, and a query that fails leads to an Error state. Each is configured per rule ([missing data](https://grafana.com/docs/grafana/latest/alerting/guides/missing-data/), [connectivity errors](https://grafana.com/docs/grafana/latest/alerting/guides/connectivity-errors/)), and the available options depend on the Grafana version.

None of this replaces choosing correct semantics for each metric. A request counter, a cumulative meter reading, and a sampled temperature signal do not behave the same way.

## A dashboard should be allowed to say “I don't know”

I would rather see a visible gap than a perfectly smooth line built from assumptions I cannot inspect.

That does not mean filling a dashboard with warnings. It means being precise where it matters: label incomplete totals, distinguish measured data from estimates, show relevant coverage, and do not equate missing observations with observed zeros.

A useful mental check is to ask three questions before publishing an aggregate:

1. **What did we observe?** Identify valid measurements and their time boundaries.
2. **What is missing?** Record coverage, freshness, and limits on precision.
3. **What can we honestly conclude?** Present only the claim supported by those observations.

The arithmetic is often the easiest part of building a dashboard. Preserving the meaning of the numbers is harder.

**A trustworthy dashboard should show not only what it knows, but also what it doesn't.**
