let ctx: AudioContext | null = null;
function ac() { return ctx || (ctx = new (window.AudioContext || (window as any).webkitAudioContext)()); }

function beep(freq: number, dur = 0.08, type: OscillatorType = "sine", gain = 0.06) {
  const a = ac(); const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = gain; o.connect(g); g.connect(a.destination);
  const t = a.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur);
}

export const SFX = {
  chip(){ beep(600, 0.05, "square", 0.05); },
  deal(){ beep(400, 0.05, "triangle", 0.05); },
  bust(){ beep(120, 0.18, "sawtooth", 0.07); },
  win(){ beep(660, 0.1, "square", 0.06); setTimeout(()=>beep(880,0.12,"square",0.06),110); },
  lose(){ beep(220, 0.12, "sine", 0.06); },
  shuffle(){ beep(300,0.05,"triangle",0.04); setTimeout(()=>beep(260,0.05,"triangle",0.04),60); setTimeout(()=>beep(220,0.05,"triangle",0.04),120); }
};