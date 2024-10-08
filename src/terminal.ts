import "@xterm/xterm/css/xterm.css";
import { WebContainer } from "@webcontainer/api";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { timeTrack } from "./helper";

export const installTerminal = async (
  getWebcontainerInstance: () => Promise<WebContainer>
) => {
  const terminalEl = document.querySelector<HTMLDivElement>(".terminal")!;
  const terminal = new Terminal({
    convertEol: true,
  });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(terminalEl);
  fitAddon.fit();
  terminal.write("启动中...\n");
  const webcontainerInstance = await getWebcontainerInstance();
  terminal.clear();

  const spawn = async (args: string[]) => {
    const process = await webcontainerInstance.spawn(args[0], args.slice(1));
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      })
    );
    return process;
  };

  const toolbarEle = document.querySelector<HTMLFieldSetElement>(".toolbar")!;
  toolbarEle.disabled = false;
  toolbarEle.querySelectorAll<HTMLButtonElement>(" button").forEach((btn) => {
    const cmd = btn.dataset.cmd!;
    btn.addEventListener("click", () => {
      timeTrack(cmd, async () => {
        terminal.write("\n ❯ " + cmd + "\n");
        const args = cmd.split(/\s/);
        await spawn(args);
      });
    });
  });

  //   const shellProcess = await spawn(["jsh"]);
  //   const input = shellProcess.input.getWriter();
  //   terminal.onData((data) => {
  //     input.write(data);
  //   });
  //   return shellProcess;
};
