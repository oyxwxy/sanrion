/* =========================================================
   MUSIC — 칩튠 캐롤 BGM (퍼블릭 도메인 곡, 멜로디·베이스만)
   ========================================================= */
(function () {
  const PX = window.PX;
  const SONGS = [
    { title: "JINGLE BELLS", bpm: 152, bar: 4, pattern: [[0, 0], [1, 7], [2, 0], [3, 7]],
      mel: "E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:.5 | E4:4 | F4:1 F4:1 F4:1.5 F4:.5 | F4:1 E4:1 E4:1 E4:.5 E4:.5 | E4:1 D4:1 D4:1 E4:1 | D4:2 G4:2 | " +
           "E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:.5 | E4:4 | F4:1 F4:1 F4:1.5 F4:.5 | F4:1 E4:1 E4:1 E4:.5 E4:.5 | G4:1 G4:1 F4:1 D4:1 | C4:4",
      bass: "C3 C3 C3 C3 F2 C3 D3 G2 C3 C3 C3 C3 F2 C3 G2 C3" },
    { title: "WE WISH YOU A MERRY CHRISTMAS", bpm: 168, bar: 3, pickup: 1, pattern: [[0, 0], [1, 7], [2, 7]],
      mel: "D4:1 | G4:1 G4:.5 A4:.5 G4:.5 F#4:.5 | E4:1 E4:1 E4:1 | A4:1 A4:.5 B4:.5 A4:.5 G4:.5 | F#4:1 D4:1 D4:1 | B4:1 B4:.5 C5:.5 B4:.5 A4:.5 | G4:1 E4:1 D4:.5 D4:.5 | E4:1 A4:1 F#4:1 | G4:2",
      bass: "G2 C3 A2 D3 E3 C3 D3 G2" },
    { title: "DECK THE HALLS", bpm: 144, bar: 4, pattern: [[0, 0], [1, 7], [2, 0], [3, 7]],
      mel: "G4:1.5 F4:.5 E4:1 D4:1 | C4:1 D4:1 E4:1 C4:1 | D4:.5 E4:.5 F4:.5 D4:.5 E4:1.5 D4:.5 | C4:1 B3:1 C4:2 | " +
           "G4:1.5 F4:.5 E4:1 D4:1 | C4:1 D4:1 E4:1 C4:1 | D4:.5 E4:.5 F4:.5 D4:.5 E4:1.5 D4:.5 | C4:1 B3:1 C4:2 | " +
           "D4:1.5 E4:.5 F4:1 D4:1 | E4:1.5 F4:.5 G4:1 D4:1 | E4:.5 F#4:.5 G4:1 A4:.5 B4:.5 C5:1 | B4:1 A4:1 G4:2 | " +
           "G4:1.5 F4:.5 E4:1 D4:1 | C4:1 D4:1 E4:1 C4:1 | D4:.5 E4:.5 F4:.5 D4:.5 E4:1.5 D4:.5 | C4:1 B3:1 C4:2",
      bass: "C3 C3 G2 C3 C3 C3 G2 C3 D3 C3 D3 G2 C3 C3 G2 C3" },
    { title: "SILENT NIGHT", bpm: 104, bar: 3, pattern: [[0, 0], [1.5, 7]], soft: true,
      mel: "G4:1.5 A4:.5 G4:1 | E4:3 | G4:1.5 A4:.5 G4:1 | E4:3 | D5:2 D5:1 | B4:3 | C5:2 C5:1 | G4:3 | A4:2 A4:1 | C5:1.5 B4:.5 A4:1 | G4:1.5 A4:.5 G4:1 | E4:3 | " +
           "A4:2 A4:1 | C5:1.5 B4:.5 A4:1 | G4:1.5 A4:.5 G4:1 | E4:3 | D5:2 D5:1 | F5:1.5 D5:.5 B4:1 | C5:3 | E5:3 | C5:1 G4:1 E4:1 | G4:1.5 F4:.5 D4:1 | C4:3 | R:3",
      bass: "C3 C3 C3 C3 G2 G2 C3 C3 F2 F2 C3 C3 F2 F2 C3 C3 G2 G2 C3 C3 C3 G2 C3 C3" }
  ];
  const NOTE = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
  const midi = (n) => { const m = n.match(/^([A-G]#?)(\d)$/); return 12 * (+m[2] + 1) + NOTE[m[1]]; };
  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function compile(song) {
    const ev = [];
    let t = 0;
    song.mel.replace(/\|/g, " ").trim().split(/\s+/).forEach((tok) => {
      const [n, d] = tok.split(":"); const dur = parseFloat(d);
      if (n !== "R") ev.push({ t, dur, f: freq(midi(n) + 12), kind: "mel" });
      t += dur;
    });
    const total = t;
    const start = song.pickup || 0;
    song.bass.split(/\s+/).forEach((root, i) => {
      const bt = start + i * song.bar, r = midi(root);
      song.pattern.forEach(([off, iv]) => { if (bt + off < total) ev.push({ t: bt + off, dur: song.bar === 3 && song.pattern.length === 2 ? 1.4 : 0.9, f: freq(r + iv), kind: "bass" }); });
    });
    ev.sort((a, b) => a.t - b.t);
    return { ev, total: total + song.bar };
  }
  const COMPILED = SONGS.map(compile);

  let actx = null, master = null, playing = false, idx = PX.store.get("bgmTrack", 0) % SONGS.length, timer = null, songStart = 0, cursor = 0;
  let enabled = PX.store.get("bgm", true);
  const listeners = [];
  function ctx() {
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      actx = new C(); master = actx.createGain(); master.gain.value = 0.55; master.connect(actx.destination);
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function voice(e, when, spb, soft) {
    const o = actx.createOscillator(), g = actx.createGain();
    const len = Math.max(0.06, e.dur * spb * 0.92);
    if (e.kind === "mel") { o.type = soft ? "triangle" : "square"; } else { o.type = "triangle"; }
    o.frequency.setValueAtTime(e.f, when);
    const v = e.kind === "mel" ? (soft ? 0.09 : 0.032) : 0.07;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(v, when + 0.008);
    g.gain.exponentialRampToValueAtTime(v * 0.45, when + Math.min(len, 0.25));
    g.gain.setValueAtTime(v * 0.45, when + len - 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);
    o.connect(g); g.connect(master);
    o.start(when); o.stop(when + len + 0.02);
  }
  function tick() {
    if (!playing) return;
    const song = SONGS[idx], comp = COMPILED[idx], spb = 60 / song.bpm;
    const now = actx.currentTime, ahead = now + 0.25;
    while (cursor < comp.ev.length && songStart + comp.ev[cursor].t * spb < ahead) {
      const e = comp.ev[cursor];
      voice(e, Math.max(now, songStart + e.t * spb), spb, song.soft);
      cursor++;
    }
    if (now > songStart + comp.total * spb) next(true);
  }
  function startSong() {
    cursor = 0; songStart = actx.currentTime + 0.1;
    PX.store.set("bgmTrack", idx);
    listeners.forEach((f) => f());
  }
  function play() {
    if (!ctx()) return;
    if (playing) return;
    playing = true; startSong();
    timer = setInterval(tick, 40);
  }
  function stop() {
    playing = false; clearInterval(timer); timer = null;
    if (master && actx) { const old = master; old.gain.setTargetAtTime(0, actx.currentTime, 0.05); setTimeout(() => old.disconnect(), 300); master = actx.createGain(); master.gain.value = 0.55; master.connect(actx.destination); }
    listeners.forEach((f) => f());
  }
  function next(auto) {
    idx = (idx + 1) % SONGS.length;
    if (playing) { if (!auto && master) { stop(); play(); } else startSong(); } else listeners.forEach((f) => f());
  }
  document.addEventListener("visibilitychange", () => { if (!actx) return; if (document.hidden) actx.suspend(); else if (playing) actx.resume(); });

  PX.music = {
    play, stop, next,
    title: () => SONGS[idx].title,
    isPlaying: () => playing,
    enabled: () => enabled,
    setEnabled(v) { enabled = v; PX.store.set("bgm", v); if (v) play(); else stop(); },
    startIfEnabled() { if (enabled) play(); },
    onChange: (f) => listeners.push(f)
  };
})();
