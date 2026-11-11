#!/bin/sh
# software WebGL for this GPU-less cloud machine
exec /usr/bin/google-chrome --use-angle=swiftshader --enable-unsafe-swiftshader "$@"
