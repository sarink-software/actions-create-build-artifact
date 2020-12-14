// Import modules with "* as" https://github.com/vercel/ncc/issues/621
import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import * as childProcess from 'child_process';
import * as shortuuid from 'short-uuid';

try {
  (async () => {
    const exec = (command: string, args: string[] = []) => {
      const { spawn } = childProcess;
      return new Promise((resolve, reject) => {
        const proc = spawn(command, args);
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.stdout.on('data', (data) => core.info(data.toString().trim()));
        proc.stderr.on('data', (data) => core.info(data.toString().trim()));
        proc.on('close', (code) => (code === 0 ? resolve(code) : reject(code)));
      });
    };

    const buildCommand = core.getInput('build-command', { required: true });
    await exec('bash', ['-c', buildCommand]);

    const artifactFileName = `${shortuuid.generate()}.tar.gz`;
    await exec('tar', ['-cvzf', artifactFileName, './*']);

    const artifactClient = artifact.create();
    await artifactClient.uploadArtifact(artifactFileName, [`${artifactFileName}.tar.gz`], '.');

    core.setOutput('ARTIFACT_NAME', artifactFileName);
  })();
} catch (error) {
  core.setFailed(error.message);
}
