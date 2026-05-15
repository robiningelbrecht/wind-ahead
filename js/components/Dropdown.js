export class Dropdown {
    constructor(name) {
        const wrapper = document.querySelector(`[data-dropdown="${name}"]`);
        this.trigger = wrapper.querySelector('button');
        this.menu = this.trigger.nextElementSibling;

        this.trigger.addEventListener('click', () => this.toggle());

        document.addEventListener('click', (e) => {
            if (this.menu.contains(e.target) || this.trigger.contains(e.target)) return;
            this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    isOpen() {
        return this.trigger.getAttribute('aria-expanded') === 'true';
    }

    open() {
        this.trigger.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    toggle() {
        if (this.isOpen()) this.close();
        else this.open();
    }
}
