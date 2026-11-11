// ============================== FILM ==============================
const TITLE = 'Allscore Tek Kişilik Tribün';
// Purpose (SKILL.md "First questions"): 'cinematic' or 'ad'.
const PURPOSE = 'ad';
// Look: authored "Gece stadı" on the cinematic-realistic family: sodium floodlights in fog, backlit black silhouettes,
// Allscore green carried only by the app (notifications, the phone's glow, the fan's scarf).
const LOOKS = {
  'night-stadium': { grade: 'contrast(1.08) saturate(0.96)', bloom: 0.32, texture: null, vignette: 0.38, grain: 0.045, grainHold: 1, hold: 30, line: 0, steps: 0,
    palette: { bg: '#040E17', ink: '#F4F6F8', accent: '#05D16E', dim: '#1B2A3A' } },
};
const LOOK_ID = 'night-stadium';
const LOOK = LOOKS[LOOK_ID];
const FINISH = { shutter: null, weave: 0, tone: null };
const FPS = 30;
const DURATION = 30;
const BPM = 100;
const BEAT0 = 0;
const beat = (n) => BEAT0 + n * 60 / BPM, bar = (n) => beat(4 * n);
const OWN_MUSIC = null;                     // the user picked a real open-licence recording; set once it is fetched
const INSTRUMENTS = [];
const CAST = {};
const FORMULAS = {};
// Allscore's mark: navy ground, green lead, white. Sodium is the world's light, never the brand's.
const PALETTE = { bg: '#040E17', ink: '#F4F6F8', accent: '#05D16E', dim: '#1B2A3A', sodium: '#F2A23A', flare: '#E0412F', fog: '#0B1A28' };
const TYPE = {
  lang: 'tr',
  roles: {
    display: { family: 'Barlow Condensed', files: { 600: 'fonts/BarlowCondensed-600.woff2', 700: 'fonts/BarlowCondensed-700.woff2', 800: 'fonts/BarlowCondensed-800.woff2' } },
    text: { family: 'Inter', files: { 400: 'fonts/Inter-400.woff2', 600: 'fonts/Inter-600.woff2' } },
    mono: null,
  },
  check: { strings: { display: ['GOL', 'DEREBOYU SK', 'Tüm skorlar, tek uygulama.', 'İĞÜŞÖÇ'], text: ['3. Lig\'e yükseldi', 'Süper Lig\'de', 'allscore.live'] }, sizes: { text: 0.04 } },
};

// One timeline for picture and sound.
const CUES = {
  phone: 0,          // the phone lights up in the crane cab
  out: 2.4,          // cut outside: the crane, the empty pitch
  promo: 6,          // "3. Lig'e yükseldi": scarves on the fence
  seasons: 10,       // time-lapse: the crane builds the stand
  truss: 15,         // the last roof truss swings in
  lock: 17.4,        // the truss locks; the roof light runs round the arc
  top: 19,           // top down: the stadium is the Allscore mark
  goal: 20,          // 90+3 GOL on the phone, a beat of silence
  roar: 20.6,        // the stadium roars
  card: 26,          // the end card
  end: DURATION,
};

const VO = [];                              // narration lines come after the voice pick
const CAPTIONS = null;
const CAPTION_STYLE = { role: 'display', accentRole: 'display', size: 0.062, caps: false, ink: PALETTE.ink, hi: PALETTE.ink, accent: PALETTE.accent, punch: 0.07 };

const SCENES = [
  { chapter: 'C1', from: CUES.phone, to: CUES.out, draw: phoneLights, action: 'the phone lights up and buzzes on the cab dash', amb: { kind: 'water', gain: 0.06 } },
  { chapter: 'C1', from: CUES.out, to: CUES.promo, draw: fanLeansOut, action: 'the lone fan leans out of the crane cab, scarf unfurling', in: { type: 'cut' }, amb: { kind: 'air', gain: 0.06 } },
  { chapter: 'C2', from: CUES.promo, to: CUES.truss, draw: notBuilt, action: 'later pass', in: { type: 'cut' }, amb: { kind: 'air', gain: 0.05 } },
  { chapter: 'C3', from: CUES.truss, to: CUES.goal, draw: trussLocks, action: 'the last roof truss locks and the roof light runs round the ring', in: { type: 'cut' }, amb: { kind: 'city', gain: 0.07 } },
  { chapter: 'C4', from: CUES.goal, to: CUES.end, draw: notBuilt, action: 'later pass', in: { type: 'cut' }, amb: { kind: 'city', gain: 0.07 } },
];

const SFX = [];
const ROOM = { secs: 2.6, decay: 3.4, tone: 4200 };
const ARRANGEMENT = [
  { section: 'alone', from: 0, to: CUES.promo, parts: [] },
  { section: 'grow', from: CUES.promo, to: CUES.truss, parts: [] },
  { section: 'summit', from: CUES.truss, to: CUES.goal, parts: [] },
  { section: 'roar', from: CUES.goal, to: CUES.end, parts: [] },
];

