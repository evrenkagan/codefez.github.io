(() => {
    var B = Object.defineProperty;
    var U = (n, t, e) => (t in n ? B(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : (n[t] = e));
    var S = (n, t, e) => (U(n, typeof t != "symbol" ? t + "" : t, e), e);
    var W = /^([^:]+):(@?\S+)$/,
        w = class n {
            constructor(t, e, s) {
                (this.title = t), (this.type = e), (this.value = s);
            }
            static parse(t) {
                let e = W.exec(t);
                if (!e) return null;
                let s = e[1].replaceAll("_", " "),
                    i = e[2][0] == "@" ? "event" : "command",
                    o = e[2][0] == "@" ? e[2].slice(1) : e[2];
                return new n(s, i, o);
            }
        };
    var L = document.createElement("template");
    L.innerHTML = `
<button hidden>Run</button>
<a href="#edit" hidden>Edit</a>
<codapi-status></codapi-status>
`;
    var A = class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.ready || (this.render(), this.listen(), (this.ready = !0));
        }
        render() {
            this.appendChild(L.content.cloneNode(!0)), (this.run = this.querySelector("button")), (this.edit = this.querySelector("a")), (this.status = this.querySelector("codapi-status"));
            let t = this.getAttribute("actions");
            this.addActions(t ? t.split(" ") : null);
        }
        listen() {
            this.run.addEventListener("click", (t) => {
                this.dispatchEvent(new Event("run"));
            }),
                this.edit.addEventListener("click", (t) => {
                    t.preventDefault(), this.dispatchEvent(new Event("edit"));
                });
        }
        addActions(t) {
            if (t)
                for (let e of t) {
                    let s = w.parse(e);
                    if (!s) continue;
                    let i = this.createButton(s);
                    this.insertBefore(i, this.status);
                }
        }
        createButton(t) {
            let e = document.createElement("a");
            return (
                e.addEventListener("click", (s) => {
                    s.preventDefault();
                    let i = new CustomEvent(t.type, { detail: t.value });
                    this.dispatchEvent(i);
                }),
                (e.innerText = t.title),
                (e.href = "#" + t.value),
                e
            );
        }
        showRunning() {
            this.run.setAttribute("disabled", ""), this.status.showRunning();
        }
        showFinished(t) {
            this.run.removeAttribute("disabled"), this.status.showFinished(t);
        }
        showStatus(t) {
            this.run.removeAttribute("disabled"), this.status.showMessage(t);
        }
        get runnable() {
            return !this.run.hasAttribute("hidden");
        }
        set runnable(t) {
            t ? this.run.removeAttribute("hidden") : this.run.setAttribute("hidden", "");
        }
        get editable() {
            return !this.edit.hasAttribute("hidden");
        }
        set editable(t) {
            t ? this.edit.removeAttribute("hidden") : this.edit.setAttribute("hidden", "");
        }
    };
    window.customElements.get("codapi-toolbar") || customElements.define("codapi-toolbar", A);
    var T = { running: "Running...", failed: "\u2718 Failed", done: "\u2713 Done" },
        k = class extends HTMLElement {
            showRunning() {
                let t = this.getAttribute("running") || T.running;
                this.innerHTML = `
            <svg width="1em" height="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>
            ${t}
        `;
            }
            showFinished(t) {
                if (!t.ok) {
                    this.innerText = this.getAttribute("failed") || T.failed;
                    return;
                }
                let e = this.getAttribute("done") || T.done;
                (e = e.replace("$DURATION", t.duration)),
                    (this.innerHTML = `
            ${e}
            <codapi-ref> by <a href="https://codapi.org/">codapi</a></codapi-ref>`);
            }
            showMessage(t) {
                this.innerText = t;
            }
        };
    window.customElements.get("codapi-status") || customElements.define("codapi-status", k);
    function V(n) {
        if (!n.length) return document.createTextNode("");
        let t = document.createElement("table"),
            e = document.createElement("thead"),
            s = document.createElement("tbody"),
            i = document.createElement("tr");
        return (
            Object.keys(n[0]).forEach((o) => {
                let r = document.createElement("th");
                (r.textContent = o), i.appendChild(r);
            }),
            e.appendChild(i),
            n.forEach((o) => {
                let r = document.createElement("tr");
                Object.values(o).forEach((h) => {
                    let x = document.createElement("td");
                    (x.textContent = h), r.appendChild(x);
                }),
                    s.appendChild(r);
            }),
            t.appendChild(e),
            t.appendChild(s),
            t
        );
    }
    var $ = { asTable: V };
    var f = "---";
    function J(n, t) {
        let e = n.indexOf(t);
        return e >= 0 ? [n.slice(0, e), n.slice(e + t.length)] : [n, ""];
    }
    function Z(n) {
        if (n.endsWith(f)) return "";
        let t = n.lastIndexOf(`
${f}
`);
        return t !== -1 ? n.slice(t + f.length + 2) : n.startsWith(f) ? n.slice(f.length + 1) : n;
    }
    var c = { cut: J, tail: Z, HORIZONTAL_RULE: f };
    var d = { text: "text", table: "table", svg: "svg", html: "html", iframe: "iframe", dom: "dom", hidden: "hidden" },
        K = "ok",
        M = document.createElement("template");
    M.innerHTML = `
<a href="#close">\u2715</a>
<pre><code></code></pre>
`;
    var G = {
            [d.text]: (n, t) => {
                let e = n.stdout || n.stderr,
                    s = t ? c.tail(e) : e;
                return document.createTextNode(s || K);
            },
            [d.table]: (n) => {
                if (!n.stdout) return document.createTextNode(n.stderr);
                let t = typeof n.stdout == "object" ? n.stdout : JSON.parse(n.stdout);
                return $.asTable(t);
            },
            [d.svg]: (n) => {
                if (!n.stdout) return document.createTextNode(n.stderr);
                let t = new DOMParser().parseFromString(n.stdout, "image/svg+xml");
                return t.querySelector("parsererror") ? document.createTextNode(n.stdout) : t.documentElement;
            },
            [d.html]: (n) => {
                if (!n.stdout) return document.createTextNode(n.stderr);
                let t = new DOMParser().parseFromString(n.stdout, "text/html");
                if (t.querySelector("parsererror")) return document.createTextNode(n.stdout);
                let e = document.createDocumentFragment();
                return Array.from(t.body.childNodes).forEach((s) => e.appendChild(s)), e;
            },
            [d.iframe]: (n) => {
                if (!n.stdout) return document.createTextNode(n.stderr);
                let t = new DOMParser().parseFromString(n.stdout, "text/html");
                if (t.querySelector("parsererror")) return document.createTextNode(n.stdout);
                let e = document.createElement("iframe");
                return (
                    (e.width = "100%"),
                    (e.srcdoc = t.documentElement.outerHTML),
                    (e.onload = () => {
                        let s = e.contentDocument.body,
                            i = e.contentDocument.documentElement,
                            o = Math.max(s.scrollHeight, s.offsetHeight, i.clientHeight, i.scrollHeight, i.offsetHeight);
                        e.style.height = o + "px";
                    }),
                    e
                );
            },
            [d.dom]: (n) => (n.stdout ? n.stdout : document.createTextNode(n.stderr)),
            [d.hidden]: (n) => (!n.stdout && n.stderr ? document.createTextNode(n.stderr) : null),
        },
        C = class extends HTMLElement {
            constructor() {
                super();
            }
            connectedCallback() {
                this.ready ||
                    (this.appendChild(M.content.cloneNode(!0)),
                    (this.close = this.querySelector("a")),
                    (this.output = this.querySelector("pre > code")),
                    this.close.addEventListener("click", (t) => {
                        t.preventDefault(), this.hide();
                    }),
                    (this.ready = !0));
            }
            fadeOut() {
                this.style.opacity = 0.4;
            }
            fadeIn() {
                setTimeout(() => {
                    this.style.opacity = "";
                }, 100);
            }
            showResult(t) {
                let e = G[this.mode](t, this.tail);
                if (((this.output.innerHTML = ""), !e)) {
                    this.hide();
                    return;
                }
                this.output.appendChild(e), this.show();
            }
            showMessage(t) {
                (this.output.innerText = t), t ? this.show() : this.hide();
            }
            showError(t) {
                let e =
                    t.message +
                    (t.stack
                        ? `
${t.stack}`
                        : "");
                this.showMessage(e);
            }
            show() {
                this.removeAttribute("hidden");
            }
            hide() {
                this.setAttribute("hidden", "");
            }
            get mode() {
                return this.getAttribute("mode") || d.text;
            }
            set mode(t) {
                t in d || (t = d.text), this.setAttribute("mode", t);
            }
            get tail() {
                return this.hasAttribute("tail");
            }
            set tail(t) {
                t ? this.setAttribute("tail", "") : this.removeAttribute("tail");
            }
        };
    window.customElements.get("codapi-output") || customElements.define("codapi-output", C);
    var p = { off: "off", basic: "basic", external: "external" },
        E = class extends EventTarget {
            constructor(t, e, s) {
                super(), (this.el = t), (this.mode = e), (this.executeFunc = s), this.listen();
            }
            listen() {
                if (this.mode != p.off) {
                    if (this.mode == p.external) {
                        this.el.addEventListener("keydown", this.handleExecute.bind(this));
                        return;
                    }
                    (this.el.contentEditable = "true"),
                        this.el.addEventListener("keydown", this.handleIndent.bind(this)),
                        this.el.addEventListener("keydown", this.handleHide.bind(this)),
                        this.el.addEventListener("keydown", this.handleExecute.bind(this)),
                        this.el.addEventListener("paste", this.onPaste.bind(this)),
                        (this.onFocus = this.initEditor.bind(this)),
                        this.el.addEventListener("focus", this.onFocus);
                }
            }
            initEditor(t) {
                let e = t.target;
                e.innerHTML.includes("</span>") && (e.textContent = e.textContent), e.removeEventListener("focus", this.onFocus), delete this.onFocus;
            }
            handleIndent(t) {
                t.key == "Tab" && (t.preventDefault(), document.execCommand("insertHTML", !1, " ".repeat(4)));
            }
            handleHide(t) {
                t.key == "Escape" && (t.preventDefault(), this.dispatchEvent(new Event("hide")));
            }
            handleExecute(t) {
                (!t.ctrlKey && !t.metaKey) || (t.keyCode != 10 && t.keyCode != 13) || (t.preventDefault(), this.executeFunc());
            }
            onPaste(t) {
                t.preventDefault();
                let e = (t.originalEvent || t).clipboardData.getData("text/plain");
                document.execCommand("insertText", !1, e);
            }
            focusEnd() {
                this.el.focus();
                let t = window.getSelection();
                t.selectAllChildren(this.el), t.collapseToEnd();
            }
            get isEmpty() {
                return this.el.textContent.trim() == "";
            }
            get value() {
                return this.el.textContent.trim().replace(/[\u00A0]/g, " ");
            }
            set value(t) {
                this.el.textContent = t;
            }
        };
    var a = window.codapi ?? {};
    a.version = "0.19.0";
    a.engines = a.engines ?? {};
    a.settings = a.settings ?? {};
    window.codapi = a;
    var _ = class extends HTMLElement {
        connectedCallback() {
            this.ready || ((a.settings.url = this.getAttribute("url")), (this.ready = !0));
        }
        attributeChangedCallback(t, e, s) {
            a.settings[t] = s;
        }
    };
    window.customElements.get("codapi-settings") || customElements.define("codapi-settings", _);
    async function y(n, t = {}) {
        let { timeout: e = 1e4 } = t,
            s = new AbortController(),
            i = setTimeout(() => s.abort(), e),
            o = await fetch(n, { ...t, signal: s.signal });
        return clearTimeout(i), o;
    }
    var Y = "https://api.codapi.org/v1",
        z = "Something is wrong with Codapi.",
        Q = {
            400: "Bad request. Something is wrong with the request, not sure what.",
            404: "Unknown sandbox or command.",
            403: "Forbidden. Your domain is probably not allowed on Codapi.",
            413: "Request is too large. Try submitting less code.",
            429: "Too many requests. Try again in a few seconds.",
        };
    async function X(n) {
        try {
            let t = `${a.settings.url || Y}/exec`,
                e = await y(t, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify(n) });
            if (!e.ok) {
                let s = Q[e.status] || z;
                return { ok: !1, duration: 0, stdout: "", stderr: `${e.status} - ${s}` };
            }
            return await e.json();
        } catch (t) {
            throw new Error("request failed", { cause: t });
        }
    }
    var N = { init: () => {}, exec: X };
    async function tt(n) {
        try {
            let t = et(n.files[""]),
                [e, s] = await nt(t);
            return { ok: !0, duration: s, stdout: e, stderr: "" };
        } catch (t) {
            return { ok: !1, duration: 0, stdout: "", stderr: t.toString() };
        }
    }
    function et(n) {
        let t = n.split(`
`),
            e = 0,
            s = t[0].split(" ").filter((u) => u),
            [i, o] = s.length >= 2 ? s : ["GET", s[0]];
        e += 1;
        let r = [];
        for (let u = e; u < t.length; u++) {
            let m = t[u].trim();
            if (m.startsWith("?") || m.startsWith("&")) r.push(m), (e += 1);
            else break;
        }
        let h = {};
        for (let u = e; u < t.length; u++) {
            let m = t[u].trim();
            if (m === "") break;
            let [I, P] = c.cut(m, ":");
            (h[I.trim()] = P.trim()), (e += 1);
        }
        let x = t.slice(e + 1).join(`
`);
        return { method: i, url: o + r.join(""), headers: h, body: x };
    }
    async function nt(n) {
        let t = new Date(),
            e = await st(n),
            s = await it(e),
            i = new Date() - t;
        return [s, i];
    }
    async function st(n) {
        let t = { method: n.method, headers: n.headers, body: n.body || void 0 };
        return await y(n.url, t);
    }
    async function it(n) {
        let t = "HTTP/1.1",
            e = await n.text(),
            s = [`${t} ${n.status} ${n.statusText}`];
        for (let i of n.headers.entries()) s.push(`${i[0]}: ${i[1]}`);
        return (
            e && s.push("", e),
            s.join(`
`)
        );
    }
    var O = { exec: tt };
    var ot = async function () {}.constructor;
    async function rt(n) {
        try {
            let t = [];
            ct(t);
            let [e, s] = await at(n.files[""]);
            return {
                ok: !0,
                duration: s,
                stdout:
                    e ??
                    t.join(`
`),
                stderr: "",
            };
        } catch (t) {
            return { ok: !1, duration: 0, stdout: "", stderr: t.toString() };
        } finally {
            dt();
        }
    }
    async function at(n) {
        let t = new ot(n),
            e = new Date(),
            s = await t(),
            i = new Date() - e;
        return [s, i];
    }
    function ct(n) {
        let t = new Proxy(console, {
            get(e, s) {
                return s === "log" || s === "error" || s === "warn"
                    ? (...i) => {
                          let o = i.map((r) => ut(r)).join(" ");
                          n.push(o), e[s](...i);
                      }
                    : e[s];
            },
        });
        (window._console = window.console), (window.console = t), window.addEventListener("error", (e) => console.log(e.error));
    }
    function dt() {
        (window.console = window._console), delete window._console;
    }
    function ut(n) {
        switch (typeof n) {
            case "undefined":
                return "undefined";
            case "object":
                return JSON.stringify(n);
            default:
                return n.toString();
        }
    }
    var H = { exec: rt };
    var D = { javascript: H.exec, fetch: O.exec };
    async function lt(n) {
        try {
            return ht(n)(n);
        } catch (t) {
            return { ok: !1, duration: 0, stdout: "", stderr: t.toString() };
        }
    }
    function ht(n) {
        if (!(n.sandbox in D)) throw Error(`unknown sandbox: ${n.sandbox}`);
        if (n.command != "run") throw Error(`unknown command: ${n.sandbox}.${n.command}`);
        return D[n.sandbox];
    }
    var R = { init: () => {}, exec: lt };
    var mt = "codapi",
        ft = "run",
        b = class {
            constructor({ engine: t, sandbox: e, command: s, template: i, files: o }) {
                let [r, h] = c.cut(e, ":");
                (this.engineName = t || mt), (this.sandbox = r), (this.version = h), (this.command = s || ft), (this.template = i), (this.files = o);
            }
            get engine() {
                let t = a.engines[this.engineName];
                if (!t) throw new Error(`unknown engine: ${this.engineName}`);
                return t;
            }
            async execute(t, e) {
                e = await this.prepare(e);
                let s = await this.loadFiles();
                return await this.engine.exec({ sandbox: this.sandbox, version: this.version, command: t || this.command, files: { "": e, ...s } });
            }
            async prepare(t) {
                if (!this.template) return t;
                let e = "##CODE##",
                    [s, i] = await F(this.template, pt);
                return (t = i.replace(e, () => t)), t;
            }
            async loadFiles() {
                if (!this.files) return {};
                let t = {};
                for (let e of this.files) {
                    let [s, i] = c.cut(e, ":"),
                        [o, r] = await F(s, bt);
                    t[i || o] = r;
                }
                return t;
            }
        };
    async function F(n, t) {
        if (n[0] == "#") {
            let o = n.slice(1),
                r = document.getElementById(o);
            if (!r) throw new Error(`element ${n} not found`);
            let h = r.code || r.textContent.trim();
            return [o, h];
        }
        let e = n.split("/").pop(),
            s = await fetch(n);
        if (s.status != 200) throw new Error(`file ${n} not found`);
        let i = await t(s);
        return [e, i];
    }
    async function pt(n) {
        return await n.text();
    }
    async function bt(n) {
        if (n.headers.get("content-type") == "application/octet-stream") {
            let e = await n.blob();
            return await gt(e);
        } else return await n.text();
    }
    function gt(n) {
        return new Promise((t) => {
            let e = new FileReader();
            e.readAsDataURL(n),
                (e.onloadend = function () {
                    t(e.result);
                });
        });
    }
    var xt = { codapi: N, browser: R };
    a.engines = { ...a.engines, ...xt };
    var l = c.HORIZONTAL_RULE,
        wt = {
            javascript: `console.log("${l}");`,
            lua: `print("${l}")`,
            php: `echo "${l}"`,
            python: `print("${l}")`,
            r: `cat("${l}
")`,
            ruby: `puts "${l}"`,
            typescript: `console.log("${l}");`,
            shell: `echo "${l}"`,
            sql: `select '${l}';`,
        };
    function Et(n) {
        return wt[n] || "";
    }
    var q = { hr: Et };
    var yt = { fallback: "\u2718 Failed, using fallback" },
        g = { unknown: "unknown", running: "running", failed: "failed", succeded: "succeded" },
        j = document.createElement("template");
    j.innerHTML = `
<codapi-toolbar></codapi-toolbar>
<codapi-output hidden></codapi-output>
`;
    var v = class extends HTMLElement {
        constructor() {
            super(), (this.ready = !1), (this.executor = null), (this._snippet = null), (this._toolbar = null), (this._output = null), (this._fallback = null);
        }
        connectedCallback() {
            if (this.ready) return;
            let t = parseInt(this.getAttribute("init-delay"), 10) || 0;
            At(() => {
                this.init(), this.render(), this.listen(), (this.ready = !0), this.dispatchEvent(new Event("load"));
            }, t);
        }
        init() {
            let t = this.getAttribute("files");
            (this.executor = this.hasAttribute("sandbox")
                ? new b({ engine: this.getAttribute("engine"), sandbox: this.getAttribute("sandbox"), command: this.getAttribute("command"), template: this.getAttribute("template"), files: t ? t.split(" ") : null })
                : null),
                (this.dependsOn = this.getAttribute("depends-on")),
                (this.state = g.unknown);
        }
        render() {
            this.appendChild(j.content.cloneNode(!0));
            let t = this.findCodeElement();
            (this.snippet = new E(t, this.editor, this.execute.bind(this))), (this._toolbar = this.querySelector("codapi-toolbar"));
            let e = this.getAttribute("actions");
            (this._toolbar.runnable = this.executor != null), this._toolbar.addActions(e ? e.split(" ") : null);
            let s = this._toolbar.querySelector("codapi-status");
            this.hasAttribute("status-running") && s.setAttribute("running", this.getAttribute("status-running")),
                this.hasAttribute("status-failed") && s.setAttribute("failed", this.getAttribute("status-failed")),
                this.hasAttribute("status-done") && s.setAttribute("done", this.getAttribute("status-done")),
                (this._output = this.querySelector("codapi-output")),
                (this._output.mode = this.getAttribute("output-mode")),
                (this._output.tail = this.hasAttribute("output-tail")),
                this.hasAttribute("output") && (this._fallback = this.extractFallback(this.getAttribute("output")));
        }
        listen() {
            this._toolbar.addEventListener("run", (t) => {
                this.execute();
            }),
                this._toolbar.addEventListener("command", (t) => {
                    this.execute(t.detail);
                }),
                this._toolbar.addEventListener("event", (t) => {
                    this.dispatchEvent(new Event(t.detail));
                }),
                this.editor == p.basic &&
                    ((this._toolbar.editable = !0),
                    this._toolbar.addEventListener("edit", (t) => {
                        this.snippet.focusEnd();
                    })),
                this.snippet.addEventListener("hide", (t) => {
                    this._output.hide();
                });
        }
        findCodeElement() {
            if (!this.selector) {
                let e = this.previousElementSibling || this.parentElement.previousElementSibling;
                return e.querySelector("code") || e;
            }
            let t;
            if (this.selector.startsWith("@prev")) {
                let e = this.previousElementSibling,
                    [s, i] = c.cut(this.selector, " ");
                t = e.querySelector(i);
            } else t = document.querySelector(this.selector);
            if (!t) throw Error(`element not found: ${this.selector}`);
            return t;
        }
        extractFallback(t) {
            let e = this.findOutputElement(t),
                i = (e.querySelector("code") || e).textContent.trim();
            return e.parentElement.removeChild(e), { ok: !1, duration: 0, stdout: i, stderr: "" };
        }
        findOutputElement(t) {
            if (!t || t == "@next") return this.nextElementSibling || this.parentElement.nextElementSibling;
            let e;
            if (t.startsWith("@next")) {
                let s = this.nextElementSibling,
                    [i, o] = c.cut(t, " ");
                e = s.querySelector(o);
            } else e = document.querySelector(t);
            if (!e) throw Error(`element not found: ${t}`);
            return e;
        }
        async execute(t = void 0) {
            if (this.executor) {
                if (this.snippet.isEmpty) {
                    this._output.showMessage("(empty)");
                    return;
                }
                try {
                    let e = vt(this);
                    this.dispatchEvent(new CustomEvent("execute", { detail: e })), (this.state = g.running), this._toolbar.showRunning(), this._output.fadeOut();
                    let s = await this.executor.execute(t, e);
                    (this.state = s.ok ? g.succeded : g.failed), this._toolbar.showFinished(s), this._output.showResult(s), this.dispatchEvent(new CustomEvent("result", { detail: s }));
                } catch (e) {
                    this._fallback ? (this._toolbar.showStatus(yt.fallback), this._output.showResult(this._fallback)) : (this._toolbar.showFinished({}), this._output.showMessage(e.message)),
                        console.error(e),
                        (this.state = g.failed),
                        this.dispatchEvent(new CustomEvent("error", { detail: e }));
                } finally {
                    this._output.fadeIn();
                }
            }
        }
        attributeChangedCallback(t, e, s) {
            switch (t) {
                case "engine":
                case "sandbox":
                case "command":
                case "template":
                case "files":
                    let i = this.getAttribute("files");
                    this.executor = new b({ engine: this.getAttribute("engine"), sandbox: this.getAttribute("sandbox"), command: this.getAttribute("command"), template: this.getAttribute("template"), files: i ? i.split(" ") : null });
                    break;
            }
        }
        showStatus(t) {
            this._toolbar.showStatus(t);
        }
        get syntax() {
            return this.getAttribute("syntax") || this.getAttribute("sandbox");
        }
        set syntax(t) {
            this.setAttribute("syntax", t);
        }
        get selector() {
            return this.getAttribute("selector");
        }
        set selector(t) {
            this.setAttribute("selector", t);
        }
        get editor() {
            return this.getAttribute("editor") || p.off;
        }
        set editor(t) {
            this.setAttribute("editor", t);
        }
        get code() {
            return this.snippet.value;
        }
        set code(t) {
            this.snippet.value = t;
        }
        get state() {
            return this.getAttribute("state");
        }
        set state(t) {
            this.setAttribute("state", t);
        }
    };
    S(v, "observedAttributes", ["sandbox", "engine", "command", "template", "files"]);
    function vt(n) {
        let t = n.code,
            e = n.dependsOn ? n.dependsOn.split(" ") : [],
            s = n.hasAttribute("output-tail") ? q.hr(n.syntax) : "";
        for (let i of e) {
            let o = document.getElementById(i);
            if (!o) throw new Error(`#${i} dependency not found`);
            (t =
                o.code +
                `
${s}
` +
                t),
                o.dependsOn && e.push(...o.dependsOn.split(" ").filter((r) => !e.includes(r)));
        }
        return t;
    }
    function At(n, t) {
        if (t <= 0) {
            n();
            return;
        }
        setTimeout(n, t);
    }
    window.customElements.get("codapi-snippet") || customElements.define("codapi-snippet", v);
})();
