'use strict';

const fs = require('node:fs/promises');
const { Console } = require('node:console');

class Logger {
  #files = new Map();

  async use(filename) {
    let instance = this.#files.get(filename);
    if (!instance) {
      instance = await this.#open(filename);
      this.#files.set(filename, instance);
    }
    instance.count++;
    console.log(`👉 Use: ${filename}`);
    const disposable = Object.create(instance.console);
    disposable[Symbol.asyncDispose] = async () => {
      instance.count--;
      console.log(`👉 Dispose: ${filename}`);
      if (instance.count > 0) return;
      console.log(`👉 Close: ${filename}`);
      await instance.fd.close();
      this.#files.delete(filename);
    };
    return disposable;
  }

  async #open(filename) {
    console.log(`👉 Open: ${filename}`);
    const fd = await fs.open(filename, 'a');
    const stream = fd.createWriteStream(filename, { flush: true });
    const con = new Console({ stdout: stream });
    return { count: 0, fd, console: con };
  }
}

// Usage

const logger = new Logger();

const main = async () => {
  // Block 0
  await using console = await logger.use('output.log');
  console.log('Log 0');
  {
    // Block 1
    await using console = await logger.use('output.log');
    console.log('Log 1');
  }
  {
    // Block 2
    await using console = await logger.use('output.log');
    console.log('Log 2');
    {
      // Block 3
      await using console = await logger.use('output3.log');
      console.log('Log 3');
      {
        // Block 4
        await using console = await logger.use('output.log');
        console.log('Log 4');
      }
    }
  }
  return console;
};

main().then((ref) => {
  // Block 5
  console.log('After main');
  ref.log('Log 5');
});
