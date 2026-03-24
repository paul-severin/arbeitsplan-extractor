// Extract only the calculateShiftDetails function from index.html
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/index.html', 'utf8');
const match = src.match(/function calculateShiftDetails[\s\S]+?module\.exports[^\n]+/);
if (!match) { console.error('Function not found'); process.exit(1); }
eval(match[0]);

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) {
        console.log(`  ✓ ${label}`);
        passed++;
    } else {
        console.error(`  ✗ ${label}`);
        console.error(`    expected: ${JSON.stringify(expected)}`);
        console.error(`    actual:   ${JSON.stringify(actual)}`);
        failed++;
    }
}

console.log('calculateShiftDetails');

// < 6h: keine Pause
assert('4h Schicht → keine Pause',
    calculateShiftDetails('08:00', '12:00'),
    { pause: '', arbeitszeit: '4,00' });

// Genau 6h → 0,50 Pause, 5,50 Dauer
assert('genau 6h → Pause 0,50',
    calculateShiftDetails('06:00', '12:00'),
    { pause: '0,50', arbeitszeit: '5,50' });

// 8h brutto → 0,50 Pause, 7,50 Dauer
assert('8h brutto → Pause 0,50',
    calculateShiftDetails('06:00', '14:00'),
    { pause: '0,50', arbeitszeit: '7,50' });

// Genau 9h → 0,75 Pause, 8,25 Dauer
assert('genau 9h → Pause 0,75',
    calculateShiftDetails('06:00', '15:00'),
    { pause: '0,75', arbeitszeit: '8,25' });

// > 9h → 0,75 Pause
assert('11h brutto → Pause 0,75',
    calculateShiftDetails('06:00', '17:00'),
    { pause: '0,75', arbeitszeit: '10,25' });

// Nicht-volle Stunden
assert('7h 30min brutto → Pause 0,50',
    calculateShiftDetails('07:00', '14:30'),
    { pause: '0,50', arbeitszeit: '7,00' });

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
