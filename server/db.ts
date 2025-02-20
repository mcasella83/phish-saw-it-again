
import Database from "@replit/database";

const db = new Database(process.env.REPLIT_DB_URL);

if (!process.env.REPLIT_DB_URL) {
  console.error('ERROR: Replit DB URL is missing!');
  throw new Error('Replit DB URL environment variable is not configured');
}
console.log('Replit DB URL is configured');

// Test DB connection
db.list().then(keys => {
  console.log('Successfully connected to Replit DB');
  console.log('Current DB keys:', keys);
}).catch(err => {
  console.error('Failed to connect to Replit DB:', err);
});

export async function logUserLogin(username: string, showCount: number) {
  const timestamp = new Date().toISOString();
  let key = "login_" + username;
  try {
    console.log('Attempting to store login for:', username);
    await db.set(key, { timestamp, showCount });
    console.log('Successfully logged login for:', username, 'with show count:', showCount);
    
    // Verify the data was stored
    const value = await db.get(key);
    console.log('Retrieved stored data:', value);
    
    // List all keys to verify
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
