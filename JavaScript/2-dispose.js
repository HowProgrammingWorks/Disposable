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
    await this.#file?.write(msg + '\n');
  }

  [Symbol.dispose]() {
    this.#file.close();
    console.log('File closed (dispose)');
  }
}

const main = async () => {
  using logger = await new Logger('output.log');
  await logger.log('Open');
  await logger.log('Do something');
};

main();
