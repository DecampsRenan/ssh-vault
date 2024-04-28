import Conf from 'conf';
import { P } from 'ts-pattern';

const ConfSchema = {
  githubToken: P.string,
  githubRepo: P.string,
};

export const conf = new Conf<P.infer<typeof ConfSchema>>({
  projectName: 'ssh-vault',
});
