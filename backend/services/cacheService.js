/**
 * In-Memory Cache Service with TTL support
 * Provides fast caching to reduce database queries
 */

class CacheService {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
    }

    /**
     * Set a value in cache with optional TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
     */
    set(key, value, ttlSeconds = 300) {
        // Clear existing timer for this key
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }

        // Store the value with metadata
        this.cache.set(key, {
            value,
            createdAt: Date.now(),
            ttl: ttlSeconds * 1000
        });

        // Set expiration timer
        const timer = setTimeout(() => {
            this.invalidate(key);
        }, ttlSeconds * 1000);

        this.timers.set(key, timer);
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any|null} - Cached value or null if not found/expired
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired (belt and suspenders with the timer)
        const age = Date.now() - entry.createdAt;
        if (age > entry.ttl) {
            this.invalidate(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Invalidate (remove) a specific cache entry
     * @param {string} key - Cache key
     */
    invalidate(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        this.cache.delete(key);
    }

    /**
     * Invalidate all entries matching a pattern
     * @param {string} pattern - Pattern to match (supports * wildcard)
     */
    invalidatePattern(pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.invalidate(key);
            }
        }
    }

    /**
     * Clear all cache entries
     */
    clear() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {{ size: number, keys: string[] }}
     */
    stats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Get or set pattern - fetch from cache or execute function and cache result
     * @param {string} key - Cache key
     * @param {Function} fetchFn - Async function to fetch data if not cached
     * @param {number} ttlSeconds - TTL in seconds
     * @returns {Promise<any>}
     */
    async getOrSet(key, fetchFn, ttlSeconds = 300) {
        const cached = this.get(key);
        if (cached !== null) {
            console.log(`📦 Cache HIT: ${key}`);
            return cached;
        }

        console.log(`📦 Cache MISS: ${key}`);
        const value = await fetchFn();
        this.set(key, value, ttlSeconds);
        return value;
    }
}

// Export singleton instance
export const cache = new CacheService();
export default cache;
