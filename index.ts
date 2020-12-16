// Import modules with "* as" https://github.com/vercel/ncc/issues/621
import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import * as childProcess from 'child_process';
import * as shortuuid from 'short-uuid';

(async () => {
  try {
    const exec = (command: string, args: string[] = []) => {
      return new Promise((resolve) => {
        const { spawn } = childProcess;

        const PS1 = 'actions$';
        core.info(`${PS1} ${command} ${args.join(' ')}`);

        const proc = spawn(command, args);

        const stdout: string[] = [];
        proc.stdout.on('data', (data) => {
          stdout.push(data);
          core.info(data);
        });

        const stderr: string[] = [];
        proc.stderr.on('data', (data) => {
          stderr.push(data);
          throw new Error(stderr.join('\n'));
        });

        proc.on('close', (code) => {
          if (code !== 0) throw new Error(stderr.join('\n'));
          return resolve(stdout.join('\n'));
        });
      });
    };

    const buildCommand = core.getInput('build-command', { required: true });
    await exec('bash', ['-c', buildCommand]);

    const artifactFileName = `${shortuuid.generate()}.tar.gz`;
    const exclude = [
      ...core
        .getInput('exclude-files')
        .split(' ')
        .map((file) => `--exclude=${file}`),
      `--exclude=${artifactFileName}`,
    ];
    const keep = core.getInput('keep-files').split(' ');
    await exec('tar', ['-cvzf', artifactFileName, ...exclude, ...keep]);

    const artifactClient = artifact.create();
    await artifactClient.uploadArtifact(artifactFileName, [artifactFileName], '.');

    await exec('rm', ['-f', artifactFileName]);

    core.setOutput('ARTIFACT_NAME', artifactFileName);
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
})();