// ---------------- the 3D world (three.js, loaded locally before READY) ----------------
// World in metres, y up. Pitch at the origin along x. The tower crane stands in the south-east gap of the future
// stadium ring, where the Allscore mark leaves its opening; its cab looks north-west over the pitch.
const RING = { R: 118, r: 76, start: 17, len: 239 };            // the roof arc in degrees, measured from the logo
const CRANE = { x: 0.8 * 118, z: 0.18 * 118, h: 46 };           // the logo's upper green dot: the cab, the fan's seat
const W3 = {};                                                    // built once, reused by every frame
function three() {
  if (W3.ready) return W3;
  const T = window.THREE, r = rng(101);
  const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  scene.background = new T.Color('#050d16');
  scene.fog = new T.FogExp2(PALETTE.fog, 0.011);
  const cam = new T.PerspectiveCamera(38, W / H, 0.03, 3000);
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0.05, ...o });
  const add = (m, p) => { (p || scene).add(m); return m; };

  // sky glow: a faint sodium dome low on the horizon (the city behind the fog)
  scene.add(new T.HemisphereLight('#24384f', '#0a0604', 0.55));

  // ground: the amateur pitch, worn to mud in the goalmouths and the centre, puddles that catch the floodlight
  const gc = document.createElement('canvas'); gc.width = 1024; gc.height = 1024;
  const gx = gc.getContext('2d');
  gx.fillStyle = '#17240f'; gx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) { const a = r(), b = r(); gx.fillStyle = `rgba(${30 + 40 * r()},${40 + 50 * r()},${15 + 20 * r()},0.25)`; gx.fillRect(a * 1024, b * 1024, 2 + 4 * r(), 1 + 2 * r()); }
  const mud = (x, y, rx, ry) => { const gr = gx.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, 'rgba(46,32,20,0.95)'); gr.addColorStop(1, 'rgba(46,32,20,0)'); gx.fillStyle = gr; gx.save(); gx.translate(x, y); gx.scale(1, ry / rx); gx.translate(-x, -y); gx.beginPath(); gx.arc(x, y, rx, 0, TAU); gx.fill(); gx.restore(); };
  mud(512, 512, 150, 110); mud(150, 512, 110, 160); mud(874, 512, 110, 160);
  for (let i = 0; i < 40; i++) mud(100 + 824 * r(), 220 + 584 * r(), 20 + 60 * r(), 10 + 40 * r());
  gx.strokeStyle = 'rgba(225,225,210,0.55)'; gx.lineWidth = 4;         // chalk lines, half washed out
  gx.strokeRect(112, 232, 800, 560); gx.beginPath(); gx.moveTo(512, 232); gx.lineTo(512, 792); gx.stroke();
  gx.beginPath(); gx.arc(512, 512, 80, 0, TAU); gx.stroke();
  gx.strokeRect(112, 392, 120, 240); gx.strokeRect(792, 392, 120, 240);
  const groundTex = new T.CanvasTexture(gc); groundTex.colorSpace = T.SRGBColorSpace; groundTex.anisotropy = 4;
  const rc = document.createElement('canvas'); rc.width = 512; rc.height = 512;      // roughness: puddles are glossy
  const rx = rc.getContext('2d'); rx.fillStyle = '#e0e0e0'; rx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { const x = 60 + 392 * r(), y = 120 + 272 * r(), s = 6 + 26 * r(); const gr = rx.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, '#151515'); gr.addColorStop(1, 'rgba(224,224,224,0)'); rx.fillStyle = gr; rx.beginPath(); rx.ellipse(x, y, s * 1.6, s, 0, 0, TAU); rx.fill(); }
  const roughTex = new T.CanvasTexture(rc);
  const ground = add(new T.Mesh(new T.PlaneGeometry(140, 140), std('#ffffff', { map: groundTex, roughnessMap: roughTex, roughness: 1, metalness: 0.0 })));
  ground.rotation.x = -Math.PI / 2;
  const outer = add(new T.Mesh(new T.PlaneGeometry(1400, 1400), std('#0b0f0a', { roughness: 0.95 })));
  outer.rotation.x = -Math.PI / 2; outer.position.y = -0.05;

  // soft additive glow sprite and the volumetric cone material
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
  const glow = (color, size, p) => { const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); s.scale.set(size, size, 1); (p || scene).add(s); return s; };
  const coneMat = (color) => new T.ShaderMaterial({
    uniforms: { c: { value: new T.Color(color) }, a: { value: 0.12 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    vertexShader: 'varying float vy; varying vec3 vn; varying vec3 vv; void main(){ vy = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vn = normalize(normalMatrix*normal); vv = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; uniform float a; varying float vy; varying vec3 vn; varying vec3 vv; void main(){ float edge = pow(abs(dot(vn, vv)), 1.6); float fall = pow(max(vy,0.0), 1.3); gl_FragColor = vec4(c, a * edge * fall); }',
  });

  // floodlight pylons at the four corners of the amateur pitch: a lattice mast, a head of lamps, a cone of light
  W3.pylons = [];
  for (const [x, z] of [[-60, -44], [60, -44], [-60, 44], [60, 44]]) {
    const grp = add(new T.Group()); grp.position.set(x, 0, z);
    const mast = new T.Mesh(new T.CylinderGeometry(0.22, 0.38, 22, 6), std('#1a1d22', { metalness: 0.6, roughness: 0.55 })); mast.position.y = 11; grp.add(mast);
    for (let i = 0; i < 9; i++) { const brace = new T.Mesh(new T.BoxGeometry(0.06, 1.6, 0.06), std('#1a1d22', { metalness: 0.6 })); brace.position.set(0.3 * Math.cos(i * 2), 1.5 + i * 2.3, 0.3 * Math.sin(i * 2)); brace.rotation.z = 0.7; grp.add(brace); }
    const head = new T.Group(); head.position.y = 22.4; head.lookAt(new T.Vector3(x * 0.1, 0, z * 0.1)); grp.add(head);
    const frame = new T.Mesh(new T.BoxGeometry(3.2, 1.8, 0.3), std('#202329', { metalness: 0.5 })); head.add(frame);
    const lamps = [];
    for (let i = 0; i < 6; i++) { const l = new T.Mesh(new T.CircleGeometry(0.36, 16), new T.MeshBasicMaterial({ color: '#fff0c8', fog: false })); l.position.set(-1.05 + (i % 3) * 1.05, i < 3 ? 0.45 : -0.45, 0.17); head.add(l); lamps.push(l); }
    const halo = glow('#ffcf80', 9, head); halo.position.z = 0.4;
    const len = Math.hypot(x, z, 22) * 0.85;
    const cone = new T.Mesh(new T.ConeGeometry(14, len, 32, 1, true), coneMat('#ffc46e'));
    cone.geometry.translate(0, -len / 2, 0); cone.geometry.rotateX(-Math.PI / 2); head.add(cone);
    const spot = new T.SpotLight('#ffcf8a', 0, 140, 0.62, 0.55, 1.2); spot.position.set(x, 22.4, z); spot.target.position.set(x * 0.15, 0, z * 0.15); scene.add(spot); scene.add(spot.target);
    W3.pylons.push({ grp, lamps, halo, cone, spot });
  }

  // the amateur stand: one short run of three benches behind a mesh fence on the south touchline
  const benches = add(new T.Group()); benches.position.set(0, 0, 43.5);
  for (let i = 0; i < 3; i++) { const b = new T.Mesh(new T.BoxGeometry(22, 0.12, 0.5), std('#4a3a2a', { roughness: 0.9 })); b.position.set(0, 0.5 + i * 0.45, i * 0.8); benches.add(b); const st = new T.Mesh(new T.BoxGeometry(22, 0.45, 0.08), std('#2a2622')); st.position.set(0, 0.25 + i * 0.45, i * 0.8 - 0.25); benches.add(st); }
  const fence = add(new T.Group()); fence.position.set(0, 0, 41.5);
  for (let i = 0; i <= 24; i++) { const p = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1.4, 5), std('#7a7f86', { metalness: 0.7, roughness: 0.4 })); p.position.set(-60 + i * 5, 0.7, 0); fence.add(p); }
  const rail = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 120, 5), std('#8a8f96', { metalness: 0.7, roughness: 0.4 })); rail.rotation.z = Math.PI / 2; rail.position.y = 1.38; fence.add(rail);
  // goals
  for (const sx of [-54.5, 54.5]) { const gg = add(new T.Group()); gg.position.set(sx, 0, 0); const m = std('#e8e8e2', { roughness: 0.5 });
    for (const zz of [-3.66, 3.66]) { const p = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.44, 8), m); p.position.set(0, 1.22, zz); gg.add(p); }
    const bar = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 7.32, 8), m); bar.rotation.x = Math.PI / 2; bar.position.y = 2.44; gg.add(bar); }

  // the tower crane: lattice mast, slewing jib, counter-jib, the cab with its glass, the hook on its cable
  const crane = add(new T.Group()); crane.position.set(CRANE.x, 0, CRANE.z);
  const steel = std('#c9a227', { metalness: 0.55, roughness: 0.45 });                  // crane yellow, dulled by night
  const mastH = CRANE.h;
  for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const c = new T.Mesh(new T.BoxGeometry(0.18, mastH, 0.18), steel); c.position.set(cx, mastH / 2, cz); crane.add(c); }
  for (let i = 0; i < 23; i++) for (const side of [0, 1, 2, 3]) { const d = new T.Mesh(new T.BoxGeometry(0.08, 2.9, 0.08), steel); const a = side * Math.PI / 2; d.position.set(Math.cos(a) * 1, 1 + i * 2, Math.sin(a) * 1); d.rotation.set(0, -a, 0.75 * (i % 2 ? 1 : -1)); d.rotateOnAxis(new T.Vector3(1, 0, 0), 0); crane.add(d); }
  const slew = new T.Group(); slew.position.y = mastH; crane.add(slew);
  W3.slew = slew;
  const yawToPitch = Math.atan2(-(0 - CRANE.z), (0 - CRANE.x));                          // jib points at the pitch centre
  slew.rotation.y = yawToPitch + Math.PI;                                                // local -x looks at the pitch
  const jibLen = 62;
  for (const [yy, zz] of [[0, -0.8], [0, 0.8], [1.6, 0]]) { const c = new T.Mesh(new T.BoxGeometry(jibLen, 0.16, 0.16), steel); c.position.set(-jibLen / 2 + 2, 2.2 + yy, zz); slew.add(c); }
  for (let i = 0; i < 30; i++) { const d = new T.Mesh(new T.BoxGeometry(0.07, 1.9, 0.07), steel); d.position.set(1 - i * 2.05, 3.0, i % 2 ? 0.4 : -0.4); d.rotation.z = i % 2 ? 0.6 : -0.6; slew.add(d); }
  const cj = new T.Mesh(new T.BoxGeometry(18, 0.5, 1.4), steel); cj.position.set(10, 2.2, 0); slew.add(cj);
  const weight = new T.Mesh(new T.BoxGeometry(3, 2.4, 1.8), std('#55585c', { roughness: 0.8 })); weight.position.set(17, 1.2, 0); slew.add(weight);
  const apex = new T.Mesh(new T.BoxGeometry(0.4, 8, 0.4), steel); apex.position.set(0, 6, 0); slew.add(apex);
  const redLamp = glow('#ff3a2a', 3.2, slew); redLamp.position.set(0, 10.2, 0); W3.redLamp = redLamp;
  const jibLamp = glow('#ff3a2a', 2.2, slew); jibLamp.position.set(-jibLen + 3, 3.6, 0); W3.jibLamp = jibLamp;
  // the cab hangs at the front of the slewing ring, facing the pitch (local -x)
  const cab = new T.Group(); cab.position.set(-2.4, -0.6, 1.6); cab.rotation.y = Math.PI / 2; slew.add(cab);  // cab local -z = slew -x
  W3.cab = cab;
  const cabM = std('#d8d4c8', { roughness: 0.6, metalness: 0.2 });
  const box = (w, h, d, x, y, z, m = cabM) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); cab.add(b); return b; };
  box(2.4, 0.12, 2.6, 0, 0, 0); box(2.4, 0.12, 2.6, 0, 2.3, 0);                          // floor, roof
  box(0.1, 2.3, 2.6, -1.2, 1.15, 0); box(0.1, 2.3, 2.6, 1.2, 1.15, 0);                    // side frames (glass set in)
  box(2.4, 2.3, 0.1, 0, 1.15, 1.3);                                                        // back wall
  for (const x of [-1.15, 1.15]) box(0.12, 2.3, 0.12, x, 1.15, -1.3);                     // front pillars
  box(2.4, 0.7, 0.12, 0, 0.35, -1.3);                                                      // low front panel
  const dash = box(2.2, 0.08, 0.5, 0, 0.95, -1.0, std('#26292e', { roughness: 0.7 })); dash.rotation.x = -0.25;
  const seat = box(0.7, 0.12, 0.6, -0.35, 0.55, 0.2, std('#1b1c1f')); box(0.7, 0.8, 0.12, -0.35, 0.95, 0.5, std('#1b1c1f'));
  const levers = box(0.08, 0.5, 0.08, 0.45, 0.8, -0.35, std('#111')); levers.rotation.x = -0.3;
  const glassM = new T.MeshPhysicalMaterial({ color: '#9fb4c8', roughness: 0.08, metalness: 0, transmission: 0, transparent: true, opacity: 0.16, side: T.DoubleSide });
  const glassF = new T.Mesh(new T.PlaneGeometry(2.3, 1.55), glassM); glassF.position.set(0, 1.5, -1.3); cab.add(glassF);
  // rain on the windshield: drawn drops that slide, re-drawn per frame from t
  const dropC = document.createElement('canvas'); dropC.width = 512; dropC.height = 360; const dropTex = new T.CanvasTexture(dropC);
  const drops = new T.Mesh(new T.PlaneGeometry(2.3, 1.55), new T.MeshBasicMaterial({ map: dropTex, transparent: true, depthWrite: false, fog: false })); drops.position.set(0, 1.5, -1.285); cab.add(drops);
  W3.dropC = dropC; W3.dropTex = dropTex;
  // the phone on the dash: a black slab whose screen is a canvas (the Allscore notification)
  const phone = new T.Group(); phone.position.set(0.32, 1.0, -0.98); phone.rotation.set(-Math.PI / 2 + 0.25, 0, 0.18); cab.add(phone);
  const body = new T.Mesh(new T.BoxGeometry(0.075, 0.155, 0.008), std('#0c0d0f', { roughness: 0.3, metalness: 0.6 })); phone.add(body);
  const scrC = document.createElement('canvas'); scrC.width = 360; scrC.height = 760; const scrTex = new T.CanvasTexture(scrC); scrTex.colorSpace = T.SRGBColorSpace;
  const screen = new T.Mesh(new T.PlaneGeometry(0.069, 0.148), new T.MeshBasicMaterial({ map: scrTex, fog: false, toneMapped: false })); screen.position.z = 0.0042; phone.add(screen);
  const phoneLight = new T.PointLight(PALETTE.accent, 0, 3.2, 2); phoneLight.position.set(0, 0, 0.05); phone.add(phoneLight);
  W3.phone = phone; W3.scrC = scrC; W3.scrTex = scrTex; W3.phoneLight = phoneLight;
  const cabLight = new T.PointLight('#ffb870', 0.0, 4, 2); cabLight.position.set(0, 2.0, 0.6); cab.add(cabLight); W3.cabLight = cabLight;

  // the fan: a stylised silhouette (no face), black against the light, the green scarf the only colour on him
  const fan = new T.Group(); cab.add(fan); fan.position.set(-0.35, 0.6, 0.1); W3.fan = fan;
  const dark = std('#07080a', { roughness: 0.9 });
  const torso = new T.Mesh(new T.CapsuleGeometry(0.22, 0.42, 4, 10), dark); torso.position.y = 0.55; fan.add(torso);
  const head = new T.Mesh(new T.SphereGeometry(0.13, 16, 12), dark); head.position.y = 1.02; fan.add(head);
  const hood = new T.Mesh(new T.SphereGeometry(0.15, 16, 12, 0, TAU, 0, 1.9), dark); hood.position.set(0, 1.04, 0.03); fan.add(hood);
  const armL = new T.Mesh(new T.CapsuleGeometry(0.06, 0.45, 4, 8), dark); armL.position.set(-0.27, 0.62, -0.05); fan.add(armL);
  const armR = new T.Mesh(new T.CapsuleGeometry(0.06, 0.45, 4, 8), dark); armR.position.set(0.27, 0.62, -0.05); fan.add(armR);
  W3.fanParts = { torso, head, armL, armR };
  // the scarf: a strip whose vertices wave in the wind (set per frame)
  const scarfG = new T.PlaneGeometry(0.16, 1.4, 1, 28); const scarfTexC = document.createElement('canvas'); scarfTexC.width = 32; scarfTexC.height = 256;
  const sx = scarfTexC.getContext('2d'); for (let i = 0; i < 8; i++) { sx.fillStyle = i % 2 ? '#05D16E' : '#F4F6F8'; sx.fillRect(0, i * 32, 32, 32); } sx.fillStyle = '#05D16E'; sx.fillRect(0, 0, 32, 20);
  const scarfTex = new T.CanvasTexture(scarfTexC); scarfTex.colorSpace = T.SRGBColorSpace;
  const scarf = new T.Mesh(scarfG, std('#ffffff', { map: scarfTex, side: T.DoubleSide, roughness: 0.9, emissive: '#05D16E', emissiveIntensity: 0.08 }));
  scene.add(scarf); W3.scarf = scarf; W3.scarfBase = scarfG.attributes.position.array.slice();

  // rain: line segments placed each frame from seeded drops
  const N = 4200, rainPos = new Float32Array(N * 6);
  const rainG = new T.BufferGeometry(); rainG.setAttribute('position', new T.BufferAttribute(rainPos, 3));
  const rain = new T.LineSegments(rainG, new T.LineBasicMaterial({ color: '#a9c2da', transparent: true, opacity: 0.32, fog: true }));
  rain.frustumCulled = false; scene.add(rain); W3.rain = rain; W3.rainN = N; W3.rainSeed = Array.from({ length: N }, () => [r(), r(), r(), r()]);

  // the finished stadium: a ring bowl of tiers, the roof arc open where the crane stands, the crowd as phone lights
  const stadium = add(new T.Group()); W3.stadium = stadium; stadium.visible = false;
  const tierM = std('#1d2834', { roughness: 0.8 });
  for (let i = 0; i < 5; i++) {
    const rIn = 72 + i * 6, h = 2 + i * 5;
    const tier = new T.Mesh(new T.CylinderGeometry(rIn + 6, rIn, 5.2, 96, 1, true), tierM); tier.position.y = h; stadium.add(tier);
  }
  const outerWall = new T.Mesh(new T.CylinderGeometry(RING.R - 6, RING.R - 6, 26, 128, 1, true), std('#101a24', { roughness: 0.9, side: T.DoubleSide })); outerWall.position.y = 13; stadium.add(outerWall);
  // the roof: a flat annulus arc (the logo's ring) with a lit inner edge
  const a0 = RING.start * Math.PI / 180, aL = RING.len * Math.PI / 180;
  const roofShape = new T.Shape(); const seg = 128;
  for (let i = 0; i <= seg; i++) { const a = a0 + aL * i / seg; roofShape.lineTo(RING.R * Math.cos(a), -RING.R * Math.sin(a)); }
  for (let i = seg; i >= 0; i--) { const a = a0 + aL * i / seg; roofShape.lineTo(RING.r * Math.cos(a), -RING.r * Math.sin(a)); }
  const roofG = new T.ExtrudeGeometry(roofShape, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.4, bevelSegments: 2, curveSegments: 4 });
  const roofM = std('#dfe4ea', { roughness: 0.55, metalness: 0.3, emissive: '#ffffff', emissiveIntensity: 0 });
  const roof = new T.Mesh(roofG, roofM); roof.rotation.x = Math.PI / 2; roof.position.y = 30; stadium.add(roof);   // shape y -> world z
  W3.roof = roof; W3.roofM = roofM;
  // roof lamps along the inner edge: lit one after another when the truss locks
  W3.roofLamps = [];
  for (let i = 0; i < 90; i++) { const a = a0 + aL * (i + 0.5) / 90; const s = glow('#ffffff', 7, stadium); s.position.set(RING.r * Math.cos(a), 29.4, -RING.r * Math.sin(a)); s.material.opacity = 0; W3.roofLamps.push(s); }
  // the crowd: phone lights in the tiers (white, a few green: Allscore users)
  const CN = 14000, cpos = new Float32Array(CN * 3), ccol = new Float32Array(CN * 3);
  for (let i = 0; i < CN; i++) { const ti = Math.floor(r() * 5), a = r() * TAU, rr = 72.5 + ti * 6 + r() * 5.5, y = 2.4 + ti * 5 + (rr - 72.5 - ti * 6) * 0.85;
    cpos.set([rr * Math.cos(a), y, rr * Math.sin(a)], i * 3); const gr = r() < 0.22; ccol.set(gr ? [0.02, 0.82, 0.43] : [0.95, 0.95, 0.9], i * 3); }
  const crowdG = new T.BufferGeometry(); crowdG.setAttribute('position', new T.BufferAttribute(cpos, 3)); crowdG.setAttribute('color', new T.BufferAttribute(ccol, 3));
  const crowd = new T.Points(crowdG, new T.PointsMaterial({ size: 0.55, vertexColors: true, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false }));
  stadium.add(crowd); W3.crowd = crowd;
  // the last truss: the arc's final 18° section, hanging from the hook until it locks
  const lastShape = new T.Shape(); const b0 = a0 + aL - 18 * Math.PI / 180, bL = 18 * Math.PI / 180;
  for (let i = 0; i <= 24; i++) { const a = b0 + bL * i / 24; lastShape.lineTo(RING.R * Math.cos(a), -RING.R * Math.sin(a)); }
  for (let i = 24; i >= 0; i--) { const a = b0 + bL * i / 24; lastShape.lineTo(RING.r * Math.cos(a), -RING.r * Math.sin(a)); }
  const mid = b0 + bL / 2, cxm = (RING.R + RING.r) / 2 * Math.cos(mid), czm = -(RING.R + RING.r) / 2 * Math.sin(mid);
  const lastG = new T.ExtrudeGeometry(lastShape, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.4, bevelSegments: 2 });
  lastG.translate(-cxm, -czm, 0);
  const truss = new T.Mesh(lastG, roofM); truss.rotation.x = Math.PI / 2; stadium.add(truss); W3.truss = truss; W3.trussHome = [cxm, 30, czm];
  // the dots of the mark: the cab's green, the old pylon's green, the crane hook's white
  const disc = (c) => { const m = new T.Mesh(new T.CircleGeometry(0.2 * RING.R, 48), new T.MeshBasicMaterial({ color: c, transparent: true, fog: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; const h = glow(c, 0.9 * RING.R, m); h.position.z = 0.5; scene.add(m); return m; };
  W3.dotCab = disc(PALETTE.accent); W3.dotPylon = disc(PALETTE.accent); W3.dotHook = disc('#ffffff');
  [W3.dotCab, W3.dotPylon, W3.dotHook].forEach((d) => (d.visible = false));
  // stadium floodlights from the roof (used only when the stadium shows)
  W3.roofSpots = [];
  for (let i = 0; i < 4; i++) { const a = a0 + aL * (i + 0.5) / 4; const s = new T.SpotLight('#eef3ff', 0, 260, 0.9, 0.6, 1.0); s.position.set(RING.r * Math.cos(a), 30, -RING.r * Math.sin(a)); s.target.position.set(0, 0, 0); scene.add(s); scene.add(s.target); W3.roofSpots.push(s); }

  // the hook: cable + block, hanging from the jib trolley
  const hook = new T.Group(); scene.add(hook); W3.hook = hook;
  const cable = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1, 4), std('#222')); hook.add(cable); W3.cable = cable;
  const block = new T.Mesh(new T.BoxGeometry(0.8, 1.1, 0.5), std('#c9a227', { metalness: 0.5 })); hook.add(block); W3.block = block;

  Object.assign(W3, { T, renderer, scene, cam, ready: true });
  return W3;
}

