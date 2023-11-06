#!/bin/bash 

npm run build
cp -r ./node_modules/monaco-editor/min/vs ../cli/dist/assets
#./package_monaco.py
