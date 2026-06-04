const DB_NAME = 'silo';
const DB_VERSION = 1;

class Store {
  constructor() {
    this.db = null;
    this.fallbackUsed = false;
  }

  async init() {
    if (!('indexedDB' in window)) {
      return this._useFallback();
    }

    try {
      this.db = await new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('expenses')) {
            const store = db.createObjectStore('expenses', {
              keyPath: 'id',
              autoIncrement: true,
            });
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('category', 'category', { unique: false });
          }
          if (!db.objectStoreNames.contains('budgets')) {
            db.createObjectStore('budgets', { keyPath: 'month' });
          }
        };

        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => reject(req.error);

        req.onblocked = () => {
          console.warn('Silo: DB blocked, closing old connection');
          if (req.result) req.result.close();
        };
      });

      return this;
    } catch (err) {
      console.warn('Silo: IndexedDB failed, using localStorage fallback', err);
      this.db = null;
      this.fallbackUsed = true;
      return this;
    }
  }

  _useFallback() {
    this.fallbackUsed = true;
    return this;
  }

  // --- Expenses ---

  async addExpense(expense) {
    if (this.fallbackUsed) return this._fallbackAdd('expenses', expense);

    try {
      const tx = this.db.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');
      const id = await new Promise((resolve, reject) => {
        const req = store.add(expense);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await this._txComplete(tx);
      return id;
    } catch {
      this._useFallback();
      return this._fallbackAdd('expenses', expense);
    }
  }

  async getExpenses(month = null) {
    if (this.fallbackUsed) return this._fallbackGet('expenses', month);

    try {
      const tx = this.db.transaction('expenses', 'readonly');
      const store = tx.objectStore('expenses');
      const index = store.index('date');
      const expenses = await new Promise((resolve, reject) => {
        const req = index.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (month) {
        return expenses.filter((e) => e.date?.startsWith(month));
      }
      return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
      this._useFallback();
      return this._fallbackGet('expenses', month);
    }
  }

  async deleteExpense(id) {
    if (this.fallbackUsed) return this._fallbackDelete('expenses', id);

    try {
      const tx = this.db.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');
      await new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = resolve;
        req.onerror = reject;
      });
      return await this._txComplete(tx);
    } catch {
      this._useFallback();
      return this._fallbackDelete('expenses', id);
    }
  }

  // --- Budgets ---

  async setBudget(month, amount) {
    if (this.fallbackUsed) return this._fallbackSet('budgets', month, { month, amount });

    try {
      const tx = this.db.transaction('budgets', 'readwrite');
      const store = tx.objectStore('budgets');
      await new Promise((resolve, reject) => {
        const req = store.put({ month, amount });
        req.onsuccess = resolve;
        req.onerror = reject;
      });
      return await this._txComplete(tx);
    } catch {
      this._useFallback();
      return this._fallbackSet('budgets', month, { month, amount });
    }
  }

  async getBudget(month) {
    if (this.fallbackUsed) return this._fallbackGetSingle('budgets', month);

    try {
      const tx = this.db.transaction('budgets', 'readonly');
      const store = tx.objectStore('budgets');
      const result = await new Promise((resolve, reject) => {
        const req = store.get(month);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      return result?.amount ?? null;
    } catch {
      this._useFallback();
      return this._fallbackGetSingle('budgets', month);
    }
  }

  // --- Helpers ---

  async _txComplete(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  // --- Fallback helpers ---

  _fallbackKey(store, id) {
    return `silo_${store}_${id ?? 'all'}`;
  }

  _fallbackAdd(storeName, item) {
    const entries = this._fallbackGet(storeName);
    const id = Date.now();
    entries.unshift({ ...item, id });
    const key = this._fallbackKey(storeName, 'all');
    try {
      localStorage.setItem(key, JSON.stringify(entries));
    } catch {}
    return id;
  }

  _fallbackGet(storeName, month = null) {
    const key = this._fallbackKey(storeName, 'all');
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : [];
      if (month && storeName === 'expenses') {
        return data.filter((e) => e.date?.startsWith(month));
      }
      return data;
    } catch {
      return [];
    }
  }

  _fallbackDelete(storeName, id) {
    const entries = this._fallbackGet(storeName);
    const filtered = entries.filter((e) => e.id !== id);
    try {
      localStorage.setItem(this._fallbackKey(storeName, 'all'), JSON.stringify(filtered));
    } catch {}
  }

  _fallbackSet(storeName, key, value) {
    try {
      localStorage.setItem(this._fallbackKey(storeName, key), JSON.stringify(value));
    } catch {}
  }

  _fallbackGetSingle(storeName, key) {
    try {
      const raw = localStorage.getItem(this._fallbackKey(storeName, key));
      return raw ? JSON.parse(raw).amount ?? null : null;
    } catch {
      return null;
    }
  }
}

const store = new Store();
export default store;
