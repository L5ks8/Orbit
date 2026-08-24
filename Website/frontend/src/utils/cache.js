const cache = new Map();

export const setCache = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const getCache = (key, maxAge = 5 * 60 * 1000) => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > maxAge) {
        cache.delete(key);
        return null;
    }
    return item.data;
};

export const clearCache = (key) => {
    if (key) cache.delete(key);
    else cache.clear();
};
