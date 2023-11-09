https://user-images.githubusercontent.com/326807/201398785-5eaf402e-ee41-46c4-bb7b-5ccc6a9861db.mp4

 [![crates.io](https://img.shields.io/crates/v/codestage.svg)](https://crates.io/crates/codestage)

![logo](https://raw.githubusercontent.com/shi-yan/codestage/master/logo.png)

CodeStage is a static site generator to create javascript playgrounds. I implemented this to generate code samples for my WebGPU tutorial project. CodeStage was inspired by the following sites:

[Monaco](https://microsoft.github.io/monaco-editor/playground.html) | [WebGPU samples](https://austin-eng.com/webgpu-samples) | [Bauble](https://bauble.studio) | [Goplay](https://goplay.space)

All these sites seem to build their own solution. CodeStage, on the other hand, is a free and reusable solution.

### Key features

* Mutable code samples, easy to conduct experiments on
* Samples can be navigated by a menu supporting nested items
* No backend is needed

To see a demo of a deployed CodeStage site: [Demo](https://shi-yan.github.io/codestage/). Some samples used in this demo come from [webglsamples](https://github.com/webglsamples/webglsamples.github.io).

## Installation
```
cargo install codestage --version 0.1.1-alpha.0
```

## Usage

Create a project folder and a project file [codestage.toml](https://github.com/shi-yan/codestage/blob/master/example_project/codestage.toml)

```toml
# Title of the project (must have).
title = "CodeStage example"
# Link to the repository (optional).
repo = "xxx"
# If not deployed under the root directory, this will be needed. The first slash is required (optional).
prefix = "/codestage"
# Specify the output folder (optional).
target = "dist"
# Link to the deployed site, this will be used for meta tags (optional).
url = "https://shi-yan.github.io/codestage/"
# Image used for meta tags (optional).
meta_image = "meta.png"
# Description used for meta tags (optional).
description = """
CodeStage is a static site generator to build JS playground demos."""
# Utility folders are shared by all samples in the project (optional).
utilities = [ "utility_folder_1",  "utility_folder_2" ]

# The following is the table of content, which will be rendered in the menu area.
# The content field is an array of chapters.
# Each chapter must have a title
# A chapter can have a folder. When a folder is provided and when the menu item is clicked, we will load the sample in the folder. If no folder is provided, this menu item will not be clickable.
[[content]]
title = "chapter 1"
folder = "test_base"

# A list of files we want to load into the editor. All files in the above folder will be deployed, but only these files in that folder will be loaded into the editor.
[[content.files]]
# Each folder must have an index.html, this file is the entrypoint.
filename = "index.html"
# is_readonly will make a file immutable (optional).
is_readonly = true

# Chapters can be nested by using the sub_chapters field. This field is an array, its format is the same as the content field.
[[content.sub_chapters]]
title = "chapter 1.1"
folder = "test_base"

[[content.sub_chapters.files]]
filename = "index.html"

# Another level of nested chapter
[[content.sub_chapters.sub_chapters]]
title = "chapter 1.1.1"
folder = "test_base"

[[content.sub_chapters.sub_chapters.files]]
filename = "index.html"

[[content]]
title = "chapter 2"
folder = "test_base"

[[content.files]]
filename = "index.html"
is_readonly = true

```

Each individual sample should be in a separate folder. Under each folder, there must be an `index.html` file. This will be the entrypoint for the sample. When a user clicks the run button, we will load and display this `index.html` file.

There can be a utility folder housing the common files that are shared by all samples.

A typical project's folder structure should look like this:

```bash
my-codestage-project/
├─ sample_1/
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ style.css
├─ sample_2/
│  ├─ index.html
├─ sample_3/
│  ├─ index.html
│  ├─ index.css
│  ├─ index.js
├─ utility_folder/
│  ├─ utility_script.js
├─ utility_folder_2/
│  ├─ test.png
├─ codestage.toml
├─ meta_image.png
├─ README.md
```

It is not necessary to develop the samples using the CodeStage editor. They can be developed using a more familiar and advanced editor. 

Once development is done, run this command to build your project:

```bash
codestage --target <target_folder>
```

The static site is generated under <target_folder>

If the site will be deployed to a subpath of a domain, indead of the root, for example: `https://example.com/my_samples`, We need to specify the path prefix (`/my_sample`). This can be done with either the commandline argument `--prefix` or the `codestage.toml` file.

The commandline options have higher priority than the toml file. If you want to do any adhoc config changes, you can use the commandline.

## Example

The [example_project](https://github.com/shi-yan/codestage/tree/master/example_project) folder contains an example project. To build it:

```bash
cd example_project

codestage
```

The generated site will be under `example_project/dist`

## Build
```
cd frontend
npm i --save
./build
cd cli
cargo build --release
```

## Implementation details
When we build a CodeStage project, we first validate the `codestage.toml` file, copy all sample and utility folders to the target folder. We then generate a json file called `manifest.json`, which contains the menu structure for the project. We also output the frontend code into the target folder. When the project is loaded into browser, we fetch the manifest file first to populate the menu structure. When a menu item is clicked, we load the corresponding `files` as defined in the `codestage.toml` file into the editor. A user can freely change the sample code using the in-browser editor. When the `run` button is clicked, we use the following mechanism to assemble the program:

1. We first create a dom tree using the content of the index.html file.
2. We scan for all link tags. For all link tags that have the `href` attribute matching a modified css file, we will replace their `textContent` with the modified code.
3. We scan for all script tags. For all script tags that have the `src` attribute matching a modified js file, we will replace their `textContent` with the modified code.
4. Finally we inject a `base` tag into the document, so that we can use the sample's folder as the root.
5. The dom tree assembled above will be stuffed into an iframe for execution.

The in-browser editor is built using [Monaco](https://microsoft.github.io/monaco-editor/).

