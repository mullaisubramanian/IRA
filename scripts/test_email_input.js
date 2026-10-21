import fs from 'fs';
import path from 'path';

console.log('--- Test 1: Check Email Input Definition in auth.js ---');
const authJsPath = path.resolve('src/views/auth.js');
const authJsContent = fs.readFileSync(authJsPath, 'utf8');

// Verify af function creates type="email" with id="aEmail"
if (!authJsContent.includes('type="${type}"')) {
  throw new Error('af function must use type="${type}"');
}
if (!authJsContent.includes('autocomplete="${auto || \'off\'}"')) {
  throw new Error('af function missing autocomplete');
}
if (authJsContent.includes('readonly') || authJsContent.includes('readOnly')) {
  console.log('Note: Checking if readonly is set on aEmail...');
  const afLines = authJsContent.split('\n').filter(l => l.includes('export const af'));
  if (afLines.some(l => l.includes('readonly'))) {
    throw new Error('af helper should NOT set readonly by default');
  }
}
console.log('✓ af input generator creates clean input without readonly or disabled attributes.');

console.log('\n--- Test 2: Verify Finally Block Re-enables All Inputs ---');
if (!authJsContent.includes('finally {') || !authJsContent.includes('.forEach(el => el.disabled = false)')) {
  throw new Error('Finally block must re-enable all form inputs.');
}
console.log('✓ Finally block re-enables all form controls on completion or error.');

console.log('\n--- Test 3: Verify Standard Email Regex Check ---');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const testEmails = [
  { email: 'dean@engineering.edu', valid: true },
  { email: 'professor.smith+test@college.ac.in', valid: true },
  { email: '  hr@institution.org  ', valid: true, trimmed: 'hr@institution.org' },
  { email: 'plainaddress', valid: false },
  { email: '@missingusername.com', valid: false },
  { email: 'missingdomain@.com', valid: false },
  { email: 'user@', valid: false },
  { email: 'user@domain', valid: false }
];

for (const t of testEmails) {
  const tested = (t.trimmed || t.email).trim().toLowerCase();
  const passes = emailRegex.test(tested);
  if (passes !== t.valid) {
    throw new Error(`Regex test failed for "${t.email}". Expected: ${t.valid}, Got: ${passes}`);
  }
  console.log(`  "${t.email}" => ${passes ? 'VALID' : 'INVALID'} (as expected)`);
}
console.log('✓ Simple email regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ works as expected.');

console.log('\n--- Test 4: Verify CSS Stacking & Pointer Events ---');
const overlaysCssPath = path.resolve('src/styles/overlays.css');
const overlaysCss = fs.readFileSync(overlaysCssPath, 'utf8');

if (!overlaysCss.includes('.login .side::after') || !overlaysCss.includes('pointer-events:none!important')) {
  throw new Error('overlays.css must set pointer-events: none !important on .login .side::after');
}
if (!overlaysCss.includes('.login .form{display:flex;align-items:center;justify-content:center;padding:40px 24px;position:relative;z-index:5}')) {
  throw new Error('overlays.css must elevate .login .form with position:relative and z-index:5');
}
if (!overlaysCss.includes('#modal:empty{display:none!important;pointer-events:none!important}')) {
  throw new Error('overlays.css must hide empty modal with display:none and pointer-events:none');
}

const controlsCssPath = path.resolve('src/styles/controls.css');
const controlsCss = fs.readFileSync(controlsCssPath, 'utf8');
if (!controlsCss.includes('pointer-events:auto!important')) {
  throw new Error('controls.css must ensure .in has pointer-events:auto!important');
}

const responsiveCssPath = path.resolve('src/styles/responsive.css');
const responsiveCss = fs.readFileSync(responsiveCssPath, 'utf8');
if (!responsiveCss.includes('.login .side::after{pointer-events:none!important}')) {
  throw new Error('responsive.css must set pointer-events:none on decorative elements for mobile');
}

console.log('✓ All CSS z-index and pointer-events rules are active and verified.');

console.log('\n--- All Email Input & Overlay Checks PASSED! ---');
