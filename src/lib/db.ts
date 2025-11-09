import Database from '@tauri-apps/plugin-sql';
console.log(__dirname)
const db = await Database.load(__dirname + 'db/main.db');

export default db