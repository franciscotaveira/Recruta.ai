/**
 * AI Cache — caches AI responses to avoid redundant API calls
 *
 * Strategy:
 *   - Hash of (cvText snippet + jobRequirements) → cached result
 *   - TTL: 7 days for CV analysis, 30 days for job matching
 *   - Redis-compatible structure (for future scaling)
 */

import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '..', '.ai-cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

interface CacheEntry<T> {
  hash: string;
  result: T;
  createdAt: number;
  ttl: number; // milliseconds
  hits: number;
}

class AICache {
  private maxEntries: number;
  private defaultTTL: number;

  constructor(maxEntries = 1000, defaultTTL = 7 * 24 * 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  private hash(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
  }

  private getCacheFile(key: string): string {
    return path.join(CACHE_DIR, `${key}.json`);
  }

  get<T>(key: string): T | null {
    try {
      const file = this.getCacheFile(key);
      if (!fs.existsSync(file)) return null;

      const raw = fs.readFileSync(file, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(raw);

      // Check TTL
      if (Date.now() - entry.createdAt > entry.ttl) {
        fs.unlinkSync(file);
        return null;
      }

      entry.hits++;
      fs.writeFileSync(file, JSON.stringify(entry));
      return entry.result;
    } catch {
      return null;
    }
  }

  set<T>(key: string, result: T, ttl?: number): void {
    try {
      // Evict old entries if over limit
      const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith('.json'));
      if (files.length >= this.maxEntries) {
        // Remove oldest entries
        const entries = files.map((f) => ({
          file: f,
          mtime: fs.statSync(path.join(CACHE_DIR, f)).mtime.getTime(),
        }));
        entries.sort((a, b) => a.mtime - b.mtime);

        const toDelete = entries.slice(0, Math.floor(this.maxEntries * 0.2));
        for (const e of toDelete) {
          fs.unlinkSync(path.join(CACHE_DIR, e.file));
        }
      }

      const entry: CacheEntry<T> = {
        hash: key,
        result,
        createdAt: Date.now(),
        ttl: ttl || this.defaultTTL,
        hits: 0,
      };

      fs.writeFileSync(this.getCacheFile(key), JSON.stringify(entry));
    } catch {
      // Silently fail — cache is non-critical
    }
  }

  clear(): void {
    try {
      const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith('.json'));
      for (const f of files) {
        fs.unlinkSync(path.join(CACHE_DIR, f));
      }
    } catch {
      /* ignore */
    }
  }

  stats(): { entries: number; hitRate: number } {
    try {
      const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith('.json'));
      let totalHits = 0;
      let validEntries = 0;

      for (const f of files) {
        const raw = fs.readFileSync(path.join(CACHE_DIR, f), 'utf-8');
        const entry: CacheEntry<any> = JSON.parse(raw);
        totalHits += entry.hits;
        if (Date.now() - entry.createdAt <= entry.ttl) {
          validEntries++;
        }
      }

      return {
        entries: validEntries,
        hitRate: files.length > 0 ? totalHits / files.length : 0,
      };
    } catch {
      return { entries: 0, hitRate: 0 };
    }
  }
}

export const aiCache = new AICache(1000, 7 * 24 * 60 * 60 * 1000);

/**
 * Generate cache key for CV analysis.
 * Uses first 500 chars of CV + job requirements hash.
 */
export function cvAnalysisCacheKey(cvText: string, jobTitle: string, requirements: string): string {
  const cvSnippet = cvText.substring(0, 500).trim();
  const jobHash = crypto
    .createHash('md5')
    .update(`${jobTitle}:${requirements}`)
    .digest('hex')
    .substring(0, 8);
  const cvHash = crypto.createHash('md5').update(cvSnippet).digest('hex').substring(0, 8);
  return `cv_${cvHash}_${jobHash}`;
}

/**
 * Generate cache key for bulk analysis batch.
 */
export function bulkAnalysisCacheKey(
  jobTitle: string,
  requirements: string,
  candidateCount: number
): string {
  const jobHash = crypto
    .createHash('md5')
    .update(`${jobTitle}:${requirements}`)
    .digest('hex')
    .substring(0, 8);
  return `bulk_${jobHash}_${candidateCount}`;
}
