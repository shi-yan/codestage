https://user-images.githubusercontent.com/326807/201398785-5eaf402e-ee41-46c4-bb7b-5ccc6a9861db.mp4

CodeStage is a static site generator to generate javascript playground. I implemented this to generate code samples for my WebGPU tutorial project. CodeStage is inspired by the following sites:

[Monaco](https://microsoft.github.io/monaco-editor/playground.html)

[WebGPU samples](https://austin-eng.com/webgpu-samples)

[Bauble](https://bauble.studio/)

[Goplay][https://goplay.space/]

All these sites seem to build their own solution. CodeStage, on the other hand, is a free and reusable solution.

To see a demo of a deployed CodeStage site: [WebGPUTutorial](https://shi-yan.github.io/WebGPUTutorial/?sample=test_base)

## Usage
```
cargo install codestage
```

Create a project folder and craft a project file [codestage.toml](https://github.com/shi-yan/codestage/blob/master/example_project/codestage.toml)


### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
