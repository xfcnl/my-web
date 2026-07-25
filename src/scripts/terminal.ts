const TOOLS = [
  {
    name: "VICP 备案",
    url: "https://mikufans.qzz.io",
    desc: "虚拟备案系统",
    icon: "fa-shield-halved",
  },
  {
    name: "术曲下载",
    url: "/songs-download",
    desc: "下载术力口歌曲",
    icon: "fa-music",
  },
  { name: "画廊", url: "/gallery", desc: "图片展示", icon: "fa-images" },
  {
    name: "返回博客",
    url: "https://xfcnl.github.io",
    desc: "主站 xf_blog",
    icon: "fa-blog",
  },
];

interface Command {
  name: string;
  desc: string;
  usage?: string;
  fn: (args: string[]) => string | string[];
}

let isRoot = false;
const history: string[] = [];
let historyIndex = -1;
const bootLines = [
  {
    text: "[  \x1b[32m  OK  \x1b[0m  ] Started xf_blog.service - Personal terminal portal",
    delay: 80,
  },
  {
    text: "[  \x1b[32m  OK  \x1b[0m  ] Reached target xf_blog.session",
    delay: 60,
  },
  {
    text: "[  \x1b[32m  OK  \x1b[0m  ] Listening on port 22 (SSH mock)",
    delay: 100,
  },
  { text: "", delay: 40 },
  {
    text: "  ██╗  ██╗███████╗     ██████╗ ██╗      ██████╗  ██████╗ ",
    delay: 20,
  },
  {
    text: "  ╚██╗██╔╝╚══███╔╝    ██╔══██╗██║     ██╔═══██╗██╔════╝ ",
    delay: 20,
  },
  {
    text: "   ╚███╔╝   ███╔╝     ██████╔╝██║     ██║   ██║██║  ███╗",
    delay: 20,
  },
  {
    text: "   ██╔██╗  ███╔╝      ██╔══██╗██║     ██║   ██║██║   ██║",
    delay: 20,
  },
  {
    text: "  ██╔╝ ██╗███████╗    ██████╔╝███████╗╚██████╔╝╚██████╔╝",
    delay: 20,
  },
  {
    text: "  ╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ",
    delay: 20,
  },
  { text: "", delay: 30 },
  { text: "  \x1b[36mWelcome to xf_blog terminal v2.0\x1b[0m", delay: 60 },
  {
    text: "  \x1b[33mType `help` to see available commands\x1b[0m",
    delay: 100,
  },
  { text: "", delay: 50 },
];

