class TenspeedCountMessage extends HTMLElement {
  static observedAttributes = ['count', 'count-format', 'announce', 'flash'];

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this._lastCount = undefined;
    this._contentObserver = new MutationObserver(() => {
      if (this.isConnected) {
        this.render();
      }
    });
  }

  connectedCallback() {
    this._contentObserver.observe(this, {
      attributes: true,
      attributeFilter: ['data-count-format'],
      childList: true,
      subtree: true,
    });
    this.render();
  }

  disconnectedCallback() {
    this._contentObserver.disconnect();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  formatCount(count, format) {
    if (format !== 'words') {
      return String(count);
    }

    const smallNumbers = [
      'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
      'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
      'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    ];
    const tens = [
      '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
      'eighty', 'ninety',
    ];
    const scales = [
      [1_000_000_000, 'billion'],
      [1_000_000, 'million'],
      [1_000, 'thousand'],
    ];

    const underThousand = (value) => {
      if (value < 20) {
        return smallNumbers[value];
      }

      if (value < 100) {
        return tens[Math.floor(value / 10)] + (value % 10 ? `-${smallNumbers[value % 10]}` : '');
      }

      return `${smallNumbers[Math.floor(value / 100)]} hundred${value % 100 ? ` ${underThousand(value % 100)}` : ''}`;
    };

    const toWords = (value) => {
      if (value < 1000) {
        return underThousand(value);
      }

      const scale = scales.find(([threshold]) => value >= threshold);
      if (!scale) {
        return String(value);
      }

      const [threshold, name] = scale;
      const leading = Math.floor(value / threshold);
      const remainder = value % threshold;
      return `${toWords(leading)} ${name}${remainder ? ` ${toWords(remainder)}` : ''}`;
    };

    const words = toWords(count);
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  render() {
    const rawCount = this.getAttribute('count');
    const count = rawCount === null ? 0 : Number(rawCount);

    if (!Number.isInteger(count) || count < 0) {
      this.shadowRoot.innerHTML = '<span>Unable to display results.</span>';
      return;
    }

    const slotName = count === 0 ? 'zero' : count === 1 ? 'singular' : 'plural';
    const componentFormat = this.getAttribute('count-format') || 'digits';
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
    const flashEnabled = this.hasAttribute('flash');
    const flashColor = this.getAttribute('flash') || '#ffe066';
    const shouldFlash = flashEnabled && this._lastCount !== undefined && this._lastCount !== count;
    const flashClass = shouldFlash ? ' flash' : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        .flash {
          display: inline-block;
          animation: flash-fade 900ms ease-out;
          border-radius: 0.2rem;
        }

        @keyframes flash-fade {
          0% {
            background-color: transparent;
          }

          20% {
            background-color: ${flashColor};
          }

          100% {
            background-color: transparent;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .flash {
            animation: none;
          }
        }
      </style>
      <span class="${flashClass}"${liveRegionAttributes}>
        <slot${selectedSlot ? ` name="${selectedSlot}"` : ''}>
          ${slotName === 'zero' ? 'No results found.' : slotName === 'singular' ? '1 result found.' : `${count} results found.`}
        </slot>
      </span>
    `;

    this._lastCount = count;

    const slot = this.shadowRoot.querySelector('slot');
    slot.assignedElements({ flatten: true }).forEach((element) => {
      const countElements = element.matches('[data-count]')
        ? [element, ...element.querySelectorAll('[data-count]')]
        : element.querySelectorAll('[data-count]');

      countElements.forEach((countElement) => {
        const format = countElement.getAttribute('data-count-format') || componentFormat;
        countElement.textContent = this.formatCount(count, format);
      });
    });
  }
}

customElements.define('ts-count-message', TenspeedCountMessage);
