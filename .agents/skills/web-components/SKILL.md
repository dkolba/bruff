---
name: web-components
description: "Best practices for building scalable plain Web Components without turning custom elements into “god objects”. Provides patterns that keep Web Components modular, reusable, maintainable, and focused on UI concerns."
---

# Web Components Architecture Patterns

A common smell in Web Components is when a custom element becomes a “god object” containing networking, business logic, DOM orchestration, validation, formatting, state coordination, and lifecycle management all inside a single class.

Good Web Component architecture keeps custom elements focused on:

- rendering
- local UI state
- DOM interaction
- event emission
- wiring behaviors together

Everything else should usually be extracted.

---

# Core Patterns for Plain Web Components

## 1. Container / Presentational Component Split

Separate orchestration from rendering.

### Bad

```js
class UserCard extends HTMLElement {
  async loadUser() {}
  validatePermissions() {}
  formatDate() {}
  renderAvatar() {}
  savePreferences() {}
}
```

### Better

```js
class UserCard extends HTMLElement {
  render(userViewModel) {}
}
```

Move logic elsewhere:

```js
class UserService {}
class UserFormatter {}
class UserPermissions {}
```

The component should mostly:

- receive data
- render UI
- emit events

---

# 2. Service Objects

Move business logic outside components.

### Example

```js
class CartService {
  addItem() {}
  removeItem() {}
  calculateTax() {}
}
```

Component:

```js
cartService.addItem(product);
```

Components should generally not contain:

- API orchestration
- pricing rules
- caching
- analytics
- authentication rules

---

# 3. Event-Driven Communication (`CustomEvent`)

Avoid components directly calling each other.

### Bad

```js
sidebar.updateCart();
navbar.refreshCount();
```

### Better

```js
this.dispatchEvent(
  new CustomEvent("cart-updated", {
    bubbles: true,
    composed: true,
  }),
);
```

Consumers subscribe:

```js
document.addEventListener("cart-updated", () => {
  refreshNavbar();
});
```

Benefits:

- loose coupling
- easier reuse
- less dependency wiring

---

# 4. Pub/Sub Event Bus

For larger systems, use a shared event bus.

```js
const bus = new EventTarget();

bus.dispatchEvent(new CustomEvent("user-login"));

bus.addEventListener("user-login", handler);
```

Useful when components are distant in the DOM tree.

---

# 5. State Machines

When components gain many lifecycle methods, model behavior explicitly.

Instead of:

```js
open();
close();
loading();
retry();
success();
fail();
```

Represent state declaratively:

```txt
idle
loading
success
error
```

Transitions:

```txt
idle -> loading
loading -> success
loading -> error
```

This reduces ad-hoc conditional logic.

---

# 6. Reducer-Based State Management

Instead of mutating state everywhere:

```js
this.count++;
this.loading = false;
```

Centralize transitions:

```js
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return {
        ...state,
        count: state.count + 1,
      };

    default:
      return state;
  }
}
```

Components become easier to reason about.

---

# 7. Composition Over Inheritance

Prefer assembling behavior from smaller pieces instead of giant base classes.

### Bad

```js
class BaseElement extends HTMLElement {
  log() {}
  trackAnalytics() {}
  setupKeyboard() {}
  setupResizeObserver() {}
}
```

### Better

```js
class KeyboardController {
  constructor(host) {
    this.host = host;
  }

  connect() {
    window.addEventListener("keydown", this.onKeyDown);
  }

  disconnect() {
    window.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (e) => {
    if (e.key === "Escape") {
      this.host.close?.();
    }
  };
}
```

Component:

```js
class MyModal extends HTMLElement {
  constructor() {
    super();
    this.keyboard = new KeyboardController(this);
  }

  connectedCallback() {
    this.keyboard.connect();
  }

  disconnectedCallback() {
    this.keyboard.disconnect();
  }

  close() {
    this.removeAttribute("open");
  }
}
```

Benefits:

- modular behavior
- reusable concerns
- smaller components
- no deep inheritance chains

---

# 8. Behavior / Controller Objects

Extract lifecycle-heavy concerns.

### Instead of