const commands: Command[] = [
  {
    name: "help",
    desc: "显示帮助信息",
    fn: () => {
      const lines = ["\x1b[1;36m可用命令:\x1b[0m", ""];
      for (const cmd of commands) {
        const usage = cmd.usage ? ` \x1b[33m${cmd.usage}\x1b[0m` : "";
        lines.push(
          `  \x1b[32m${cmd.name.padEnd(12)}\x1b[0m ${cmd.desc}${usage}`,
        );
      }
      lines.push(
        "",
        "\x1b[2mTab = 自动补全 | ↑↓ = 历史 | Ctrl+L = 清屏\x1b[0m",
      );
      return lines;
    },
  },
  {
    name: "about",
    desc: "关于本站",
    fn: () => [
      "\x1b[1;36mxf_blog — lm-xiao-fen 的个人小角落\x1b[0m",
      "",
      "这是 lm-xiao-fen 的个人副站，用于放置一些小工具 / 实验页面 / 临时项目。",
      "本站使用 \x1b[36mAstro\x1b[0m + \x1b[36mTailwind CSS\x1b[0m 构建，终端风格界面。",
      "",
      `运行时间: ${formatUptime()}`,
      "正式博客: \x1b[4;36mhttps://xfcnl.github.io\x1b[0m",
    ],
  },
  {
    name: "whoami",
    desc: "显示当前用户",
    fn: () => [isRoot ? "lm-xiao-fen" : "user"],
  },
  {
    name: "time",
    desc: "显示当前时间",
    usage: "[utc|cst]",
    fn: (args) => {
      const now = new Date();
      const tz = args[0]?.toLowerCase();
      if (tz === "utc") {
        return [`UTC: ${now.toUTCString().split(" ")[4]}`];
      }
      if (tz === "cst") {
        const cst = now.toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
          hour12: false,
        });
        return [`CST: ${cst.split(" ")[1] || cst}`];
      }
      return [
        `UTC: ${now.toUTCString().split(" ")[4]}`,
        `CST: ${now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}`,
        "",
        "\x1b[2m使用 `time utc` 或 `time cst` 查看单个时区\x1b[0m",
      ];
    },
  },
  {
    name: "date",
    desc: "显示当前日期",
    fn: () => {
      const now = new Date();
      return [
        now.toLocaleDateString("zh-CN", {
          timeZone: "Asia/Shanghai",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ];
    },
  },
  {
    name: "tools",
    desc: "列出可用小工具",
    fn: () => {
      const lines = ["\x1b[1;36m小工具:\x1b[0m", ""];
      for (const t of TOOLS) {
        lines.push(
          `  \x1b[32m${t.name.padEnd(12)}\x1b[0m \x1b[2m→\x1b[0m \x1b[36m${t.url}\x1b[0m  ${t.desc}`,
        );
      }
      return lines;
    },
  },
  {
    name: "ls",
    desc: "列出目录内容",
    usage: "[-la]",
    fn: (args) => {
      const long =
        args.includes("-l") || args.includes("-la") || args.includes("-al");
      if (long) {
        return [
          "drwxr-xr-x  2 guest guest  4.0K Jul 24 12:00 \x1b[34m.\x1b[0m",
          "drwxr-xr-x  3 guest guest  4.0K Jul 24 12:00 \x1b[34m..\x1b[0m",
          "drwxr-xr-x  2 guest guest  4.0K Jul 24 12:00 \x1b[34mgallery\x1b[0m",
          "drwxr-xr-x  2 guest guest  4.0K Jul 24 12:00 \x1b[34msongs\x1b[0m",
          "-rw-r--r--  1 guest guest   220 Jul 24 12:00 \x1b[0mREADME.md",
          "-rwxr-xr-x  1 guest guest   128 Jul 24 12:00 \x1b[32mxfetch\x1b[0m",
        ];
      }
      return [
        "\x1b[34mgallery/\x1b[0m  \x1b[34msongs/\x1b[0m  README.md  \x1b[32mxfetch\x1b[0m",
      ];
    },
  },
  {
    name: "cd",
    desc: "切换目录",
    usage: "<dir>",
    fn: (args) => {
      const dir = args[0];
      if (!dir) return [];
      if (dir === "gallery") {
        window.location.href = "/gallery";
        return [];
      }
      if (dir === "songs" || dir === "songs-download") {
        window.location.href = "/songs-download";
        return [];
      }
      if (dir === ".." || dir === "/") return [];
      if (dir === "blog" || dir === "xf_blog") {
        window.open("https://xfcnl.github.io", "_blank");
        return ["\x1b[33mOpening xf_blog...\x1b[0m"];
      }
      return [`\x1b[31mcd: no such file or directory: ${dir}\x1b[0m`];
    },
  },
  {
    name: "gallery",
    desc: "打开画廊",
    fn: () => {
      window.location.href = "/gallery";
      return ["\x1b[33mOpening gallery...\x1b[0m"];
    },
  },
  {
    name: "songs",
    desc: "打开术曲下载站",
    fn: () => {
      window.location.href = "/songs-download";
      return ["\x1b[33mOpening songs download...\x1b[0m"];
    },
  },
  {
    name: "blog",
    desc: "打开主站博客",
    fn: () => {
      window.open("https://xfcnl.github.io", "_blank");
      return ["\x1b[33mOpening xf_blog...\x1b[0m"];
    },
  },
  {
    name: "echo",
    desc: "输出文本",
    usage: "<text>",
    fn: (args) => [args.join(" ") || ""],
  },
  {
    name: "clear",
    desc: "清屏",
    fn: () => {
      const output = document.getElementById("terminal-output")!;
      output.innerHTML = "";
      return [];
    },
  },
  {
    name: "neofetch",
    desc: "显示系统信息（彩蛋）",
    fn: () => [
      "\x1b[36m                   \x1b[0m",
      "\x1b[36m   \x1b[0m \x1b[1mxf_blog\x1b[0m",
      "\x1b[36m                   \x1b[0m",
      "\x1b[32m  OS:\x1b[0m        xf_blog OS v2.0",
      "\x1b[32m  Host:\x1b[0m      CloudFlare",
      "\x1b[32m  Kernel:\x1b[0m    JavaScript ES2024",
      "\x1b[32m  Uptime:\x1b[0m    " + formatUptime(),
      "\x1b[32m  Shell:\x1b[0m     xfsh 2.0",
      "\x1b[32m  Theme:\x1b[0m     Terminal",
      "\x1b[32m  CPU:\x1b[0m       CloudFlare Pages/Workers (2) @ Unknown GHz",
      "\x1b[32m  Memory:\x1b[0m    AI-assisted / 512MB",
      "\x1b[32m  Editor:\x1b[0m    opencode",
      "\x1b[32m  ID:\x1b[0m        xfcnl",
      "\x1b[32m  Uptime:\x1b[0m    since 2025",
      "",
      '\x1b[2m  "I use AI btw" — xiaofen\x1b[0m',
    ],
  },
  {
    name: "history",
    desc: "查看命令历史",
    fn: () => {
      if (!history.length) return ["(history empty)"];
      return history.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`);
    },
  },
  {
    name: "uptime",
    desc: "显示运行时间",
    fn: () => [`系统运行时间: ${formatUptime()}`],
  },
  {
    name: "su",
    desc: "切换为 root 用户",
    usage: "",
    fn: () => {
      if (isRoot) return ["\x1b[33m已经是 root 用户\x1b[0m"];
      isRoot = true;
      updatePrompt();
      return ["\x1b[32m切换到 root\x1b[0m"];
    },
  },
  {
    name: "sudo",
    desc: "以 root 权限执行命令",
    usage: "<cmd>",
    fn: (args) => {
      if (args[0] === "su" || args[0] === "-i" || args[0] === "-s") {
        if (isRoot) return ["\x1b[33m已经是 root 用户\x1b[0m"];
        isRoot = true;
        updatePrompt();
        return ["\x1b[32m切换到 root\x1b[0m"];
      }
      return [`\x1b[31m未授权: ${args.join(" ")}\x1b[0m`];
    },
  },
  {
    name: "exit",
    desc: "退出 root 用户",
    fn: () => {
      if (!isRoot) return [];
      isRoot = false;
      updatePrompt();
      return [];
    },
  },
];

function formatUptime(): string {
  const start =
    window.performance?.timing?.navigationStart || Date.now() - 60000;
  const diff = Math.floor((Date.now() - start) / 1000);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

function findCommand(name: string): Command | undefined {
  return commands.find((c) => c.name === name);
}

function getCompletions(prefix: string): string[] {
  if (!prefix) return commands.map((c) => c.name);
  return commands.filter((c) => c.name.startsWith(prefix)).map((c) => c.name);
}

const outputEl = document.getElementById("terminal-output")!;

function writeOutput(text: string): void {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.innerHTML = ansiToHtml(text);
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function writeCommandLine(cmd: string): void {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.innerHTML = `<span class="prompt">${isRoot ? "root" : "guest"}@xf_blog:<span class="prompt-path">~</span>${isRoot ? "#" : "$"}</span> <span class="cmd-text">${escapeHtml(cmd)}</span>`;
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function writeBootLine(text: string): void {
  const line = document.createElement("div");
  line.className = "terminal-line boot-line";
  line.innerHTML = ansiToHtml(text);
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function ansiToHtml(text: string): string {
  if (!text) return "&nbsp;";
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\x1b\[1;36m/g, '<span class="ansi-bold-cyan">')
    .replace(/\x1b\[1m/g, '<span class="ansi-bold">')
    .replace(/\x1b\[32m/g, '<span class="ansi-green">')
    .replace(/\x1b\[33m/g, '<span class="ansi-yellow">')
    .replace(/\x1b\[36m/g, '<span class="ansi-cyan">')
    .replace(/\x1b\[34m/g, '<span class="ansi-blue">')
    .replace(/\x1b\[31m/g, '<span class="ansi-red">')
    .replace(/\x1b\[2m/g, '<span class="ansi-dim">')
    .replace(/\x1b\[4;36m/g, '<span class="ansi-underline-cyan">')
    .replace(/\x1b\[0m/g, "</span>");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function runBootSequence(): Promise<void> {
  for (const line of bootLines) {
    if (line.text) {
      writeBootLine(line.text);
    } else {
      const empty = document.createElement("div");
      empty.className = "terminal-line";
      empty.innerHTML = "&nbsp;";
      outputEl.appendChild(empty);
    }
    await new Promise((r) => setTimeout(r, line.delay));
  }
}

function processCommand(input: string): void {
  const trimmed = input.trim();
  if (!trimmed) {
    writeCommandLine("");
    return;
  }

  history.push(trimmed);
  historyIndex = history.length;
  writeCommandLine(trimmed);

  const parts = trimmed.split(/\s+/);
  const cmdName = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (cmdName === "clear") {
    outputEl.innerHTML = "";
    return;
  }

  const cmd = findCommand(cmdName);
  if (!cmd) {
    writeOutput(`\x1b[31mxfsh: command not found: ${cmdName}\x1b[0m`);
    writeOutput(`\x1b[2m  Try \`help\` to see available commands\x1b[0m`);
    return;
  }

  const result = cmd.fn(args);
  if (Array.isArray(result)) {
    for (const line of result) {
      writeOutput(line);
    }
  }
}

const inputEl = document.getElementById("terminal-input") as HTMLInputElement;
const promptEl = document.getElementById("prompt")!;

function updatePrompt(dir?: string): void {
  const d = dir ?? currentDir;
  if (isRoot) {
    promptEl.innerHTML = `root@xf_blog:<span class="prompt-path">${escapeHtml(d)}</span>#`;
  } else {
    promptEl.innerHTML = `guest@xf_blog:<span class="prompt-path">${escapeHtml(d)}</span>$`;
  }
}

let currentDir = "~";

function updateInputDisplay(): void {
  const display = document.getElementById("input-display")!;
  const val = inputEl.value;
  if (!val) {
    display.innerHTML = '<span class="cursor-blink">█</span>';
  } else {
    const before = val.slice(0, inputEl.selectionStart || val.length);
    const after = val.slice(inputEl.selectionStart || val.length);
    display.innerHTML = `${escapeHtml(before)}<span class="cursor-blink">█</span>${escapeHtml(after)}`;
  }
}

inputEl.addEventListener("input", updateInputDisplay);
inputEl.addEventListener("click", updateInputDisplay);
inputEl.addEventListener("keyup", updateInputDisplay);

inputEl.addEventListener("keydown", (e) => {
  const val = inputEl.value;

  if (e.key === "Enter") {
    e.preventDefault();
    processCommand(val);
    inputEl.value = "";
    updateInputDisplay();
    updatePrompt("~");
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      inputEl.value = history[historyIndex];
      updateInputDisplay();
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      inputEl.value = history[historyIndex];
    } else {
      historyIndex = history.length;
      inputEl.value = "";
    }
    updateInputDisplay();
    return;
  }

  if (e.key === "Tab") {
    e.preventDefault();
    const prefix = val.trim().split(/\s+/)[0] || "";
    const completions = getCompletions(prefix);
    if (completions.length === 1) {
      inputEl.value = completions[0] + " ";
      updateInputDisplay();
    } else if (completions.length > 1) {
      writeCommandLine(val);
      writeOutput("\x1b[36m" + completions.join("  ") + "\x1b[0m");
    }
    return;
  }

  if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    outputEl.innerHTML = "";
    return;
  }
});

inputEl.addEventListener("blur", () => {
  setTimeout(() => inputEl.focus(), 10);
});

document.addEventListener("click", () => {
  inputEl.focus();
});

const inputDisplay = document.getElementById("input-display");
if (inputDisplay) {
  inputDisplay.addEventListener("click", () => inputEl.focus());
}

async function init(): Promise<void> {
  await runBootSequence();
  setPrompt("~");
  updateInputDisplay();
  inputEl.focus();
}

init();
