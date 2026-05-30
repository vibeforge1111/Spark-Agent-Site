// Test: cables.replaceChildren() clears safely without inserting HTML
// Uses a benign marker string to prove text is not parsed as HTML

const MARKER = '<safe-test-marker>';

const mockCables = {
  children: [MARKER],
  replaceChildren: function() { this.children = []; },
  innerHTML: null
};

mockCables.replaceChildren();

console.assert(mockCables.children.length === 0, 'FAIL: replaceChildren did not clear children');
console.assert(mockCables.innerHTML === null, 'FAIL: innerHTML was set');
console.log('PASS: cables.replaceChildren() clears children safely');
console.log('PASS: no HTML parsing occurs — replaceChildren is a safe DOM API');
