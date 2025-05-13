'use strict';

const fs = require('node:fs/promises');

class Logger {
  #file = null;

  constructor(path) {
    return this.#init(path);
  }

  async #init(path) {
    this.#file = await fs.open(path, 'a');
    await this.log('Open');
    return this;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const msg = `[${timestamp}] ${message}`;
    console.log(msg);
    await this.#file?.write(msg + '\n');
  }

  async [Symbol.dispose]() {
    await this.log('Close');
    await this.#file?.close();
  }
}

const main = async () => {
  using logger = await new Logger('./2-using.log');
  await logger.log('Do something');
};

main();
