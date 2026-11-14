/* =========================================================
   STAGE 3 — 픽셀 캐릭터 메이커 (32x32, 세분화 버전)
   ========================================================= */
(function () {
  const PX = window.PX;
  const N = 32;
  const LINE = "#3a1d2e", WHITE = "#fffafc", MOUTH = "#c0405e", GOLD = "#d9a441", GOLD_D = "#a8742a", SILVER = "#d8dde6";

  /* 문자 → 색 슬롯
     s 피부 S 피부음영 | h 머리 H 머리음영 l 머리광택 B 눈썹 b 브릿지
     e 눈 E 라인 w 흰 W 흰음영 k 볼터치 d 다크서클 m 입속
     c 상의 C 상의음영 t 포인트(넥타이) | o 겉옷 O 겉옷음영 | v 망토 V 망토음영
     g 금장 G 금장음영 | p 하의 P 하의음영 | f 신발 F 신발음영 | a 장식 A 장식음영 y 은색 */
  const P = (x, y, r) => ({ x, y, r });
  const fill = (row, n) => Array(n).fill(row);
  const mirror = (part, cx) => ({ x: Math.round(cx * 2 - part.x - part.r[0].length + 1), y: part.y, r: part.r.map((row) => row.split("").reverse().join("")) });

  const HEAD = P(9, 7, ["....ssssss....", "..ssssssssss..", ".ssssssssssss.", ...fill("ssssssssssssss", 6), ".ssssssssssss.", ".ssssssssssss.", "..ssssssssss..", "....ssssss...."]);

  /* ---- 앞머리 ---- */
  const FRONTS = [
    { name: "뱅", p: P(8, 5, ["....hhhhhhhh....", "..hhhhhhhhhhhh..", ".hhhhhhhhhhhhhh.", "hhhhhhhhhhhhhhhh", "hhhhhhhhhhhhhhhh", "hhhhhHhhhhHhhhhh", "hhhHH.HhhH.HHhhh", "hhH..........Hhh", "hh............hh", "hh............hh", "hH............Hh", "H..............H"]) },
    { name: "히메 일자", p: P(8, 5, ["....hhhhhhhh....", "..hhhhhhhhhhhh..", ".hhhllllhhhhhhh.", "hhllhhhhhhllhhhh", "hhhhhhhhhhhhhhhh", "hhhhhhhhhhhhhhhh", "hhHHHHHHHHHHHHhh", "hhh..........hhh", "hhh..........hhh", "hhh..........hhh", "hhh..........hhh", "hHh..........hHh", "HHH..........HHH"]) },
    { name: "가르마", p: P(8, 3, ["....h.hhhhh.h...", "...hhhhhhhhhhh..", "..hhhhhhhhhhhhh.", ".hhhhhhhhhhhhhhh", "hhhhhbhHHhhhhhhh", "hhhhbhH..Hhhhhhh", "hhhbhH....Hhhhhh", "hhbhH......Hhhhh", ".bh.........hHh.", ".h............h.", ".H............H."]) },
    { name: "짧은앞머리", p: P(8, 5, ["...hhhhhhhhhh...", "..hhhhhhhhhhhh..", ".hhhhhhhhhhhhhh.", "hhhhhhhhhhhhhhhh", "hhhhhhHhhhhhhhhh", "hhhHhH.HhhHhHhhh", "hH............Hh", "h..............h"]) },
    { name: "넘김", p: P(8, 5, ["....hhhhhhhh....", "..hhhhhhhhhhhh..", ".hhhhhhhhhhhhhh.", "hhhhhhhhhhhhhhhh", "hhhH........Hhhh", "hhH..........Hhh", "hh............hh", "h..............h"]) }
  ];
  /* ---- 뒷머리 ---- */
  const BOB = P(7, 4, ["......hhhhhh......", "....hhhhhhhhhh....", "..hhhhhhhhhhhhhh..", ".hhhhhhhhhhhhhhhh.", ...fill("hhhhhhhhhhhhhhhhhh", 10), "HhhhhhhhhhhhhhhhhH", "HHHHHHHHHHHHHHHHHH"]);
  const LONG = P(7, 4, ["......hhhhhh......", "....hhhhhhhhhh....", "..hhhhhhhhhhhhhh..", ".hhhhhhhhhhhhhhhh.", ...fill("hhhhhhhhhhhhhhhhhh", 8), ...fill("hlhhhhhhhhhhhhhhlh", 3), ...fill("hhhhhhhhhhhhhhhhhh", 4), "HhhhhhhhhhhhhhhhhH", "HHhHHhHHHHHHHhHHhH", "H.HH.H......H.HH.H"]);
  const SHORT = P(8, 4, ["....hh.hhh.h....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", ".hhhhhhhhhhhhhh.", ...fill("hhhhhhhhhhhhhhhh", 6), "HHHHHHHHHHHHHHHH"]);
  const WOLF = P(7, 3, ["......hh.hhhh.h...", "....hhhhhhhhhhh...", "...hhhhhhhhhhhhh..", "..hhhhhhhhhhhhhh..", ".hhhhhhhhhhhhhhhh.", ...fill(".hhhhhhhhhhhhhhhh.", 5), "..hhhhhhhhhhhhhh..", ".hH............Hh.", "..H............H.."]);
  const TAIL_L = P(3, 8, [".hhh.", "hhhha", "hhhha", ...fill("hhhhH", 9), ".hhH.", "..H.."]);
  const BUN = P(12, 1, ["..hhhh..", ".hhhhhh.", ".hhhHhh.", "..hHHh.."]);
  const PONY = P(21, 4, [".hhh..", "hhhhh.", "hhhhhh", "..hahh", ...fill("...hhh", 8), "...hHh", "....H."]);
  const BACKS = [
    { name: "단발", p: [BOB] }, { name: "긴생머리", p: [LONG] }, { name: "숏", p: [SHORT] }, { name: "울프컷", p: [WOLF] },
    { name: "양갈래", p: [SHORT, TAIL_L, mirror(TAIL_L, 15.5)] }, { name: "똥머리", p: [SHORT, BUN] }, { name: "포니테일", p: [SHORT, PONY] }
  ];
  // 브릿지: 머리카락 위에만 칠해지는 마스크
  const STREAK = [[13, 5], [14, 5], [13, 6], [14, 6], [13, 7], [14, 7], [12, 8], [13, 8], [11, 9], [12, 9], [10, 10], [11, 10], [9, 11], [10, 11], [8, 12], [9, 12], [8, 13]];

  /* ---- 얼굴 ---- */
  const pair = (l, rx) => [l, P(rx, l.y, l.r)];
  const EYES = [
    { name: "동글", p: pair(P(12, 12, ["EE", "we", "ee"]), 18) },
    { name: "점", p: [P(13, 13, ["E", "E"]), P(18, 13, ["E", "E"])] },
    { name: "웃음", p: pair(P(11, 13, [".E.", "E.E"]), 18) },
    { name: "졸림", p: pair(P(11, 14, ["EEE"]), 18) },
    { name: "반짝", p: pair(P(11, 11, ["EEE", "Ewe", "eee", ".e."]), 18) },
    { name: "반눈", p: [P(11, 13, ["EEE", ".ee"]), P(18, 13, ["EEE", "ee."])] },
    { name: "윙크", p: [P(12, 12, ["EE", "we", "ee"]), P(18, 13, [".E.", "E.E"])] },
    { name: "올라간눈", p: [P(11, 11, ["E..", ".EE", ".we", ".ee"]), P(18, 11, ["..E", "EE.", "ew.", "ee."])] },
    { name: "처진눈", p: [P(11, 12, ["EEE", "wee", "E.."]), P(18, 12, ["EEE", "eew", "..E"])] }
  ];
  const BROWS = [
    { name: "없음", p: [] },
    { name: "일자", p: [P(11, 10, ["BBB"]), P(18, 10, ["BBB"])] },
    { name: "올라감", p: [P(11, 9, ["BB.", "..B"]), P(18, 9, [".BB", "B.."])] },
    { name: "처짐", p: [P(11, 9, [".BB", "B.."]), P(18, 9, ["BB.", "..B"])] },
    { name: "굵게", p: [P(11, 9, ["BB.", "BBB"]), P(18, 9, [".BB", "BBB"])] }
  ];
  const MOUTHS = [
    { name: "미소", p: [P(14, 16, ["E..E", ".EE."])] },
    { name: "작게", p: [P(15, 16, ["EE"])] },
    { name: "고양이", p: [P(13, 16, ["E.EE.E", ".E..E."])] },
    { name: "메롱", p: [P(14, 16, ["EEEE", ".mm."])] },
    { name: "활짝", p: [P(14, 16, [".EE.", "EmmE", ".EE."])] },
    { name: "놀람", p: [P(15, 16, ["EE", "EE"])] },
    { name: "송곳니", p: [P(14, 16, ["EEEE", "wmmw", ".EE."])] },
    { name: "씨익", p: [P(15, 16, ["..E", "EE."])] }
  ];
  const EARS = [P(7, 12, [".s", "sS", "ss"]), P(23, 12, ["s.", "Ss", "ss"])];
  const BLUSH = [P(10, 16, ["kk"]), P(20, 16, ["kk"])];
  const DARK = [P(12, 15, ["dd"]), P(18, 15, ["dd"])];
  const NOSE = [P(15, 15, ["kk"])];

  /* ---- 옷 ---- */
  const TOPS = [
    { name: "티셔츠", r: ["......SSSS......", "....cccccccc....", "...cccccccccc...", "..ccCccccccCcc..", "..ccCccccccCcc..", "..ssCccccccCss.."] },
    { name: "줄무늬", r: ["......SSSS......", "....cccccccc....", "...wwwwwwwwww...", "..ccCccccccCcc..", "..wwCwwwwwwCww..", "..ssCccccccCss.."] },
    { name: "후드", r: ["....cCSSSSCc....", "....ccwccwcc....", "...cccwccwccc...", "..ccCccccccCcc..", "..ccCcCCCCcCcc..", "..ssCccccccCss.."] },
    { name: "셔츠+넥타이", r: ["......SSSS......", "....ccCtCccc....", "...cccctccccc...", "..ccCcctcccCcc..", "..ccCccTcccCcc..", "..ssCccccccCss.."] },
    { name: "터틀넥", r: ["......cccc......", "....cCcccccc....", "...cccccccccc...", "..ccCccccccCcc..", "..ccCccccccCcc..", "..ssCccccccCss.."] },
    { name: "민소매", r: ["......SSSS......", "....cccccccc....", "...cccccccccc...", "..sSccccccccSs..", "..sSccccccccSs..", "..ssccccccccss.."] },
    { name: "멜빵", r: ["......SSSS......", "....cpccccpc....", "...ccpccccpcc...", "..ccCppppppCcc..", "..ccCpwppwpCcc..", "..ssPppppppPss.."] }
  ];
  const OUTERS = [
    { name: "없음", r: [] },
    { name: "재킷", r: ["....ooo..ooo....", "...oooo..oooo...", "..ooOoo..ooOoo..", "..ooOoo..ooOoo..", "..ssOoo..ooOss..", "....ooo..ooo...."] },
    { name: "제복", r: ["...ggoo..oogg...", "..gGgoo..oogGg..", "..ooOoo..ooOoo..", "..ooOog..goOoo..", "..ssOoo..ooOss..", "....oog..goo...."] },
    { name: "코트", r: ["....ooo..ooo....", "...oooo..oooo...", "..ooOoo..ooOoo..", "..ooOoo..ooOoo..", "..ssOoo..ooOss..", "....ooo..ooo....", "...ooo....ooo...", "...OOO....OOO..."] }
  ];
  const CAPE_BACK = P(6, 20, ["....vvvvvvvvvvvv....", "...vvvvvvvvvvvvvv...", "..vvvvvvvvvvvvvvvv..", ...fill(".vvvvvvvvvvvvvvvvvv.", 5), "vvvvvvvvvvvvvvvvvvvv", "VVVVVVVVVVVVVVVVVVVV"]);
  const CAPES = [
    { name: "없음", p: [] },
    { name: "망토", p: [P(8, 21, ["...vvvv..vvvv...", "..vvvvv..vvvvv..", "..vVvv....vvVv..", "..vVv......vVv.."])] },
    { name: "한쪽망토", p: [P(8, 21, ["...vvvv.........", "..vvvvvv........", "..vVvvv.........", "..vVvv.........."])] }
  ];
  const EPAULET = P(8, 21, ["...gggg..gggg...", "..gGgGg..gGgGg.."]);
  const BOTTOMS = [
    { name: "바지", r: ["....pppppppp....", "....pppppppp....", "....ppp..ppp....", "....ppp..ppp...."] },
    { name: "정장바지", r: ["....pppppppp....", "....pPpppppP....", "....pPp..pPp....", "....pPp..pPp...."] },
    { name: "반바지", r: ["....pppppppp....", "....pppppppp....", "....ppp..ppp....", "....sss..sss...."] },
    { name: "치마", r: ["...pppppppppp...", "..pppppppppppp..", "..PpPpPpPpPpPp..", ".....ss..ss....."] },
    { name: "롱치마", r: ["...pppppppppp...", "..pppppppppppp..", "..pppppppppppp..", "..PPPPPPPPPPPP.."] }
  ];
  const SHOES = [
    { name: "구두", p: P(8, 30, ["....fff..fff...."]) },
    { name: "운동화", p: P(8, 30, ["...wfff..fffw..."]) },
    { name: "부츠", p: P(8, 29, ["....fff..fff....", "....fFf..fFf...."]) },
    { name: "롱부츠", p: P(8, 28, ["....fFf..fFf....", "....fff..fff....", "....fFf..fFf...."]) }
  ];

  /* ---- 장식 ---- */
  const HEAD_ACC = [
    { name: "없음", p: [] },
    { name: "고깔모자", p: [P(11, 0, ["....ww....", "....aa....", "...aAaa...", "...aaAa...", "..aAaaAa..", "..aaaAaa..", ".wwwwwwww."])] },
    { name: "리본", p: [P(18, 4, ["aa.aa", "aaAaa", "aa.aa"])] },
    { name: "왕관", p: [P(12, 1, ["a..aa..a", "aa.aa.aa", "aaaaaaaa", "AAAAAAAA"])] },
    { name: "헤드폰", p: [P(8, 3, ["...aaaaaaaaaa...", "..a..........a..", ".a............a.", ".a............a.", ".a............a.", ".a............a."]), P(7, 9, ["aaa", "aAa", "aAa", "aAa", "aaa"]), P(22, 9, ["aaa", "aAa", "aAa", "aAa", "aaa"])] },
    { name: "고양이귀", p: [P(9, 1, ["h...", "hh..", "hkh.", "hkkh"]), P(19, 1, ["...h", "..hh", ".hkh", "hkkh"])] },
    { name: "꽃핀", p: [P(19, 5, [".a.", "awa", ".a."])] },
    { name: "산타모자", p: [P(9, 1, [".....aaaa......", "...aaaaaaaa....", "..aAaaaaaaaaaww", "wwwwwwwwwwwwwww", ".wWwwWwwWwwWww."])] }
  ];
  const FACE_ACC = [
    { name: "없음", p: [] },
    { name: "동그란안경", p: [P(10, 11, [".aaa....aaa.", "a...aaaa...a", "a...a..a...a", "a...a..a...a", ".aaa....aaa."])] },
    { name: "선글라스", p: [P(11, 12, ["EEEE..EEEE", "EwEEEEEwEE", "EEEE..EEEE"])] },
    { name: "반창고", p: [P(19, 15, ["www", "wWw"])] },
    { name: "하트스티커", p: [P(10, 15, ["a.a", "aaa", ".a."])] },
    { name: "별스티커", p: [P(10, 15, [".a.", "aaa", ".a."])] }
  ];
  const EAR_ACC = [
    { name: "없음", p: [] },
    { name: "피어싱", p: [P(7, 12, ["y"]), P(7, 14, ["y"]), P(24, 13, ["y"])] },
    { name: "귀걸이", p: [P(7, 15, ["y", "a"]), P(24, 15, ["y", "a"])] }
  ];
  const BG_PATTERNS = ["투명", "단색", "깅엄", "도트", "캔디", "반짝", "하트", "눈", "레이스", "하프톤"];

  const SW = {
    skin: ["#fdeee6", "#f6e2d8", "#f6d0b1", "#e8b48c", "#c98e66", "#8d5a3b", "#5e3b2a", "#e6e1ea"],
    hair: ["#1d1b22", "#1c2a26", "#5b3a29", "#8a5a3c", "#d8a657", "#efe0b9", "#f4f2f6", "#bfbcc8", "#c8323f", "#e58aab", "#5f74a8", "#6b8a68"],
    eye: ["#2f2833", "#6b4636", "#4a6a9a", "#2fa36f", "#c8323f", "#7a5ea8", "#c08a2e", "#e0578a"],
    cloth: ["#f7f5f9", "#1d1b22", "#34303a", "#c8323f", "#1f8f63", "#e0578a", "#f8bfd3", "#a8e6dc", "#d8a657", "#4a6a9a", "#7a5ea8", "#9a8a8f"],
    acc: ["#e0578a", "#c8323f", "#1f8f63", "#d9a441", "#fffafc", "#1d1b22", "#a8e6dc", "#7a5ea8"],
    bg: ["#fde8f0", "#f8bfd3", "#ffffff", "#e0578a", "#f6d3d8", "#d3f0e6", "#a8e6dc", "#e7e0f2", "#2a2340", "#3a1d2e"]
  };

  const blank = () => Array(N * N).fill(null);
  const DEFAULT = {
    front: 0, back: 0, streak: false, eyes: 0, brow: 0, mouth: 0, blush: true, dark: false, nose: false,
    top: 0, outer: 0, cape: 0, epaulet: false, bottom: 0, shoe: 1, headAcc: 1, faceAcc: 0, earAcc: 0, bgPat: 3,
    colors: { skin: "#f6d0b1", hair: "#5b3a29", streak: "#f4f2f6", eye: "#2f2833", top: "#f8bfd3", point: "#e0578a",
      outer: "#f7f5f9", cape: "#e0578a", bottom: "#4a6a9a", shoe: "#f7f5f9", acc: "#e0578a", bg: "#fde8f0" }
  };
  const PRESETS = {
    santa: { front: 2, back: 3, streak: true, eyes: 7, brow: 2, mouth: 7, blush: true, dark: false, nose: false,
      top: 3, outer: 0, cape: 1, epaulet: true, bottom: 1, shoe: 0, headAcc: 0, faceAcc: 0, earAcc: 0, bgPat: 2,
      colors: { skin: "#f6e2d8", hair: "#1f1c24", streak: "#f4f2f6", eye: "#6b4636", top: "#f7f5f9", point: "#1d1b22",
        outer: "#1d1b22", cape: "#26222c", bottom: "#34303a", shoe: "#1d1b22", acc: "#c8323f", bg: "#f6d3d8" } },
    orion: { front: 1, back: 1, streak: false, eyes: 4, brow: 0, mouth: 0, blush: true, dark: false, nose: false,
      top: 4, outer: 2, cape: 1, epaulet: true, bottom: 1, shoe: 3, headAcc: 0, faceAcc: 0, earAcc: 1, bgPat: 3,
      colors: { skin: "#fdeee6", hair: "#1c1b22", streak: "#f4f2f6", eye: "#2fa36f", top: "#1d1b22", point: "#1d1b22",
        outer: "#f7f5f9", cape: "#f7f5f9", bottom: "#f1eef4", shoe: "#ffffff", acc: "#e04a5f", bg: "#d3f0e6" } }
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const presetState = (k) => Object.assign(clone(PRESETS[k]), { paint: blank() });
  const normalize = (s) => {
    const d = clone(DEFAULT);
    s = Object.assign(d, s || {});
    s.colors = Object.assign(clone(DEFAULT.colors), (s && s.colors) || {});
    if (!Array.isArray(s.paint) || s.paint.length !== N * N) s.paint = blank();
    return s;
  };
  let state = normalize(PX.store.get("maker3", null));

  /* ---------- 합성 ---------- */
  function colorMap(s) {
    const c = s.colors;
    const mix = (a, b, t) => PX.rgbToHex(...PX.hexToRgb(a).map((v, i) => v * (1 - t) + PX.hexToRgb(b)[i] * t));
    return {
      s: c.skin, S: PX.shade(c.skin, 0.12), h: c.hair, H: PX.shade(c.hair, 0.3), l: PX.tint(c.hair, 0.14), B: PX.shade(c.hair, 0.25), b: s.streak ? c.streak : c.hair,
      e: c.eye, E: LINE, w: WHITE, W: "#e6dde3", k: mix(c.skin, "#ec7c90", 0.45), d: mix(c.skin, "#7a5a86", 0.3), m: MOUTH,
      c: c.top, C: PX.shade(c.top, 0.16), t: c.point, T: PX.shade(c.point, 0.2),
      o: c.outer, O: PX.shade(c.outer, 0.16), v: c.cape, V: PX.shade(c.cape, 0.2), g: GOLD, G: GOLD_D,
      p: c.bottom, P: PX.shade(c.bottom, 0.18), f: c.shoe, F: PX.shade(c.shoe, 0.16), a: c.acc, A: PX.shade(c.acc, 0.25), y: SILVER
    };
  }
  function stamp(g, part, cm) {
    part.r.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i]; if (ch === ".") continue;
        const x = part.x + i, y = part.y + j;
        if (x < 0 || y < 0 || x >= N || y >= N) continue;
        g[y * N + x] = cm[ch] || LINE;
      }
    });
  }
  const at = (list, i) => list[i] || list[0];
  function compose(s) {
    s = s || state;
    const cm = colorMap(s), g = Array(N * N).fill(null);
    const P8 = (y, r) => ({ x: 8, y, r });
    if (s.cape) stamp(g, CAPE_BACK, cm);
    at(BACKS, s.back).p.forEach((p) => stamp(g, p, cm));
    stamp(g, P8(26, at(BOTTOMS, s.bottom).r), cm);
    stamp(g, at(SHOES, s.shoe).p, cm);
    stamp(g, P8(20, at(TOPS, s.top).r), cm);
    if (s.outer) stamp(g, P8(21, at(OUTERS, s.outer).r), cm);
    at(CAPES, s.cape).p.forEach((p) => stamp(g, p, cm));
    if (s.epaulet) stamp(g, EPAULET, cm);
    EARS.forEach((p) => stamp(g, p, cm));
    stamp(g, HEAD, cm);
    if (s.dark) DARK.forEach((p) => stamp(g, p, cm));
    if (s.blush) BLUSH.forEach((p) => stamp(g, p, cm));
    if (s.nose) NOSE.forEach((p) => stamp(g, p, cm));
    at(BROWS, s.brow).p.forEach((p) => stamp(g, p, cm));
    at(EYES, s.eyes).p.forEach((p) => stamp(g, p, cm));
    at(MOUTHS, s.mouth).p.forEach((p) => stamp(g, p, cm));
    // 앞머리 + 브릿지 (머리카락 픽셀에만)
    const before = g.slice();
    stamp(g, at(FRONTS, s.front).p, cm);
    if (s.streak && !at(FRONTS, s.front).p.r.some((r) => r.includes("b"))) {
      const hairCols = new Set([cm.h, cm.H, cm.l]);
      STREAK.forEach(([x, y]) => { const i = y * N + x; if (hairCols.has(g[i]) || hairCols.has(before[i])) if (g[i] && hairCols.has(g[i])) g[i] = cm.b; });
    }
    at(FACE_ACC, s.faceAcc).p.forEach((p) => stamp(g, p, cm));
    at(EAR_ACC, s.earAcc).p.forEach((p) => stamp(g, p, cm));
    at(HEAD_ACC, s.headAcc).p.forEach((p) => stamp(g, p, cm));
    // 바깥 외곽선
    const out = g.slice();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (g[y * N + x]) continue;
      if ((x > 0 && g[y * N + x - 1]) || (x < N - 1 && g[y * N + x + 1]) || (y > 0 && g[(y - 1) * N + x]) || (y < N - 1 && g[(y + 1) * N + x])) out[y * N + x] = LINE;
    }
    const paint = s.paint || [];
    for (let i = 0; i < N * N; i++) { if (paint[i] === "x") out[i] = null; else if (paint[i]) out[i] = paint[i]; }
    return out;
  }

  function drawBg(ctx, s, size, scale) {
    const pat = s.bgPat, c = s.colors.bg;
    if (!pat) return;
    const T = (k) => PX.tint(c, k);
    const [hh, ss, vv] = PX.ui.rgb2hsv(...PX.hexToRgb(c));
    const D = (k) => PX.rgbToHex(...PX.ui.hsv2rgb(hh, Math.min(1, ss + k * 1.1), Math.max(0, vv - k * 0.55)));
    const px = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(x * scale, y * scale, scale, scale); };
    const W = size, dark = PX.hexToRgb(c).reduce((a, b) => a + b, 0) < 260;
    // 위가 밝은 계단식 그라데이션
    for (let y = 0; y < W; y++) { let col; if (pat === 7) col = D(0.34 - Math.floor(y / 4) * 0.035); else { const k = Math.max(0, 0.3 - Math.floor(y / 4) * 0.05); col = k ? T(k) : c; } ctx.fillStyle = col; ctx.fillRect(0, y * scale, W * scale, scale); }
    const HEART = [".#.#.", "#####", "#####", ".###.", "..#.."];
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      let col = null;
      if (pat === 2) { const a = (x >> 2) % 2, b = (y >> 2) % 2; if (a && b) col = D(0.22); else if (a || b) col = D(0.1); }
      if (pat === 3) { const ox = (Math.floor(y / 8) % 2) * 4, lx = (x + ox) % 8, ly = y % 8; if (lx >= 2 && lx <= 3 && ly >= 2 && ly <= 3) col = lx === 2 && ly === 2 ? "#ffffff" : D(0.16); }
      if (pat === 4) { const k = (x + y) % 8; if (k < 3) col = D(0.12); else if (k === 3) col = D(0.06); }
      if (pat === 6) { const ox = (Math.floor(y / 8) % 2) * 4, lx = (x + ox) % 8, ly = y % 8; if (lx < 5 && ly < 5 && HEART[ly][lx] === "#") col = lx === 1 && ly === 1 ? T(0.5) : D(0.18); }
      if (pat === 9) { const r = Math.hypot(x - 30, y - 1) / 34, cell = (x % 3 === 1 && y % 3 === 1); if (cell && r < 0.95) col = r < 0.5 ? D(0.26) : D(0.14); if (r < 0.35 && (x % 3 === 2 && y % 3 === 1)) col = D(0.26); }
      if (col) px(x, y, col);
    }
    if (pat === 5) {
      [[4, 5, 2], [26, 4, 2], [7, 24, 1], [27, 19, 2], [16, 2, 1], [2, 14, 1], [29, 11, 1], [21, 8, 1], [11, 9, 1]].forEach(([sx, sy, r]) => {
        px(sx, sy, "#ffffff");
        for (let i = 1; i <= r; i++) { const cc = i === r ? D(0.2) : "#ffffff"; px(sx + i, sy, cc); px(sx - i, sy, cc); px(sx, sy + i, cc); px(sx, sy - i, cc); }
      });
      [[9, 3], [20, 13], [3, 28], [24, 26], [13, 18]].forEach(([sx, sy]) => px(sx, sy, D(0.2)));
    }
    if (pat === 7) {
      for (let i = 0; i < 26; i++) { const x = (i * 11 + 3) % W, y = (i * 7 + (i % 3) * 5) % 26; px(x, y, i % 4 ? "#ffffff" : T(0.6)); if (i % 6 === 0) { px(x + 1, y, "#ffffff"); px(x - 1, y, "#ffffff"); px(x, y + 1, "#ffffff"); px(x, y - 1, "#ffffff"); } }
      for (let x = 0; x < W; x++) { const top = 27 + Math.round(Math.sin(x / 3.2) * 1.2); for (let y = top; y < W; y++) px(x, y, y === top ? "#ffffff" : "#eef1f8"); }
    }
    if (pat === 8) {
      const L = "#ffffff", LS = D(0.22);
      for (let i = 0; i < W; i++) {
        const sc = i % 4;
        [0, 1].forEach((d) => { px(i, d, L); px(i, W - 1 - d, L); px(d, i, L); px(W - 1 - d, i, L); });
        if (sc === 1 || sc === 2) { px(i, 2, L); px(i, W - 3, L); px(2, i, L); px(W - 3, i, L); }
        if (sc === 0) { px(i, 1, LS); px(i, W - 2, LS); px(1, i, LS); px(W - 2, i, LS); }
        if (sc === 3) { px(i, 3, LS); px(i, W - 4, LS); px(3, i, LS); px(W - 4, i, LS); }
      }
    }
    // 바닥 그림자
    if (pat !== 7) {
      const sh = dark ? T(0.12) : D(0.12);
      for (let x = 9; x <= 22; x++) px(x, 30, sh);
      for (let x = 11; x <= 20; x++) px(x, 31, sh);
      for (let x = 7; x <= 24; x++) if (x < 9 || x > 22) px(x, 30, D(0.06));
    } else { for (let x = 10; x <= 21; x++) px(x, 30, "#d6dcea"); }
  }
  function drawGrid(ctx, grid, ox, oy, scale, flip) {
    for (let i = 0; i < grid.length; i++) {
      if (!grid[i]) continue;
      ctx.fillStyle = grid[i];
      const x = i % N;
      ctx.fillRect(ox + (flip ? N - 1 - x : x) * scale, oy + Math.floor(i / N) * scale, scale, scale);
    }
  }

  /* ---------- 아바타 인코딩 ---------- */
  const CH = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function encode(grid) {
    grid = grid || compose();
    const pal = []; let body = "";
    for (const c of grid) {
      if (!c) { body += "."; continue; }
      let i = pal.indexOf(c);
      if (i < 0) { if (pal.length >= CH.length) i = 0; else { pal.push(c); i = pal.length - 1; } }
      body += CH[i];
    }
    return "v1:" + pal.map((c) => c.slice(1)).join(",") + ":" + body;
  }
  function decode(str) {
    try {
      const [v, pal, body] = String(str).split(":");
      if (v !== "v1" || !body || body.length !== N * N) return null;
      const p = pal.split(",").map((h) => "#" + h);
      return body.split("").map((ch) => (ch === "." ? null : p[CH.indexOf(ch)] || null));
    } catch (e) { return null; }
  }

  /* ---------- 히스토리 ---------- */
  const undoStack = [], redoStack = [];
  const snap = () => JSON.stringify(state);
  function commit() { undoStack.push(snap()); if (undoStack.length > 150) undoStack.shift(); redoStack.length = 0; }
  function undo() { if (!undoStack.length) return PX.toast("더 되돌릴 게 없어요"); redoStack.push(snap()); state = JSON.parse(undoStack.pop()); changed(true); PX.sfx("back"); }
  function redo() { if (!redoStack.length) return PX.toast("다시 할 게 없어요"); undoStack.push(snap()); state = JSON.parse(redoStack.pop()); changed(true); PX.sfx("blip"); }

  /* ---------- UI ---------- */
  const listeners = [];
  let root, cv, ctx, tool = null, paintColor = "#3a1d2e", gridOn = true, curTab = "face";
  function changed(rebuild) {
    PX.store.set("maker3", state);
    render(); if (rebuild) buildPanel(); else if (curTab === "save") refreshCard();
    listeners.forEach((fn) => fn());
  }
  function live() { PX.store.set("maker3", state); render(); listeners.forEach((fn) => fn()); }
  function render() { if (!ctx) return; ctx.clearRect(0, 0, N, N); drawBg(ctx, state, N, 1); drawGrid(ctx, compose(), 0, 0, 1); }

  const TABS = [["face", "얼굴"], ["hair", "헤어"], ["top", "상의"], ["bottom", "하의·신발"], ["acc", "장식"], ["bg", "배경"], ["save", "저장"]];
  function row(label, content) {
    const w = document.createElement("div"); w.className = "mk-row";
    const l = document.createElement("div"); l.className = "mk-label"; l.textContent = label;
    w.append(l, content); return w;
  }
  function chips(list, key) {
    const box = document.createElement("div"); box.className = "mk-chips";
    list.forEach((it, i) => {
      const b = document.createElement("button"); b.type = "button";
      b.className = "chip" + (state[key] === i ? " is-on" : "");
      b.textContent = typeof it === "string" ? it : it.name;
      b.onclick = () => { if (state[key] === i) return; commit(); state[key] = i; PX.sfx("move"); changed(true); };
      box.appendChild(b);
    });
    return box;
  }
  function toggle(key, on = "있음", off = "없음") {
    const box = document.createElement("div"); box.className = "mk-chips";
    [[true, on], [false, off]].forEach(([v, t]) => {
      const b = document.createElement("button"); b.type = "button";
      b.className = "chip" + (!!state[key] === v ? " is-on" : ""); b.textContent = t;
      b.onclick = () => { if (!!state[key] === v) return; commit(); state[key] = v; PX.sfx("move"); changed(true); };
      box.appendChild(b);
    });
    return box;
  }
  function swatches(list, ckey) {
    const box = document.createElement("div"); box.className = "mk-swatches";
    const cur = state.colors[ckey].toLowerCase();
    list.forEach((c) => {
      const b = document.createElement("button"); b.type = "button";
      b.className = "sw" + (cur === c ? " is-on" : ""); b.style.setProperty("--c", c); b.title = c;
      b.onclick = () => { if (state.colors[ckey] === c) return; commit(); state.colors[ckey] = c; PX.sfx("move"); changed(true); };
      box.appendChild(b);
    });
    let started = false;
    const pick = PX.ui.colorButton({
      value: cur, cls: "sw-custom" + (list.includes(cur) ? "" : " is-on"), title: "직접 고르기",
      onInput: (c) => { if (!started) { commit(); started = true; } state.colors[ckey] = c; live(); },
      onCommit: (c) => { state.colors[ckey] = c; started = false; changed(true); }
    });
    box.appendChild(pick);
    const hx = document.createElement("span"); hx.className = "hex-tag"; hx.textContent = cur.toUpperCase();
    box.appendChild(hx);
    return box;
  }
  function buildPanel() {
    const panel = PX.$(".mk-panel", root); if (!panel) return;
    const keep = panel.scrollTop; panel.innerHTML = "";
    const add = (l, c) => panel.appendChild(row(l, c));
    if (curTab === "face") {
      add("피부", swatches(SW.skin, "skin")); add("눈 모양", chips(EYES, "eyes")); add("눈 색", swatches(SW.eye, "eye"));
      add("눈썹", chips(BROWS, "brow")); add("입", chips(MOUTHS, "mouth"));
      add("볼터치", toggle("blush")); add("다크서클", toggle("dark")); add("코 홍조", toggle("nose"));
    } else if (curTab === "hair") {
      add("앞머리", chips(FRONTS, "front")); add("뒷머리", chips(BACKS, "back")); add("머리색", swatches(SW.hair, "hair"));
      add("브릿지", toggle("streak")); add("브릿지 색", swatches(SW.hair, "streak"));
    } else if (curTab === "top") {
      add("상의", chips(TOPS, "top")); add("상의 색", swatches(SW.cloth, "top")); add("넥타이 색", swatches(SW.cloth, "point"));
      add("겉옷", chips(OUTERS, "outer")); add("겉옷 색", swatches(SW.cloth, "outer"));
      add("망토", chips(CAPES, "cape")); add("망토 색", swatches(SW.cloth, "cape")); add("금장 견장", toggle("epaulet"));
    } else if (curTab === "bottom") {
      add("하의", chips(BOTTOMS, "bottom")); add("하의 색", swatches(SW.cloth, "bottom"));
      add("신발", chips(SHOES, "shoe")); add("신발 색", swatches(SW.cloth, "shoe"));
    } else if (curTab === "acc") {
      add("머리", chips(HEAD_ACC, "headAcc")); add("얼굴", chips(FACE_ACC, "faceAcc")); add("귀", chips(EAR_ACC, "earAcc"));
      add("장식 색", swatches(SW.acc, "acc"));
    } else if (curTab === "bg") {
      add("패턴", chips(BG_PATTERNS, "bgPat")); add("배경색", swatches(SW.bg, "bg"));
    } else if (curTab === "save") {
      const box = document.createElement("div"); box.className = "mk-save";
      box.innerHTML = `
        <div class="mk-row"><div class="mk-label">이름</div><input class="px-input mk-name" maxlength="12" placeholder="카드에 들어갈 이름"></div>
        <div class="mk-row"><div class="mk-label">PNG</div><div class="mk-chips">
          <button type="button" class="px-btn sm" data-save="char">캐릭터만 저장</button>
          <button type="button" class="px-btn sm" data-save="card">플레이어 카드 저장</button></div></div>
        <div class="mk-row"><div class="mk-label">복사</div><div class="mk-chips">
          <button type="button" class="px-btn sm ghost" data-save="copyimg">이미지 복사</button>
          <button type="button" class="px-btn sm ghost" data-save="copycode">캐릭터 코드 복사</button>
          <button type="button" class="px-btn sm ghost" data-save="pastecode">코드 붙여넣기</button></div></div>
        <div class="mk-cardprev"><canvas width="600" height="800"></canvas><span>플레이어 카드 미리보기</span></div>
        <p class="mk-note">캐릭터만 저장은 512×512 PNG예요. 배경을 ‘투명’으로 두면 배경 없이 저장돼요. 만든 캐릭터는 폴라로이드와 방명록 쪽지에도 쓰여요.</p>`;
      panel.appendChild(box);
      const nameIn = PX.$(".mk-name", box);
      nameIn.value = PX.store.get("cardName", "");
      let nt; nameIn.oninput = () => { PX.store.set("cardName", nameIn.value); clearTimeout(nt); nt = setTimeout(refreshCard, 150); };
      refreshCard();
      box.querySelectorAll("[data-save]").forEach((b) => (b.onclick = () => saveAction(b.dataset.save)));
    }
    panel.scrollTop = keep;
    PX.$$(".mk-tab", root).forEach((t) => t.classList.toggle("is-on", t.dataset.tab === curTab));
    PX.$$(".tool", root).forEach((t) => t.classList.toggle("is-on", t.dataset.tool === tool));
    paintBtn && paintBtn.setValue(paintColor);
    cv && cv.classList.toggle("is-painting", !!tool);
  }

  /* ---------- 그리기 ---------- */
  let drawing = false, last = null, paintBtn = null;
  function cellFromEvent(e) {
    const r = cv.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * N), y = Math.floor(((e.clientY - r.top) / r.height) * N);
    return x >= 0 && y >= 0 && x < N && y < N ? [x, y] : null;
  }
  function applyAt(x, y) { const i = y * N + x; if (tool === "pen") state.paint[i] = paintColor; else if (tool === "eraser") state.paint[i] = "x"; }
  function line(a, b) {
    let [x0, y0] = a; const [x1, y1] = b;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) { applyAt(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  }
  function pickColor(x, y) {
    let c = compose()[y * N + x];
    if (!c) { const t = document.createElement("canvas"); t.width = t.height = N; const tc = t.getContext("2d"); drawBg(tc, state, N, 1); const d = tc.getImageData(x, y, 1, 1).data; if (d[3]) c = PX.rgbToHex(d[0], d[1], d[2]); }
    if (c) { paintColor = c; tool = "pen"; buildPanel(); PX.toast("색을 가져왔어요 " + c.toUpperCase()); }
  }

  /* ---------- 저장 ---------- */
  function charCanvas(scale, withBg, s) {
    s = s || state;
    const c = document.createElement("canvas"); c.width = c.height = N * scale;
    const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    if (withBg) drawBg(x, s, N, scale);
    drawGrid(x, compose(s), 0, 0, scale);
    return c;
  }
  async function cardCanvas() {
    const W = 600, H = 800;
    try { await Promise.all([document.fonts.load('40px "NeoDunggeunmo"'), document.fonts.load('18px "Galmuri11"')]); } catch (e) {}
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    const ink = "#3a1d2e", pink = "#e0578a";
    x.fillStyle = "#fbe4ee"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#f3bfd2";
    for (let yy = 0; yy < H; yy += 10) for (let xx = (yy / 10) % 2 ? 5 : 0; xx < W; xx += 10) x.fillRect(xx, yy, 2, 2);
    const box = (bx, by, bw, bh, f, u) => { x.fillStyle = ink; x.fillRect(bx + u, by, bw - 2 * u, bh); x.fillRect(bx, by + u, bw, bh - 2 * u); x.fillStyle = f; x.fillRect(bx + u, by + u, bw - 2 * u, bh - 2 * u); };
    box(24, 24, W - 48, H - 48, "#ffffff", 8);
    x.fillStyle = pink; x.fillRect(48, 56, W - 96, 44); x.fillStyle = "#b83a6b"; x.fillRect(48, 96, W - 96, 4);
    PX.text(x, "SANTA", 64, 68, "#fff", 3); PX.text(x, "*", 64 + PX.textWidth("SANTA", 3) + 9, 68, "#ffd3e2", 3);
    PX.text(x, "ORION", 64 + PX.textWidth("SANTA", 3) + 30, 68, "#fff", 3); PX.text(x, "1ST ANNIV", W - 64, 68, "#fff", 3, "right");
    const S = 12, cx = (W - N * S) / 2, cy = 124;
    box(cx - 12, cy - 12, N * S + 24, N * S + 24, ink, 6);
    if (!state.bgPat) { x.fillStyle = "#fdf2f6"; x.fillRect(cx, cy, N * S, N * S); }
    x.drawImage(charCanvas(S, true), cx, cy);
    const name = (PX.store.get("cardName", "") || "PLAYER").slice(0, 12);
    x.fillStyle = ink; x.textAlign = "center"; x.font = '40px "NeoDunggeunmo", "Galmuri11", monospace'; x.fillText(name, W / 2, 594);
    x.fillStyle = "#b07c93"; x.font = '18px "Galmuri11", monospace'; x.fillText("산타 ♥ 오리온 1주년 기념 플레이어 카드", W / 2, 630);
    x.fillStyle = ink; x.fillRect(64, 664, W - 128, 4);
    const d = new Date(), p = (n) => String(n).padStart(2, "0");
    PX.text(x, "DAY " + PX.daysSinceStart(), 72, 688, ink, 3);
    PX.text(x, `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`, W - 72, 688, ink, 3, "right");
    PX.text(x, "P1", W / 2 - 60, 724, "#c8323f", 3, "center"); PX.text(x, "* * *", W / 2, 724, pink, 3, "center"); PX.text(x, "P2", W / 2 + 60, 724, "#1f8f63", 3, "center");
    return c;
  }
  function download(canvas, name) { PX.saveImage(canvas, name); }
  let cardCache = null, cardSeq = 0;
  async function refreshCard() {
    const my = ++cardSeq, c = await cardCanvas();
    if (my !== cardSeq) return;
    cardCache = c;
    const pv = root && PX.$(".mk-cardprev canvas", root);
    if (pv) { const x = pv.getContext("2d"); x.clearRect(0, 0, 600, 800); x.drawImage(c, 0, 0); }
  }
  PX.download = download;
  const codeString = () => "PXCHAR3:" + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  function loadCode(str) {
    try {
      const s = JSON.parse(decodeURIComponent(escape(atob(str.trim().replace(/^PXCHAR3:/, "")))));
      if (!s.colors) throw 0;
      commit(); state = normalize(s); changed(true); PX.sfx("select"); PX.toast("캐릭터를 불러왔어요"); return true;
    } catch (e) { PX.toast("올바른 캐릭터 코드가 아니에요"); return false; }
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) { const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove(); return ok; }
  }
  async function saveAction(kind) {
    PX.sfx("select");
    if (kind === "char") download(charCanvas(16, state.bgPat !== 0), "pixel-character.png");
    else if (kind === "card") download(cardCache || (await cardCanvas()), "player-card.png");
    else if (kind === "copyimg") {
      try { const blob = await new Promise((r) => charCanvas(16, state.bgPat !== 0).toBlob(r, "image/png")); await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); PX.toast("이미지를 복사했어요"); }
      catch (e) { PX.toast("이 환경에선 이미지 복사가 막혀 있어요. PNG 저장을 써 주세요"); }
    } else if (kind === "copycode") PX.toast((await copyText(codeString())) ? "캐릭터 코드를 복사했어요 (Ctrl+V로 불러오기)" : "복사에 실패했어요");
    else if (kind === "pastecode") {
      try { loadCode(await navigator.clipboard.readText()); } catch (e) { PX.toast("이 페이지에서 Ctrl+V로 붙여넣어 주세요"); }
    }
  }
  function randomize() {
    commit();
    const r = PX.pick, ri = (L) => PX.randi(0, L.length - 1);
    Object.assign(state, {
      front: ri(FRONTS), back: ri(BACKS), streak: Math.random() < 0.2, eyes: ri(EYES), brow: ri(BROWS), mouth: ri(MOUTHS),
      blush: Math.random() < 0.7, dark: Math.random() < 0.2, nose: Math.random() < 0.3, top: ri(TOPS),
      outer: Math.random() < 0.5 ? 0 : PX.randi(1, OUTERS.length - 1), cape: Math.random() < 0.75 ? 0 : PX.randi(1, 2), epaulet: Math.random() < 0.2,
      bottom: ri(BOTTOMS), shoe: ri(SHOES), headAcc: Math.random() < 0.4 ? 0 : ri(HEAD_ACC), faceAcc: Math.random() < 0.6 ? 0 : ri(FACE_ACC),
      earAcc: Math.random() < 0.7 ? 0 : ri(EAR_ACC), bgPat: PX.randi(1, BG_PATTERNS.length - 1)
    });
    state.colors = { skin: r(SW.skin.slice(0, 7)), hair: r(SW.hair), streak: r(SW.hair), eye: r(SW.eye), top: r(SW.cloth), point: r(SW.cloth),
      outer: r(SW.cloth), cape: r(SW.cloth), bottom: r(SW.cloth), shoe: r(SW.cloth), acc: r(SW.acc), bg: r(SW.bg) };
    PX.sfx("coin"); changed(true);
  }
  function clearPaint() { if (!state.paint.some((v) => v)) return PX.toast("지울 그림이 없어요"); commit(); state.paint = blank(); changed(true); PX.toast("그린 픽셀을 비웠어요"); }
  function resetAll() { commit(); state = normalize(null); changed(true); PX.toast("처음 상태로 돌렸어요 (Ctrl+Z로 취소)"); }

  /* ---------- 마운트 ---------- */
  function mount(el) {
    root = el;
    root.innerHTML = `
      <div class="mk-stage">
        <div class="mk-canvas-wrap px-frame ${gridOn ? "grid-on" : ""}"><canvas class="mk-canvas" width="${N}" height="${N}"></canvas><div class="mk-gridline"></div></div>
        <div class="mk-tools">
          <button type="button" class="tool" data-tool="pen" title="연필 (B)"><i class="ico ico-pen"></i>연필</button>
          <button type="button" class="tool" data-tool="eraser" title="지우개 (E)"><i class="ico ico-eraser"></i>지우개</button>
          <button type="button" class="tool" data-tool="picker" title="스포이드 (I)"><i class="ico ico-picker"></i>스포이드</button>
          <span class="paint-slot"></span>
        </div>
        <div class="mk-tools mk-tools-2">
          <button type="button" class="tool-s" data-act="undo" title="되돌리기 (Ctrl+Z)">↶</button>
          <button type="button" class="tool-s" data-act="redo" title="다시하기 (Ctrl+Shift+Z / Ctrl+Y)">↷</button>
          <button type="button" class="tool-s" data-act="grid" title="격자 (G)">#</button>
          <span class="mk-sep"></span>
          <button type="button" class="px-btn ghost sm" data-act="clearpaint">그림 비우기 (Del)</button>
          <button type="button" class="px-btn ghost sm" data-act="reset">초기화</button>
        </div>
      </div>
      <div class="mk-side">
        <div class="mk-presets"><span>불러오기</span>
          <button type="button" class="px-btn sm p1" data-preset="santa">P1 산타</button>
          <button type="button" class="px-btn sm p2" data-preset="orion">P2 오리온</button>
          <button type="button" class="px-btn sm ghost" data-act="random">랜덤 (R)</button>
        </div>
        <div class="mk-tabs">${TABS.map(([id, l]) => `<button type="button" class="mk-tab" data-tab="${id}">${l}</button>`).join("")}</div>
        <div class="mk-panel"></div>
        <div class="mk-keys"><b>단축키</b> Ctrl+Z 되돌리기 · Ctrl+Shift+Z/Ctrl+Y 다시 · Ctrl+C 코드 복사 · Ctrl+X 코드 복사 후 그림 비우기 · Ctrl+V 코드 붙여넣기 · Ctrl+S PNG 저장 · B 연필 · E 지우개 · I 스포이드 · R 랜덤 · G 격자 · Esc 도구 해제</div>
      </div>`;
    cv = PX.$(".mk-canvas", root); ctx = cv.getContext("2d");
    paintBtn = PX.ui.colorButton({ value: paintColor, title: "그리기 색", cls: "paint-color",
      onInput: (c) => (paintColor = c), onCommit: (c) => { paintColor = c; if (!tool || tool === "picker") tool = "pen"; buildPanel(); } });
    PX.$(".paint-slot", root).appendChild(paintBtn);
    PX.$$(".mk-tab", root).forEach((b) => (b.onclick = () => { curTab = b.dataset.tab; PX.sfx("blip"); buildPanel(); }));
    PX.$$(".tool", root).forEach((b) => (b.onclick = () => setTool(b.dataset.tool)));
    PX.$$("[data-act]", root).forEach((b) => (b.onclick = () => act(b.dataset.act)));
    PX.$$("[data-preset]", root).forEach((b) => (b.onclick = () => { commit(); state = presetState(b.dataset.preset); PX.sfx("coin"); changed(true); PX.toast(b.textContent + " 프리셋을 불러왔어요 (Ctrl+Z로 취소)"); }));
    cv.addEventListener("pointerdown", (e) => {
      if (!tool) { PX.toast("연필·지우개를 고르면 직접 그릴 수 있어요"); return; }
      const c = cellFromEvent(e); if (!c) return; e.preventDefault();
      if (tool === "picker") return pickColor(c[0], c[1]);
      commit(); drawing = true; last = c; cv.setPointerCapture(e.pointerId); applyAt(c[0], c[1]); render(); PX.sfx("paint");
    });
    cv.addEventListener("pointermove", (e) => { if (!drawing) return; const c = cellFromEvent(e); if (!c || (last && c[0] === last[0] && c[1] === last[1])) return; line(last || c, c); last = c; render(); });
    const end = () => { if (drawing) { drawing = false; last = null; changed(false); } };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    buildPanel(); render();
  }
  function setTool(t) { tool = tool === t ? null : t; PX.sfx("blip"); buildPanel(); }
  function act(a) {
    if (a === "undo") undo(); else if (a === "redo") redo();
    else if (a === "grid") { gridOn = !gridOn; PX.$(".mk-canvas-wrap", root).classList.toggle("grid-on", gridOn); }
    else if (a === "random") randomize(); else if (a === "clearpaint") clearPaint(); else if (a === "reset") resetAll();
  }

  /* ---------- 단축키 ---------- */
  const visible = () => root && root.closest(".stage") && root.closest(".stage").classList.contains("is-active") && !PX.$(".xmodal") && !PX.ui.colorPicker.isOpen();
  const typingIn = (e) => { const t = e.target; return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
  window.addEventListener("keydown", (e) => {
    if (!visible() || typingIn(e)) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (mod && k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (mod && ((k === "z" && e.shiftKey) || k === "y")) { e.preventDefault(); redo(); }
    else if (mod && k === "s") { e.preventDefault(); saveAction("char"); }
    else if (mod) return;
    else if (k === "b" || k === "p") setTool("pen"); else if (k === "e") setTool("eraser"); else if (k === "i") setTool("picker");
    else if (k === "r") randomize(); else if (k === "g") act("grid");
    else if (k === "delete" || k === "backspace") { e.preventDefault(); clearPaint(); }
    else if (k === "escape") { tool = null; buildPanel(); }
  });
  const hasSel = () => { const s = window.getSelection(); return s && String(s).length > 0; };
  document.addEventListener("copy", (e) => { if (!visible() || typingIn(e) || hasSel()) return; e.preventDefault(); e.clipboardData.setData("text/plain", codeString()); PX.toast("캐릭터 코드를 복사했어요"); });
  document.addEventListener("cut", (e) => {
    if (!visible() || typingIn(e) || hasSel()) return;
    e.preventDefault(); e.clipboardData.setData("text/plain", codeString());
    if (state.paint.some((v) => v)) { commit(); state.paint = blank(); changed(true); }
    PX.toast("코드를 복사하고 그린 픽셀을 비웠어요");
  });
  document.addEventListener("paste", (e) => {
    if (!visible() || typingIn(e)) return;
    const t = (e.clipboardData && e.clipboardData.getData("text/plain")) || "";
    if (t.trim().startsWith("PXCHAR3:")) { e.preventDefault(); loadCode(t); }
    else if (t) PX.toast("캐릭터 코드(PXCHAR3:…)만 붙여넣을 수 있어요");
  });

  PX.maker = {
    N, mount, compose, encode, decode, drawGrid, drawBg,
    getState: () => state,
    composePreset: (k) => compose(presetState(k)),
    presetState,
    onChange: (fn) => listeners.push(fn)
  };
})();
