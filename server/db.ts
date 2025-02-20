
import Database from "@replit/database";

const db = new Database(process.env.REPLIT_DB_URL);

export async function logUserLogin(username: string, showCount: number) {
  const timestamp = new Date().toISOString();
  let key = "login_" + username;
  try {
    await db.set(key, { timestamp, showCount });
    console.log('Logged login for:', username, 'with show count:', showCount);
    
    // Verify the data was stored
    const value = await db.get(key);
    console.log('Stored data:', value);
  } catch (error) {
    console.error('Error logging user login:', error);
    throw error;
  }
}

export async function getLoginHistory(username: string) {
  const keys = await db.list(`login_${username}`);
  const logins = await Promise.all(keys.map((key) => db.get(key)));
  return logins;
}
