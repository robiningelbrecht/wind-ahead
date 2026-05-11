import { $ } from '../state';

export class Dropdown {
    constructor(btnId, menuId) {
        this.btn = $(btnId);
        this.menu = $(menuId);

        this.btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) this.close();
        });
    }

    toggle() {
        this.menu.classList.toggle('hidden');
    }

    close() {
        this.menu.classList.add('hidden');
    }
}
