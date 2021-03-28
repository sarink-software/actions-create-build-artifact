# actions-create-build-artifact

## Overview

Simply utility to execute a `build-command`, `tar` a bunch of files (with `include` and `exclude` options), and upload it as a github artifact (with a randomly generated name).

## Outputs

`ARTIFACT_NAME`: The name of the artifact (to be used by the [download-artifact](https://github.com/actions/download-artifact) action)

## Usage

```
jobs:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v2

      - name: Create backend artifact
        uses: sarink-software/actions-create-build-artifact@main
        id: build
        # Optional
        # with:
        #   build-command: cd backend && npm run build
        #   include: docker-compose.yml backend
        #   exclude: frontend .git

      - name: Use the artifact for something
        uses: actions/download-artifact@v2
        with:
          name: ${{ steps.build.outputs.ARTIFACT_NAME }}
```

# Optional Inputs

`build-command`: The command to execute before `tar` ing the artifact (default: `npm run build`)

`include`: Files to include (default: `.`)

`exclude`: Files to exclude (default: `.git`)
