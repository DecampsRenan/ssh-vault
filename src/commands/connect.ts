import { Future, Option } from '@swan-io/boxed';
import chalk from 'chalk';
import ky from 'ky';
import ora from 'ora';
import prompts from 'prompts';
import terminalLink from 'terminal-link';
import { P, match } from 'ts-pattern';

import { conf } from '@/config/store.js';

export default async () => {
  const githubToken = Option.fromNullable(conf.get<string>('githubToken'));
  const githubRepo = Option.fromNullable(conf.get<string>('githubRepo'));

  const token = await match(githubToken)
    .with(Option.P.Some(P.select()), (token) => token)
    .with(Option.P.None, async () => {
      console.log('In order to manage your ssh keys, we need to use a personal token.');
      console.log(
        `You can create one on ${terminalLink('your github profile settings', 'https://github.com/settings/tokens/new')}.`,
      );
      const { personalToken } = await prompts({
        type: 'password',
        name: 'personalToken',
        message: 'Github personal token',
        validate: (value) => (!value.trim() ? 'Token is required' : true),
        format: (value) => value.trim(),
      });

      if (!personalToken) {
        console.log('Please fill a token');
        process.exit(-1);
      }

      conf.set('githubToken', personalToken);
      return personalToken;
    })
    .exhaustive();

  // Get token owner
  const spinner = ora('Checking token validity...').start();
  const checkToken = await Future.fromPromise(
    ky
      .get('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      .json<{ login: string }>(),
  );

  if (checkToken.isError()) {
    spinner.fail(
      'Please check that the provided token is valid. It should at least have the repo scope checked.',
    );
    console.log(
      `${(checkToken.error as any).response.status} - ${(checkToken.error as any).response.statusText}`,
    );
    conf.delete('githubToken');
    process.exit(-2);
  }

  conf.set('username', checkToken.get().login);
  spinner.succeed();

  const repo = await match(githubRepo)
    .with(Option.P.Some(P.select()), (repo) => repo)
    .with(Option.P.None, async () => {
      console.log('We need to create a private repository which will be your vault.');
      // Ask repo name
      const { repositoryName } = await prompts({
        name: 'repositoryName',
        message: 'Provide the name of the repository to use as a vault',
        type: 'text',
        initial: 'personal-ssh-vault',
        format: (value) => value.trim(),
        validate: (value) => {
          if (!value) {
            return 'You must provide a repository name so we can create it to use it as a vault.';
          }

          if (value.match(/\s/gm)) {
            return 'Repository name do not authorize whitespace characters';
          }

          return true;
        },
      });

      // TODO: make sure the repo can be created without problems
      if (!repositoryName) {
        console.log('Please provide a repository name.');
        process.exit(-1);
      }

      spinner.start('Creating repository...');
      await ky.post('https://api.github.com/user/repos', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        json: {
          name: repositoryName,
          description: 'SSH Vault - used to store my ssh keys.',
          private: true,
        },
      });
      spinner.succeed();

      conf.set('githubRepo', repositoryName);
      return repositoryName;
    })
    .exhaustive();

  console.log(`${chalk.green('✔︎')} Connection successfull !`);
};
