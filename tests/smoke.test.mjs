import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync('index.html','utf8');
const css = readFileSync('src/styles.css','utf8');
test('HTML carga el juego y sus estilos', () => {
  assert.match(html, /src="\.\/src\/game\.js\?v=0\.3\.0"/);
  assert.match(html, /href="\.\/src\/styles\.css\?v=0\.3\.0"/);
  assert.match(html, /id="main"/);
  assert.match(html, /id="reset"/);
  assert.match(html, /type="module"/);
  assert.match(html, /id="save"/);
  assert.match(html, /id="load"/);
});
test('No depende de CDN ni de recursos extraídos del juego', () => {
  assert.doesNotMatch(html, /<script[^>]+https?:\/\//i);
  assert.doesNotMatch(css, /url\(\s*['"]?https?:\/\//i);
});
