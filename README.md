https://user-images.githubusercontent.com/326807/201398785-5eaf402e-ee41-46c4-bb7b-5ccc6a9861db.mp4

CodeStage is a static site generator to generate javascript playground. I implemented this to generate code samples for my WebGPU tutorial project. CodeStage is inspired by the following sites:

[Monaco](https://microsoft.github.io/monaco-editor/playground.html)

[WebGPU samples](https://austin-eng.com/webgpu-samples)

[Bauble](https://bauble.studio)

[Goplay](https://goplay.space)

All these sites seem to build their own solution. CodeStage, on the other hand, is a free and reusable solution.

To see a demo of a deployed CodeStage site: [WebGPUTutorial](https://shi-yan.github.io/WebGPUTutorial/?sample=test_base)

## Installation
```
cargo install codestage
```

## Usage

Create a project folder and craft a project file [codestage.toml](https://github.com/shi-yan/codestage/blob/master/example_project/codestage.toml)

```toml

```

Each indivisual sample should be in a separate folder.
There can be a utility folder that is shared by all samples.

Run this command to build your project

```bash
codestage --target <target_folder>
```

Once done, the static site is generated under <target_folder>

## Build
```
cd frontend
npm i --save
npm run build
cd cli
cargo build --release
```

## Implementation details


