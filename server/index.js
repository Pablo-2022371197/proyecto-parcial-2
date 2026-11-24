import { createApp } from './app.js';
import { registerHostMetrics } from './hostMetrics.js';
import { log } from './logger.js';

registerHostMetrics();

const port = Number(process.env.PORT || 3000);
const app = createApp();

app.listen(port, '0.0.0.0', () => {
  log('info', 'server_started', { port });
});
