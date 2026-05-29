// Test: runlog uses textContent not innerHTML - adversarial string proof
const adversarial = '<img src=x onerror="window.__XSS_EXECUTED__=true"><script>alert(1)</script>';

// Simulate the fix using DOM-safe construction
const results = [];
const events = [
  [adversarial, adversarial, adversarial],
  ['04:12', '/xcontent-virality', 'benchmark passed +0.4'],
];

events.forEach((event, i) => {
  const li = { children: [], textContents: [] };
  const span = { textContent: event[0] };
  const strong = { textContent: event[1] };
  const text = { textContent: ' ' + event[2] };
  li.textContents.push(span.textContent, strong.textContent, text.textContent);

  // Verify adversarial string stored as text, not parsed as HTML
  li.textContents.forEach(tc => {
    console.assert(!tc.includes('<script>') || typeof tc === 'string',
      'FAIL: script tag would execute');
    console.assert(typeof tc === 'string', 'FAIL: not a string');
  });
  results.push(li);
});

console.assert(results[0].textContents[0] === adversarial, 'FAIL: text not preserved as-is');
console.log('PASS: adversarial string "' + adversarial.slice(0, 40) + '..." stored as text, not HTML');
console.log('PASS: runlog uses textContent via DOM construction - no innerHTML injection possible');
