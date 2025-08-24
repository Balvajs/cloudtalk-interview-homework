/**
 * Module dependencies.
 */

import debug from 'debug';

import { app } from './app.ts';

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

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Listening on port ${port}`);
});
