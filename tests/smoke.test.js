const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');

// Files that should have been removed (dead code/assets)
const removed = [
	'avatar-3d.js',
	'head.glb',
	'vendor/three/loaders/GLTFLoader.js',
	'vendor/three/three.module.js',
	'vendor/three/utils/BufferGeometryUtils.js',
];

// Files that should still exist
const required = [
	'app.js',
	'index.html',
	'Dockerfile',
];

console.log('=== Verifying removed files are gone ===');
for (const f of removed) {
	const exists = require('fs').existsSync(join(root, f));
	if (exists) {
		console.error(`FAIL: ${f} still exists`);
		process.exitCode = 1;
	} else {
		console.log(`  ✓ ${f} removed`);
	}
}

console.log('\n=== Verifying required files still exist ===');
for (const f of required) {
	const exists = require('fs').existsSync(join(root, f));
	if (!exists) {
		console.error(`FAIL: ${f} missing`);
		process.exitCode = 1;
	} else {
		console.log(`  ✓ ${f} present`);
	}
}

console.log('\n=== Verifying Dockerfile does not reference removed files ===');
const dockerfile = readFileSync(join(root, 'Dockerfile'), 'utf-8');
for (const f of removed) {
	if (dockerfile.includes(f)) {
		console.error(`FAIL: Dockerfile still references ${f}`);
		process.exitCode = 1;
	} else {
		console.log(`  ✓ Dockerfile clean of ${f}`);
	}
}

console.log('\n=== Verifying app.js is syntactically valid ===');
try {
	new Function(readFileSync(join(root, 'app.js'), 'utf-8'));
	console.log('  ✓ app.js syntax OK');
} catch (e) {
	console.error(`FAIL: app.js has syntax errors: ${e.message}`);
	process.exitCode = 1;
}

console.log('\n=== Verifying remaining code does not reference removed files ===');
const appJs = readFileSync(join(root, 'app.js'), 'utf-8');
if (appJs.includes('three') || appJs.includes('GLTFLoader') || appJs.includes('avatar-3d')) {
	console.error('FAIL: app.js still references three.js or avatar-3d');
	process.exitCode = 1;
} else {
	console.log('  ✓ No stale references in app.js');
}
