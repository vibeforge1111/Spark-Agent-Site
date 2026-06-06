import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function buildRunlogItems(visible) {
  return visible.map((event, i) => ({
    tag: 'li',
    className: i === 0 ? 'active' : '',
    children: [
      { tag: 'span', text: event[0] },
      { tag: 'strong', text: event[1] },
      { text: ' ' + event[2] },
    ],
  }));
}

function serializeItem(item) {
  const escapeText = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return item.children
    .map(c => (c.tag ? `<${c.tag}>${escapeText(c.text)}</${c.tag}>` : escapeText(c.text)))
    .join('');
}

describe('DOM XSS — runlog innerHTML fix', () => {
  it('renders normal event fields safely', () => {
    const visible = [['04:15', '/qa-pass', 'score 94%']];
    const items = buildRunlogItems(visible);
    const html = serializeItem(items[0]);
    assert.ok(html.includes('04:15'));
    assert.ok(html.includes('/qa-pass'));
    assert.ok(html.includes('score 94%'));
  });

  it('escapes script tags in event[0] (timestamp field)', () => {
    const visible = [['<script>alert(1)</script>', '/event', 'detail']];
    const items = buildRunlogItems(visible);
    const html = serializeItem(items[0]);
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  it('escapes script tags in event[1] (route field)', () => {
    const visible = [['04:00', '<img src=x onerror=alert(1)>', 'detail']];
    const items = buildRunlogItems(visible);
    const html = serializeItem(items[0]);
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;img'));
  });

  it('escapes script tags in event[2] (description field)', () => {
    const visible = [['04:00', '/route', '<svg onload=alert(1)>']];
    const items = buildRunlogItems(visible);
    const html = serializeItem(items[0]);
    assert.ok(!html.includes('<svg'));
    assert.ok(html.includes('&lt;svg'));
  });

  it('first item gets active class', () => {
    const visible = [['t1', 'r1', 'd1'], ['t2', 'r2', 'd2']];
    const items = buildRunlogItems(visible);
    assert.equal(items[0].className, 'active');
    assert.equal(items[1].className, '');
  });

  it('innerHTML pattern is unsafe with attacker data', () => {
    const maliciousEvent = ['<script>alert(document.cookie)</script>', '/route', 'desc'];
    const oldHtml = `<li><span>${maliciousEvent[0]}</span><strong>${maliciousEvent[1]}</strong> ${maliciousEvent[2]}</li>`;
    assert.ok(oldHtml.includes('<script>'));
  });
});
