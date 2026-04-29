const fs = require('fs');

const path = '/Users/franciscotaveira.ads/Documents/Recrutaria/recruta.ai---recrutamento-inteligente/server/index.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace all non async (req, res) route handlers that might use db calls to async
content = content.replace(/app\.(get|post|put|delete|patch)\(([^,]+),\s*(?:requireAuth[^,]*,\s*)?((?:[a-zA-Z]+Limiter,\s*)?)\(req,\s*res\)\s*=>\s*\{/g, 
  (match, method, route, limitCtx) => {
    return match.replace('(req, res) => {', 'async (req, res) => {');
});

// 2. Add away to dual, usersDb, wa
content = content.replace(/(?<!await\s+)(dual|usersDb|wa)\.([a-zA-Z0-9]+)\(/g, 'await $1.$2(');

fs.writeFileSync(path, content, 'utf8');
console.log('index.ts refactored successfully.');
