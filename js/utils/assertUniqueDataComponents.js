export function assertUniqueDataComponents(root = document) {
    const seen = new Set();
    for (const el of root.querySelectorAll('[data-component]')) {
        const name = el.getAttribute('data-component');
        if (seen.has(name)) {
            throw new Error(`Duplicate data-component: "${name}". Each key must be unique.`);
        }
        seen.add(name);
    }
}
