"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";

// === Terminal-Style Portfolio — Single-file React Component ===
// How to use:
// - Drop this component into a Vite/Next/CRA app and render <TerminalPortfolio />
// - Tailwind is recommended. Minimal inline fallback styles are included.
// - All commands are implemented client-side; edit the PROFILE/PROJECTS const to customize.

export default function TerminalPortfolio() {
  // ----- PROFILE DATA (edit to your info) -----
  const PROFILE = {
    name: "Husen Azis",
    handle: "husen",
    title: "Web Programmer @ EasySoft",
    location: "Jakarta, ID",
    tech: ["PHP", "Go", "Java", "Node.js", "MySQL", "Tailwind", "Socket.IO"],
    email: "you@example.com",
    socials: {
      github: "https://github.com/yourname",
      linkedin: "https://www.linkedin.com/in/yourname/",
      x: "https://x.com/yourname",
    },
    repo: "https://github.com/yourname/terminal-portfolio",
  };

  const PROJECTS = [
    {
      name: "PPOB Engine",
      stack: ["Go", "PostgreSQL", "gRPC"],
      desc: "Payment hub with VA/QRIS integration, retry queue, and observability.",
      url: "https://example.com/ppob",
    },
    {
      name: "Chat Realtime Module",
      stack: ["Node.js", "Socket.IO", "Redis"],
      desc: "Modular WebSocket chat with pagination + emoji decoding.",
      url: "https://example.com/chat",
    },
    {
      name: "Interactive Portfolio",
      stack: ["React", "Tailwind"],
      desc: "Terminal-style portfolio with command router (this site).",
      url: "https://example.com/portfolio",
    },
  ];

  // ----- THEMES -----
  const THEMES = {
    dark: {
      bg: "bg-[#0b0f14]",
      text: "text-zinc-100",
      dim: "text-zinc-400",
      accent: "text-emerald-400",
      prompt: "text-emerald-400",
      caret: "bg-emerald-400",
      link: "text-emerald-300 hover:text-emerald-200 underline",
    },
    light: {
      bg: "bg-zinc-50",
      text: "text-zinc-900",
      dim: "text-zinc-600",
      accent: "text-emerald-700",
      prompt: "text-emerald-700",
      caret: "bg-emerald-700",
      link: "text-emerald-700 hover:text-emerald-600 underline",
    },
    matrix: {
      bg: "bg-black",
      text: "text-green-100",
      dim: "text-green-600",
      accent: "text-green-400",
      prompt: "text-green-400",
      caret: "bg-green-400",
      link: "text-green-300 hover:text-green-200 underline",
    },
  } as const;

  // ----- STATE -----
  const [theme, setTheme] = useState<keyof typeof THEMES>(() => (typeof window === "undefined" ? "dark" : localStorage.getItem("theme") as keyof typeof THEMES) || "dark");
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("cli_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [pointer, setPointer] = useState<number>(-1);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TermLine[]>(() => [
    { type: "banner", text: banner(PROFILE) },
    { type: "text", text: `Type 'help' to get started. Press Tab for autocomplete.` },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  type TermLine = { type: "text" | "cmd" | "error" | "banner" | "html"; text: string };

  // ----- EFFECTS -----
  useEffect(() => {
    if (typeof window !== "undefined"){
        localStorage.setItem("cli_history", JSON.stringify(history.slice(-300)));
    }
  }, [history]);

  useEffect(() => {
    if (typeof window !== "undefined"){
        localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    // Auto scroll to bottom
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);

  useEffect(() => {
    // Focus input on mount/click anywhere
    const focus = () => inputRef.current?.focus();
    focus();
    const handler = () => focus();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // ----- COMMANDS -----
  const COMMANDS = useMemo(() => {
    const fmt = {
      link: (label: string, url: string) => `<a href="${url}" target="_blank" rel="noreferrer" class='${THEMES[theme].link}'>${label}</a>`,
      key: (t: string) => `<span class='${THEMES[theme].accent}'>${t}</span>`,
      dim: (t: string) => `<span class='${THEMES[theme].dim}'>${t}</span>`,
      code: (t: string) => `<code class='px-1 rounded bg-white/5 border border-white/10'>${escapeHtml(t)}</code>`,
    };

    return {
      help: () => [
        `Available commands:`,
        `${fmt.key("help")} – show this help`,
        `${fmt.key("about")} – whoami + stack`,
        `${fmt.key("skills")} – list core skills`,
        `${fmt.key("projects")} – portfolio projects`,
        `${fmt.key("contact")} – email & socials`,
        `${fmt.key("ls")} – list sections`,
        `${fmt.key("cat readme")} – show intro`,
        `${fmt.key("theme")} ${fmt.dim("[dark|light|matrix]")} – switch theme`,
        `${fmt.key("clear")} – clear the screen`,
        `${fmt.key("echo")} ${fmt.dim("<text>")} – print text`,
        `${fmt.key("date")} – show current date/time`,
        `${fmt.key("repo")} – open project repo`,
        `${fmt.key("social")} ${fmt.dim("[github|linkedin|x]")} – open links`,
      ].join("\n"),

      about: () => [
        `Name   : ${PROFILE.name}`,
        `Role   : ${PROFILE.title}`,
        `Location: ${PROFILE.location}`,
        `Stack  : ${PROFILE.tech.join(", ")}`,
        `\nI'm a web programmer building payment, chat, and portal features. I love clean code, reliable systems, and smooth DX.`,
      ].join("\n"),

      skills: () => `Skills -> ${PROFILE.tech.join(", ")}`,

      projects: () =>
        PROJECTS.map(
          (p, i) => `${i + 1}. ${p.name} — [${p.stack.join(", ")}]\n   ${p.desc}\n   ${fmt.link(p.url.replace(/^https?:\/\//, ""), p.url)}`
        ).join("\n\n"),

      contact: () => [
        `Email  : ${fmt.link(PROFILE.email, `mailto:${PROFILE.email}`)}`,
        `GitHub : ${fmt.link("github.com/husenazs", PROFILE.socials.github)}`,
        `LinkedIn: ${fmt.link("linkedin.com/in/husenazs", PROFILE.socials.linkedin)}`,
        `X/Twitter: ${fmt.link("x.com/husenazs", PROFILE.socials.x)}`,
      ].join("\n"),

      ls: () => ["about", "skills", "projects", "contact", "readme"].join("  "),

      cat: (arg?: string) => {
        if (arg?.toLowerCase() === "readme") return readme();
        return `cat: ${arg || "<file>"}: No such file`;
      },

      theme: (arg?: string) => {
        if (!arg) return `Current theme: ${theme}. Try: theme dark | theme light | theme matrix`;
        const t = arg.toLowerCase();
        if (t === "dark" || t === "light" || t === "matrix") {
          setTheme(t as keyof typeof THEMES);
          return `Theme switched to ${t}`;
        }
        return `Unknown theme '${arg}'. Available: dark, light, matrix`;
      },

      clear: () => {
        setLines([]);
        return "";
      },

      echo: (...args: string[]) => args.join(" "),
      date: () => new Date().toString(),
      repo: () => openExternal(PROFILE.repo),
      social: (which?: string) => {
        const key = (which || "").toLowerCase();
        if (!key || !(key in PROFILE.socials)) return `Usage: social [github|linkedin|x]`;
        return openExternal((PROFILE.socials as any)[key]);
      },
      whoami: () => PROFILE.handle,
      banner: () => banner(PROFILE),
    } as const;
  }, [PROFILE, PROJECTS, theme]);

  const COMMAND_LIST = useMemo(() => Object.keys(COMMANDS), [COMMANDS]);

  // ----- HANDLERS -----
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "c" && e.ctrlKey) {
      // ctrl+c — cancel input
      setInput("");
      addLine({ type: "text", text: "^C" });
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = Math.min(history.length - 1, pointer + 1);
      setPointer(next);
      setInput(history[history.length - 1 - next] || "");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!history.length) return;
      const next = Math.max(-1, pointer - 1);
      setPointer(next);
      setInput(next === -1 ? "" : history[history.length - 1 - next] || "");
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(input.trim());
    }
  }

  function handleAutocomplete() {
    const [cmd, ...args] = input.trim().split(/\s+/);
    console.log(cmd)
    console.log(...args)
    if (!cmd) return;
    const matches = COMMAND_LIST.filter((c) => c.startsWith(cmd));
    if (matches.length === 1) {
      setInput([matches[0], ...args].join(" "));
    } else if (matches.length > 1) {
      addLine({ type: "text", text: matches.join("    ") });
    }
  }

  function runCommand(raw: string) {
    addLine({ type: "cmd", text: promptText(PROFILE.handle) + raw });
    if (!raw) return;

    const parts = raw.split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    setHistory((h) => [...h, raw].slice(-300));
    setPointer(-1);
    setInput("");

    if (!(cmd in COMMANDS)) {
      addLine({ type: "error", text: `command not found: ${cmd}` });
      return;
    }

    try {
      const handler: any = (COMMANDS as any)[cmd];
      const out = handler(...args);
      if (typeof out === "string") {
        if (out) addMultiline(out);
      } else if (Array.isArray(out)) {
        addMultiline(out.join("\n"));
      }
    } catch (err: any) {
      addLine({ type: "error", text: `error: ${err?.message || String(err)}` });
    }
  }

  function addLine(line: TermLine) {
    setLines((prev) => [...prev, line]);
  }

function addMultiline(text: string) {
  const rows = text.split(/\n/);
  setLines((prev) => [
    ...prev,
    ...rows.map((r) =>
      r.includes("<span") || r.includes("<a")
        ? { type: "html", text: r }
        : { type: "text", text: r }
    )
  ]);
}


  function openExternal(url: string) {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
      return `Opening ${url} ...`;
    } catch {
      return `Open this URL: ${url}`;
    }
  }

  // ----- RENDER -----
  const th = THEMES[theme];

  return (
    <div className={`min-h-screen ${th.bg} ${th.text} antialiased flex items-center justify-center p-4`}
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace" }}
    >
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        <Titlebar theme={theme} setTheme={setTheme} accent={th.accent} />
        <div ref={scrollRef} className="h-[70vh] md:h-[75vh] overflow-y-auto p-4 md:p-6 space-y-1">
          {lines.map((line, i) => (
            <Line key={i} line={line} themeClasses={th} />
          ))}
          {/* Prompt */}
          <div className="flex flex-wrap items-center">
            <Prompt handle={PROFILE.handle} classes={th.prompt} />
            <div className="flex-1 min-w-[200px]">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                caretClass={th.caret}
              />
            </div>
          </div>
          <div className={`${th.dim} text-xs mt-2`}>Tip: try <kbd className="px-1 border rounded">help</kbd>, <kbd className="px-1 border rounded">projects</kbd>, or <kbd className="px-1 border rounded">theme matrix</kbd>. Autocomplete with <kbd className="px-1 border rounded">Tab</kbd>.</div>
        </div>
      </div>
    </div>
  );
}

// ===== UI PARTS =====
function Titlebar({ theme, setTheme, accent }: { theme: string; setTheme: (t: any) => void; accent: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className={`ml-3 text-sm ${accent}`}>terminal — portfolio</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <button className="px-2 py-1 rounded border border-white/10 hover:bg-white/10" onClick={() => setTheme("dark")}>dark</button>
        <button className="px-2 py-1 rounded border border-white/10 hover:bg-white/10" onClick={() => setTheme("light")}>light</button>
        <button className="px-2 py-1 rounded border border-white/10 hover:bg-white/10" onClick={() => setTheme("matrix")}>matrix</button>
      </div>
    </div>
  );
}

function Prompt({ handle, classes }: { handle: string; classes: string }) {
  return (
    <div className="shrink-0 mr-2 select-none">
      <span className={classes}>{handle}</span>
      <span className="mx-1">@</span>
      <span className={classes}>portfolio</span>
      <span className="mx-1">:</span>
      <span className={classes}>~</span>
      <span className="mx-1">$</span>
    </div>
  );
}

const Line = ({ line, themeClasses }: { line: any; themeClasses: any }) => {
  const base = "whitespace-pre-wrap break-words";
  if (line.type === "cmd") return <div className={`${base}`}>{line.text}</div>;
  if (line.type === "error") return <div className={`${base} text-rose-400`}>{line.text}</div>;
  if (line.type === "banner") return <pre className={`${base} ${themeClasses.accent}`}>{line.text}</pre>;
  if (line.type === "html") return <div className={base} dangerouslySetInnerHTML={{ __html: line.text }} />;
  return <div className={base} dangerouslySetInnerHTML={{ __html: linkify(line.text, themeClasses.link) }} />;
};

const Input = React.forwardRef<HTMLInputElement, { value: string; onChange: any; onKeyDown: any; caretClass: string }>(
  ({ value, onChange, onKeyDown, caretClass }, ref) => {
    const [showCaret, setShowCaret] = useState(true);
    useEffect(() => {
      const t = setInterval(() => setShowCaret((s) => !s), 550);
      return () => clearInterval(t);
    }, []);

    return (
      <div className="relative">
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          className="w-full bg-transparent outline-none border-none caret-transparent"
        />
        <div className="pointer-events-none absolute inset-0">
          <span className="invisible">{value}</span>
          <span className={`inline-block w-2 h-5 align-[-2px] ml-0.5 ${showCaret ? caretClass : "bg-transparent"}`} />
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

// ===== HELPERS =====
function linkify(text: string, linkClass: string) {
  // turn raw URLs into clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return escapeHtml(text).replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noreferrer" class='${linkClass}'>${url.replace(/^https?:\/\//, "")}</a>`);
}

function escapeHtml(t: string) {
  return t
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function promptText(handle: string) {
  return `${handle}@portfolio:~$ `;
}

function readme() {
  return [
    "# Terminal Portfolio",
    "Welcome! This is a terminal-style personal site.",
    "Type 'help' to see what I can do.",
  ].join("\n");
}

function banner(PROFILE: any) {
  const title = `${PROFILE.name} — ${PROFILE.title}`;
  const pad = (s: string, n: number) => s + " ".repeat(Math.max(0, n - s.length));
  const w = Math.min(60, Math.max(28, title.length + 4));
  const top = "┌" + "─".repeat(w - 2) + "┐";
  const bot = "└" + "─".repeat(w - 2) + "┘";
  const mid = `│ ${pad(title, w - 4)} │`;
  return [top, mid, bot, "", `Location: ${PROFILE.location}`, `Repo: ${PROFILE.repo}`, ""].join("\n");
}