```js
class MyElement extends HTMLElement {
  connectedCallback() {}
  disconnectedCallback() {}
  handleResize() {}
  handleKeyboard() {}
}
```

### Use controllers

```js
class ResizeController {}
class KeyboardController {}
class FocusTrapController {}
```

Component:

```js
class MyDialog extends HTMLElement {
  constructor() {
    super();

    this.resize = new ResizeController(this);
    this.keyboard = new KeyboardController(this);
  }
}
```

Each controller owns one concern.

---

# 9. Mixin Functions

Lightweight reusable behaviors.

```js
const Selectable = (Base) =>
  class extends Base {
    selected = false;

    select() {
      this.selected = true;
    }
  };

class MyItem extends Selectable(HTMLElement) {}
```

Prefer small mixins over giant base classes.

---

# 10. Child Component Decomposition

Split large elements into focused elements.

### Too broad

```html
<dashboard-page></dashboard-page>
```

### Better

```html
<dashboard-page>
  <dashboard-sidebar></dashboard-sidebar>
  <dashboard-toolbar></dashboard-toolbar>
  <analytics-chart></analytics-chart>
</dashboard-page>
```

Smaller components naturally require fewer methods.

---

# 11. Slot-Based Composition

Compose UI with slots instead of subclassing variants.

```html
<app-modal>
  <h2 slot="title">Delete item</h2>

  <p>Are you sure?</p>

  <button slot="actions">Delete</button>
</app-modal>
```

The component becomes a reusable shell instead of a hierarchy of specialized subclasses.

---

# 12. Functional DOM Render Helpers

Extract rendering helpers from components.

```js
function renderAvatar(user) {
  return `
    <img src="${user.avatar}">
  `;
}
```

Component:

```js
this.innerHTML = `
  ${renderAvatar(user)}
`;
```

This reduces rendering clutter.

---

# 13. View Model / Mapper Layer

Move data shaping outside components.

```js
function toUserViewModel(user) {
  return {
    fullName: `${user.first} ${user.last}`,
    formattedDate: formatDate(user.createdAt),
    avatarUrl: buildAvatarUrl(user),
  };
}
```

The component receives already-prepared data.

---

# 14. Declarative Template Rendering

Avoid imperative DOM mutation methods.

### Imperative

```js
showSpinner();
hideSpinner();
updateError();
clearError();
```

### Declarative

```js
render() {
  this.innerHTML = this.loading
    ? `<spinner-loader></spinner-loader>`
    : `<user-list></user-list>`
}
```

State determines UI.

---

# 15. Store Objects with Subscriptions

Externalize shared state.

```js
class Store extends EventTarget {
  state = {
    count: 0,
  };

  setState(next) {
    this.state = next;

    this.dispatchEvent(new Event("change"));
  }
}
```

Component:

```js
store.addEventListener("change", () => {
  this.render();
});
```

---

# 16. Immutable State Updates

Prefer replacing state over mutating nested objects.

### Avoid

```js
this.state.user.name = "John";
```

### Prefer

```js
this.state = {
  ...this.state,
  user: {
    ...this.state.user,
    name: "John",
  },
};
```

This makes updates more predictable.

---

# 17. Dependency Injection via Properties

Avoid hidden global dependencies.

```js
class UserList extends HTMLElement {
  set api(service) {
    this._api = service;
  }
}
```

Consumer:

```js
userList.api = userService;
```

Makes components easier to test and reuse.

---

# 18. Observer Pattern

Encapsulate subscriptions to external changes.

```js
resizeObserver.observe(this);

mutationObserver.observe(node, {
  childList: true,
});
```

Useful for DOM coordination concerns.

---

# 19. Command Pattern

Represent actions as explicit objects/functions.

```js
class SaveCommand {
  execute(data) {}
}
```

Components dispatch commands instead of embedding workflows.

---

# 20. Adapter Pattern

Normalize external APIs.

```js
class StripeAdapter {
  async charge() {}
}
```

Component depends on a stable interface instead of vendor-specific details.

---

# 21. Proxy / Wrapper Components

Wrap third-party widgets behind a stable custom element.

```html
<stripe-checkout></stripe-checkout>
```

The wrapper isolates external complexity.

---

# 22. Form-Associated Custom Elements

