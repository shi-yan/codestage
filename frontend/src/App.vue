<template>
  <div style="width: 100%; display: flex; flex-direction: column">
    <div ref="menu" class="menu">
      <h2 class="menu-title">{{ content.title }}</h2>
      <div class="menu-content">
        <ul>
          <menu-item
            v-for="item in content.content"
            :key="item.title"
            :item="item"
          >
          </menu-item>
        </ul>
      </div>
    </div>
    <div class="tool-bar">
      <button
        style="z-index: 200"
        @click="onMenuButtonClicked"
        class="tab-button"
      >
        <menu-icon style="vertical-align: middle"></menu-icon>
      </button>
      <button
        v-for="f in files"
        :filename="f.filename"
        :key="f.filename"
        :ref="(el) => fileRefs.push(el)"
        @click="
          (e) => {
            onLoadFile(e, f);
          }
        "
        class="tab-button"
      >
        <file-outline-icon style="vertical-align: middle"></file-outline-icon>
        <span class="tab-button-text">{{ f.filename }}</span>
      </button>
      <div style="flex-grow: 1"></div>
      <button
        v-if="content.repo"
        @click="openRepo(content.repo)"
        class="tab-button"
      >
        <git-icon style="vertical-align: middle"></git-icon>
        <span class="tab-button-text">REPO</span>
      </button>
      <button @click="onRun" class="tab-button">
        <play-icon style="vertical-align: middle"></play-icon>
        <span class="tab-button-text">RUN</span>
      </button>
    </div>
    <div class="main" ref="main">
      <div class="editor" id="container" ref="container"></div>
      <div id="adjust-bar" ref="movableBar"></div>
      <div class="output" id="output" ref="output">
        <iframe ref="outputWindow" class="sandbox"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import { ref } from "vue";
import MenuItem from "./MenuItem.vue";
import FileOutlineIcon from "vue-material-design-icons/FileOutline.vue";
import MenuIcon from "vue-material-design-icons/Menu.vue";
import PlayIcon from "vue-material-design-icons/Play.vue";
import GitIcon from "vue-material-design-icons/Git.vue";

let editor = null;
let loadedFiles = new Map();

