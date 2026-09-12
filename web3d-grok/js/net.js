const PREFIX = "ffue-";
const MAX = 4;
const ICE = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
    { urls: "stun:stun.cloudflare.com:3478" },
  ],
};

function idle() {
  return { x: 0, y: 0, jump: false, attack: false, special: false, shield: false, grab: false, dodge: false, ult: false, holdAttack: 0, jumpHold: 0 };
}

function code4() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[(Math.random() * a.length) | 0];
  return s;
}

function queryRoom() {
  try {
    const q = new URLSearchParams(location.search);
    return {
      room: String(q.get("room") || "").toUpperCase(),
      host: q.get("host") === "1" || q.get("host") === "true",
    };
  } catch {
    return { room: "", host: false };
  }
}

export const FFNet = {
  makeCode: code4,
  queryRoom,
  enabled: false,
  host: false,
  room: "",
  slot: 0,
  n: 1,
  ids: ["vesper", "quill", "relay", "forge"],
  remote: [idle(), idle(), idle(), idle()],
  conns: [],
  status: "off",
  lastState: null,
  peer: null,
  prefix: PREFIX,

  boot(opts) {
    const q = queryRoom();
    this.room = String(opts.room || q.room || "").toUpperCase();
    this.host = opts.host !== undefined ? !!opts.host : q.host;
    if (!this.room || typeof Peer === "undefined") {
      this.status = "offline";
      return Promise.resolve(false);
    }
    this.enabled = true;
    return this.host ? this._host() : this._join();
  },

  sendInput(inp) {
    if (!this.enabled || this.host) return;
    const c = this.conns[0];
    if (c && c.open) c.send(JSON.stringify({ t: "in", s: this.slot, i: inp }));
  },

  broadcastState(payload) {
    if (!this.host) return;
    const msg = JSON.stringify({ t: "st", ...payload });
    for (const c of this.conns) if (c && c.open) c.send(msg);
  },

  _peerOpts() {
    const opts = { debug: 0, config: ICE };
    const host = (typeof window !== "undefined" && window.FF_PEER_HOST) || "";
    if (host) {
      try {
        const u = new URL(host);
        opts.host = u.hostname;
        opts.port = +u.port || (u.protocol === "https:" ? 443 : 9000);
        opts.path = u.pathname || "/";
        opts.secure = u.protocol === "https:";
      } catch {}
    }
    return opts;
  },

  _host() {
    const self = this;
    return new Promise((resolve) => {
      const peer = new Peer(self.prefix + self.room, self._peerOpts());
      self.peer = peer;
      const done = (ok) => resolve(ok);
      const t = setTimeout(() => { self.status = "timeout"; done(false); }, 8000);
      peer.on("open", () => { clearTimeout(t); self.status = "host"; self.slot = 0; done(true); });
      peer.on("error", () => { clearTimeout(t); self.status = "error"; done(false); });
      peer.on("connection", (conn) => {
        if (self.n >= MAX) { conn.close(); return; }
        const slot = self.n;
        self.n += 1;
        self.conns.push(conn);
        conn.on("open", () => conn.send(JSON.stringify({ t: "hi", slot, n: self.n, ids: self.ids })));
        conn.on("data", (raw) => self._on(raw, slot));
      });
    });
  },

  _join() {
    const self = this;
    return new Promise((resolve) => {
      const peer = new Peer(self._peerOpts());
      self.peer = peer;
      const t = setTimeout(() => { self.status = "timeout"; resolve(false); }, 8000);
      peer.on("error", () => { clearTimeout(t); self.status = "error"; resolve(false); });
      peer.on("open", () => {
        const conn = peer.connect(self.prefix + self.room, { reliable: true });
        self.conns = [conn];
        conn.on("data", (raw) => self._on(raw, 0));
        conn.on("error", () => { clearTimeout(t); resolve(false); });
      });
      self._joinResolve = (ok) => { clearTimeout(t); resolve(ok); };
    });
  },

  _on(raw) {
    let msg;
    try { msg = typeof raw === "string" ? JSON.parse(raw) : raw; } catch (_) { return; }
    if (msg.t === "hi") {
      this.slot = msg.slot;
      this.n = msg.n;
      this.status = "guest";
      if (this._joinResolve) this._joinResolve(true);
    }
    if (msg.t === "in" && this.host) this.remote[msg.s | 0] = Object.assign(idle(), msg.i || {});
    if (msg.t === "st" && !this.host) this.lastState = msg;
  },
};
