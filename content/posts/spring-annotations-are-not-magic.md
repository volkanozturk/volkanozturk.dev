---
title: "Spring Annotations Are Not Magic"
slug: spring-annotations-are-not-magic
category: engineering
excerpt: "Understanding what actually happens behind @Service, @Transactional, @Configuration and the annotations we use every day."
publishedDate: 2026-09-22
tags:
  - Spring
  - Spring Boot
  - Java
  - Architecture
thumbnail: /images/covers/spring-annotations-are-not-magic.webp
cover: /images/covers/spring-annotations-are-not-magic-wide.webp
draft: false
---

I have been using Spring for a long time.

Like many Java developers, I learned Spring partly by learning its annotations.

`@Service` means this is a service.

`@Repository` means this talks to the database.

`@Transactional` means this method runs in a transaction.

`@Async` means this runs asynchronously.

That mental model is useful when you are starting out. It lets you build things without first understanding the entire framework.

But eventually it becomes incomplete.

Because an annotation does not really *do* anything by itself.

It is metadata.

The interesting question is not:

> What does this annotation do?

It is:

> What does Spring do when it finds this annotation?

That small change in perspective made a lot of Spring behavior easier for me to understand.

## An annotation is just metadata

Consider a familiar class:

```java
@Service
public class PaymentService {

    public void processPayment() {
        // ...
    }
}
```

It is tempting to think that `@Service` somehow turns `PaymentService` into a service.

It does not.

At the Java level, the annotation simply describes the class. Something else has to discover that metadata and act on it.

In this case, Spring scans the application, discovers the class, creates a bean definition and eventually manages an instance inside the application context.

This distinction sounds academic until something does not behave the way you expect.

Then it becomes very practical.

## `@SpringBootApplication` is a good place to see this

Most Spring Boot applications begin with something like this:

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

It looks almost suspiciously simple.

But `@SpringBootApplication` combines three important ideas: Spring Boot configuration, auto-configuration and component scanning.

Conceptually, it brings together:

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
```

So when the application starts, Spring is doing much more than looking for classes with nice labels on them.

It is building a model of the application.

Which classes are components?

Which bean definitions should exist?

Which configuration applies?

Which dependencies are available?

Which auto-configurations should be activated?

The annotation is the entry point.

The container does the work.

## `@Component`, `@Service` and `@Repository` are closer than they look

These are among the first Spring annotations many developers learn:

```java
@Component
@Service
@Repository
@Controller
```

They can look like four different mechanisms.

They are not.

`@Component` is the generic Spring stereotype. `@Service`, `@Repository` and `@Controller` are more specific stereotypes built on top of it, which is why component scanning can discover all of them.

So technically, this works:

```java
@Component
public class PaymentService {
}
```

And so does this:

```java
@Service
public class PaymentService {
}
```

Spring can manage both.

But that does not make the choice meaningless.

The second version communicates something about the role of the class. A service is not just "some Spring bean." It belongs to the service layer.

The same idea applies to repositories and controllers.

There can also be framework-specific semantics. For example, `@Repository` can make a class eligible for Spring's persistence exception translation when the corresponding exception-translation infrastructure is enabled.

I therefore do not see these annotations as completely different ways of creating objects. I see them as different ways of describing the role of an object to both Spring and the people reading the code.

## Component scanning is only one way to create beans

Now consider this:

```java
@Configuration
public class PaymentConfiguration {

    @Bean
    PaymentClient paymentClient() {
        return new PaymentClient();
    }
}
```

There is no `@Component` on `PaymentClient`.

Spring can still manage it.

Component scanning is one mechanism for discovering bean definitions. `@Bean` methods are another.

That distinction becomes useful when integrating third-party libraries or when object creation should be explicit.

For application classes, this may feel natural:

```java
@Service
public class PaymentService {
}
```

For infrastructure, explicit configuration can be easier to reason about:

```java
@Configuration(proxyBeanMethods = false)
public class PaymentConfiguration {

