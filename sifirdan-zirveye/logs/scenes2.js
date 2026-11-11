// The Allscore notification as a screen overlay: the film's signature, returning changed at each step of the rise.
// k: 0..1 its life (drops in, holds, lifts away); slot: 0 the top card, 1 the card under it (a stack).
function notif(g, S, k, head, line, slot = 0) {
  if (k <= 0 || k >= 1) return;
  const inK = MOTION.back(clamp(k / 0.18), 1.3), outK = EASE.in(clamp((k - 0.86) / 0.14));
  const w = S.W * 0.84, h = S.u * 0.2, x = (S.W - w) / 2, y = S.H * 0.13 + slot * (h + S.u * 0.025) - (1 - inK) * h * 0.8 - outK * h * 0.5;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = clamp(k / 0.08) * (1 - outK);
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = S.u * 0.04;
  g.fillStyle = 'rgba(10,24,36,0.9)'; roundRect(g, x, y, w, h, S.u * 0.035); g.fill(); g.shadowBlur = 0;
  g.strokeStyle = 'rgba(5,209,110,0.6)'; g.lineWidth = S.u * 0.003; roundRect(g, x, y, w, h, S.u * 0.035); g.stroke();
  allscoreMark(g, x + S.u * 0.06, y + S.u * 0.055, S.u * 0.024);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  setType(g, TYPE, 'text', S.u * 0.026, { weight: 600 }); g.fillStyle = 'rgba(244,246,248,0.72)'; g.fillText('ALLSCORE', x + S.u * 0.1, y + S.u * 0.064);
  g.textAlign = 'right'; setType(g, TYPE, 'text', S.u * 0.024, { weight: 400 }); g.fillStyle = 'rgba(244,246,248,0.5)'; g.fillText('şimdi', x + w - S.u * 0.04, y + S.u * 0.064);
  g.textAlign = 'left'; setType(g, TYPE, 'display', S.u * 0.062, { weight: 800 }); g.fillStyle = PALETTE.accent; g.fillText(head, x + S.u * 0.045, y + S.u * 0.132);
  setType(g, TYPE, 'text', S.u * 0.03, { weight: 600 }); g.fillStyle = '#F4F6F8'; g.fillText(line, x + S.u * 0.045, y + S.u * 0.178);
  g.restore();
}
// S3 · 6–10 · truck right along the rail, 4 s, ease in-out, low by the fence. The promotion buzzes in; one stranger
// ties a scarf on the rail, then the rail fills: ten scarves, nine people behind it, the lone lamp steady at last.
function scarvesTie(g, k, t, S) {
  const e = EASE.inOut(k), w = three();
  const fill = MOTION.at(t, CUES.promo + 0.9, 2.6);
  const camPos = [lerp(-34, -14, e), lerp(1.15, 1.5, e), lerp(37.6, 38.4, e)], camAt = [lerp(-14, 8, e), lerp(1.6, 1.9, e), lerp(42, 42.6, e)];
  setWorld(t, { camPos, camAt, fov: 40, allLamps: fill > 0.5, rail: clamp(0.09 + fill), fence: clamp(0.11 + fill * 0.95), rain: 0.3, rainBox: 30, cabLight: 0.5, phone: { on: 0 } });
  blit(g, w);
  notif(g, S, MOTION.at(t, CUES.promo + 0.1, 3.4), "3. Lig'e yükseldi", 'Dereboyu SK  ·  Sezon 2');
}
// S3b · 10–15 · locked-off wide from the hill behind the north stand, a slow push in, 5 s. Time-lapse: the stand rises
// tier by tier round the pitch, the crowd fills it, flares light red; "2. Lig", then "1. Lig" stack in.
function standRises(g, k, t, S) {
  const w = three(), grow = EASE.inOut(clamp(k * 1.08)), e = EASE.inOut(k);
  const camPos = [lerp(-150, -128, e), lerp(78, 64, e), lerp(-120, -100, e)], camAt = [CRANE.x * 0.25, 4, CRANE.z * 0.25];
  setWorld(t, { stadium: true, roof: false, grow, allLamps: true, flares: clamp((k - 0.3) * 1.6), camPos, camAt, fov: 40, fog: 0.004, rain: 0.12, rainBox: 120, cabLight: 0.6, phone: { on: 0 } });
  blit(g, w);
  notif(g, S, MOTION.at(t, CUES.seasons + 0.2, 4.6), "2. Lig'e yükseldi", 'Dereboyu SK  ·  Sezon 5', 0);
  notif(g, S, MOTION.at(t, CUES.seasons + 2.2, 2.6), "1. Lig'e yükseldi", 'Dereboyu SK  ·  Sezon 8', 1);
}
// S5 · 20–21.8 · close, handheld, on the phone in the fan's hand in the stand; the crowd a blur of lights behind.
// The 90+3 goal lands on the phone first; half a beat of silence; then the stand behind it erupts.
function goalBuzzes(g, k, t, S) {
  const w = three(), roar = MOTION.at(t, CUES.roar, 0.5);
  const fp = w.standFan.position, hh = CAM.handheld(CAM.base(), t, 1 + 2 * roar, 9);
  const camPos = [fp.x - 6 + hh.x * 0.6, fp.y + 2.4, fp.z - 3.5 + hh.y * 0.6], camAt = [fp.x + 6, fp.y + 3.4 + 2 * roar, fp.z + 3];
  setWorld(t, { stadium: true, standCrowd: true, cheer: roar, flares: 1, camPos, camAt, fov: 50, fog: 0.004, rain: 0, cabLight: 0, phone: { on: 0 } });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${(S.u * 0.012).toFixed(1)}px)`; g.drawImage(w.renderer.domElement, 0, 0, S.W, S.H); g.restore();
  // the phone, held up in a silhouette hand, the screen the only sharp thing
  const buzz = t < CUES.roar ? Math.sin(t * 150) * S.u * 0.004 * (1 - (t - CUES.goal) / 0.6) : 0;
  const pw = S.u * 0.62, ph = pw * 2.05, px = (S.W - pw) / 2 + buzz + hh.x * S.u * 0.01, py = S.H * 0.2 + hh.y * S.u * 0.01 - roar * S.u * 0.05;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#050607'; roundRect(g, px - S.u * 0.018, py - S.u * 0.018, pw + S.u * 0.036, ph + S.u * 0.036, S.u * 0.07); g.fill();
  const sg = g.createLinearGradient(0, py, 0, py + ph); sg.addColorStop(0, '#0b1c2a'); sg.addColorStop(1, '#040E17'); g.fillStyle = sg; roundRect(g, px, py, pw, ph, S.u * 0.055); g.fill();
  g.textAlign = 'center'; setType(g, TYPE, 'display', S.u * 0.15, { weight: 600 }); g.fillStyle = 'rgba(244,246,248,0.92)'; g.fillText('22:53', S.W / 2 + buzz, py + ph * 0.2);
  setType(g, TYPE, 'text', S.u * 0.028, { weight: 400 }); g.fillStyle = 'rgba(244,246,248,0.6)'; g.fillText('Pazar, 19 Mayıs', S.W / 2 + buzz, py + ph * 0.25);
  const ck = MOTION.back(clamp((t - CUES.goal) / 0.25), 1.3), cy = py + ph * 0.33 - (1 - ck) * S.u * 0.1;
  g.globalAlpha = clamp((t - CUES.goal) / 0.1);
  g.fillStyle = 'rgba(16,30,44,0.95)'; roundRect(g, px + S.u * 0.03, cy, pw - S.u * 0.06, S.u * 0.3, S.u * 0.04); g.fill();
  g.strokeStyle = 'rgba(5,209,110,0.7)'; g.lineWidth = S.u * 0.004; roundRect(g, px + S.u * 0.03, cy, pw - S.u * 0.06, S.u * 0.3, S.u * 0.04); g.stroke();
  allscoreMark(g, px + S.u * 0.09, cy + S.u * 0.06, S.u * 0.028);
  g.textAlign = 'left'; setType(g, TYPE, 'text', S.u * 0.026, { weight: 600 }); g.fillStyle = 'rgba(244,246,248,0.72)'; g.fillText('ALLSCORE', px + S.u * 0.135, cy + S.u * 0.07);
  setType(g, TYPE, 'display', S.u * 0.09, { weight: 800 }); g.fillStyle = PALETTE.accent; g.fillText("90+3'  GOL!", px + S.u * 0.065, cy + S.u * 0.17);
  setType(g, TYPE, 'text', S.u * 0.03, { weight: 600 }); g.fillStyle = '#F4F6F8'; g.fillText("Dereboyu SK Süper Lig'de", px + S.u * 0.065, cy + S.u * 0.24);
  g.restore();
  // the hand: a dark silhouette holding the phone from below
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#030405';
  g.beginPath(); g.moveTo(px - S.u * 0.05, S.H); g.bezierCurveTo(px - S.u * 0.04, py + ph * 0.75, px + S.u * 0.02, py + ph * 0.7, px + S.u * 0.06, py + ph * 0.78);
  g.lineTo(px + pw * 0.35, py + ph + S.u * 0.03); g.lineTo(px + pw * 0.75, S.H); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(px + pw + S.u * 0.005, py + ph * 0.62, S.u * 0.035, S.u * 0.07, 0.2, 0, TAU); g.fill();   // fingers round the edge
  g.restore();
  if (roar > 0) flash(g, S, 0.25 * (1 - roar));
}
// S6 · 21.8–26.5 · from the pitch, a slow tilt up, 4.7 s, ease in-out: the fan in the first row with his scarf held
// over his head among a roaring crowd, flares behind; the tilt ends on the crane above the gap, its cab dark and empty.
function fanInStand(g, k, t, S) {
  const w = three(), e = EASE.inOut(k), fp = w.standFan.position;
  const camPos = [fp.x - 15, 1.8 + e * 1.5, fp.z - 2.5], camAt = [lerp(fp.x, CRANE.x, e), lerp(fp.y + 1.6, CRANE.h + 1, e), lerp(fp.z, CRANE.z, e)];
  const raise = EASE.out(MOTION.at(t, CUES.wide, 0.8));
  setWorld(t, { stadium: true, standCrowd: true, cheer: 1, raise, flares: 1, camPos, camAt, fov: lerp(36, 44, e), fog: 0.004, rain: 0, cabLight: 0, phone: { on: 0 } });
  blit(g, w);
}
// S7 · 26.5–30 · locked, the end card: the ring draws itself, the three dots land on the beat, the line reads, the URL.
function markCloses(g, k, t, S) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const bg = g.createRadialGradient(S.W / 2, S.H * 0.4, 0, S.W / 2, S.H * 0.4, S.H * 0.7); bg.addColorStop(0, '#0a1a28'); bg.addColorStop(1, PALETTE.bg);
  g.fillStyle = bg; g.fillRect(0, 0, S.W, S.H);
  const ring = EASE.out(clamp((t - CUES.card) / 0.8)), dots = clamp((t - CUES.card - 0.55) / 0.9);
  const R = S.u * 0.2 * (1 + 0.02 * Math.sin((t - CUES.card) * 0.8)), cx = S.W / 2, cy = S.H * 0.4;
  allscoreMark(g, cx, cy, R, { ring, dots });
  const tk = clamp((t - CUES.card - 1.1) / 0.5), uk = clamp((t - CUES.card - 1.6) / 0.5);
  g.textAlign = 'center'; g.globalAlpha = tk; setType(g, TYPE, 'display', S.u * 0.085, { weight: 700 }); g.fillStyle = '#F4F6F8';
  g.fillText('Tüm skorlar, tek uygulama.', cx, cy + R * 1.75 + (1 - EASE.out(tk)) * S.u * 0.03);
  g.globalAlpha = uk; setType(g, TYPE, 'text', S.u * 0.036, { weight: 600 }); g.fillStyle = PALETTE.accent;
  g.fillText('allscore.live', cx, cy + R * 2.25 + (1 - EASE.out(uk)) * S.u * 0.02);
  g.restore();
}
