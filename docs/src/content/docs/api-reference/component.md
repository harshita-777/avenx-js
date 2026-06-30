---
title: 'AvenxComponent API'
description: 'Full API reference for AvenxComponent properties, methods, and lifecycle hooks.'
---

The base class from which all standard UI components inherit. It manages reactivity, templates, lifecycle methods, and slot rendering.

## Properties

- `this.state` (Proxy): The reactive state instance for local properties. Changing state triggers updates automatically.

- `this.props` (Proxy): The reactive attributes passed by parent tags. Modifications from parents trigger updates.

## Lifecycle Hooks

Implement these functions in your component logic to execute code at specific points in the component's lifespan:

| Method Name   | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `onMount()`   | Called immediately after the component's element is attached to the DOM. Place your initial data fetches here. |
| `onUpdate()`  | Called after the component has updated and patched the DOM tree. Use this for DOM measurements.                |
| `onUnmount()` | Called before the component is detached and cleaned up. Ideal for removing timers and global listeners.        |

## Core Methods

### `mount(target)`

Mounts the component to the target DOM element or selector.

```javascript
const btn = new ButtonComponent();
btn.mount('#button-container');
```

### `unmount()`

Cleans up event listeners and empties the mounted container.

### `update()`

Forces a DOM patch and re-evaluates slots. Typically called automatically by the scheduler.
