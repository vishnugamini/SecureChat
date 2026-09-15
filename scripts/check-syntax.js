const { readdirSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function check(file) {
  // Browser modules use imports, while the server is CommonJS.
  const module = ['encrypt.js', 'room.js'].some(name => file === path.join('public', 'js', name));
  const result = spawnSync(process.execPath,
    ['--check', `--input-type=${module ? 'module' : 'commonjs'}`],
    { input: readFileSync(file), encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`${file}:\n${result.stderr || result.error}`);
    process.exitCode = 1;
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.js')) check(file);
  }
}

check('index.js');
for (const directory of ['src', 'public/js', 'scripts', 'test']) walk(directory);
