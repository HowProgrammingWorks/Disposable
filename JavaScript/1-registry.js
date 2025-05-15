'use strict';

// To intercept finalization run
// node --expose-gc 1-registry.js

const fs = require('node:fs/promises');

const registry = new FinalizationRegistry(async (file) => {
  await file.close();
  console.log('File closed (finalized)');
});

class Logger {
  #file = null;

  constructor(path) {
    return this.#init(path);
  }

  async #init(path) {
    this.#file = await fs.open(path, 'a');
    registry.register(this, this.#file, this);
    return this;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const msg = `[${timestamp}] ${message}`;
    console.log(msg);
    await this.#file.write(msg + '\n');
  }
}

const main = async () => {
  const logger = await new Logger('output.log');
  await logger.log('Open');
  await logger.log('Do something');
  setTimeout(() => {
    if (global.gc) gc();
    else console.log('Run node with --expose-gc flag');
  }, 1000);
};

main();
