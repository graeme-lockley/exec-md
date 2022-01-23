#!/bin/bash

packages=$(rush list -p --json | jq -r '. | .projects[] | .name + " " + .path + "/"')

echo "${packages}" | awk '{print $2 "package.json"}' | xargs -n 1 -x ncu "${@}" --packageFile
