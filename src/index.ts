#!/usr/bin/env node
import { program } from '@commander-js/extra-typings';

import connect from '@/commands/connect.js';
import disconnect from '@/commands/disconnect.js';
import open from '@/commands/open.js';
import sync from '@/commands/sync.js';
import whoami from '@/commands/whoami.js';

program
  // Metadata for the CLI
  .name('ssh-vault')
  .description('Securely manage your ssh keys')
  .version('0.0.1');

program
  // ssh-vault connect
  .command('connect')
  .description('Connect ssh-vault to the github repo used to store your ssh keys')
  .action(connect);

program
  // ssh-vault disconnect
  .command('disconnect')
  .description('Remove the github personal token used to communicate with your vault.')
  .action(disconnect);

program
  // ssh-vault disconnect
  .command('whoami')
  .description('Show the profile linked to the provided github personal token.')
  .action(whoami);

program
  // ssh-vault sync
  .command('sync')
  .description('Sync keys between your computer and the vault')
  .action(sync);

program
  // ssh-vault open
  .command('open')
  .description('Open the vault in your browser')
  .action(open);

program.parse();
