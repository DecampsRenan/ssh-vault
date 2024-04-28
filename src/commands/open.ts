import open from 'open';

import { conf } from '@/config/store.js';

export default async () => {
  const username = conf.get('username');
  const githubRepo = conf.get('githubRepo');

  if (!username || !githubRepo) {
    console.log('You need to connect first to be able to open your vault.');
    process.exit();
  }

  console.log('Opening ssh folder in your file explorer...');
  await open(`https://github.com/${username}/${githubRepo}`);
};