    @Bean
    PaymentClient paymentClient(PaymentProperties properties) {
        return new PaymentClient(
            properties.baseUrl(),
            properties.timeout()
        );
    }

    @Bean
    PaymentService paymentService(PaymentClient paymentClient) {
        return new PaymentService(paymentClient);
    }
}
```

Here Spring resolves `PaymentClient` as a dependency of the `PaymentService` bean. The configuration methods do not need to call one another.

Both approaches end with Spring managing objects.

They simply arrive there through different mechanisms.

## Then we get to the annotations that really confuse people

Consider:

```java
@Transactional
public void processPayment() {
    // ...
}
```

The natural interpretation is:

> This method is transactional.

That is close enough most of the time.

But it hides an important part of the mechanism.

With Spring's usual proxy-based transaction management, infrastructure is placed around the bean. Calls passing through that infrastructure can be intercepted so a transaction can be started, joined, committed or rolled back around the target method.

![A caller crossing a Spring proxy before reaching the target method](/images/spring-annotations-are-not-magic/proxy-boundary.svg)

The annotation itself did not start the transaction.

Spring infrastructure interpreted the metadata and applied behavior around the method invocation.

And once you understand that, one of Spring's classic surprises becomes much less surprising.

## The self-invocation trap

Imagine this service:

```java
@Service
public class PaymentService {

    public void processOrder() {
        savePayment();
    }

    @Transactional
    public void savePayment() {
        // database operations
    }
}
```

At first glance, it is reasonable to expect `savePayment()` to run transactionally.

But with Spring's default proxy-based transaction management, the call from `processOrder()` to `savePayment()` happens inside the same object.

It does not go back through the proxy.

![An external call crosses the proxy, while the internal method call stays inside the target object](/images/spring-annotations-are-not-magic/self-invocation.svg)

So the annotation is there.

The code compiles.

The application starts.

And yet the behavior may not be what the annotation appears to promise.

This is why I prefer thinking in terms of mechanisms rather than annotations.

Instead of asking:

> Does this method have `@Transactional`?

I ask:

> Will this invocation pass through the transaction interceptor?

That is a much more useful question.

The proxy detail matters here. Spring can also use AspectJ-based transaction management, where the interception model is different. The common self-invocation problem described above is specifically about the default proxy-based model.

## `@Async` has the same kind of trap

The same idea appears with asynchronous execution.

```java
@Async
public void sendNotification() {
    // ...
}
```

Again, the simple mental model is:

> Spring sees `@Async`, so this method runs on another thread.

But Spring's default async support is also proxy based.

An external call can be intercepted and submitted to a task executor. A local call inside the same class does not pass through that proxy.

So this:

```java
public void process() {
    sendNotification();
}

@Async
public void sendNotification() {
    // ...
}
```

may not behave the way someone reading only the annotations expects.

Different feature.

Same underlying lesson.

Once you understand the mechanism, several seemingly unrelated Spring quirks suddenly become the same problem.

## `@Configuration` has machinery behind it too

Another interesting example is:

```java
@Configuration
public class AppConfiguration {

    @Bean
    Client client() {
        return new Client();
    }

    @Bean
    PaymentService paymentService() {
        return new PaymentService(client());
    }
}
```

That `client()` call looks like a normal Java method call.

With the traditional full `@Configuration` behavior, Spring can enhance the configuration class and intercept calls between `@Bean` methods so that the managed bean is returned rather than treating every call as an ordinary factory invocation.

That behavior is one reason `@Configuration` exposes `proxyBeanMethods`.

If the bean methods do not need inter-bean method calls, a simpler form is:

```java
@Configuration(proxyBeanMethods = false)
public class AppConfiguration {

    @Bean
    Client client() {
        return new Client();
    }

