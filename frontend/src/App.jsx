import { createSignal, onMount, For } from 'solid-js'
import styles from './App.module.css'
import MenuItem from './MenuItem';
import theme from "./assets/CodeStage.json";
import logo from "./assets/logo2.png";
import { IoMenuSharp } from 'solid-icons/io'
import { AiOutlineFile } from 'solid-icons/ai'
import { FaBrandsSquareGit } from 'solid-icons/fa'
import { FaSolidPlay } from 'solid-icons/fa'
import * as monaco from "monaco-editor";

function App() {

  function prefixSubPath(path) {
    return "$$_codestage_prefix_$$" + (path ? '/' + path : '');
  }

  function isMobile() {
    if (screen.width <= 760) {
      return true;
    } else {
      return false;
    }
  }

  let menu = null;
  let main = null;
  let container = null;
  let movableBar = null;
  let output = null;
  let outputWindow = null;
  let editor = null;
  let loadedFiles = new Map();

  const [content, setContent] = createSignal({});
  let currentFolder = {};
  const [files, setFiles] = createSignal([]);
  let fileRefs = [];
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  function onMenuButtonClicked(e) {
    console.log("onMenuButtonClicked called")
    if (isMenuOpen()) {
      setIsMenuOpen(false);
    } else {
      console.log("set true")
      setIsMenuOpen(true);
    }
  }

  function openRepo(url) {
    window.open(url, "_blank");
  }

  async function displayReadme() {
    const filePath = "readme/index.html";
    let file = await fetch(filePath);
    let html_string = await file.text();

    let newHTMLDocument =
      document.implementation.createHTMLDocument("preview");
    newHTMLDocument.documentElement.innerHTML = html_string;

    let existing = newHTMLDocument.head.getElementsByTagName("base");
    if (existing.length > 0) {
      for (let e = 0; e < existing.length; ++e) {
        existing[e].setAttribute(
          "href",
          "/" + prefixSubPath(currentFolder.folder) + '/'
        );
      }
    } else {
      let base = document.createElement("base");
      base.setAttribute(
        "href",
        "/" + prefixSubPath(currentFolder.folder) + '/'
      );
      newHTMLDocument.head.appendChild(base);
    }

    let iframeDoc = outputWindow.contentDocument;
    iframeDoc.removeChild(iframeDoc.documentElement);
    outputWindow.srcdoc =
      newHTMLDocument.documentElement.innerHTML;
  }

  async function onRun() {
    const filePath = currentFolder.folder + "/index.html";
    const model = await fetchFileByPath(filePath);
    const html_string = model.getValue();

    let newHTMLDocument =
      document.implementation.createHTMLDocument("preview");
    newHTMLDocument.documentElement.innerHTML = html_string;

    let styleTags = newHTMLDocument.getElementsByTagName("link");

    for (let t = 0; t < styleTags.length; ++t) {
      const href = styleTags[t].getAttribute("href");

      if (href) {
        for (let f of currentFolder.files) {
          if (f.filename === href) {
            const path = currentFolder.folder + "/" + href;

            const model = await fetchFileByPath(path);
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
        for (let f of currentFolder.files) {
          if (f.filename === src) {
            const path = currentFolder.folder + "/" + src;
            scriptTags[t].removeAttribute("src");
            const model = await fetchFileByPath(path);
            const script_string = model.getValue();
            scriptTags[t].textContent = script_string;
            break;
          }
        }
      }
    }

    let existing = newHTMLDocument.head.getElementsByTagName("base");
    if (existing.length > 0) {
      for (let e = 0; e < existing.length; ++e) {
        existing[e].setAttribute(
          "href",
          "/" + prefixSubPath(currentFolder.folder) + '/'
        );
      }
    } else {
      let base = document.createElement("base");
      base.setAttribute(
        "href",
        "/" + prefixSubPath(currentFolder.folder) + '/'
      );
      newHTMLDocument.head.appendChild(base);
    }

    let iframeDoc = outputWindow.contentDocument;
    iframeDoc.removeChild(iframeDoc.documentElement);
    outputWindow.srcdoc =
      newHTMLDocument.documentElement.innerHTML;
  }

  function getFirstFolderDetails(defaultSample) {
    function helper(node) {
      if (node.folder) {
        if (defaultSample !== null && node.folder === defaultSample) {
          return node;
        }
        else if (defaultSample === null) {
          return node;
        }
      }

      if (node.sub_chapters && node.sub_chapters.length > 0) {
        for (let n of node.sub_chapters) {
          const r = helper(n);
          if (r !== null) {
            return r;
          }
        }
      }
      return null;
    }

    for (let n of content().content) {
      const r = helper(n);
      if (r !== null) {
        return r;
      }
    }
    return null;
  }

  function getDetailsByFolder(folderName) {
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

    for (let n of content().content) {
      const r = helper(n);
      if (r !== null) {
        return r;
      }
    }
    return null;
  }

  async function fetchContent() {
    let manifest = await fetch("manifest.json");
    let jsonContent = await manifest.json();
    return jsonContent;
  }

  function onLoadSample(e) {
    console.log(e);
    setIsMenuOpen(false);
    window.location.href = prefixSubPath();
    window.location.hash = "#" + e.folder;
    window.location.reload();
  }

  async function fetchFileByPath(filePath) {
    if (loadedFiles.has(filePath)) {
      const model = loadedFiles.get(filePath);
      return model;
    } else {
      let file = await fetch(filePath);
      let fileContent = await file.text();
      const model = monaco.editor.createModel(
        fileContent,
        undefined, // language
        monaco.Uri.file(filePath) // uri
      );
      loadedFiles.set(filePath, model);
      return model;
    }
  }

  async function onLoadFile(e, f) {
    for (let re of fileRefs) {
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

    const filePath = currentFolder.folder + "/" + f.filename;
    const model = await fetchFileByPath(filePath);
    editor.setModel(model);
    if (f.is_readonly == true) {
      editor.updateOptions({ readOnly: true });
    } else {
      editor.updateOptions({ readOnly: false });
    }

    document.title = currentFolder.title + " - " + f.filename;

    if (content().readme_folder) {
      console.log("show readme", content().readme_folder)
      displayReadme();
    }
    else {
      console.log("no readme folder")
    }
  }

  function updateIFrameSize() {
    const outputRect = document
      .getElementById("output")
      .getBoundingClientRect();

    outputWindow.style.width = outputRect.width + "px";
    outputWindow.style.height = outputRect.height + "px";
  }

  onMount(async () => {
    if (isMobile()) {
      return;
    }

    setContent(await fetchContent());
    document.title = content().title;

    let folder = window.location.hash;
    if (folder.length > 0) {
      folder = folder.substring(1);
    } else {
      folder = null;
    }

    currentFolder =
      (folder && getDetailsByFolder(folder)) ||
      getFirstFolderDetails(content().default_sample ? content().readme_folder : null);

    if (currentFolder !== null) {
      setFiles([...currentFolder.files]);
    }

    let mouseX = 0;
    let panelLeft = 0;
    let panelRight = 0;
    let panelMain = 0;

    let movableOnMouseMove = function (e) {
      e.stopPropagation();
      e.preventDefault();
      const dx = e.screenX - mouseX;
      panelLeft = container.getBoundingClientRect().width;
      panelRight = output.getBoundingClientRect().width;
      panelMain = main.getBoundingClientRect().width;
      const left = ((panelLeft + dx) * 100) / panelMain;

      container.style.width = `${left}%`;
      const right = ((panelRight - dx) * 100) / panelMain;
      output.style.width = `${right}%`;
      mouseX = e.screenX;
    };

    let movableOnMouseUp = function (event) {
      event.stopPropagation();
      event.preventDefault();
      document.removeEventListener("mousemove", movableOnMouseMove);
      document.removeEventListener("mouseup", movableOnMouseUp);
      updateIFrameSize();
      outputWindow.style.pointerEvents = "auto";
      container.style.pointerEvents = "auto";
    };

    let timer = null;
    window.onresize = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        updateIFrameSize();
      }, 500);
    };

    movableBar.onmousedown = function (e) {
      mouseX = e.screenX;
      document.addEventListener("mousemove", movableOnMouseMove);
      document.addEventListener("mouseup", movableOnMouseUp);
      // cancel iframe mouse event https://www.gyrocode.com/articles/how-to-detect-mousemove-event-over-iframe-element/
      outputWindow.style.pointerEvents = "none";
      container.style.pointerEvents = "none";

      e.stopPropagation();
      e.preventDefault();
    };

    updateIFrameSize();

    window.MonacoEnvironment = {
      getWorkerUrl: function (workerId, label) {
        console.log("moduleid", workerId, label)
        if (workerId === 'workerMain.js') {
          return 'assets/vs/base/worker/' + workerId;
        }
      }
    }

    monaco.editor.defineTheme("codestage", theme);
    monaco.editor.setTheme("codestage");

    editor = monaco.editor.create(container, {
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

    onLoadFile(null, files()[0]);

  });

  return (
    <Show when={!isMobile()}
      fallback={<>
        <img src={logo} style="width:100vw" />
        <p>Only desktop browsers are supported.</p>
      </>}>
      <div style="width: 100%; display: flex; flex-direction: column">
        <div ref={menu} class={styles.Menu} classList={{ slide: isMenuOpen() }}>
          <h2 class={styles.MenuTitle}>{content().title}</h2>
          <div class={styles.MenuContent}>
            <ul>
              <For each={content().content}>
                {(item, i) =>
                  <MenuItem
                    key={item.title}
                    item={item}
                    load={onLoadSample}
                  ></MenuItem>}
              </For>
            </ul>
          </div>
        </div>
        <div class={styles.ToolBar}>
          <button
            style="z-index: 200"
            onClick={onMenuButtonClicked}
            class={styles.TabButton}
          >
            <IoMenuSharp style="vertical-align: middle" />
          </button>
          <For each={files()}>
            {(f, i) =>
              <button
                filename={f.filename}
                key={f.filename}
                ref={el => fileRefs.push(el)}
                onclick={
                  (e) => {
                    onLoadFile(e, f);
                  }}

                class={styles.TabButton}
              >
                <AiOutlineFile style="vertical-align: middle" />
                <span class={styles.TabButtonText}>{f.filename}</span>
              </button >
            }
          </For>
          <div style="flex-grow: 1"></div>
          <Show when={content().repo}>
            <button
              onclick={e => openRepo(content().repo)}
              class={styles.TabButton}
            >
              <FaBrandsSquareGit style="vertical-align: middle" />
              <span class={styles.TabButtonText}>REPO</span>
            </button >
          </Show>
          <button onClick={onRun} class={styles.TabButton} >
            <FaSolidPlay style="vertical-align: middle" />
            <span class={styles.TabButtonText}>RUN</span>
          </button >
        </div >
        <div class={styles.Main} ref={main}>
          <div class={styles.Editor} id="container" ref={container}></div>
          <div id="adjust-bar" ref={movableBar}></div>
          <div class={styles.Output} id="output" ref={output}>
            <iframe ref={outputWindow} class={styles.Sandbox}></iframe>
          </div>
        </div>
      </div>
    </Show>)
}

export default App