---
title: 'AvenxRouter & Guard API'
description: 'API documentation for routing hooks, guards, navigation, and page lifecycle management.'
---

Classes responsible for navigation controls and route access authorization.

## AvenxRouter

Created by calling `AvenxApp.initRouter()`.

### Methods

- `navigate(hash)`: Programs a transition to another hash path.

```javascript
router.navigate('#/dashboard');
```

- `destroy()`: Removes routing event listeners from the window.

<hr />

## AvenxGuard

Route guards extend `AvenxGuard`. Override the following method to implement route access validation:

### `canActivate(to, from)`

Called before navigating to a route.

| Param  | Properties           | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| `to`   | `hash, page, params` | Target route details.                            |
| `from` | `hash, page, params` | Current route details (or null if initial load). |

**Returns:** `boolean` (true to allow, false to deny) or `string` (a redirect hash like `'#/login'`).
