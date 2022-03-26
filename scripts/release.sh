#!/bin/bash

for dir in core/*
do
    (
        if ! cd "$dir"
        then
            echo "Error: Unable to change into $dir"
            echo "Aborting"
            exit 1
        fi

        echo "Publish: $dir"
        echo npm publish
    )
done
