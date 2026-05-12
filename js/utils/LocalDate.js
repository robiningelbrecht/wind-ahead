export class LocalDate {
    constructor(localStr) {
        this._str = localStr;
    }

    static fromDate(d) {
        const Y = d.getFullYear();
        const M = String(d.getMonth() + 1).padStart(2, '0');
        const D = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return new LocalDate(`${Y}-${M}-${D}T${h}:${m}`);
    }

    get dateStr() {
        return this._str.split('T')[0];
    }

    get nextDayStr() {
        return this.addDays(1).dateStr;
    }

    addDays(n) {
        const d = new Date(this._str);
        d.setDate(d.getDate() + n);
        return LocalDate.fromDate(d);
    }

    get hourPrefix() {
        return this._str.slice(0, 13);
    }

    getTime() {
        return new Date(this._str).getTime();
    }

    toLocaleDateString(locales, options) {
        return new Date(this._str).toLocaleDateString(locales, options);
    }

    toString() {
        return this._str;
    }
}