// per-frame state: one function sets everything a frame shows from t alone
function setWorld(t, o) {
  const w = three(), T = w.T;
  // pylons: in the amateur years only the north-west lamp works, and it flickers
  w.pylons.forEach((p, i) => {
    const on = o.stadium ? 0 : (i === 0 ? 1 : 0);
    const fl = i === 0 && !o.stadium ? (noise1(t * 9 + 3) > 0.18 ? 1 : 0.15) * (0.85 + 0.15 * noise1(t * 31)) : 1;
    const v = on * fl;
    p.spot.intensity = 2600 * v; p.halo.material.opacity = 0.9 * v; p.cone.material.uniforms.a.value = 0.11 * v;
    p.lamps.forEach((l) => l.material.color.setRGB(0.12 + 0.88 * v, 0.1 + 0.84 * v, 0.08 + 0.7 * v));
    p.grp.visible = !o.stadium;
  });
  w.stadium.visible = !!o.stadium;
  w.roofSpots.forEach((s) => (s.intensity = o.stadium ? 9000 * (o.roofOn ?? 1) : 0));
  // crane: slewing a little in the wind, the red lamps blink
  w.slew.rotation.y = Math.atan2(-(0 - CRANE.z), (0 - CRANE.x)) + Math.PI + (o.slew || 0) + 0.004 * Math.sin(t * 0.7);
  const blink = (Math.floor(t * 1.2) % 2) ? 1 : 0.15; w.redLamp.material.opacity = blink; w.jibLamp.material.opacity = blink;
  // the phone screen
  drawPhone(w.scrC, t, o.phone || {}); w.scrTex.needsUpdate = true;
  w.phoneLight.intensity = (o.phone?.on ?? 0) * 1.4;
  w.cabLight.intensity = o.cabLight ?? 0.25;
  // rain on the windshield
  drawDrops(w.dropC, t); w.dropTex.needsUpdate = true;
  // the fan's pose
  const lean = o.lean ?? 0, f = w.fan;
  f.position.set(-0.35 - lean * 0.55, 0.6 + lean * 0.35, 0.1 - lean * 0.3); f.rotation.z = 0.4 * lean;   // he stands and leans out of the open left side
  w.fanParts.armL.rotation.z = -lean * 1.75; w.fanParts.armL.position.set(-0.27 - lean * 0.3, 0.62 + lean * 0.32, -0.05);
  w.fanParts.armR.rotation.x = -lean * 0.5;
  // the scarf: held in the right hand when he leans out, tied to the dash otherwise; it flows with the wind
  w.scene.updateMatrixWorld(true);
  const hand = new T.Vector3(0, -0.28, 0).applyMatrix4(w.fanParts.armL.matrixWorld);
  const anchor = lean > 0.05 ? hand : new T.Vector3(-0.7, 1.0, -1.05).applyMatrix4(w.cab.matrixWorld);
  const pos = w.scarf.geometry.attributes.position, base = w.scarfBase;
  const wind = new T.Vector3(0.6, 0, 0.8).normalize();
  const fly = lean > 0.05 ? lean : 0;
  for (let i = 0; i < pos.count; i++) {
    const bx = base[i * 3], by = base[i * 3 + 1], s = (0.7 - by) / 1.4;           // 0 at the knot, 1 at the tail
    const wave = Math.sin(t * 9 - s * 7) * 0.12 * s + Math.sin(t * 5.3 - s * 4) * 0.06 * s;
    const dx = wind.x * s * 1.3 * fly + bx * 0.9, dy = -s * 1.35 * (1 - 0.75 * fly) + wave * fly * 1.5, dz = wind.z * s * 1.3 * fly + wave * (1 - fly);
    pos.setXYZ(i, anchor.x + dx, anchor.y + dy, anchor.z + dz);
  }
  pos.needsUpdate = true; w.scarf.geometry.computeVertexNormals();
  // rain: seeded drops falling through a box around the camera
  const c = o.camPos, rp = w.rain.geometry.attributes.position.array, box = o.rainBox || 30, fall = 22;
  for (let i = 0; i < w.rainN; i++) {
    const [a, b, d, e] = w.rainSeed[i]; const x = c[0] + (a - 0.5) * box, z = c[2] + (b - 0.5) * box;
    const y = c[1] - box / 2 + ((d * box - t * fall) % box + box) % box; const l = 0.35 + e * 0.4;
    rp.set([x, y, z, x - 0.08 * l, y + l, z - 0.06 * l], i * 6);
  }
  w.rain.geometry.attributes.position.needsUpdate = true; w.rain.material.opacity = o.rain ?? 0.32;
  // the stadium's state
  if (o.stadium) {
    const lit = o.roofLit ?? 1;
    w.roofLamps.forEach((s, i) => (s.material.opacity = clamp(lit * 90 - i, 0, 1) * 0.95));
    w.roofM.emissiveIntensity = 0.85 * lit;
    const tp = o.truss ?? 1, [hx, hy, hz] = w.trussHome;                          // 0 hanging, 1 locked
    const swing = (1 - tp) * Math.sin(t * 2.1) * 0.06;
    w.truss.position.set(hx + (1 - tp) * 8, hy + (1 - EASE.out(tp)) * 14, hz + (1 - tp) * 10);
    w.truss.rotation.set(Math.PI / 2 + swing, 0, (1 - tp) * 0.25);
    w.hook.visible = true;
    const top = new T.Vector3(w.truss.position.x, CRANE.h + 2, w.truss.position.z);
    const len = top.y - (w.truss.position.y + 2.4);
    w.cable.scale.y = Math.max(0.1, len); w.cable.position.set(top.x, top.y - len / 2, top.z);
    w.block.position.set(top.x, w.truss.position.y + 2.6, top.z);
    w.crowd.material.opacity = 0.9;
    const dz = o.dots ?? 0;
    for (const [d, x, z] of [[w.dotCab, 0.8, 0.18], [w.dotPylon, 0.12, 0.82], [w.dotHook, 0.8, 0.82]]) {
      d.visible = dz > 0; d.material.opacity = dz; d.children[0].material.opacity = 0.5 * dz; d.position.set(x * RING.R, 33, z * RING.R);
    }
  } else { w.hook.visible = false; [w.dotCab, w.dotPylon, w.dotHook].forEach((d) => (d.visible = false)); }
  // the camera
  w.scene.fog.density = o.fog ?? 0.011;
  w.cam.position.set(...o.camPos); w.cam.up.set(...(o.up || [0, 1, 0])); w.cam.lookAt(...o.camAt);
  w.cam.fov = o.fov || 38; w.cam.updateProjectionMatrix();
  w.renderer.render(w.scene, w.cam);
  return w;
}
function blit(g, w) { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(w.renderer.domElement, 0, 0, W, H); }
// a point in the cab's frame, in world coordinates (camera paths inside the cab)
function cabPoint(x, y, z) { const w = three(); w.scene.updateMatrixWorld(true); const v = new w.T.Vector3(x, y, z).applyMatrix4(w.cab.matrixWorld); return [v.x, v.y, v.z]; }

