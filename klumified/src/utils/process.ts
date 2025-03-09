"use strict";

const isWin = process.platform === "win32";

interface OriginalCommand {
  command: string;
  args: string[];
}

/**
 * Creates an ENOENT error for a command that was not found
 * @param {OriginalCommand} original - The original command that was attempted
 * @param {string} syscall - The system call that failed
 * @return {Error} Error with ENOENT details
 */
function notFoundError(original: OriginalCommand, syscall: string) {
  const command = original.command || "unknown command";
  const error = new Error(`${syscall} ${command} ENOENT`);
  Object.assign(error, {
    code: "ENOENT",
    errno: "ENOENT",
    syscall: `${syscall} ${original.command}`,
    path: original.command,
    spawnargs: original.args,
  });
  return error;
}

interface ParsedCommand {
  file?: string;
  original?: {
    command?: string;
    args?: string[];
  };
}

/**
 * Hooks into child process events to handle Windows-specific ENOENT errors
 * @param {NodeJS.EventEmitter} cp - The child process instance
 * @param {ParsedCommand} parsed - The parsed command details
 * @return {void}
 */
function hookChildProcess(cp: NodeJS.EventEmitter, parsed: ParsedCommand) {
  if (!isWin) {
    return;
  }

  const originalEmit = cp.emit;

  cp.emit = function(name: string, arg1: number, ...args: unknown[]) {
    // If emitting "exit" event and exit code is 1, we need to check if
    // the command exists and emit an "error" instead
    // See https://github.com/IndigoUnited/node-cross-spawn/issues/16
    if (name === "exit") {
      const err = verifyENOENT(arg1, parsed);

      if (err) {
        return originalEmit.call(cp, "error", err);
      }
    }

    return originalEmit.apply(cp, [name, arg1, ...args]);
  };
}

/**
 * Verifies if an ENOENT error should be created for a command
 * @param {number} status - The exit status code
 * @param {ParsedCommand} parsed - The parsed command details
 * @return {Error|null} Error if ENOENT should be thrown, null otherwise
 */
function verifyENOENT(status: number, parsed: ParsedCommand) {
  if (isWin && status === 1 && !parsed.file) {
    if (parsed.original && parsed.original.command) {
      return notFoundError(parsed.original as OriginalCommand, "spawn");
    }
  }

  return null;
}

/**
 * Synchronous version of verifyENOENT
 * @param {number} status - The exit status code
 * @param {ParsedCommand} parsed - The parsed command details
 * @return {Error|null} Error if ENOENT should be thrown, null otherwise
 */
function verifyENOENTSync(status: number, parsed: ParsedCommand) {
  if (isWin && status === 1 && !parsed.file) {
    if (parsed.original && parsed.original.command) {
      return notFoundError(parsed.original as OriginalCommand, "spawnSync");
    }
  }

  return null;
}

export {
  hookChildProcess,
  verifyENOENT,
  verifyENOENTSync,
  notFoundError,
};