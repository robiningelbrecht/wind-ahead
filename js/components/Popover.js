export class Popover {
    constructor(name) {
        const wrapper = document.querySelector(`[data-popover="${name}"]`);
        this.trigger = wrapper.querySelector('button');
        this.element = this.trigger.nextElementSibling;

        this.trigger.addEventListener('click', () => this.toggle());

        document.addEventListener('click', (e) => {
            if (this.element.contains(e.target) || this.trigger.contains(e.target)) return;
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

    isOpen() {
        return this.trigger.getAttribute('aria-expanded') === 'true';
    }

    open() {
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
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    toggle() {
        if (this.isOpen()) this.close();
        else this.open();
    }
}
