import { Option } from '@swan-io/boxed';
import chalk from 'chalk';
import ky from 'ky';
import ora from 'ora';
import terminalLink from 'terminal-link';
import { P, match } from 'ts-pattern';

import { conf } from '@/config/store.js';

export default async () => {
  const githubToken = Option.fromNullable(conf.get<string>('githubToken'));

  const token = await match(githubToken)
    .with(Option.P.Some(P.select()), (token) => token)
    .with(Option.P.None, async () => {
      const personalTokenLink = terminalLink(
        '▶︎ Create your personal token',
        'https://github.com/settings/tokens/new',
      );
      console.log('There is no personal token connected.');
      console.log(
        `Provide one by first creating it in your github profile settings, and then by providing it to the ${chalk.blue('ssh-vault connect')} command.`,
      );
      console.log(personalTokenLink);
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
    .json<{ login: string; html_url: string }>();

  const profileLink = terminalLink(userDetails.login, userDetails.html_url);
  spinner.succeed(`Logged as ${chalk.blue(profileLink)}`);
};
