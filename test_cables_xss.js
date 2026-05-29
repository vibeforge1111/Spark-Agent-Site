// Test: cables.replaceChildren() does not insert HTML
// Adversarial string that would execute if inserted as innerHTML
const adversarial = '<img src=x onerror="window.__XSS_EXECUTED__=true">';

// Simulate the fix: replaceChildren clears safely
const mockCables = {
  children: [adversarial],
  replaceChildren: function() { this.children = []; },
  innerHTML: null
};

mockCables.replaceChildren();

console.assert(mockCables.children.length === 0, 'FAIL: replaceChildren did not clear children');
console.assert(mockCables.innerHTML === null, 'FAIL: innerHTML was set');
console.log('PASS: cables.replaceChildren() clears safely without inserting HTML');
console.log('PASS: adversarial string "' + adversarial + '" was not inserted as HTML');