// The Allscore notification as it appears on the phone: a lock screen with one card that drops in and settles.
function drawPhone(c, t, p) {
  const x = c.getContext('2d'), w = c.width, h = c.height, on = p.on ?? 0;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  if (on <= 0) return;
  x.globalAlpha = on;
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1a28'); gr.addColorStop(1, '#040E17'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(244,246,248,0.9)'; x.textAlign = 'center';
  x.font = typeFont(TYPE, 'display', 120, { weight: 600 }); x.fillText(p.clock || '21:47', w / 2, 190);
  x.font = typeFont(TYPE, 'text', 22, { weight: 400 }); x.fillStyle = 'rgba(244,246,248,0.6)'; x.fillText(p.date || 'Pazar, 14 Mart', w / 2, 230);
  // the card
  const k = p.card ?? 0; if (k <= 0) { x.globalAlpha = 1; return; }
  const y0 = 300 - (1 - MOTION.back(clamp(k), 1.2)) * 120, cw = w - 36, ch = 170;
  x.globalAlpha = on * clamp(k * 3);
  x.fillStyle = 'rgba(16,30,44,0.92)'; roundRect(x, 18, y0, cw, ch, 26); x.fill();
  x.strokeStyle = 'rgba(5,209,110,0.55)'; x.lineWidth = 2; roundRect(x, 18, y0, cw, ch, 26); x.stroke();
  allscoreMark(x, 58, y0 + 44, 22);
  x.textAlign = 'left'; x.fillStyle = 'rgba(244,246,248,0.7)'; x.font = typeFont(TYPE, 'text', 19, { weight: 600 }); x.fillText('ALLSCORE', 92, y0 + 51);
  x.textAlign = 'right'; x.fillStyle = 'rgba(244,246,248,0.45)'; x.font = typeFont(TYPE, 'text', 18, { weight: 400 }); x.fillText('şimdi', w - 40, y0 + 51);
  x.textAlign = 'left'; x.fillStyle = PALETTE.accent; x.font = typeFont(TYPE, 'display', 46, { weight: 800 }); x.fillText(p.head || 'GOL!', 40, y0 + 108);
  x.fillStyle = '#F4F6F8'; x.font = typeFont(TYPE, 'text', 21, { weight: 600 }); x.fillText(p.line || "67'  Dereboyu SK  1 : 0  Kuzey Gençlik", 40, y0 + 145);
  x.globalAlpha = 1;
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
// The Allscore mark from the logo: an open ring (17° to 256°, measured) and three dots in its opening.
function allscoreMark(x, cx, cy, R, o = {}) {
  const a0 = 17 * Math.PI / 180, a1 = 256 * Math.PI / 180, ring = o.ring ?? 1;
  x.save(); x.lineCap = 'butt'; x.strokeStyle = o.white || '#F4F6F8'; x.lineWidth = R * 0.36;
  x.beginPath(); x.arc(cx, cy, R * 0.82, -a0, -(a0 + (a1 - a0) * ring), true); x.stroke();   // canvas y is down
  const d = o.dots ?? 1, dr = R * 0.2;
  if (d > 0) { x.globalAlpha *= clamp(d * 3); x.fillStyle = PALETTE.accent; x.beginPath(); x.arc(cx + 0.8 * R, cy + 0.18 * R, dr * MOTION.back(clamp(d * 3)), 0, TAU); x.fill(); }
  if (d > 0.33) { x.fillStyle = PALETTE.accent; x.beginPath(); x.arc(cx + 0.12 * R, cy + 0.82 * R, dr * MOTION.back(clamp(d * 3 - 1)), 0, TAU); x.fill(); }
  if (d > 0.66) { x.fillStyle = '#F4F6F8'; x.beginPath(); x.arc(cx + 0.8 * R, cy + 0.82 * R, dr * MOTION.back(clamp(d * 3 - 2)), 0, TAU); x.fill(); }
  x.restore();
}
// Rain on the cab glass: seeded beads that hold, swell and run down in streaks.
function drawDrops(c, t) {
  const x = c.getContext('2d'), w = c.width, h = c.height; x.clearRect(0, 0, w, h);
  const r = rng(77);
  for (let i = 0; i < 220; i++) {
    const px = r() * w, py0 = r() * h, s = 1.5 + r() * 4.5, run = r() < 0.25, sp = 30 + r() * 80, ph = r() * 10;
    const py = run ? (py0 + ((t + ph) * sp) % (h + 40)) % (h + 40) - 20 : py0;
    x.fillStyle = 'rgba(190,210,230,0.32)'; x.beginPath(); x.ellipse(px, py, s * 0.8, s, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.5)'; x.beginPath(); x.arc(px - s * 0.25, py - s * 0.35, s * 0.28, 0, TAU); x.fill();
    if (run) { x.strokeStyle = 'rgba(190,210,230,0.16)'; x.lineWidth = s * 0.7; x.beginPath(); x.moveTo(px, py - s); x.lineTo(px + Math.sin(i) * 3, py - s - 40); x.stroke(); }
  }
}

// ---------------- scenes ----------------
// S1 · 0–2.4 · pull back + rise, 2.4 s, ease out, from the phone's screen to over the fan's shoulder and out the glass.
// The phone lights on frame 0 and buzzes (it rattles on the dash); the camera leaves the screen as the card settles.
function phoneLights(g, k, t, S) {
  const e = EASE.out(k);
  const buzz = t < 1.1 ? Math.sin(t * 160) * 0.0025 * (1 - t / 1.1) : 0;
  const w = three(); w.phone.position.x = 0.32 + buzz;
  const from = cabPoint(0.33, 1.2, -0.92), to = cabPoint(-0.05, 1.55, 0.75);
  const atA = cabPoint(0.32, 1.0, -0.98), atB = cabPoint(-0.2, 0.2, -6);
  const camPos = from.map((v, i) => lerp(v, to[i], e)), camAt = atA.map((v, i) => lerp(v, atB[i], EASE.inOut(clamp(k * 1.25))));
  setWorld(t, { camPos, camAt, fov: lerp(30, 52, e), phone: { on: clamp(t * 6), card: clamp((t - 0.15) * 2.2) }, cabLight: 0.12, lean: 0, rain: 0.2, rainBox: 14 });
  blit(g, w);
}
// S2 · 2.4–6 · low-angle crane up + slow orbit, 3.6 s, ease in-out, from the muddy touchline up to the crane's cab.
// The lone fan leans out of the cab and holds his green scarf into the wind; one floodlight flickers over an empty pitch.
function fanLeansOut(g, k, t, S) {
  const e = EASE.inOut(k), w = three();
  const lean = MOTION.at(t, CUES.out + 0.5, 1.6);
  const cabW = cabPoint(0, 1.2, 0);
  const camPos = [cabW[0] + lerp(16, 7, e), cabW[1] + lerp(7, 2.4, e), cabW[2] + lerp(13, 7.5, e)];
  const camAt = [lerp(cabW[0] - 40, cabW[0] - 6, e), lerp(cabW[1] - 34, cabW[1] - 4.5, e), lerp(cabW[2] - 8, cabW[2] - 1, e)];
  setWorld(t, { camPos, camAt, fov: lerp(46, 40, e), phone: { on: 0.6, card: 1 }, cabLight: 0.5, lean: EASE.out(lean), rain: 0.38, rainBox: 40 });
  blit(g, w);
}
// S4 · 15–20 · crane up to top down, 4 s, inertia ease, rising with the hook. The last roof truss swings in and locks
// (17.4); the roof light runs round the arc; from straight above the stadium reads as the Allscore mark (19).
function trussLocks(g, k, t, S) {
  const w = three();
  const lock = MOTION.at(t, CUES.truss, CUES.lock - CUES.truss);
  const rise = EASE.inertia(MOTION.at(t, CUES.truss + 0.6, CUES.top - CUES.truss - 0.6));
  const lit = MOTION.at(t, CUES.lock, 1.4);
  const dots = MOTION.at(t, CUES.top - 0.5, 0.9);
  const [hx, , hz] = w.trussHome;
  const side = [hx + 52, 34, hz + 40], above = [0, 650, 0.01];
  const camPos = side.map((v, i) => lerp(v, above[i], rise));
  const camAt = [lerp(hx, 0, rise), lerp(30, 0, rise), lerp(hz, 0, rise)];
  const up = [0, lerp(1, 0, rise), lerp(0, -1, rise)];
  setWorld(t, { stadium: true, truss: EASE.out(lock), roofLit: lit, dots, camPos, camAt, up, fov: lerp(44, 40, rise), fog: lerp(0.006, 0.0008, rise), rain: 0.18 * (1 - rise), rainBox: 60, cabLight: 0.4, phone: { on: 0 } });
  blit(g, w);
}
function notBuilt(g, k, t, S) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PALETTE.bg; g.fillRect(0, 0, S.W, S.H); }

function score(ctx, out) {
  // The user chose a real open-licence recording (STATE.md Music); it goes in OWN_MUSIC once fetched.
}
