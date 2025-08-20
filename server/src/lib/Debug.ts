// Resources
import chalk from "chalk";

/**
 * A simple replacement from console.*.
 */
class Debug {
  /**
   * Sends an information log to the console.
   * @param str The text to display.
   */
  public log(str: string): void {
    console.info(`${chalk.white("[LOG]:")} ${chalk.whiteBright(str)}`);
  }

  /**
   * Sends an information log to the console.
   * @param str The text to display.
   */
  public info(str: string): void {
    console.info(`${chalk.white("[INFO]:")} ${chalk.blue(str)}`);
  }

  /**
   * Sends an warn log to the console.
   * @param str The text to display.
   */
  public warn(str: string): void {
    console.warn(`${chalk.white("[WARN]:")} ${chalk.yellow(str)}`);
  }

  /**
   * Sends an error log to the console.
   * @param str The text to display.
   */
  public success(str: string): void {
    console.error(`${chalk.white("[SUCCESS]:")} ${chalk.green(str)}`);
  }

  /**
   * Sends an error log to the console.
   * @param str The text to display.
   */
  public error(str: string): void {
    console.error(`${chalk.white("[ERROR]:")} ${chalk.red(str)}`);
  }
}

// Export
export const debug = new Debug();