    @Bean
    PaymentService paymentService(Client client) {
        return new PaymentService(client);
    }
}
```

Now the dependency is explicit in the method signature and the configuration does not rely on inter-bean method interception.

Again, knowing the annotation name is useful.

Knowing why Spring might proxy the class is more useful.

## Auto-configuration is where this model becomes really powerful

Spring Boot sometimes feels magical because adding a dependency can suddenly create working infrastructure.

Add the right database dependencies and configuration, and a `DataSource` can appear.

Add another starter and more infrastructure can become available.

But there is no magic involved.

There are conditions.

Spring Boot auto-configuration makes heavy use of annotations such as:

```java
@ConditionalOnClass
@ConditionalOnMissingBean
@ConditionalOnProperty
```

An auto-configuration can effectively say:

```text
If this class exists,
and this property has the right value,
and the application has not already provided this bean,
then register this configuration.
```

A simplified configuration might look like:

```java
@Bean
@ConditionalOnMissingBean
PaymentClient paymentClient() {
    return new DefaultPaymentClient();
}
```

The idea is:

> I can provide a sensible default, but I will step aside if the application already has one.

That is a large part of what makes Spring Boot convenient without making every decision completely rigid.

The framework evaluates metadata and conditions while constructing the application context.

## Annotations can make architecture easier to read

Annotations are useful partly because they remove infrastructure code from business code.

Compare:

```java
@Transactional
public void updateAccount() {
    // ...
}
```

with manually opening a transaction, executing the operation, handling rollback and closing resources.

The annotation version communicates intent much more clearly.

The same idea applies to:

```java
@Cacheable
@Async
@Scheduled
@Validated
```

They let us express cross-cutting behavior without mixing all the implementation details into the business method.

That is a real advantage.

But abstraction has a cost.

It becomes easy to forget that something underneath still has to implement that behavior.

## And annotations can also hide architecture

A Spring class can slowly become something like this:

```java
@Service
@Transactional
@Validated
public class PaymentService {

    @Async
    @Retryable
    @CacheEvict(...)
    public void process(...) {
        // ...
    }
}
```

The method may look simple.

Its runtime behavior may not be.

Transactions, retries, validation, caching, asynchronous execution and custom aspects can all change what happens around that method.

Then questions become harder.

Which advice runs first?

Does the retry happen inside or outside the transaction?

Which thread owns the transaction?

Does the cache update happen before or after commit?

What happens when one interceptor throws?

Those are architecture questions, not annotation questions.

For example, imperative Spring transactions are normally associated with the current execution thread. Moving work to an async executor changes that execution context; the presence of both `@Async` and `@Transactional` should not be read as a promise that one transaction context simply follows work onto another thread.

The answer is not to stop using annotations.

It is to remember that each annotation may represent infrastructure that is absent from the method body.

## I now read Spring code differently

When I see:

```java
@Transactional
```

I think about the transaction interceptor and the proxy boundary.

When I see:

```java
@Async
```

I think about the executor and whether the call actually crosses the proxy.

When I see:

```java
@Service
```

I think about component scanning and bean registration.

When I see:

```java
@Bean
```

I think about a bean definition being contributed to the application context.

When I see:

```java
@ConditionalOnMissingBean
```

I think about the state of the context when the condition is evaluated.

The annotations are still useful shorthand.

I just no longer treat the shorthand as the mechanism itself.

## Learn the mechanism, not the list

It is easy to learn Spring as a collection of annotations.

And in the beginning, that is probably fine.

You need to build something before you can understand every layer underneath it.

But eventually, memorizing more annotations gives diminishing returns.

Understanding component scanning teaches you about many stereotype annotations at once.

Understanding the application context explains why both `@Component` and `@Bean` work.

Understanding proxies explains several of the surprising behaviors around `@Transactional` and `@Async`.

Understanding conditions makes Spring Boot auto-configuration much less mysterious.

That knowledge transfers.

And when something eventually behaves differently from what an annotation seems to say, you have somewhere useful to look.

Because Spring annotations are not magic.

They are metadata.

The framework behind them is where the behavior actually lives.
