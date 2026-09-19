class CaseCount extends HTMLElement {
  static observedAttributes = ['count', 'announce'];

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const rawCount = this.getAttribute('count');
    const count = rawCount === null ? 0 : Number(rawCount);

    if (!Number.isInteger(count) || count < 0) {
      this.shadowRoot.innerHTML = '<span>Unable to display results.</span>';
      return;
    }

    const slotName = count === 0 ? 'zero' : count === 1 ? 'singular' : 'plural';
    const hasNamedSlot = this.querySelector(`[slot="${slotName}"]`) !== null;
    const hasPluralSlot = this.querySelector('[slot="plural"]') !== null;
    const hasDefaultSlot = Array.from(this.childNodes).some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent.trim() !== '';
      }

      return node.nodeType === Node.ELEMENT_NODE && !node.hasAttribute('slot');
    });
    const selectedSlot = hasNamedSlot
      ? slotName
      : count === 0 && hasPluralSlot
        ? 'plural'
        : hasDefaultSlot
          ? ''
          : slotName;
    const liveRegionAttributes = this.hasAttribute('announce')
      ? ' role="status" aria-live="polite" aria-atomic="true"'
      : '';

    this.shadowRoot.innerHTML = `
      <span${liveRegionAttributes}>
        <slot${selectedSlot ? ` name="${selectedSlot}"` : ''}>
          ${slotName === 'zero' ? 'No results found.' : slotName === 'singular' ? '1 result found.' : `${count} results found.`}
        </slot>
      </span>
    `;

    const slot = this.shadowRoot.querySelector('slot');
    slot.assignedElements({ flatten: true }).forEach((element) => {
      const countElements = element.matches('[data-count]')
        ? [element, ...element.querySelectorAll('[data-count]')]
        : element.querySelectorAll('[data-count]');

      countElements.forEach((countElement) => {
        countElement.textContent = count;
      });
    });
  }
}

customElements.define('case-count', CaseCount);
