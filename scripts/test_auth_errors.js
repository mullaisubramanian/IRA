import { getFriendlyAuthError } from '../src/lib/authErrors.js';

console.log('--- Testing src/lib/authErrors.js ---');

const tests = [
  {
    name: 'Status 429 rate limit',
    input: { status: 429, message: 'Too many requests' },
    expected: "We're receiving a lot of sign-ups right now. Please try again in a few minutes."
  },
  {
    name: 'over_email_send_rate_limit code',
    input: { code: 'over_email_send_rate_limit', message: 'email rate limit exceeded' },
    expected: "We're receiving a lot of sign-ups right now. Please try again in a few minutes."
  },
  {
    name: 'Rate limit in message string',
    input: 'rate limit reached',
    expected: "We're receiving a lot of sign-ups right now. Please try again in a few minutes."
  },
  {
    name: 'User already registered message',
    input: { message: 'User already registered' },
    expected: 'This email is already registered. Please log in.'
  },
  {
    name: 'user_already_exists code',
    input: { code: 'user_already_exists' },
    expected: 'This email is already registered. Please log in.'
  },
  {
    name: 'Invalid login credentials',
    input: { message: 'Invalid login credentials' },
    expected: 'Incorrect email or password.'
  },
  {
    name: 'invalid_credentials code',
    input: { code: 'invalid_credentials' },
    expected: 'Incorrect email or password.'
  },
  {
    name: 'Weak password error code',
    input: { code: 'weak_password', message: 'Password should be at least 6 characters.' },
    expected: 'Password must be at least 8 characters.'
  },
  {
    name: 'Email not confirmed message',
    input: { message: 'Email not confirmed' },
    expected: 'Please verify your email — check your inbox.'
  },
  {
    name: 'email_not_confirmed code',
    input: { code: 'email_not_confirmed' },
    expected: 'Please verify your email — check your inbox.'
  },
  {
    name: 'Network / Failed to fetch error (fallback)',
    input: new Error('Failed to fetch'),
    expected: 'Something went wrong. Please try again.'
  },
  {
    name: 'Unknown server error (fallback)',
    input: { code: 'unknown_error', message: 'Database connection dropped' },
    expected: 'Something went wrong. Please try again.'
  },
  {
    name: 'Null/undefined (fallback)',
    input: null,
    expected: 'Something went wrong. Please try again.'
  }
];

let failed = 0;
for (const t of tests) {
  const result = getFriendlyAuthError(t.input);
  if (result === t.expected) {
    console.log(`✓ [PASS] ${t.name}: "${result}"`);
  } else {
    console.error(`✗ [FAIL] ${t.name}`);
    console.error(`  Expected: "${t.expected}"`);
    console.error(`  Got:      "${result}"`);
    failed++;
  }
}

if (failed === 0) {
  console.log('\nAll 13 error mapping tests PASSED!');
} else {
  console.error(`\n${failed} tests FAILED!`);
  process.exit(1);
}
