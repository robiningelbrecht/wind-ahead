import { $ } from '../state';

export class Popover {
    constructor(triggerId, popoverId) {
        this.trigger = $(triggerId);
        this.element = $(popoverId);

        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (this.element.contains(e.target) || e.target === this.trigger) return;
            this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });

        const observer = new IntersectionObserver(([entry]) => {
            const { width, height } = entry.boundingClientRect;
            if (width === 0 && height === 0) this.close();
        });
        observer.observe(this.trigger);
    }

    setContent(text) {
        this.element.textContent = text;
    }

    open() {
        this.element.classList.remove('hidden');
        this.trigger.setAttribute('aria-expanded', 'true');
        this.element.style.left = '';

        const padding = 8;
        const rect = this.element.getBoundingClientRect();
        const rightOverflow = rect.right - (window.innerWidth - padding);
        const leftOverflow = padding - rect.left;
        if (rightOverflow > 0) {
            this.element.style.left = `calc(50% - ${rightOverflow}px)`;
        } else if (leftOverflow > 0) {
            this.element.style.left = `calc(50% + ${leftOverflow}px)`;
        }
    }

    close() {
        this.element.classList.add('hidden');
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    toggle() {
        if (this.element.classList.contains('hidden')) {
            this.open();
        } else {
            this.close();
        }
    }
}
