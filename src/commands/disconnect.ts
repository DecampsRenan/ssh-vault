import chalk from 'chalk';
import prompts from 'prompts';

import { conf } from '@/config/store.js';

export default async () => {
  const token = conf.get('githubToken');
  if (!token) {
    console.log(`${chalk.blue('ℹ')} You are already disconnected.`);
    process.exit();
  }

  const { confirmDeletion } = await prompts({
    type: 'confirm',
    message: 'Your github personal token will be removed. Do you want to continue?',
    name: 'confirmDeletion',
  });

  if (!confirmDeletion) {
    console.log(`${chalk.blue('ℹ')} Operation canceled.`);
    process.exit();
  }

  conf.delete('githubToken');
  conf.delete('githubRepo');
  conf.delete('username');
  console.log(`${chalk.green('✔︎')} Token successfully deleted.`);
};
