const { spawn } = require('node:child_process');

const isWin = process.platform === 'win32';
const env = {
  ...process.env,
  ComSpec: process.env.ComSpec || 'C:/Windows/System32/cmd.exe',
  SHELL: process.env.SHELL || 'C:/Windows/System32/cmd.exe',
};

const commands = [
  { name: 'dev:watch', command: 'npm', args: ['run', 'dev:watch'] },
  { name: 'sync', command: 'npm', args: ['run', 'sync'] },
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWin,
    env,
  });

  child.on('error', (error) => {
    console.error(`[${name}] failed to start:`, error.message);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] exited from signal: ${signal}`);
      process.exit(1);
    }

    if (code !== 0) {
      console.log(`[${name}] exited with code ${code}`);
      process.exit(code || 1);
    }
  });

  return child;
});

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
