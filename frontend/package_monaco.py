#!/opt/homebrew/bin/python3

import glob
import glob
import os

types = ('*.js', '*.css', '*.ttf')
files_grabbed = []

for files in types:
    files_grabbed.extend(glob.glob('../cli/dist/assets/' + files,recursive=False))

print(files_grabbed)

subfolder_files_grabbed = []

for files in types:
    subfolder_files_grabbed.extend(glob.glob('../cli/dist/assets/vs/**/'+files,recursive=True))
    

print(subfolder_files_grabbed)

exisiting_files = {}

for f in subfolder_files_grabbed:
    filename = os.path.basename(f)
    exisiting_files[filename] = f

print(exisiting_files)

for f in files_grabbed:
    filename = os.path.basename(f)
    if filename in exisiting_files:
        os.remove(f)


