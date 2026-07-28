
import Database from "@replit/database";

// REPLIT_DB_URL is injected automatically in the workspace but may be absent
// in autoscale production containers. Degrade gracefully so the server still
// starts — login logging is a non-critical feature.
const db = process.env.REPLIT_DB_URL ? new Database(process.env.REPLIT_DB_URL) : null;

if (db) {
  console.log('Replit DB URL is configured');
  db.list().then(keys => {
    console.log('Successfully connected to Replit DB');
    console.log('Current DB keys:', keys);
  }).catch(err => {
    console.error('Failed to connect to Replit DB:', err);
  });
} else {
  console.warn('Replit DB URL is not configured — login logging disabled');
}

export async function logUserLogin(username: string, showCount: number) {
  if (!db) return; // silently skip when DB is unavailable
  const timestamp = new Date().toISOString();
  const key = "login_" + username;
  try {
    console.log('Attempting to store login for:', username);
    await db.set(key, { timestamp, showCount });
    console.log('Successfully logged login for:', username, 'with show count:', showCount);
    const value = await db.get(key);
    console.log('Retrieved stored data:', value);
    const allKeys = await db.list();
    console.log('All DB keys:', allKeys);
  } catch (error) {
    console.error('Error logging user login:', error);
    throw error;
  }
}

export async function getLoginHistory(username: string) {
  console.log('Getting login history for:', username);
  const keys = await db.list(`login_${username}`);
  console.log('Found keys:', keys);
  const logins = await Promise.all(keys.map((key) => db.get(key)));
  console.log('Retrieved login history:', logins);
  return logins;
}
