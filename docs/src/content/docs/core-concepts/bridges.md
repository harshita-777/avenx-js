---
title: 'Shared State & Bridges'
description: 'Share reactive state between components using Avenx Bridges.'
---

Bridges provide an elegant, lightweight solution for sharing state and business logic across multiple components or pages without prop-drilling.

## Creating a Bridge

Generate a new bridge using the CLI tool:

```bash
npx avenx g bridge auth
```

This creates a file in `src/global/auth.bridge.js`. Export a standard JavaScript object representing the state:

```javascript
// src/global/auth.bridge.js
export default {
  isLoggedIn: false,
  user: {
    name: 'Guest',
    role: 'visitor',
  },
  logout() {
    this.isLoggedIn = false;
    this.user.name = 'Guest';
  },
};
```

## Using Bridges in Components

Bridges are automatically loaded and registered by the compiler. They are exposed directly to component templates and actions under their capitalized name postfixed with `Bridge` (e.g. `AuthBridge`).

```html
<p>Current User: {{ AuthBridge.user.name }}</p>

<action name="login"> AuthBridge.isLoggedIn = true; AuthBridge.user.name = "John Doe"; </action>

<button @click="AuthBridge.logout()">Log Out</button>
```

:::note
**Reactivity:** Mutations to a bridge trigger updates on all components referencing that bridge, ensuring state sync across your entire application automatically.
:::
