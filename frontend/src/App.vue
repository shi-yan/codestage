<template>
  <div style="width: 100%; display: flex; flex-direction: column">
    <div style="flex-grow: 0; flex-shrink: 1">
      <button @click="onFile1">file one</button>
      <button @click="onFile2">file two</button>
    </div>
    <div class="main" ref="main">
      <div class="editor" id="container" ref="container"></div>
      <div id="adjust-bar" ref="movableBar"></div>
      <div class="output" id="output" ref="output">
        <iframe ref="outputWindow" style="position: absolute"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";

let editor = null;

export default {
  name: "App",
  components: {},
  data: function () {},
  mounted: async function () {
    this.getChapters();
    /*
        var jsCode = [
          '"use strict";',
          "function Person(age) {",
          "	if (age) {",
          "		this.age = age;",
          "	}",
          "}",
          "Person.prototype.getAge = function () {",
          "	return this.age;",
          "};",
        ].join("\n");*/

    var html = [
      "<html>",
      "<body>",
      "<p>tesatdf</p>",
      "<img src='logo.png' />",
      "</body>",
      "<script>console.log('test');< /script>",
      "</html>",
    ].join("\n");

    this.$nextTick(async () => {
      let movable = this.$refs["movableBar"];
      let mouseX = 0;
      let panelLeft = 0;
      let panelRight = 0;
      let panelMain = 0;
      let self = this;

      let movableOnMouseMove = function (e) {
        //console.log("mouse move");
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
        //        document.removeEventListener("mousemove", movableOnMouseMove);
        //        document.removeEventListener("mouseup", movableOnMouseUp);
        self.updateIFrameSize();
        self.$refs["outputWindow"].style.pointerEvents = "auto";
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
        isDragging = true;
        document.addEventListener("mousemove", movableOnMouseMove);
        document.addEventListener("mouseup", movableOnMouseUp);
        // cancel iframe mouse event https://www.gyrocode.com/articles/how-to-detect-mousemove-event-over-iframe-element/
        self.$refs["outputWindow"].style.pointerEvents = "none";

        e.stopPropagation();
        e.preventDefault();
      };

      self.updateIFrameSize();

      editor = monaco.editor.create(document.getElementById("container"), {
        value: html,
        language: "html",
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
    });
  },
  methods: {
    getChapters: function () {
      let uri = window.location.href.split("#");
      if (uri.length == 2) {
        let chapter = uri[1];
        return chapter;
      }
      return "default";
    },
    onFile1: function () {
      console.log(this.editor);
      editor.getModel().setValue("test");
    },
    onFile2: function () {
      const html_string = editor.getModel().getValue();
      let newHTMLDocument =
        document.implementation.createHTMLDocument("preview");
      newHTMLDocument.documentElement.innerHTML = html_string;
      let base = document.createElement("base");
      base.setAttribute("href", "test_base/");
      newHTMLDocument.head.appendChild(base);
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
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
</style>
