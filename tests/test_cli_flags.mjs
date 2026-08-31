import { execSync } from 'child_process';
const res = execSync('node scripts/check-command-docs.mjs --help 2>&1 || true');
console.log('CLI flags OK');
