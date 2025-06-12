'use strict';

const fs = require('node:fs/promises');

// Strategy Pattern for different log formats
class LogFormatter {
  format(message, timestamp) {
    throw new Error('Method not implemented');
  }
}

class SimpleFormatter extends LogFormatter {
  format(message, timestamp) {
    return `[${timestamp}] ${message}`;
  }
}

class JsonFormatter extends LogFormatter {
  format(message, timestamp) {
    return JSON.stringify({
      timestamp,
      message,
      level: 'INFO'
    });
  }
}

// Observer Pattern for log events
class LogEventEmitter {
  #listeners = new Map();

  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(callback);
  }

  emit(event, data) {
    const listeners = this.#listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

// Factory Pattern for formatters
class LogFormatterFactory {
  static createFormatter(type) {
    switch (type) {
      case 'simple':
        return new SimpleFormatter();
      case 'json':
        return new JsonFormatter();
      default:
        throw new Error(`Unknown formatter type: ${type}`);
    }
  }
}

// Decorator Pattern for log levels
class LogLevelDecorator {
  constructor(logger, level) {
    this.logger = logger;
    this.level = level;
  }

  async log(message) {
    const formattedMessage = `[${this.level}] ${message}`;
    return this.logger.log(formattedMessage);
  }
}

// Main Logger class with Disposable pattern
class Logger {
  #file = null;
  #formatter;
  #eventEmitter;

  constructor(path, formatterType = 'simple') {
    this.#formatter = LogFormatterFactory.createFormatter(formatterType);
    this.#eventEmitter = new LogEventEmitter();
    return this.#init(path);
  }

  async #init(path) {
    this.#file = await fs.open(path, 'a');
    this.#eventEmitter.emit('initialized', { path });
    return this;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = this.#formatter.format(message, timestamp);
    
    console.log(formattedMessage);
    await this.#file?.write(formattedMessage + '\n');
    
    this.#eventEmitter.emit('logged', { message, timestamp });
  }

  on(event, callback) {
    this.#eventEmitter.on(event, callback);
  }

  async [Symbol.asyncDispose]() {
    if (this.#file) {
      await this.#file.close();
      this.#eventEmitter.emit('disposed', {});
      console.log('Logger disposed');
    }
  }
}

async function main() {
  await using logger = await new Logger('output.json', 'json');

  const errorLogger = new LogLevelDecorator(logger, 'ERROR');
  const infoLogger = new LogLevelDecorator(logger, 'INFO');

  logger.on('logged', ({ message, timestamp }) => {
    console.log(`Event: logged - ${message} at ${timestamp}`);
  });

  logger.on('disposed', () => {
    console.log('Event: logger was disposed');
  });

  try {
    await infoLogger.log('Application started');
    await errorLogger.log('Something went wrong');
    await infoLogger.log('Application finished');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error); 