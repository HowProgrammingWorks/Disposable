'use strict';

const fs = require('node:fs/promises');

const registry = new FinalizationRegistry(async (file) => {
  await file.close();
  console.log('[Logger] File closed (finalized)');
});

class Logger {
  #file = null;

  constructor(path) {
    return this.#init(path);
  }

  async #init(path) {
    this.#file = await fs.open(path, 'a');
    registry.register(this, this.#file, this);
    await this.log('Open');
    return this;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const msg = `[${timestamp}] ${message}`;
    console.log(msg);
    await this.#file?.write(msg + '\n');
  }
}

const main = async () => {
  const logger = await new Logger('./1-registry.log');
  await logger.log('Do something');
};

main();

setTimeout(() => {
  console.log('1 sec timeout');
}, 1000);
