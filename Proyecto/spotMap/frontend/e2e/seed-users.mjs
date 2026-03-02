const required = {
  SUPABASE_URL: process.env.E2E_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.E2E_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY,
  E2E_USER_EMAIL: process.env.E2E_USER_EMAIL,
  E2E_USER_PASSWORD: process.env.E2E_USER_PASSWORD,
  E2E_MODERATOR_EMAIL: process.env.E2E_MODERATOR_EMAIL,
  E2E_MODERATOR_PASSWORD: process.env.E2E_MODERATOR_PASSWORD
};

const missing = Object.entries(required)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.error(`[E2E Seed] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const baseUrl = required.SUPABASE_URL.replace(/\/$/, '');
const serviceKey = required.SUPABASE_SERVICE_KEY;

function headers(extra = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function adminListUsers(page = 1, perPage = 1000) {
  const url = `${baseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`List users failed (${res.status}): ${txt}`);
  }
  const json = await res.json();
  return Array.isArray(json?.users) ? json.users : [];
}

async function adminCreateUser(email, password, role) {
  const url = `${baseUrl}/auth/v1/admin/users`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
      app_metadata: { role }
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Create user failed (${res.status}): ${txt}`);
  }

  return res.json();
}

async function adminUpdateUser(userId, email, password, role) {
  const url = `${baseUrl}/auth/v1/admin/users/${userId}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
      app_metadata: { role }
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Update user failed (${res.status}): ${txt}`);
  }

  return res.json();
}

async function upsertProfile(userId, role, email) {
  const url = `${baseUrl}/rest/v1/profiles?on_conflict=user_id`;
  const primaryPayload = [{ user_id: userId, role, email }];
  const primaryRes = await fetch(url, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(primaryPayload)
  });

  if (primaryRes.ok) {
    return primaryRes.json();
  }

  const primaryText = await primaryRes.text();
  if (!primaryText.includes("'email' column") && !primaryText.includes('"email"')) {
    throw new Error(`Upsert profile failed (${primaryRes.status}): ${primaryText}`);
  }

  const fallbackPayload = [{ user_id: userId, role }];
  const fallbackRes = await fetch(url, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(fallbackPayload)
  });

  if (!fallbackRes.ok) {
    const fallbackText = await fallbackRes.text();
    throw new Error(`Upsert profile fallback failed (${fallbackRes.status}): ${fallbackText}`);
  }

  return fallbackRes.json();
}

async function ensureUser({ email, password, role }) {
  const users = await adminListUsers();
  const existing = users.find((u) => String(u.email).toLowerCase() === email.toLowerCase());

  if (existing) {
    const updated = await adminUpdateUser(existing.id, email, password, role);
    await upsertProfile(existing.id, role, email);
    return { id: existing.id, email: updated.email || email, role, action: 'updated' };
  }

  const created = await adminCreateUser(email, password, role);
  const userId = created?.id;
  if (!userId) {
    throw new Error(`Created user response missing id for ${email}`);
  }
  await upsertProfile(userId, role, email);
  return { id: userId, email, role, action: 'created' };
}

async function main() {
  console.log('[E2E Seed] Ensuring E2E users...');

  const user = await ensureUser({
    email: required.E2E_USER_EMAIL,
    password: required.E2E_USER_PASSWORD,
    role: 'user'
  });

  const moderator = await ensureUser({
    email: required.E2E_MODERATOR_EMAIL,
    password: required.E2E_MODERATOR_PASSWORD,
    role: 'moderator'
  });

  console.log('[E2E Seed] Done');
  console.log(`[E2E Seed] User: ${user.email} (${user.action})`);
  console.log(`[E2E Seed] Moderator: ${moderator.email} (${moderator.action})`);
}

main().catch((error) => {
  console.error('[E2E Seed] Failed:', error.message);
  process.exit(1);
});
