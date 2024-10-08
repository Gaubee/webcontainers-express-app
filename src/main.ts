import "./style.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files.ts";
import { installTerminal } from "./terminal.ts";
import { timeTrack } from "./helper.ts";

const html = String.raw;

if (location.search.includes("hook")) {
  globalThis.WEBCONTAINER_API_IFRAME_URL = "https://stackblitz.gaubee.local";
}
const app_template = html`<div class="container">
    <div class="editor">
      <textarea>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe src="loading.html"></iframe>
    </div>
  </div>
  <div class="terminal"></div>
  <fieldset class="toolbar" disabled>
    <legend>shortcut</legend>
    <button data-cmd="npm install">install deps</button>
    <button data-cmd="npm run start">start server</button>
    <button data-cmd="node output.js">start bundle server</button>
  </fieldset>`;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = app_template;

const textareaEl =
  document.querySelector<HTMLTextAreaElement>(".editor textarea")!;

const iframeEl = document.querySelector<HTMLIFrameElement>(".preview iframe")!;

let webcontainerInstance: WebContainer;

window.addEventListener("load", () => {
  installTerminal(async () => {
    textareaEl.value = files["index.js"].file.contents;
    textareaEl.addEventListener("input", () => {
      writeIndexJS(textareaEl.value);
    });

    // Call only once
    await timeTrack("boot & mount", async () => {
      webcontainerInstance = await WebContainer.boot();
      await webcontainerInstance.mount(files);
    });

    // const exitCode = await installDependencies();
    // if (exitCode !== 0) {
    //   throw new Error("Installation failed");
    // }
    // Wait for `server-ready` event
    webcontainerInstance.on("server-ready", (port, url) => {
      console.log("server-ready", port, url);
      iframeEl.src = url;
    });
    // startDevServer();
    return webcontainerInstance;
  });
});

async function writeIndexJS(content: string) {
  await webcontainerInstance.fs.writeFile("/index.js", content);
}
