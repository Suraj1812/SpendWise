import { app } from './app.js';
import { serverConfig } from './config.js';
import { ensureDb } from './db.js';

await ensureDb();

app.listen(serverConfig.port, () => {
  console.log(`SpendWise API running on http://localhost:${serverConfig.port}`);
  console.log('Demo login: demo@spendwise.app / demo123');
});