Use browser-native form participation.

```js
class DatePicker extends HTMLElement {
  static formAssociated = true;
}
```

Keeps form behavior standardized instead of manually orchestrated.

---

# 23. Headless Component Pattern

Separate behavior from presentation.

Behavior component:

```html
<dropdown-controller></dropdown-controller>
```

Presentation provided externally.

Useful for design-system flexibility.

---

# 24. Progressive Enhancement Pattern

Enhance existing HTML instead of fully replacing it.

```html
<button data-modal-trigger>Open</button>
```

Component attaches richer behavior progressively.

---

# 25. Lazy Hydration / Deferred Initialization

Delay expensive work.

```js
connectedCallback() {
  requestIdleCallback(() => {
    this.initialize()
  })
}
```

Useful for performance-sensitive pages.

---

# 26. Finite Lifecycle Ownership Pattern

Each resource should have a clear owner.

### Example

```js
connectedCallback() {
  this.controller.connect()
}

disconnectedCallback() {
  this.controller.disconnect()
}
```

Avoid leaked listeners and observers.

---

# 27. Capability-Based Composition

Compose only required capabilities.

```js
this.search = createSearchCapability();
this.analytics = createAnalyticsCapability();
```

Instead of giant universal base classes.

---

# 28. Data-Down / Events-Up Architecture

Parents pass data downward.

Children emit events upward.

```js
this.dispatchEvent(new CustomEvent("save"));
```

This keeps ownership boundaries clear.

---

# 29. Stateless Rendering Components

Some components only render based on inputs.

```js
class UserAvatar extends HTMLElement {
  set user(value) {
    this.render(value);
  }
}
```

No business logic or orchestration.

---

# 30. Controller-Per-Concern Pattern

One object per behavior concern.

Example structure:

```txt
my-modal/
  my-modal.js
  keyboard-controller.js
  focus-trap-controller.js
  animation-controller.js
```

The component becomes a coordinator.

---

# 31. Resource Manager Objects

Centralize cleanup-sensitive resources.

```js
class ResourceManager {
  timers = new Set();

  cleanup() {}
}
```

Useful for timers, subscriptions, observers, and async tasks.

---

# 32. DOM Delegation for Event Handling

Avoid many per-node listeners.

### Instead of

```js
button.addEventListener(...)
```

Use delegation:

```js
this.addEventListener("click", (e) => {
  if (e.target.matches("[data-remove]")) {
    removeItem();
  }
});
```

Better scalability and simpler cleanup.

---

# 33. Registry / Factory Pattern

Create child elements dynamically.

```js
const registry = {
  chart: () => document.createElement("chart-widget"),
  table: () => document.createElement("data-table"),
};
```

Useful for plugin-style systems.

---

# 34. Strategy Objects

Swap behaviors without condition-heavy components.

```js
class GridLayoutStrategy {}
class MasonryLayoutStrategy {}
```

Component:

```js
gallery.strategy = new MasonryLayoutStrategy();
```

Avoids giant `if/else` blocks.

---

# 35. Async Task Queue / Scheduler Abstraction

Externalize async coordination.

```js
class TaskQueue {
  add(task) {}
}
```

Useful for retries, batching, throttling, and sequencing.

---

# 36. Externalized Validation Modules

Move validation outside components.

```js
function validateUser(user) {}
```

Avoid embedding business rules in UI elements.

---

# 37. Externalized Formatting / Serialization

Formatting should rarely live inside components.

```js
function formatCurrency(value) {}
function serializeForm(data) {}
```

Keeps rendering logic clean.

---

# Practical Heuristic

If a Web Component has:

- more than ~10 methods
- unrelated responsibilities
- many conditional branches
- multiple async flows
- complex lifecycle management

…you likely need:

- services
- controllers
- child components
- state machines
- stores
- strategy objects
- render helpers

instead of more component methods.

---

# Rule of Thumb

A healthy custom element usually mostly contains:

- attributes/properties
- local UI state
- rendering
- event emission
- tiny interaction handlers
- coordination of behaviors

And usually not:

- business rules
- networking
- formatting
- orchestration
- workflow management
- cross-component coordination
- API normalization
- analytics
- caching
