import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

const candidates = [
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', 'config', 'secret.py'),
  path.resolve(process.cwd(), '..', '..', 'config', 'secret.py'),
];

const envPaths = [...new Set(candidates.filter((candidate) => existsSync(candidate)))];
for (const envPath of envPaths) {
  dotenv.config({ path: envPath, override: false, quiet: true });
}

export const loadedEnvPath = envPaths[0];
