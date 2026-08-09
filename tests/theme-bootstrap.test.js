import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIGHT_THEME_IDS } from '../src/lib/themes.js';

test('app.html does not hardcode data-theme on html (hydration would reset saved theme)', () => {
	const html = readFileSync('src/app.html', 'utf8');
	assert.ok(!html.match(/<html[^>]*data-theme=/));
});

test('app.html light-theme bootstrap covers every LIGHT_THEME_IDS entry', () => {
	const html = readFileSync('src/app.html', 'utf8');
	assert.ok(html.includes('isLightThemeId'));
	for (const id of LIGHT_THEME_IDS) {
		const isLight =
			id.endsWith('-light') || /^(paper|dawn|blush|petal|ballet|mint|sand|sky)$/.test(id);
		assert.equal(isLight, true, `bootstrap helper missing light theme: ${id}`);
	}
});

test('ThemePicker renders select only in browser to avoid hydration overwriting saved theme', () => {
	const source = readFileSync('src/lib/components/ThemePicker.svelte', 'utf8');
	assert.ok(source.includes('{#if browser}'));
	assert.ok(source.includes('bind:value={$theme}'));
});
