# Tenspeed Count Message

A small, dependency-free web component for displaying count-aware messages with named slots, optional accessibility announcements, visual update feedback, and English number words.

Open `index.html` in a browser, or serve the folder with any static web server. The component source is [ts-count-message.js](ts-count-message.js). For a broader set of examples, see [showcase.html](showcase.html).

## Basic Usage

Load the module and provide messages for the singular, plural, and zero cases:

```html
<script type="module" src="./ts-count-message.js"></script>

<ts-count-message count="14">
  <span slot="singular">One result found.</span>
  <span slot="plural"><span data-count></span> results found.</span>
  <span slot="zero">No results found.</span>
</ts-count-message>
```

The custom element is registered as `ts-count-message`.

## API Reference

### Component attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `count` | A non-negative integer | `0` | Selects the message variant and fills each `[data-count]` placeholder. |
| `count-format` | `digits` or `words` | `digits` | Sets the display format for every rendered `[data-count]` descendant. |
| `announce` | Boolean attribute | Off | Adds `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` to the rendered message. |
| `flash` | Boolean attribute or a CSS color | Off | Adds a flash-and-fade effect when the count changes. A bare attribute uses the default color. |

Boolean attributes are enabled by their presence. For example, `announce="false"` still enables announcements; omit the attribute to disable them.

### Count placeholders

Put `data-count` on the element where the number should appear:

```html
<span slot="plural">
  <span data-count></span> results found.
</span>
```

Use `data-count-format` to override the component format for one placeholder:

```html
<ts-count-message count="3" count-format="words">
  <span slot="plural">
    <span data-count data-count-format="digits"></span> results found.
  </span>
</ts-count-message>
```

Formatting precedence is:

1. `data-count-format` on the individual placeholder
2. `count-format` on the component
3. `digits`

`digits` displays values such as `3`. `words` displays title-cased English words such as `Three`, including compound values such as `Twenty-one` and `One hundred five`. The formatter handles whole, non-negative JavaScript numbers using English `thousand`, `million`, and `billion` scales. Use `digits` for very large values or values that require locale-specific formatting.

Unknown format names fall back to digits. Decimal, negative, missing, or otherwise invalid `count` values are not rendered as messages; the component displays `Unable to display results.` instead.

## Message Selection

The component chooses a named slot based on `count`:

- `0` selects `[slot="zero"]`.
- `1` selects `[slot="singular"]`.
- Values greater than `1` select `[slot="plural"]`.

If the selected named slot is missing, the component uses the unnamed default slot when one is present. For a zero count, a plural slot is also accepted as a fallback. If no matching content is supplied, the component provides a generic fallback message.

For a message that does not change its wording between counts, use the default slot:

```html
<ts-count-message count="14">
  <span><span data-count></span> results found.</span>
</ts-count-message>
```

## Dynamic Updates

Changing the `count` attribute updates the selected slot and every rendered count placeholder:

```js
const message = document.querySelector('ts-count-message');
message.setAttribute('count', '3');
```

Changing `count-format`, `announce`, or `flash` also re-renders the component. Changing a slotted placeholder's `data-count-format` attribute, or adding a new `[data-count]` placeholder, updates it as well. The numeric `count` remains the source of truth for plural selection; formatting changes only the displayed placeholder text.

## Accessibility

Use `announce` when a count changes after an interaction, network request, or other asynchronous update that the user may need to hear. It creates a polite, atomic status region. Do not add it to static messages when no announcement is needed.

`flash` is visual feedback only and should not be the sole indication of a change. The component respects `prefers-reduced-motion: reduce` by disabling its flash animation.

The component does not create labels for surrounding controls. When placing it beside an input or buttons, give those controls their own accessible names, as the demos do.

## Styling

The component uses Shadow DOM for its internal status wrapper and animation styles. Styles applied to the custom element itself, its light-DOM slot content, and surrounding controls remain available to the page author. The `flash` value is inserted as a CSS color, so provide a valid color such as `#ffd166`, `rgb(255 209 102)`, or `rebeccapurple`.
