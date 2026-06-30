---
title: 'Reactive State'
description: 'Deep dive into the Proxy-based reactive state and transparent dependency tracking in Avenx-JS.'
---

Avenx-JS implements a **transparent reactivity system** powered by JavaScript ES6 `Proxy`. There are no state setter functions or hooks required to update the user interface.

## How It Works

When a component is instantiated, the framework wraps its initial state object in a reactive Proxy. When an action or callback modifies any field on `state`, the Proxy trap intercepts the change and queues a re-render job.

```javascript
// In an action:
state.counter++; // Automatically schedules a visual update!
```

## Batching Updates & Scheduler

To maximize browser performance, state updates are batched together. If you change multiple state properties sequentially, Avenx does not re-render the DOM for each modification. Instead, the framework queues a single microtask job to flush updates together in the next tick.

```javascript
<action name="updateUser">
  state.name = "John"; // Queued state.age = 30; // Queued (deduplicated) state.role = "admin"; // Queued (deduplicated)
  // The DOM will render only ONCE at the end of the microtask queue.
</action>
```

## Nested Reactivity

Avenx-JS automatically intercepts nested object mutations. If a state property contains an array or object, mutations within that tree are tracked:

```javascript
state.todos.push({ text: 'Learn Avenx', done: false }); // Reactive!
state.user.profile.age = 35; // Reactive!
```
