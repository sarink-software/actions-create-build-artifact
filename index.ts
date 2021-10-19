// Import modules with "* as" https://github.com/vercel/ncc/issues/621
import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import * as shortuuid from 'short-uuid';
import { promisify } from 'util';
import { exec as origExec } from 'child_process';
const asyncExec = promisify(origExec);

(async () => {
  const exec = async (command: string) => {
    const PS1 = 'actions$';
    core.info(`${PS1} ${command}`);
    const { stdout, stderr } = await asyncExec(command);
    core.info(stdout);
    core.info(stderr);
  };

  const buildCommand = core.getInput('build-command', { required: true });
  await exec(buildCommand);

  const artifactFileName = `${shortuuid.generate()}.tar`;
  await exec(`touch ${artifactFileName}`);

  const include = core.getInput('include').split(' ');
  const exclude = [...core.getInput('exclude').split(' '), artifactFileName].map(
    (file) => `--exclude=${file}`
  );
  await exec(`tar -czvf ${artifactFileName} ${exclude.join(' ')} ${include.join(' ')}`);

  const artifactClient = artifact.create();
  await artifactClient.uploadArtifact(artifactFileName, [`./${artifactFileName}`], './', {
    retentionDays: 1,
  });

  await exec(`rm -f ${artifactFileName}`);

  core.setOutput('ARTIFACT_NAME', artifactFileName);
})().catch((error) => {
  core.setFailed(error.message);
  console.error(error);
});
