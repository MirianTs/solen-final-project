// Admin password rules, shared by the password form (hint, minLength) and the changePassword action.
export const PASSWORD_MIN_LENGTH = 8;
// bcrypt, which Supabase Auth uses, only reads the first 72 bytes.
export const PASSWORD_MAX_LENGTH = 72;