export default {
  name: "App",
  components: {
    MenuItem,
    FileOutlineIcon,
    MenuIcon,
    PlayIcon,
    GitIcon,
  },
  data: function () {
    return {
      content: ref({}),
      currentFolder: ref({}),
      files: ref([]),
      fileRefs: ref([]),
      isMenuOpen: ref(false),
    };
  },
  beforeUnmount: function () {
    this.eventBus.off("load");
  },
  mounted: async function () {
    this.content = await this.fetchContent();
    document.title = this.content.title;

    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    const folder = urlParams.get("sample");

    this.currentFolder =
      (folder && this.getDetailsByFolder(folder)) ||
      this.getFirstFolderDetails();

    if (this.currentFolder !== null) {
      this.files = [];
      this.files.push(...this.currentFolder.files);
    }

    this.eventBus.on("load", (e) => {
      this.onLoadSample(e);
    });

    this.$nextTick(async () => {
      let movable = this.$refs["movableBar"];
      let mouseX = 0;
      let panelLeft = 0;
      let panelRight = 0;
      let panelMain = 0;
      let self = this;

      let movableOnMouseMove = function (e) {
        e.stopPropagation();
        e.preventDefault();
        const dx = e.screenX - mouseX;
        panelLeft = self.$refs["container"].getBoundingClientRect().width;
        panelRight = self.$refs["output"].getBoundingClientRect().width;
        panelMain = self.$refs["main"].getBoundingClientRect().width;
        const left = ((panelLeft + dx) * 100) / panelMain;

        self.$refs["container"].style.width = `${left}%`;
        const right = ((panelRight - dx) * 100) / panelMain;
        self.$refs["output"].style.width = `${right}%`;
        mouseX = e.screenX;
      };

      let movableOnMouseUp = function (event) {
        event.stopPropagation();
        event.preventDefault();
        document.removeEventListener("mousemove", movableOnMouseMove);
        document.removeEventListener("mouseup", movableOnMouseUp);
        self.updateIFrameSize();
        self.$refs["outputWindow"].style.pointerEvents = "auto";
        self.$refs["container"].style.pointerEvents = "auto";
      };

      let timer = null;
      window.onresize = () => {
        console.log("resize");
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          self.updateIFrameSize();
        }, 500);
      };

      movable.onmousedown = function (e) {
        mouseX = e.screenX;
        //isDragging = true;
        document.addEventListener("mousemove", movableOnMouseMove);
        document.addEventListener("mouseup", movableOnMouseUp);
        // cancel iframe mouse event https://www.gyrocode.com/articles/how-to-detect-mousemove-event-over-iframe-element/
        self.$refs["outputWindow"].style.pointerEvents = "none";
        self.$refs["container"].style.pointerEvents = "none";

        e.stopPropagation();
        e.preventDefault();
      };

      self.updateIFrameSize();

      const data = await import("./CodeStage.json");
      monaco.editor.defineTheme("codestage", data);
      monaco.editor.setTheme("codestage");

      editor = monaco.editor.create(document.getElementById("container"), {
        value: "",
        language: undefined,
        automaticLayout: true,
        suggest: {
          showSnippets: false,
          showWords: false,
          showKeywords: false,
          showVariables: false, // disables `undefined`, but also disables user-defined variables suggestions.
          showModules: false, // disables `globalThis`, but also disables user-defined modules suggestions.
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        guides: {
          indentation: false,
        },
        codeLens: false,
        ordBasedSuggestions: false,
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: false,
        snippetSuggestions: "none",
        hover: { enabled: false },
      });

      this.onLoadFile(null, this.files[0]);
    });
  },
  methods: {
    openRepo: function (url) {
      window.open(url, "_blank");
    },
    getFirstFolderDetails: function () {
      function helper(node) {
        if (node.folder) {
          return node;
        } else {
          if (node.sub_chapters && node.sub_chapters.length > 0) {
            for (let n of node.sub_chapters) {
              const r = helper(n);
              if (r !== null) {
                return r;
              }
            }
          }
        }
        return null;
      }

      for (let n of this.content.content) {
        const r = helper(n);
        if (r !== null) {
          return r;
        }
      }
      return null;
    },
    getDetailsByFolder: function (folderName) {
      function helper(node) {
        if (node.folder === folderName) {
          return node;
        } else {
          if (node.sub_chapters && node.sub_chapters.length > 0) {
            for (let n of node.sub_chapters) {
              const r = helper(n);
              if (r !== null) {
                return r;
              }
            }
          }
        }
        return null;
      }

      for (let n of this.content.content) {
        const r = helper(n);
        if (r !== null) {
          return r;
        }
      }
      return null;
    },
    fetchContent: async function () {
      let manifest = await fetch("{{_codestage_prefix_}}/manifest.json");
      let jsonContent = await manifest.json();
      return jsonContent;
    },
    onLoadSample: function (e) {
      console.log(e);
      this.$refs["menu"].classList.remove("slide");
      window.location = "{{_codestage_prefix_}}/?sample=" + e.folder;
    },
    onMenuButtonClicked: function () {
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
        this.$refs["menu"].classList.remove("slide");
      } else {
        this.isMenuOpen = true;
        this.$refs["menu"].classList.add("slide");
      }
    },
    fetchFileByPath: async function (filePath) {
      if (loadedFiles.has(filePath)) {
        const model = loadedFiles.get(filePath);
        return model;
      } else {
        let file = await fetch("{{_codestage_prefix_}}/" + filePath);
        let fileContent = await file.text();
        const model = monaco.editor.createModel(
          fileContent,
          undefined, // language
          monaco.Uri.file(filePath) // uri
        );
        loadedFiles.set(filePath, model);
        return model;
      }
    },
    onLoadFile: async function (e, f) {
      for (let re of this.fileRefs) {
        if (re.getAttribute("filename") === f.filename) {
          if (f.is_readonly == true) {
            re.classList.add("readonly");
          } else {
            re.classList.add("active");
          }
        } else {
          re.classList.remove("active");
          re.classList.remove("readonly");
        }
      }

      const filePath = this.currentFolder.folder + "/" + f.filename;
      const model = await this.fetchFileByPath(filePath);
      editor.setModel(model);
      if (f.is_readonly == true) {
        editor.updateOptions({ readOnly: true });
      } else {
        editor.updateOptions({ readOnly: false });
      }

      document.title = this.currentFolder.title + " - " + f.filename;
    },
    onRun: async function () {
      const filePath = this.currentFolder.folder + "/index.html";
      const model = await this.fetchFileByPath(filePath);
      const html_string = model.getValue();

      let newHTMLDocument =
        document.implementation.createHTMLDocument("preview");
      newHTMLDocument.documentElement.innerHTML = html_string;

      let styleTags = newHTMLDocument.getElementsByTagName("link");

      for (let t = 0; t < styleTags.length; ++t) {
        const href = styleTags[t].getAttribute("href");

        if (href) {
          for (let f of this.currentFolder.files) {
            if (f.filename === href) {
              const path = this.currentFolder.folder + "/" + href;

              const model = await this.fetchFileByPath(path);
              const style_string = model.getValue();

              styleTags[t].remove();
              const styleTag = newHTMLDocument.createElement("style");

              styleTag.textContent = style_string;
              newHTMLDocument.head.appendChild(styleTag);
              break;
            }
          }
        }
      }

      //overwrite scripts
      let scriptTags = newHTMLDocument.getElementsByTagName("script");
      for (let t = 0; t < scriptTags.length; ++t) {
        const src = scriptTags[t].getAttribute("src");

        if (src) {
          for (let f of this.currentFolder.files) {
            if (f.filename === src) {
              const path = this.currentFolder.folder + "/" + src;
              scriptTags[t].removeAttribute("src");
              const model = await this.fetchFileByPath(path);
              const script_string = model.getValue();
              scriptTags[t].textContent = script_string;
              break;
            }
          }
        }
      }

      let exisiting = newHTMLDocument.head.getElementsByTagName("base");
      if (exisiting.length > 0) {
        for (let e = 0; e < exisiting.length; ++e) {
          exisiting[e].setAttribute(
            "href",
            "{{_codestage_prefix_}}/" + this.currentFolder.folder + "/"
          );
        }
      } else {
        let base = document.createElement("base");
        base.setAttribute(
          "href",
          "{{_codestage_prefix_}}/" + this.currentFolder.folder + "/"
        );
        newHTMLDocument.head.appendChild(base);
      }

      let iframeDoc = this.$refs["outputWindow"].contentDocument;
      iframeDoc.removeChild(iframeDoc.documentElement);
      this.$refs["outputWindow"].srcdoc =
        newHTMLDocument.documentElement.innerHTML;
    },
    updateIFrameSize: function () {
      const outputRect = document
        .getElementById("output")
        .getBoundingClientRect();

      let iframe = this.$refs["outputWindow"];
      iframe.style.width = outputRect.width + "px";
      iframe.style.height = outputRect.height + "px";
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300&family=Source+Code+Pro&display=swap");

#app {
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
  background-color: #0e0b33;
}

