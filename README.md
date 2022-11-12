https://user-images.githubusercontent.com/326807/201398785-5eaf402e-ee41-46c4-bb7b-5ccc6a9861db.mp4

CodeStage is a static site generator to generate javascript playground. I implemented this to generate code samples for my WebGPU tutorial project. CodeStage is inspired by the following sites:

[Monaco](https://microsoft.github.io/monaco-editor/playground.html) [WebGPU samples](https://austin-eng.com/webgpu-samples) [Bauble](https://bauble.studio) [Goplay](https://goplay.space)

All these sites seem to build their own solution. CodeStage, on the other hand, is a free and reusable solution.

### Key features

* Mutable code samples, easy to conduct experiments on
* Samples can be navigated by a menu supporting nested items
* No backend is needed

To see a demo of a deployed CodeStage site: [Demo](https://shi-yan.github.io/codestage/)

## Installation
```
cargo install codestage
```

## Usage

Create a project folder and craft a project file [codestage.toml](https://github.com/shi-yan/codestage/blob/master/example_project/codestage.toml)

```toml
# Title of the project (must have)
title = "CodeStage example"
# Github repo link (optional)
github = "xxx"
# If not deployed under the root directory, this will be needed (optional)
prefix = "demo"
# specify the output folder (optional)
target = "dist"
# Utility folders are shared by all samples in the project.
utilities = [ "utility_folder_1",  "utility_folder_2" ]

# The following is the table of content
# The content field is an array of chapters
# Each chapter must have a title
# A chapter can have a folder. When a folder is provided and when the chapter is clicked, we will load the sample in the folder. If no folder is provided, this chapter will not be clickable.
[[content]]
title = "chapter 1"
folder = "test_base"

# A list of files we want to load into the editor. All files in the above folder will be deployed, but only these files in that folder will be loaded into the editor.
# The "is_readonly" option is not yet implemented. It will make a file immutable.
[[content.files]]
filename = "index.html"
is_readonly = true

# Chapters can be nested. This sub_chapters is an array field, the same as the content field.
[[content.sub_chapters]]
title = "chapter 1.1"
folder = "test_base"
[[content.sub_chapters.files]]
filename = "index.html"
is_readonly = true

# Another level of nested chapter
[[content.sub_chapters.sub_chapters]]
title = "chapter 1.1.1"
folder = "test_base"
[[content.sub_chapters.sub_chapters.files]]
filename = "index.html"
is_readonly = true

[[content]]
title = "chapter 2"
folder = "test_base"
[[content.files]]
filename = "index.html"
is_readonly = true

```

Each indivisual sample should be in a separate folder. Under each folder, there must be an `index.html` file. This will be the entrypoint for this sample when a user click the run button.

There can be a utility folder housing the common files that is shared by all samples.

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
├─ README.md
```

The samples can be developed outside the CodeStage environment using a more familiar and advanced editor. 

Once development is done, run this command to build your project

```bash
codestage --target <target_folder>
```

The static site is generated under <target_folder>

If the site will be deployed to a subpath of a domain, indead of the root, for example: `https://example.com/my_samples`, We need to specify the path prefix (`my_sample`). This can be done with either the commandline argument `--prefix` or the `codestage.toml` file.

The commandline options have higher priority than the toml file. If you want to do any adhoc changes, you can use the commandline.

## Build
```
cd frontend
npm i --save
npm run build
cd cli
cargo build --release
```

## Implementation details
When we build a CodeStage project, we validate the `codestage.toml` file, copy all sample and utility folders to the target folder. We then generate a json file called `manifest.json`, which contains the menu structure for the project. We also output the frontend code into the target folder. When the project is loaded into browser, we fetch the manifest file first to populate the menu structure. When a chapter is clicked, we load the corresponding `files` as defined in the `codestage.toml` file into the editor. A user can freely update the code using the editor. When the `run` button is clicked, we use the following mechanism to assemble the program:

1. We first crate a dom tree using the index.html file.
2. We scan for all script tags. For all script tags that have the `src` attribute matches a modified js file, we will replace their `textContent` with the modified code.
3. Finally we inject a `base` tag into the document, so that we will use the sample's folder as the root.
4. The dom tree assembled above will be stuffed into an iframe for execution.

The editor is built using [Monaco](https://github.com/shi-yan/codestage).

## Todo
better samples []
css prefix []
readonly []