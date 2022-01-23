#!/bin/bash

# grabbed the following code from a post by https://github.com/ujwal-setlur
# so credit to Ujwal - complaints to me

packages=$(rush list -p --json | jq -r '. | .projects[] | .name + " " + .path + "/"')

echo "${packages}" | awk '{print $2 "package.json"}' | xargs -n 1 -x ncu "${@}" --packageFile
