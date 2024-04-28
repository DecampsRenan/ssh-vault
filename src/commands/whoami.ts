import { Option } from '@swan-io/boxed';
import ky from 'ky';
import ora from 'ora';
import prompts from 'prompts';
import { P, match } from 'ts-pattern';

import { conf } from '@/config/store.js';

export default async () => {
  const githubToken = Option.fromNullable(conf.get<string>('githubToken'));

  const token = await match(githubToken)
    .with(Option.P.Some(P.select()), (token) => token)
    .with(Option.P.None, async () => {
      console.log('Your account is not connected.');
      process.exit(0);
    })
    .exhaustive();

  // Get token owner
  const spinner = ora('Gathering profile details...').start();
  const userDetails = await ky
    .get('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    .json<{ login: string }>();
  spinner.succeed(`Logged as ${userDetails.login}`);
};
