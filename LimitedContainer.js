export default class LimitedContainer {
    constructor(limit = 50) {
        this.limit = limit;
        this.items = [];
    }

    add(item) {
        if (this.items.length >= this.limit) {
            this.items.shift(); // Удаляет самый старый элемент (первый в массиве)
        }
        this.items.push(item);
    }

    getAll() {
        return [...this.items]; // Возвращает копию массива
    }

    includes(item) {
        return this.items.includes(item);
    }
}