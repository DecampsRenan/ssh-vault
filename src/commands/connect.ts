import { Option } from '@swan-io/boxed';
import ky from 'ky';
import ora from 'ora';
import prompts from 'prompts';
import { P, match } from 'ts-pattern';

import { conf } from '@/config/store.js';

export default async () => {
  const githubToken = Option.fromNullable(conf.get<string>('githubToken'));
  const githubRepo = Option.fromNullable(conf.get<string>('githubRepo'));

  const token = await match(githubToken)
    .with(Option.P.Some(P.select()), (token) => token)
    .with(Option.P.None, async () => {
      const response = await prompts({
        type: 'password',
        name: 'Github Token',
        message: 'What is your GitHub personal token?',
        validate: (value) => (!value.trim() ? 'Token is required' : true),
      });

      const gToken = response['Github Token']?.trim();
      if (!gToken) {
        console.log('Please fill a token');
        process.exit(-1);
      }

      conf.set('githubToken', gToken);
      return gToken;
    })
    .exhaustive();

  // Get token owner
  const spinner = ora('Checking token validity...').start();
  const userDetails = await ky
    .get('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    .json();
  spinner.succeed();
  console.log({ userDetails });

  const repo = await match(githubRepo)
    .with(Option.P.Some(P.select()), (repo) => repo)
    .with(Option.P.None, async () => {
      // Ask repo url from user
    })
    .exhaustive();

  console.log({ repo, token });
};
