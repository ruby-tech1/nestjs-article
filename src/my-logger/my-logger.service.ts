import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromise } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  public async logToFile(
    entry: string,
    type: 'SUCCESS' | 'ERROR',
  ): Promise<void> {
    const formattedEntry: string = `${Intl.DateTimeFormat('en-ng', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Africa/Lagos',
    }).format(new Date())}\t${entry}\n`;

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromise.mkdir(path.join(__dirname, '..', '..', 'logs'));
      }

      if (type === 'SUCCESS') {
        await fsPromise.appendFile(
          path.join(__dirname, '..', '..', 'logs', 'LogFileSuccess.log'),
          formattedEntry,
        );
        return;
      } else {
        await fsPromise.appendFile(
          path.join(__dirname, '..', '..', 'logs', 'LogFileError.log'),
          formattedEntry,
        );
      }
    } catch (error) {
      if (error instanceof Error) console.log(error);
    }
  }

  public log(message: unknown, context?: string): void {
    const logMessage = Array.isArray(message)
      ? JSON.stringify(message)
      : message;
    const entry: string = `${context}\t${logMessage}`;
    this.logToFile(entry, 'SUCCESS');
    super.log(message, context);
  }

  public error(message: unknown, stackOrContext?: string): void {
    const logMessage =
      typeof message === 'object' ? JSON.stringify(message) : message;
    const entry: string = `${stackOrContext}\t${logMessage}`;
    this.logToFile(entry, 'ERROR');
    super.error(message, stackOrContext);
  }
}
