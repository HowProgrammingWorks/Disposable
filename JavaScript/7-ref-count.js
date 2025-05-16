'use strict';

const fs = require('node:fs');
const timers = require('timers/promises');
const { Console } = require('node:console');

class RefCount {
  #resource = null;
  #dispose = null;
  #context = null;
  #count = 0;
  #freed = new WeakSet();

  constructor(create, dispose) {
    this.#dispose = dispose;
    return this.#init(create);
  }

  async #init(create) {
    const { resource, context } = await create();
    this.#resource = resource;
    this.#context = context;
    return this;
  }

  use() {
    console.log('👉 Use');
    this.#count++;
    const disposable = Object.create(this.#resource);
    disposable[Symbol.asyncDispose] = async () => {
      if (this.#freed.has(disposable)) return;
      this.#freed.add(disposable);
      console.log('👉 Dispose');
      this.#count--;
      if (this.#count > 0) return;
      await this.#dispose(this.#resource, this.#context);
      this.#resource = null;
      this.#context = null;
    };
    return disposable;
  }
}

const main = async () => {
  const logger = await new RefCount(
    async () => {
      const file = './output.log';
      const stream = await fs.createWriteStream(file);
      const resource = new Console({ stdout: stream });
      console.log(`👉 Open: ${file}`);
      return { resource, context: { file, stream } };
    },
    async (resource, context) => {
      console.log(`👉 Close: ${context.file}`);
      await context.stream.close();
    },
  );
  // Block 0
  {
    await using console = logger.use();
    console.log('Log 1');
    // Block 1
    {
      await using console = logger.use();
      console.log('Log 1');
    }
    // Block 2
    {
      await using console = logger.use();
      console.log('Log 2');
    }
    await timers.setTimeout(1000);
  }
};

main().then(() => {
  console.log('After main');
});
