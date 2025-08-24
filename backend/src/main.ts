/**
 * Module dependencies.
 */

import debug from 'debug';

import { app } from './app.ts';
import { database } from './db/database.ts';

debug('warehouse-api:server');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(value: string) {
  const port = Number.parseInt(value, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return value;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Listening on port ${port}`);
});

process.on('SIGINT', () => {
  database.$client.end().then(() => {
    server.close((error) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      process.exit(0);
    });
  });
});
process.on('SIGTERM', () => {
  database.$client.end().then(() => {
    server.close((error) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      process.exit(0);
    });
  });
});
