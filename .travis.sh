#!/bin/bash
set -ev

# Don't run tests for internal PRs (that aren't from forks).
# ChromaticQA advises it
# => it still run on "push" events, even if we rebase PR branch.
# PRs from forks will run as regular "pr" events.
if [[ $TRAVIS_EVENT_TYPE != 'pull_request' ||  $TRAVIS_PULL_REQUEST_SLUG != $TRAVIS_REPO_SLUG ]];
then
  npm run test:ci
fi
