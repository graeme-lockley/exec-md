#!/bin/bash

if ! rush check
then
    echo "Error: Mis-matching dependencies"
    exit 1
else
    rush version --bump --override-bump=patch
fi
