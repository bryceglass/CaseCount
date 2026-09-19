# Case Count

A small, dependency-free web component for displaying count-aware messages with named slots.

## Usage

Open `index.html` in a browser, or serve the folder with any static web server.

```html
<case-count count="14" announce>
  <span slot="singular">One result found.</span>
  <span slot="plural"><span data-count></span> results found.</span>
  <span slot="zero">No results found.</span>
</case-count>
```

For a shared message, use the unnamed default slot:

```html
<case-count count="14">
  <span><span data-count></span> results found.</span>
</case-count>
```

The `announce` attribute enables a polite live region for dynamic count updates.