html {
  overflow: hidden;
}

.main {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-grow: 1;
  overflow: hidden;
}

.editor {
  display: block;
  width: 50%;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #2b284b;
  background-color: #1a183d;
}

#adjust-bar {
  border-top-width: 0px;
  border-left-width: 1px;
  border-right-width: 1px;
  border-bottom-width: 0px;
  border-style: solid;
  border-color: black;
  width: 3px;
  cursor: ew-resize;
}

.output {
  overflow: hidden;

  width: 50%;
}

.menu {
  width: 320px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: -320px;
  background-color: white;
  z-index: 100;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
  display: flex;
  flex-direction: column;
  background-color: #0e0b33;
}

.menu-title {
  margin-top: 40px;
  color: #ffffff;
  text-align: center;
}

.slide {
  left: 0px;
  transition: 0.3s;
}

.menu-top-bar-button {
  float: right;
}

.menu-content {
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 10px;
  margin-left: 10px;
}

.tab-button {
  border: 0;
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: #9492b1;
  cursor: pointer;
}

.tab-button:hover {
  color: #ffffff;
}

.tab-button-text {
  margin-left: 8px;
  font-family: "Source Code Pro", monospace;
}

.tab-button.active {
  border-bottom-width: 4px;
  border-style: solid;
  border-color: #4631c5;
  cursor: default;
  color: #ffffff;
}

.tab-button.readonly {
  border-bottom-width: 4px;
  border-style: solid;
  border-color: #9b304c;
  cursor: default;
  color: #ffffff;
}

.tool-bar {
  flex-grow: 0;
  flex-shrink: 1;
  display: flex;
  flex-direction: row;
  height: 40px;
  padding-right: 10px;
}

.sandbox {
  position: absolute;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #2b284b;
  background-color: #1a183d;
}

.menu-item {
  color: #9492b1;
  border: 0;
  background: none;
  box-shadow: none;
  border-radius: 0px;
  cursor: pointer;
}

/* width */
::-webkit-scrollbar {
  width: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  background-color: #1a183d;
  border-radius: 4px;
  border-radius: 2px;
  border-style: solid;
  border-color: #1a183d;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #222045;
  border-radius: 4px;
}

ul {
  padding-inline-start: 8px;
}

li {
  margin: 0px;
}
</style>
