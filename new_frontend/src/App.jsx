import { createSignal } from 'solid-js'
import styles from './App.css'
import MenuItem from './MenuItem';

function App() {

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

  function onMenuButtonClicked(e) {

  }

  function openRepo(repo) { }

  function onRun(e) { }

  return (
    <>
      <Show when={!isMobile()} style="width: 100%; display: flex; flex-direction: column"
        fallback={<>
          <img src="../assets/logo2.png" style="width:100vw" />
          <p>Only desktop browsers are supported.</p>
        </>}>
        <div ref={menu} class={styles.Menu}>
          <h2 class={styles.MenuTitle}>{content.title}</h2>
          <div class={styles.MenuContent}>
            <ul>
              <For each={content.content()}>
                {(item, i) =>
                  <MenuItem
                    key={item.title}
                    item={item}
                  ></MenuItem>}
              </For>
            </ul>
          </div>
        </div>
        <div class={styles.ToolBar}>
          <button
            style="z-index: 200"
            onclick={onMenuButtonClicked}
            class={styles.TabButton}
          >
            <menu-icon style="vertical-align: middle"></menu-icon>
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
                <file-outline-icon style="vertical-align: middle"></file-outline-icon>
                <span class={styles.TabButtonText}>{f.filename}</span>
              </button >
            }
          </For>
          <div style="flex-grow: 1"></div>
          <Show when={content.repo}>
            <button
              onclick={e => openRepo(content.repo)}
              class={styles.TabButton}
            >
              <git-icon style="vertical-align: middle"></git-icon>
              <span class={styles.TabButtonText}>REPO</span>
            </button >
          </Show>
          <button onclick={onRun} class={styles.TabButton} >
            <play-icon style="vertical-align: middle"></play-icon>
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
      </Show>
    </>
  )
}

export default App
