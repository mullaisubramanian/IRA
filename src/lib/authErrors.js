/**
 * Maps Supabase auth errors to friendly, non-technical user messages.
 * Never exposes technical or Supabase/developer messages to users.
 * Logs the real error with console.error('[auth]', error).
 */

export function getFriendlyAuthError(error) {
  if (error) {
    console.error('[auth]', error);
  }

  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  const message = (typeof error === 'string' ? error : error.message || '').toLowerCase();
  const code = (error.code || '').toLowerCase();
  const status = error.status || 0;

  // 1. Rate limit / "over_email_send_rate_limit" / status 429
  if (
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    message.includes('over_email_send_rate_limit') ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    return "We're receiving a lot of sign-ups right now. Please try again in a few minutes.";
  }

  // 2. User already registered
  if (
    code === 'user_already_exists' ||
    message.includes('user already registered') ||
    message.includes('already registered') ||
    message.includes('already exists')
  ) {
    return 'This email is already registered. Please log in.';
  }

  // 3. Invalid login credentials
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials') ||
    message.includes('incorrect email or password')
  ) {
    return 'Incorrect email or password.';
  }

  // 4. Weak password
  if (
    code === 'weak_password' ||
    message.includes('weak password') ||
    message.includes('password should be at least') ||
    message.includes('password must be at least') ||
    message.includes('password is too weak')
  ) {
    return 'Password must be at least 8 characters.';
  }

  // 5. Email not confirmed
  if (
    code === 'email_not_confirmed' ||
    message.includes('email not confirmed') ||
    message.includes('email confirmation required') ||
    message.includes('verify your email') ||
    message.includes('confirm your email') ||
    message.includes('unconfirmed email')
  ) {
    return 'Please verify your email — check your inbox.';
  }

  // 6. Anything else
  return 'Something went wrong. Please try again.';
}

export const mapAuthError = getFriendlyAuthError;
export default getFriendlyAuthError;
