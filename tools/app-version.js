// The app's version name, worked out from the update number in tools/app-version.txt.
// 98 -> 1.0.98, 99 -> 1.0.99, 100 -> 1.1.1, 198 -> 1.1.99, 199 -> 1.2.1 (each minor runs .1 to .99).
const fs = require('fs'), path = require('path');
const n = parseInt(fs.readFileSync(path.join(__dirname, 'app-version.txt'), 'utf8'), 10) || 1;
const minor = n < 100 ? 0 : Math.floor((n - 100) / 99) + 1, patch = n < 100 ? n : ((n - 100) % 99) + 1;
module.exports = { n: n, name: '1.' + minor + '.' + patch };
