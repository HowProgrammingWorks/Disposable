'use strict';

const fs = require('node:fs/promises');
const timers = require('timers/promises');

class Logger {
  #file = null;
  #path = '';

  constructor(path) {
    this.#path = path;
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

  async [Symbol.dispose]() {
    console.log('Going to close file (dispose)');
    console.log('First sync block end (dispose)');
    await this.#file.close();
    console.log('File closed (dispose)');
    // You can do any async finalization logic here
    // - Send notifications, write logs
    // - Clear cache, release allocated memory
    // - Collect and save statistics, etc.
    await timers.setTimeout(1000);
    console.log('After timeout (dispose)');
    console.log(`Logger is still visible ${this.#path} (dispose)`);
  }
}

const main = async () => {
  using logger = await new Logger('./output.log');
  await logger.log('Open');
  await logger.log('Do something');
};

main().then(() => {
  console.log('After first sync block of dispose');
});
