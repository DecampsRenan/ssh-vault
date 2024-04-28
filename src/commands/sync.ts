import { conf } from '@/config/store.js';

export default () => {
  const username = conf.get('username');
  const githubRepo = conf.get('githubRepo');

  if (!username || !githubRepo) {
    console.log('You need to connect first to be able to open your vault.');
    process.exit();
  }

  console.log('WIP');
};
