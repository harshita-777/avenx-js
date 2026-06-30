---
title: 'AvenxPage API'
description: 'API reference for AvenxPage, the specialized component class for views and routing.'
---

A specialized sub-class extending `AvenxComponent`. Pages represent root layouts in router configurations.

## Key Differences from AvenxComponent

- **Child Component Resolution**: Pages are configured with a registry of components. Whenever a page renders, it scans the DOM for custom element tags (e.g. `<div data-avenx-comp="Navbar">`) and instantiates them automatically.

- **Props Propagation**: If a child component is declared with attributes (e.g., `<Card title="My Card" />`), `AvenxPage` extracts and feeds them to the child component as props dynamically.
