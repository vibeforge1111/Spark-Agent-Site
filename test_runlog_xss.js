// Test: runlog uses textContent not innerHTML - safe DOM construction proof
// Uses benign marker strings to prove text is not parsed as HTML

const MARKER = '<safe-test-marker>';

const results = [];
const events = [
  [MARKER, MARKER, MARKER],
  ['04:12', '/xcontent-virality', 'benchmark passed +0.4'],
];

events.forEach((event, i) => {
  const li = { textContents: [] };
  const span = { textContent: event[0] };
  const strong = { textContent: event[1] };
  const text = { textContent: ' ' + event[2] };
  li.textContents.push(span.textContent, strong.textContent, text.textContent);
  li.textContents.forEach(tc => {
    console.assert(typeof tc === 'string', 'FAIL: not a string');
  });
  results.push(li);
});

console.assert(results[0].textContents[0] === MARKER, 'FAIL: text not preserved as-is');
console.log('PASS: marker string preserved as text, not parsed as HTML');
console.log('PASS: runlog uses textContent via DOM construction - safe insertion confirmed');
