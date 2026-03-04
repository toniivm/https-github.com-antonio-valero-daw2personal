const required = {
  SUPABASE_URL: process.env.E2E_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.E2E_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY,
  E2E_USER_EMAIL: process.env.E2E_USER_EMAIL,
  E2E_MODERATOR_EMAIL: process.env.E2E_MODERATOR_EMAIL
};

const missing = Object.entries(required)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.error(`[E2E Cleanup] Missing required env vars: ${missing.join(', ')}`);
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

async function request(method, path, { body, tolerate404 = false } = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    if (tolerate404 && res.status === 404) return null;
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }

  const txt = await res.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

async function listUsersByEmails(emails) {
  const users = await request('GET', `/auth/v1/admin/users?page=1&per_page=1000`);
  const arr = Array.isArray(users?.users) ? users.users : [];
  const targets = new Set(emails.map((e) => String(e).toLowerCase()));
  return arr.filter((u) => targets.has(String(u.email || '').toLowerCase()));
}

async function deleteByFilter(table, filterQuery) {
  const path = `/rest/v1/${table}?${filterQuery}`;
  await request('DELETE', path, { tolerate404: true });
  console.log(`[E2E Cleanup] Cleared ${table} with filter: ${filterQuery}`);
}

function formatIn(list) {
  return `in.(${list.join(',')})`;
}

async function main() {
  console.log('[E2E Cleanup] Starting...');

  const users = await listUsersByEmails([required.E2E_USER_EMAIL, required.E2E_MODERATOR_EMAIL]);
  const userIds = users.map((u) => u.id).filter(Boolean);

  if (userIds.length === 0) {
    console.log('[E2E Cleanup] No E2E users found, nothing to clean.');
    return;
  }

  const inUserIds = encodeURIComponent(formatIn(userIds));

  // 1) Clean notifications from E2E users
  await deleteByFilter('notifications', `user_id=${inUserIds}`);

  // 2) Find E2E test spots created by flow (prefix guarded)
  const spots = await request(
    'GET',
    `/rest/v1/spots?select=id,user_id,title&user_id=${inUserIds}&title=ilike.${encodeURIComponent('E2E Spot%')}`
  );

  const spotIds = Array.isArray(spots) ? spots.map((s) => s.id).filter((id) => id !== undefined && id !== null) : [];

  if (spotIds.length > 0) {
    const inSpotIds = encodeURIComponent(formatIn(spotIds));

    // 3) Child tables first
    await deleteByFilter('comments', `spot_id=${inSpotIds}`);
    await deleteByFilter('ratings', `spot_id=${inSpotIds}`);
    await deleteByFilter('favorites', `spot_id=${inSpotIds}`);
    await deleteByFilter('reports', `spot_id=${inSpotIds}`);

    // 4) Finally spots
    await deleteByFilter('spots', `id=${inSpotIds}`);
  } else {
    console.log('[E2E Cleanup] No E2E spots found with prefix "E2E Spot".');
  }

  // 5) Optional user-owned rows in social tables that may not be tied to spots anymore
  await deleteByFilter('comments', `user_id=${inUserIds}`);
  await deleteByFilter('ratings', `user_id=${inUserIds}`);
  await deleteByFilter('favorites', `user_id=${inUserIds}`);
  await deleteByFilter('reports', `user_id=${inUserIds}`);

  console.log('[E2E Cleanup] Completed successfully.');
}

main().catch((error) => {
  console.error('[E2E Cleanup] Failed:', error.message);
  process.exit(1);
});
