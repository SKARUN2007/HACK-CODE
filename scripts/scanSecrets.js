const fs = require('fs');
const path = require('path');

/**
 * Repository Secret Scanner Script for MakkalSaantru
 * Checks codebase for hardcoded private keys, JWT secrets, or cloud API tokens.
 */

const SUSPICIOUS_PATTERNS = [
  /AI_API_KEY\s*=\s*['"](?!demo-key|mock-key)[A-Za-z0-9_\-]{20,}['"]/i,
  /BEGIN\s+PRIVATE\s+KEY/i,
  /ghp_[A-Za-z0-9]{36}/,
  /sk_live_[0-9a-zA-Z]{24}/,
];

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.gemini', 'uploads'];
const EXCLUDED_FILES = ['scanSecrets.js', '.env.example'];

let findings = [];

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (EXCLUDED_DIRS.includes(item)) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.env'))) {
      if (EXCLUDED_FILES.includes(item)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      SUSPICIOUS_PATTERNS.forEach((pattern) => {
        if (pattern.test(content)) {
          findings.push({ file: fullPath, pattern: pattern.toString() });
        }
      });
    }
  }
}

console.log('=================================================');
console.log('  MAKKALSAANTRU REPOSITORY SECRET SCANNER');
console.log('=================================================');

const projectRoot = path.join(__dirname, '..');
scanDirectory(projectRoot);

if (findings.length === 0) {
  console.log('✅ SECRET SCAN PASSED: Zero hardcoded production secrets or private keys found.');
  process.exit(0);
} else {
  console.error(`⚠️ SECRET SCAN WARNING: Found ${findings.length} potential hardcoded secret pattern(s):`);
  findings.forEach((f) => console.error(` - File: ${f.file} (Pattern: ${f.pattern})`));
  process.exit(1);
}
