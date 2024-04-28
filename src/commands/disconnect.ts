import prompts from 'prompts';

import { conf } from '@/config/store.js';

export default async () => {
  const { confirmDeletion } = await prompts({
    type: 'confirm',
    message: '⚠️  Your github personal token will be removed. Do you want to continue?',
    name: 'confirmDeletion',
  });

  if (!confirmDeletion) {
    console.log('ℹ️  Operation canceled.');
    process.exit();
  }

  conf.delete('githubToken');
  console.log('✅  Token deleted');
};
