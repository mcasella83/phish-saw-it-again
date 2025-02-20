import Database from "@replit/database";

const db = new Database();

export async function logUserLogin(username: string, showCount: number) {
  const timestamp = new Date().toISOString();
  let key = "login_" + username;
  await db.set(key, { timestamp, showCount });
}

export async function getLoginHistory(username: string) {
  const keys = await db.list(`login_${username}`);
  const logins = await Promise.all(keys.map((key) => db.get(key)));
  return logins;
}
