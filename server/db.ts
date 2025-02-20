
import Database from "@replit/database";

const db = new Database();

export async function logUserLogin(username: string) {
  const timestamp = new Date().toISOString();
  const key = `login_${username}_${timestamp}`;
  await db.set(key, { username, timestamp });
}

export async function getLoginHistory(username: string) {
  const keys = await db.list(`login_${username}`);
  const logins = await Promise.all(keys.map(key => db.get(key)));
  return logins;
}
