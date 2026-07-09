// Run: node scripts/hash-password.mjs
// Paste the hash into Vercel as ADMIN_PASSWORD_HASH

import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question('Enter new admin password: ', async (pw) => {
  rl.close();
  if (!pw || pw.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(pw, 12);
  console.log('\nCopy this into Vercel as ADMIN_PASSWORD_HASH:\n');
  console.log(hash);
  console.log('');
});
