'use strict';

const fs = require('node:fs/promises');

class Logger {
  #file = null;

  constructor(path) {
    return this.#init(path);
  }

  async #init(path) {
    this.#file = await fs.open(path, 'a');
    return this;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const msg = `[${timestamp}] ${message}`;
    console.log(msg);
    await this.#file.write(msg + '\n');
  }

  close() {
    return this.#file.close();
  }
}

const main = async () => {
  let logger = null;
  try {
    // Critical code, exceptions expected
    logger = await new Logger('output.log');
    await logger.log('Open');
    await logger.log('Do something');
  } finally {
    if (logger !== null) await logger.close();
    console.log('File closed (finalized)');
  }
};

main();
