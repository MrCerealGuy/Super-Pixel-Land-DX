const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 160, H = 144, S = 2;
canvas.width = W * S; canvas.height = H * S;
const GRAV = 0.45, JUMP = -6.8, MOVE_SPEED = 2, MAX_FALL = 10;

// Expanded palette — GameBoy originals + Stardew-inspired modern pixel colors
const COL = {
  gbLightest: '#9bbc0f',  gbLight: '#8bac0f',  gbDark: '#306230',  gbDarkest: '#0f380f',
  bg: '#9bbc0f', light: '#8bac0f', dark: '#306230', darkest: '#0f380f',
  red: '#a02020', redLight: '#d04040', redDark: '#701818',
  blue: '#2020a0', blueLight: '#4040c0',
  white: '#c8c8c8', whiteOff: '#a8a8a8',
  skin: '#d8b878', skinDark: '#b89858',
  brown: '#6b4a2e', brownLight: '#8b6a4e',
  orange: '#d06020', orangeLight: '#f08040',
  yellow: '#c8c020', star: '#f0e840',
  water: '#2060a0', waterLight: '#3080c0',
  caveBg: '#0f1a0f', caveStone: '#2a3a2a',
  lava: '#d03020', lavaGlow: '#ff5030',
  sky: '#7bae0f', skyLight: '#9bbc0f', skyDark: '#5a8a0a',
  grass: '#9bbc0f', ground: '#306230', groundLight: '#3a7a3a',
  pipeDark: '#306230', pipeLight: '#8bac0f', pipeShadow: '#0f380f',
  cloud: '#9bbc0f',
};

// ---- Sprite System ----
// drawSprite(data, palette, x, y): renders a sprite where each char = 1 game-pixel (S×S canvas pixels)
// palette maps chars to color strings; '.' or falsy = transparent
function drawSprite(data, palette, x, y) {
  if (!data || !data.length) return;
  const h = data.length;
  for (let row = 0; row < h; row++) {
    const line = data[row];
    if (!line) continue;
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.') continue;
      const c = palette[ch];
      if (c) { ctx.fillStyle = c; ctx.fillRect(x + col, y + row, 1, 1); }
    }
  }
}
function spriteW(data) { return data && data[0] ? data[0].length : 0; }
function spriteH(data) { return data ? data.length : 0; }

// Player sprites (small 10×14, big 12×20) — drawn at 1×1 game-pixel = S×S canvas pixels
const SP = {
  // Hat, skin, shirt, overalls, shoes, eye
  pl: { 'H': COL.darkest, 'h': '#1a1a1a', 'S': COL.skin, 's': COL.skinDark, 'B': COL.light, 'b': COL.dark, 'O': COL.darkest, 'E': COL.light, 'R': COL.red, 'r': COL.redDark, 'W': COL.white, '.': null },
};
// Small player frames (10w×14h)
SP.s0 = [
  '..HHHHH...',
  '..HhHh....',
  '..SssS....',
  '.SSssSS...',
  '..E..E....',
  '.BBBBBB...',
  '.BBBBBB...',
  '.BBBBBB...',
  '..b..b....',
  '.OObOO....',
  '..OOOO....',
  '..OOOO....',
  '..OOOO....',
  '..OOOO....',
];
SP.s1 = [
  '..HHHHH...',
  '..HhHh....',
  '..SssS....',
  '.SSssSS...',
  '..E..E....',
  '.BBBBBB...',
  '.BBBBBB...',
  '.BBBBBB...',
  '..b..b....',
  '.OObOO....',
  '..OOOO....',
  '..OOOO....',
  '..OOOO....',
  '..OOOO....',
];
SP.s2 = [
  '..HHHHH...',
  '..HhHh....',
  '..SssS....',
  '.SSssSS...',
  '..E..E....',
  '.BBBBBB...',
  '.BBBBBB...',
  '.BBBBBB...',
  '..b..b....',
  '..ObOO....',
  '.OOoOO....',
  '..OOO.....',
  '..OOO.....',
  '..OOO.....',
];
SP.s3 = [
  '..HHHHH...',
  '..HhHh....',
  '..SssS....',
  '.SSssSS...',
  '..E..E....',
  '.BBBBBB...',
  '.BBBBBB...',
  '.BBBBBB...',
  '..b..b....',
  '.OObOO....',
  '..OOOO....',
  '..OOOO....',
  '..OOOO....',
  '..OOOO....',
];
// Big player frames (12w×20h)
SP.b0 = [
  '...HHHHH...',
  '...HhHh....',
  '...SssS....',
  '..SSssSS...',
  '...E..E....',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '...b..b....',
  '..OObOO....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
];
SP.b1 = [
  '...HHHHH...',
  '...HhHh....',
  '...SssS....',
  '..SSssSS...',
  '...E..E....',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '...b..b....',
  '..OObOO....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
];
SP.b2 = [
  '...HHHHH...',
  '...HhHh....',
  '...SssS....',
  '..SSssSS...',
  '...E..E....',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '...b..b....',
  '..ObOO.....',
  '.OOoOO.....',
  '..OOO......',
  '..OOO......',
  '..OOO......',
  '..OOO......',
  '..OOO......',
  '..OOO......',
];
SP.b3 = [
  '...HHHHH...',
  '...HhHh....',
  '...SssS....',
  '..SSssSS...',
  '...E..E....',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '..BBBBBB...',
  '...b..b....',
  '..OObOO....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
  '..OOOO.....',
];

// Enemy sprites
SP.goomba = [
  '..HHHHHH..',
  '.HHHHHHHH.',
  '.HSSssSHH.',
  '.HsssssHH.',
  '.HsssssHH.',
  '.HHHHHHHH.',
  '.HHHHHHHH.',
  '..H....H..',
  '.HHbHHbHH.',
  '.HHHHHHHH.',
];
SP.goombaPal = { 'H': COL.darkest, 'S': COL.skin, 's': COL.skinDark, 'b': COL.dark, '.': null };

SP.koopa = [
  '..RRRRRR..',
  '.RRRRRRRR.',
  '.RsssssRR.',
  '.RsssssRR.',
  '.RRRRRRRR.',
  '.RRRRRRRR.',
  '..R....R..',
  '.RRbRRbRR.',
  '.RRRRRRRR.',
];
SP.koopaPal = { 'R': COL.red, 's': COL.skin, 'b': COL.dark, '.': null };

SP.star = [
  '...RRR....',
  '..RRRRRR..',
  '.RR.RR.RR.',
  'RRRRRRRRRR',
  'RRRRRRRRRR',
  '.RR.RR.RR.',
  '..RRRRRR..',
  '...R..R...',
];
SP.starPal = { 'R': COL.star, '.': null };
SP.starSmall = [
  '.RRR.',
  'RRRRR',
  'RRRRR',
  '.RRR.',
];
SP.starSmallPal = { 'R': COL.star, '.': null };

const BIOME = {
  MEADOW: 0, CAVE: 1, SKY: 2, VOLCANO: 3
};

let fireballs = [];
let camera = { x: 0 };
let platforms = [], coins = [], enemies = [], particles = [], movingPlats = [];
let questBlocks = [], powerups = [], pipes = [], checkpoints = [], powerUpPopups = [];
let score = 0, coinCount = 0, lives = 3, distance = 0, highScore = 0;
let cheatInfiniteLives = false, cheatImmortal = false, cheatUnlockAll = false;
let gameRunning = false, gameOver = false, screenShake = 0, animTick = 0;
let biome = BIOME.MEADOW, biomeTrans = 0;
let countdown = 0, pendingLevel = 0, pendingSeed = 0;
let comboCount = 0, comboTimer = 0;
let killstreakCount = 0, killstreakWindow = 0, killstreakTimer = 0, killstreakPopup = 0;
let lastEnemySpawnX = 0, levelGaps = [];
let goalFlag = null;
let inBonusRoom = false, bonusCoins = [], bonusBlocks = [], bonusRoomPipe = null, bonusRoomTimer = 0, bonusExitCooldown = 0;
let gameScreen = 'start', currentLevel = 0, selectedLevel = 0, mapTimer = 0;
const levels = [
  {name:'WIESE', x:20, y:110, completed:false, biome:BIOME.MEADOW},
  {name:'HOHLE', x:60, y:85, completed:false, biome:BIOME.CAVE},
  {name:'HIMMEL', x:105, y:105, completed:false, biome:BIOME.SKY},
  {name:'VULKAN', x:130, y:65, completed:false, biome:BIOME.VOLCANO},
  {name:'FESTUNG', x:80, y:35, completed:false, biome:BIOME.MEADOW},
];
const keys = { left: false, right: false, jump: false, jumpPressed: false, down: false, shoot: false, shootPressed: false };

// ---- Multiplayer ----
let mpConn = null;
const mp = {
  connected: false, id: null, room: null, host: false,
  seed: null, prng: null, players: {}, localName: '',
  lobbyLevel: 0, stateSeq: 0
};
function mpPRNG(s) {
  let a = s >>> 0;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function mpSend(data) { if (mpConn && mpConn.readyState === WebSocket.OPEN) mpConn.send(JSON.stringify(data)); }
function mpSendEvent(event, data) {
  if (mp.connected) mpSend({ type: 'game_event', event, data });
}
// ---- Player ----
const player = {
  x: 20, y: 100, w: 10, h: 14, vx: 0, vy: 0,
  onGround: false, facing: 1, frame: 0, frameTimer: 0,
  dead: false, won: false, big: false, star: 0, invTimer: 0, shoot: false, canDoubleJump: true
};

// ---- Audio ----
let audioCtx = null;
let starOsc = null, starGain = null, starFrame = 0;
let ksOsc = null, ksGain = null, ksFrame = 0;
function getAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playBeep(freq, dur, type, vol) {
  try { const c = getAudio(); const o = c.createOscillator(), g = c.createGain(); o.type = type||'square'; o.frequency.value = freq; g.gain.value = vol||0.06; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime+dur); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+dur); } catch(e) {}
}
function sfxJump() { playBeep(400,0.1,'square',0.06); setTimeout(()=>playBeep(600,0.08,'square',0.04),50); }
function sfxCoin() { playBeep(988,0.06,'square',0.05); setTimeout(()=>playBeep(1319,0.08,'square',0.04),60); }
function sfxStomp() { playBeep(200,0.15,'square',0.07); }
function sfxDie() { playBeep(300,0.1,'square',0.07); setTimeout(()=>playBeep(200,0.15,'square',0.06),100); setTimeout(()=>playBeep(100,0.2,'square',0.05),250); }
function sfxPowerUp() { playBeep(660,0.08,'square',0.06); setTimeout(()=>playBeep(880,0.08,'square',0.06),80); setTimeout(()=>playBeep(1100,0.12,'square',0.06),160); }
function sfxBlock() { playBeep(300,0.05,'square',0.04); }
function sfxStar() { playBeep(880,0.08,'square',0.05); setTimeout(()=>playBeep(1100,0.08,'square',0.05),80); setTimeout(()=>playBeep(1320,0.08,'square',0.05),160); setTimeout(()=>playBeep(1760,0.15,'square',0.05),240); }
function sfxHit() { playBeep(200,0.12,'square',0.07); }
function sfxFire() { playBeep(1200,0.05,'square',0.04); playBeep(800,0.06,'square',0.03); }
function sfxFlagpole() {
  playBeep(800,0.06,'square',0.05);
  setTimeout(()=>playBeep(600,0.06,'square',0.05),60);
  setTimeout(()=>playBeep(400,0.08,'square',0.05),120);
  setTimeout(()=>playBeep(300,0.1,'square',0.04),180);
}
function stopStarMusic() {
  if (starOsc) {
    try { starGain.gain.value = 0; starOsc.stop(); } catch(e) {}
    starOsc = null; starGain = null;
  }
}
function startKillstreakMusic() {
  try {
    const c = getAudio();
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; g.gain.value = 0.025;
    o.connect(g); g.connect(c.destination); o.start();
    ksOsc = o; ksGain = g; ksFrame = 0;
  } catch(e) {}
}
function stopKillstreakMusic() {
  if (ksOsc) {
    try { ksGain.gain.value = 0; ksOsc.stop(); } catch(e) {}
    ksOsc = null; ksGain = null;
  }
}

function saveHighScore() { try { localStorage.setItem('splDxHS', highScore); } catch(e) {} }
function loadHighScore() { try { const v = localStorage.getItem('splDxHS'); if (v) highScore = parseInt(v)||0; return highScore; } catch(e) { return 0; } }

function saveProgress() {
  try {
    const data = { levels: levels.map(l=>l.completed), score, coinCount, lives };
    localStorage.setItem('splDxSave', JSON.stringify(data));
  } catch(e) {}
}
function loadProgress() {
  try {
    const raw = localStorage.getItem('splDxSave');
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.levels) for (let i=0;i<levels.length;i++) levels[i].completed = !!data.levels[i];
    if (data.score !== undefined) score = data.score;
    if (data.coinCount !== undefined) coinCount = data.coinCount;
    if (data.lives !== undefined) lives = data.lives;
    return true;
  } catch(e) { return false; }
}
function continueGame() {
  if (!loadProgress()) return;
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('singleplayerScreen').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('helpScreen').classList.add('hidden');
  document.getElementById('cheatScreen').classList.add('hidden');
  document.getElementById('confirmDialog').classList.add('hidden');
  currentLevel = 0; selectedLevel = 0;
  document.getElementById('scoreDisplay').textContent=String(score).padStart(6,'0');
  document.getElementById('coinsDisplay').textContent=String(coinCount).padStart(2,'0');
  gameScreen = 'map'; gameRunning = true; gameOver = false;
  document.getElementById('mapScreen').classList.remove('hidden');
  goFullscreen();
}

// ---- Level Building ----
function rand(min,max){
  const r = mp.seed !== null ? mp.prng() : Math.random();
  return min + r * (max - min);
}
function randInt(min,max){return Math.floor(rand(min,max+1));}
function inGap(x,gaps){for(const g of gaps)if(x>=g[0]&&x<g[1])return true;return false;}

function buildLevel(levelIndex) {
  platforms=[]; coins=[]; enemies=[]; particles=[]; movingPlats=[];
  questBlocks=[]; powerups=[]; pipes=[]; checkpoints=[]; fireballs=[];
  const L = 10000;
  biome = (levelIndex!==undefined) ? levels[levelIndex].biome : BIOME.MEADOW;

  // Use level index to vary seeds for different levels
  const seed = (levelIndex||0) * 1337 + 42;

  // ---- Generate random gaps per biome ----
  const gapCfgs = [
    {min:400,max:1900,count:3,gapW:[32,48]},
    {min:2100,max:4900,count:5,gapW:[32,48]},
    {min:5100,max:7400,count:5,gapW:[32,48]},
    {min:7600,max:9800,count:5,gapW:[32,48]},
  ];
  const gaps = [];
  for (const cfg of gapCfgs) {
    for (let n=0; n<cfg.count; n++) {
      for (let t=0; t<100; t++) {
        const w = randInt(cfg.gapW[0]/16, cfg.gapW[1]/16)*16;
        const x = randInt(cfg.min/16, (cfg.max-w)/16)*16;
        if (gaps.some(g=>x<g[1]+80&&x+w>g[0]-80)) continue;
        gaps.push([x, x+w]); break;
      }
    }
  }
  levelGaps = gaps;

  // ---- Ground with gaps ----
  for (let x=0; x<L; x+=16) {
    let skip=false;
    for (const g of gaps) { if (x>=g[0]&&x<g[1]) { skip=true; break; } }
    if (!skip) platforms.push({x, y:H-16, w:16, h:16, type:'ground'});
  }

  // ---- Random platforms per biome ----
  const platSegs = [
    {start:150,end:1950,count:12,yRange:[H-48,H-130],wRange:[32,64]},
    {start:2100,end:4900,count:18,yRange:[H-48,H-130],wRange:[32,64]},
    {start:5100,end:7400,count:18,yRange:[H-48,H-140],wRange:[32,64]},
    {start:7600,end:9700,count:18,yRange:[H-48,H-140],wRange:[32,64]},
  ];
  function expand(r,pad){return{x:r.x-pad,y:r.y-pad,w:r.w+pad*2,h:r.h+pad*2};}
  function vertTooClose(a,b,minGap){
    if(a.x>=b.x+b.w||a.x+a.w<=b.x)return false;
    const gap=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    if(gap>0)return true; // overlapping vertically
    const dist=Math.max(a.y,b.y)-Math.min(a.y+a.h,b.y+b.h);
    return dist<minGap;
  }
  for (const seg of platSegs) {
    for (let i=0; i<seg.count; i++) {
      for (let t=0; t<50; t++) {
        const x = randInt(seg.start/16, (seg.end-32)/16)*16;
        if (inGap(x,gaps)) continue;
        const y = randInt(seg.yRange[1], seg.yRange[0]);
        const w = randInt(seg.wRange[0]/16, seg.wRange[1]/16)*16;
        const rr=expand({x,y,w,h:8},8);
        if (platforms.some(p=>p.type==='platform'&&(rectCollide(rr,p)||vertTooClose(rr,p,30)))) continue;
        if (questBlocks.some(q=>rectCollide(rr,q)||vertTooClose(rr,q,30))) continue;
        platforms.push({x, y, w, h:8, type:'platform'}); break;
      }
    }
  }
  // Staircase finale
  for (let i=0; i<7; i++) platforms.push({x:9800+i*16, y:H-48-i*16, w:16, h:8, type:'platform'});
  platforms.push({x:9920, y:H-48, w:80, h:8, type:'platform'});
  // Flagpole
  goalFlag = {x:9992, y:18, w:4, h:H-48-18, reached:false, hitY:0, bonus:0, sliding:false};

  // ---- Moving Platforms ----
  const mpCfgs = [
    {x:250,endX:400},{x:1450,endX:1600},
    {x:2250,endX:2400},{x:3200,endX:3400},{x:4400,endX:4550},
    {x:5400,endX:5550},{x:6400,endX:6550},
    {x:7700,endX:7850},{x:8800,endX:9000},
  ];
  for (const cfg of mpCfgs) {
    const mid=(cfg.x+cfg.endX)/2;
    for (let t=0;t<30;t++) {
      const y=H-50-randInt(20,50);
      const check={x:cfg.x,y,w:32,h:6};
      const check2={x:mid,y,w:32,h:6};
      const check3={x:cfg.endX-24,y,w:32,h:6};
      const ok = !platforms.some(p=>p.type==='platform'&&(
        rectCollide(check,p)||rectCollide(check2,p)||rectCollide(check3,p)||
        vertTooClose(check,p,30)||vertTooClose(check2,p,30)||vertTooClose(check3,p,30)));
      if (ok) { const _sp=Math.random()*Math.PI*2;movingPlats.push({x:cfg.x,y,w:32,h:6,startX:cfg.x,endX:cfg.endX,speed:0.8+rand(0,0.4),_startPhase:_sp,_startTime:Date.now()});break;}
    }
  }

  // ---- Question Blocks ----
  const qbSegs = [
    {start:250,end:1900,coin:8,power:2,star:1},
    {start:2100,end:4900,coin:10,power:3,star:1},
    {start:5100,end:7400,coin:10,power:3,star:1},
    {start:7600,end:9700,coin:10,power:2,star:1},
  ];
  function qbY(type){const r=Math.random();if(type==='coin')return r<0.5?H-48:r<0.8?H-64:H-80;if(type==='power')return r<0.6?H-48:H-64;return r<0.4?H-48:H-64;}
  for (const seg of qbSegs) {
    for (let n=0; n<seg.coin; n++) {
      for (let t=0; t<50; t++) {
        const x = randInt(seg.start/16, (seg.end-16)/16)*16;
        if (inGap(x,gaps)||inGap(x+12,gaps)) continue;
        const y=qbY('coin');
        const qr=expand({x,y,w:12,h:12},8);
        if (questBlocks.some(q=>rectCollide(qr,q))) continue;
        if (platforms.some(p=>p.type==='platform'&&(rectCollide(qr,p)||vertTooClose(qr,p,30)))) continue;
        questBlocks.push({x, y, w:12, h:12, type:'coin', hit:false, bounce:0, contents:'coin'}); break;
      }
    }
    for (let n=0; n<seg.power; n++) {
      for (let t=0; t<50; t++) {
        const x = randInt(seg.start/16, (seg.end-16)/16)*16;
        if (inGap(x,gaps)||inGap(x+12,gaps)) continue;
        const y=qbY('power');
        const qr=expand({x,y,w:12,h:12},8);
        if (questBlocks.some(q=>rectCollide(qr,q))) continue;
        if (platforms.some(p=>p.type==='platform'&&rectCollide(qr,p))) continue;
        questBlocks.push({x, y, w:12, h:12, type:'power', hit:false, bounce:0, contents:'power'}); break;
      }
    }
    for (let n=0; n<seg.star; n++) {
      for (let t=0; t<100; t++) {
        const x = randInt(seg.start/16, (seg.end-16)/16)*16;
        if (inGap(x,gaps)||inGap(x+12,gaps)) continue;
        const y=qbY('star');
        const qr=expand({x,y,w:12,h:12},8);
        if (questBlocks.some(q=>rectCollide(qr,q))) continue;
        if (platforms.some(p=>p.type==='platform'&&rectCollide(qr,p))) continue;
        questBlocks.push({x, y, w:12, h:12, type:'star', hit:false, bounce:0, contents:'star'}); break;
      }
    }
  }

  // ---- Bonus blocks above platforms ----
  for (const plat of platforms) {
    if (plat.type !== 'platform' || Math.random() > 0.15) continue;
    if (plat.x < 300 || plat.x > 9700) continue;
    const y = plat.y - 28;
    if (y < H - 120) continue;
    const x = randInt(plat.x/16, (plat.x+plat.w-12)/16)*16;
    const qr = expand({x,y,w:12,h:12},8);
    if (questBlocks.some(q=>rectCollide(qr,q))) continue;
    if (platforms.some(p=>p.type==='platform'&&p!==plat&&rectCollide(qr,p))) continue;
    const type = Math.random() < 0.7 ? 'coin' : 'power';
    questBlocks.push({x, y, w:12, h:12, type, hit:false, bounce:0, contents:type});
  }
  // Bonus blocks above moving platforms
  for (const mp of movingPlats) {
    if (Math.random() > 0.3) continue;
    const mid = (mp.startX + mp.endX) / 2;
    const y = mp.y - 28;
    if (y < H - 120) continue;
    const x = randInt((mid-16)/16, (mid+4)/16)*16;
    const qr = expand({x,y,w:12,h:12},8);
    if (questBlocks.some(q=>rectCollide(qr,q))) continue;
    if (platforms.some(p=>p.type==='platform'&&rectCollide(qr,p))) continue;
    const type = Math.random() < 0.6 ? 'coin' : 'power';
    questBlocks.push({x, y, w:12, h:12, type, hit:false, bounce:0, contents:type});
  }

  // ---- Pipes ----
  // Guaranteed test pipe near start
  pipes.push({x:96, y:H-32, w:24, h:16, enterable: true});
  for (let i=0; i<7; i++) {
    for (let t=0; t<50; t++) {
      const x = randInt(300/16, (9800-24)/16)*16;
      if (inGap(x,gaps)||inGap(x+24,gaps)) continue;
      const pr=expand({x,y:H-32,w:24,h:16},8);
      if (pipes.some(p=>rectCollide(pr,p))) continue;
      if (platforms.some(p=>p.type==='platform'&&rectCollide(pr,p))) continue;
      if (questBlocks.some(q=>rectCollide(pr,q))) continue;
      // Ensure clearance above pipe top for player to stand and enter
      const clearAbove = {x:x+3, y:H-56, w:18, h:24};
      if (platforms.some(p=>p.type==='platform'&&rectCollide(clearAbove,p))) continue;
      if (questBlocks.some(q=>rectCollide(clearAbove,q))) continue;
      pipes.push({x, y:H-32, w:24, h:16, enterable: Math.random() < 0.2}); break;
    }
  }

  // ---- Coins (avoid obstacles) ----
  const obstacles=[...platforms,...questBlocks,...pipes];
  function coinCollides(x,y){const r={x,y,w:6,h:8};for(const o of obstacles)if(rectCollide(r,o))return true;return false;}
  let v = 0;
  for (let x=120; x<9900; x+=80+v) {
    v = Math.random()*50;
    const y = (Math.random()>0.4) ? H-60-Math.random()*40 : H-28;
    if (!coinCollides(x,y)) coins.push({x,y,w:6,h:8,collected:false});
  }
  // Coin arcs
  for (let x=300; x<9500; x+=400+Math.random()*200) {
    for (let i=0; i<5; i++) {
      const cx=x+i*12, cy=H-50-i*10;
      if (!coinCollides(cx,cy)) coins.push({x:cx,y:cy,w:6,h:8,collected:false});
    }
  }
  // Coin arcs over gaps
  for (const g of gaps) {
    for (let i=0; i<5; i++) {
      const t=i/4, cx=g[0]-8+t*(g[1]-g[0]+16), cy=H-20-Math.sin(t*Math.PI)*18;
      if (!coinCollides(cx,cy)) coins.push({x:cx, y:cy, w:6, h:8, collected:false});
    }
  }

  // ---- Enemies ----
  // Ground enemies per biome
  for (let x=300; x<2200; x+=120+Math.random()*40) { enemies.push({x, y:H-28, w:12, h:12, vx:-0.6-Math.random()*0.4, vy:0, type:'ground', alive:true, hp:1, frame:0}); }
  for (let x=2200; x<5200; x+=110+Math.random()*40) { enemies.push({x, y:H-28, w:12, h:12, vx:-0.7-Math.random()*0.4, vy:0, type:'ground', alive:true, hp:1, frame:0}); }
  for (let x=5200; x<7700; x+=100+Math.random()*30) { enemies.push({x, y:H-28, w:12, h:12, vx:-0.8-Math.random()*0.4, vy:0, type:'ground', alive:true, hp:1, frame:0}); }
  for (let x=7700; x<10000; x+=70+Math.random()*25) { enemies.push({x, y:H-28, w:12, h:12, vx:-0.9-Math.random()*0.5, vy:0, type:'ground', alive:true, hp:1, frame:0}); }
  // Flying enemies
  for (let x=2400; x<5200; x+=200+Math.random()*100) {
    enemies.push({x, y:H-60-Math.random()*40, w:12, h:12, vx:-0.5-Math.random()*0.3, vy:0, type:'flying', alive:true, hp:1, frame:0, flyOff:0, flyPhase: Math.random()*Math.PI*2});
  }
  for (let x=5200; x<7700; x+=180+Math.random()*80) {
    enemies.push({x, y:H-60-Math.random()*40, w:12, h:12, vx:-0.6-Math.random()*0.3, vy:0, type:'flying', alive:true, hp:1, frame:0, flyOff:0, flyPhase: Math.random()*Math.PI*2});
  }
  for (let x=7700; x<10000; x+=160+Math.random()*80) {
    enemies.push({x, y:H-60-Math.random()*40, w:12, h:12, vx:-0.7-Math.random()*0.4, vy:0, type:'flying', alive:true, hp:1, frame:0, flyOff:0, flyPhase: Math.random()*Math.PI*2});
  }
  // Big enemies
  for (let x=5500; x<7700; x+=250+Math.random()*100) {
    enemies.push({x, y:H-32, w:18, h:16, vx:-0.5-Math.random()*0.3, vy:0, type:'big', alive:true, hp:2, frame:0});
  }
  for (let x=7700; x<10000; x+=220+Math.random()*80) {
    enemies.push({x, y:H-32, w:18, h:16, vx:-0.6-Math.random()*0.3, vy:0, type:'big', alive:true, hp:2, frame:0});
  }

  // ---- Checkpoints (avoid gaps + pipes) ----
  function nearPipe(x, pipes) {
    for (const p of pipes) {
      if (x < p.x + p.w + 30 && x + 50 > p.x - 30) return true;
    }
    return false;
  }
  for (let x=1000; x<=9000; x+=1000) {
    let cx = x;
    for (let t=0; t<30; t++) {
      const off = randInt(-30, 30);
      const testX = x + off;
      // Check solid ground for checkpoint + 50px to the right (safe respawn zone)
      let solid = true;
      for (let gx = testX; gx < testX + 50; gx += 16) {
        if (inGap(gx, gaps)) { solid = false; break; }
      }
      if (solid && !nearPipe(testX, pipes) && !nearPipe(testX + 20, pipes)) { cx = testX; break; }
    }
    // Fallback: scan left/right for safe ground
    if (inGap(cx, gaps) || inGap(cx + 20, gaps) || nearPipe(cx, pipes) || nearPipe(cx + 20, pipes)) {
      let found = false;
      for (let d = 16; d < 200 && !found; d += 16) {
        if (cx - d >= 16) {
          const t = cx - d;
          let ok = true;
          for (let gx = t; gx < t + 50; gx += 16) { if (inGap(gx, gaps)) { ok = false; break; } }
          if (ok && !nearPipe(t, pipes) && !nearPipe(t + 20, pipes)) { cx = t; found = true; }
        }
        if (!found && cx + d < L - 50) {
          const t = cx + d;
          let ok = true;
          for (let gx = t; gx < t + 50; gx += 16) { if (inGap(gx, gaps)) { ok = false; break; } }
          if (ok && !nearPipe(t, pipes) && !nearPipe(t + 20, pipes)) { cx = t; found = true; }
        }
      }
    }
    checkpoints.push({x:cx, y:H-20, w:8, h:16, reached:false});
  }

  // Add moving platform rects as passable platforms
  for (const mp of movingPlats) platforms.push(mp);

  // Pre-generate periodic enemies for multiplayer (deterministic via seeded Math.random)
  if (mp.seed != null) {
    for (let sec = 0; sec < L; sec += 400) {
      const startX = sec + 200, endX = startX + 300;
      if (startX >= L - 20) continue;
      for (let x = startX; x < endX; x += 100 + Math.random() * 60) {
        if (levelGaps.some(g => x >= g[0] && x < g[1])) continue;
        enemies.push({ x, y: H - 28, w: 12, h: 12, vx: -0.7 - Math.random() * 0.5, vy: 0, type: 'ground', alive: true, hp: 1, frame: 0 });
      }
      if (getBiomeAt(startX) !== BIOME.MEADOW) {
        for (let x = startX + 50; x < endX; x += 180 + Math.random() * 80) {
          enemies.push({ x, y: H - 60 - Math.random() * 40, w: 12, h: 12, vx: -0.5 - Math.random() * 0.3, vy: 0, type: 'flying', alive: true, hp: 1, frame: 0, flyOff: 0, flyPhase: Math.random() * Math.PI * 2 });
        }
      }
      if (getBiomeAt(startX) >= BIOME.SKY) {
        for (let x = startX + 80; x < endX; x += 250 + Math.random() * 100) {
          enemies.push({ x, y: H - 32, w: 18, h: 16, vx: -0.4 - Math.random() * 0.3, vy: 0, type: 'big', alive: true, hp: 2, frame: 0 });
        }
      }
    }
  }

  // Multiplayer object IDs (deterministic: same seed = same IDs across clients)
  for (let i = 0; i < coins.length; i++) coins[i]._id = 'c' + i;
  for (let i = 0; i < enemies.length; i++) enemies[i]._id = 'e' + i;
  for (let i = 0; i < questBlocks.length; i++) questBlocks[i]._id = 'q' + i;
  for (let i = 0; i < checkpoints.length; i++) checkpoints[i]._id = 'cp' + i;
}

function addPlats(arr) {
  for (const p of arr) platforms.push({x:p[0], y:p[1], w:p[2], h:p[3], type:'platform'});
}

function getBiomeAt(x) {
  // Use the level's biome for the first section
  if (x < 800) return levels[currentLevel].biome;
  if (x < 2200) return BIOME.MEADOW;
  if (x < 5000) return BIOME.CAVE;
  if (x < 7500) return BIOME.SKY;
  return BIOME.VOLCANO;
}

// ---- Bonus Room ----
function generateBonusPattern() {
  const patterns = ['circle','square','rect','diamond'];
  const shape = patterns[Math.floor(Math.random()*patterns.length)];
  const filled = Math.random() < 0.4;
  const coins = [];
  const cx = 80, cy = 78;
  if (shape === 'circle') {
    const r = 28 + Math.random() * 12;
    const steps = filled ? 15 + Math.floor(Math.random()*10) : 12 + Math.floor(Math.random()*8);
    for (let i = 0; i < steps; i++) {
      if (filled) {
        for (let ri = 4; ri <= r; ri += 8) {
          const a = (i / steps) * Math.PI * 2 + Math.random() * 0.2;
          coins.push({x: cx + Math.cos(a) * ri, y: cy + Math.sin(a) * ri, w:6, h:8, collected:false});
        }
      } else {
        const a = (i / steps) * Math.PI * 2;
        coins.push({x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, w:6, h:8, collected:false});
      }
    }
  } else if (shape === 'square') {
    const half = 20 + Math.floor(Math.random() * 16);
    const step = filled ? 8 : 12;
    for (let x = cx - half; x <= cx + half; x += step) {
      for (let y = cy - half; y <= cy + half; y += step) {
        if (!filled && x > cx - half && x < cx + half && y > cy - half && y < cy + half) continue;
        coins.push({x, y, w:6, h:8, collected:false});
      }
    }
  } else if (shape === 'rect') {
    const hw = 30 + Math.floor(Math.random() * 20), hh = 16 + Math.floor(Math.random() * 12);
    const step = filled ? 8 : 12;
    for (let x = cx - hw; x <= cx + hw; x += step) {
      for (let y = cy - hh; y <= cy + hh; y += step) {
        if (!filled && x > cx - hw + step && x < cx + hw - step && y > cy - hh + step && y < cy + hh - step) continue;
        coins.push({x, y, w:6, h:8, collected:false});
      }
    }
  } else { // diamond
    const r = 24 + Math.floor(Math.random() * 14);
    const step = filled ? 8 : 12;
    for (let dy = -r; dy <= r; dy += step) {
      const hw = r - Math.abs(dy);
      for (let dx = -hw; dx <= hw; dx += step) {
        if (!filled && Math.abs(dx) < hw - step/2 && Math.abs(dy) < r - step/2) continue;
        coins.push({x: cx + dx, y: cy + dy, w:6, h:8, collected:false});
      }
    }
  }
  // coin count bonus (+20 per coin)
  return coins;
}

function enterBonusRoom(pipe) {
  if (inBonusRoom) return;
  inBonusRoom = true;
  bonusRoomPipe = pipe;
  if (mp.connected) mpSendEvent('bonus_room', { inBonusRoom: true, senderId: mp.id });
  stopKillstreakMusic();
  killstreakCount=0; killstreakWindow=0; killstreakTimer=0; killstreakPopup=0;
  // Place player safely away from exit pipe
  player.x = 5;
  player.y = H - player.h - 1;
  player.vx = 0; player.vy = 0;
  // Build blocks FIRST
  bonusBlocks = [];
  const steps = [
    {x:14, y:H-28, w:14, h:14},
    {x:36, y:H-44, w:14, h:14},
  ];
  const nExtra = 1 + Math.floor(Math.random()*2);
  for (let i=0; i<nExtra; i++) {
    for (let t=0; t<20; t++) {
      const bx = 50 + Math.floor(Math.random()*80);
      const by = H-70 - Math.floor(Math.random()*34);
      const bw = 14 + Math.floor(Math.random()*6);
      const br = {x:bx,y:by,w:Math.min(bw,28),h:12};
      if (steps.some(s=>rectCollide(br,s))) continue;
      if (br.x+br.w>W-40) continue;
      steps.push(br); break;
    }
  }
  bonusBlocks = steps;
  // Generate coins, then remove any overlapping blocks
  bonusCoins = generateBonusPattern();
  bonusCoins = bonusCoins.filter(c => !bonusBlocks.some(b => rectCollide(c,b)));
  bonusRoomTimer = 600;
  bonusExitCooldown = 30;
}

function exitBonusRoom() {
  if (!inBonusRoom) return;
  inBonusRoom = false;
  const pipe = bonusRoomPipe;
  if (pipe) pipe.enterable = false;
  bonusRoomPipe = null;
  bonusCoins = [];
  bonusBlocks = [];
  const exitX = pipe.x + 6;
  const exitY = pipe.y - player.h;
  player.x = exitX;
  player.y = exitY;
  player.vy = 0;
  player.vx = 0;
  if (mp.connected) mpSendEvent('bonus_room', { inBonusRoom: false, x: Math.round(exitX), y: Math.round(exitY), senderId: mp.id });
}

// ---- Particles ----
function spawnParticles(x,y,count,color,speed,vary) {
  for (let i=0; i<count; i++) {
    const spd = speed||3;
    particles.push({x,y, vx:(Math.random()-0.5)*spd, vy:-Math.random()*spd*0.7-1,
      life:20+Math.random()*20, maxLife:40, color, size:(vary?1+Math.random()*2:2)});
  }
}

// ---- Helpers ----
function rectCollide(a,b) {
  return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}

function resetPlayer() {
  player.x=20; player.y=100; player.vx=0; player.vy=0;
  player.onGround=false; player.dead=false; player.won=false;
  player.facing=1; player.frame=0; player.big=false; player.star=0; player.invTimer=0; player.shoot=false;
  player.canDoubleJump=true; player.w=10; player.h=14;
}

function onEnemyKill() {
  killstreakCount++;
  killstreakWindow = 300;
  if (killstreakCount >= 3) {
    killstreakCount = 0;
    if (killstreakTimer <= 0) {
      killstreakTimer = 600;
      killstreakPopup = 50;
      startKillstreakMusic();
    } else {
      killstreakTimer = 600;
    }
  }
}

function resetGame() {
  stopStarMusic(); stopKillstreakMusic();
  score=0; coinCount=0; distance=0; camera.x=0;
  gameOver=false; screenShake=0; gameRunning=true;
  comboCount=0; comboTimer=0; killstreakCount=0; killstreakWindow=0; killstreakTimer=0; killstreakPopup=0;
  lastEnemySpawnX=0; inBonusRoom=false; bonusRoomPipe=null; bonusCoins=[]; bonusBlocks=[]; bonusExitCooldown=0;
  fireballs=[];
  buildLevel(currentLevel); resetPlayer(); powerUpPopups=[];
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.add('hidden');
}

function restartGame() {
  if (mp.connected) {
    if (mp.host) mpSend({ type: 'start_level', level: currentLevel });
    return;
  }
  if (gameScreen === 'map') { newGame(); return; }
  if (!gameRunning) { newGame(); return; }
  resetGame();
}

function returnToMap() {
  stopStarMusic();
  keys.jumpPressed=false; keys.jump=false;
  keys.shootPressed=false; keys.shoot=false;
  keys.left=false; keys.right=false; keys.down=false;
  gameOver = false;
  inBonusRoom = false; bonusRoomPipe = null; bonusCoins = []; bonusBlocks = []; bonusExitCooldown = 0;
  document.getElementById('restartTouchBtn').style.display='none';
  document.getElementById('mapTouchBtn').style.display='none';
  document.getElementById('enterBtn').style.display='none';
  document.getElementById('fireBtn').style.display='none';
  document.getElementById('controls').style.display='flex';
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('mpGameOverMsg').classList.add('hidden');
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('confirmDialog').classList.add('hidden');
  if (mp.connected) {
    mp.periodicSeed = null;
    if (gameScreen === 'playing') mpSendEvent('player_left_level', { name: mp.localName });
    gameScreen = 'mpLobby'; gameRunning = true;
    document.getElementById('mapScreen').classList.add('hidden');
    document.getElementById('mpScreen').classList.remove('hidden');
    document.getElementById('mpLobby').style.display = '';
    document.getElementById('mpJoin').style.display = 'none';
    updateMpPlayerList();
    return;
  }
  gameScreen = 'map'; gameRunning = true;
  document.getElementById('mapScreen').classList.remove('hidden');
}

// ---- Update ----
function update() {
  if (countdown > 0) {
    countdown--;
    if (countdown === 0) mpStartLevel(pendingLevel, pendingSeed);
    return;
  }
  if (!gameRunning || gameOver || gameScreen === 'mpLobby') return;

  // ---- Map Screen ----
  if (gameScreen === 'map') {
    document.getElementById('controls').style.display='none';
    document.getElementById('statusBar').style.display='none';
    document.getElementById('powerUpBar').style.display='none';
    document.getElementById('restartTouchBtn').style.display='none';
    document.getElementById('mapTouchBtn').style.display='none';
  document.getElementById('enterBtn').style.display='none';
  document.getElementById('fireBtn').style.display='none';
  document.getElementById('controls').style.display='flex';
    mapTimer++;
    if (keys.jumpPressed) {
      keys.jumpPressed=false;
      if (!levels[selectedLevel].completed && selectedLevel > 0 && !levels[selectedLevel-1].completed) {
        // can't select this level yet
      } else {
        currentLevel = selectedLevel;
        gameScreen = 'playing';
        document.getElementById('mapScreen').classList.add('hidden');
        document.getElementById('confirmDialog').classList.add('hidden');
        document.getElementById('controls').style.display='flex';
        document.getElementById('rightGroup').style.display='';
        document.getElementById('enterBtn').style.display='';
        document.getElementById('fireBtn').style.display='';
        document.getElementById('restartTouchBtn').style.display='';
        document.getElementById('mapTouchBtn').style.display='';
        document.getElementById('statusBar').style.display='';
        document.getElementById('powerUpBar').style.display='';
        resetGame();
      }
    }
    // Navigate levels (left/right cycles through)
    if (mapTimer>10) {
      if (keys.left&&selectedLevel>0) { selectedLevel--; mapTimer=0; }
      if (keys.right&&selectedLevel<levels.length-1) { selectedLevel++; mapTimer=0; }
    }
    keys.jumpPressed=false;
    return;
  }

  // ---- Star Music ----
  const sp = player;
  if (sp.star > 0) {
    if (!starOsc) {
      try {
        const c = getAudio();
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'square'; g.gain.value = 0.04;
        o.connect(g); g.connect(c.destination); o.start();
        starOsc = o; starGain = g;
      } catch(e) {}
    }
    if (starOsc) {
      const warn = sp.star <= 60;
      if (warn) {
        const notes = [1047, 1319];
        const idx = Math.floor(sp.star / 8) % 2;
        starOsc.frequency.value = notes[idx];
        starGain.gain.value = (sp.star % 8 < 4) ? 0.04 : 0;
      } else {
        const notes = [523, 659, 784, 880, 1047, 880, 784, 659];
        const idx = Math.floor(++starFrame / 12) % 8;
        starOsc.frequency.value = notes[idx];
        starGain.gain.value = 0.035;
      }
    }
  } else if (starOsc) {
    stopStarMusic();
  }

  // ---- Bonus Room ----
  if (inBonusRoom) {
    document.getElementById('fireBtn').style.display = 'none';
    const p = player;
    if (bonusRoomTimer>0) bonusRoomTimer--;
    // Player movement within bonus room
    if (keys.left) { p.vx=-MOVE_SPEED; p.facing=-1; }
    else if (keys.right) { p.vx=MOVE_SPEED; p.facing=1; }
    else p.vx*=0.7;
    if (keys.jumpPressed && (p.onGround || p.canDoubleJump)) {
      if (!p.onGround) { p.canDoubleJump = false; }
      p.vy=JUMP; p.onGround=false;
    }
    keys.jumpPressed=false;
    p.vy+=GRAV; if (p.vy>MAX_FALL) p.vy=MAX_FALL;
    // Horizontal + block collision
    p.x+=p.vx;
    const pRect={x:p.x,y:p.y,w:p.w,h:p.h};
    if (p.x<5) p.x=5;
    if (p.x>W-p.w-5) p.x=W-p.w-5;
    for (const b of bonusBlocks) {
      if (!rectCollide(pRect,b)) continue;
      if (p.vx>0) p.x=b.x-p.w;
      else if (p.vx<0) p.x=b.x+b.w;
    }
    // Vertical + block collision
    p.y+=p.vy;
    const pRect2={x:p.x,y:p.y,w:p.w,h:p.h};
    if (p.y<5) { p.y=5; p.vy=0; }
    if (p.y>H-p.h) { p.y=H-p.h; p.onGround=true; p.canDoubleJump=true; p.vy=0; }
    for (const b of bonusBlocks) {
      if (!rectCollide(pRect2,b)) continue;
      if (p.vy>0) { p.y=b.y-p.h; p.onGround=true; p.canDoubleJump=true; p.vy=0; }
      else if (p.vy<0) { p.y=b.y+b.h; p.vy=0; }
    }
    // Collect bonus coins
    for (const c of bonusCoins) {
      if (c.collected) continue;
      if (rectCollide({x:p.x,y:p.y,w:p.w,h:p.h},{x:c.x,y:c.y,w:c.w,h:c.h})) {
        c.collected=true; coinCount++; score+=50; sfxCoin(); checkExtraLife(p.x+3, p.y+4);
        spawnParticles(c.x+3,c.y+4,3,COL.star);
      }
    }
    // All collected or time up → auto exit with bonus
    const allCollected = bonusCoins.every(c=>c.collected);
    if (allCollected || bonusRoomTimer<=0) {
      if (allCollected) score += 2000;
      exitBonusRoom();
    }
    // Exit via pipe touch (standing at bottom pipe)
    if (bonusExitCooldown>0) bonusExitCooldown--;
    else if (p.onGround && p.x>W-45 && p.x<W-15) exitBonusRoom();
    animTick++;
    // Don't process main game updates
    return;
  }
  animTick++;
  const p = player;

  // ---- Flagpole slide ----
  if (goalFlag && goalFlag.sliding) {
    p.x = goalFlag.x - p.w;
    p.y += 2.5;
    p.vx = 0; p.vy = 0;
    keys.jumpPressed = false; keys.shootPressed = false;
    if (p.y + p.h >= goalFlag.y + goalFlag.h) {
      p.y = goalFlag.y + goalFlag.h - p.h;
      goalFlag.sliding = false;
      playerWins(goalFlag.bonus);
    }
    return;
  }

  // Player won → freeze until map transition
  if (p.won) return;

  // Combotimer
  if (comboTimer>0) comboTimer--; else comboCount=0;
  // Killstreak window (resets kill count if no kill within 5s)
  if (killstreakWindow>0) { killstreakWindow--; if (killstreakWindow<=0) killstreakCount=0; }
  // Killstreak timer
  if (killstreakTimer>0) {
    killstreakTimer--;
    // Killstreak music
    if (ksOsc) {
      const notes = [784, 1047];
      const idx = Math.floor(++ksFrame / 6) % 2;
      ksOsc.frequency.value = notes[idx];
      ksGain.gain.value = (killstreakTimer % 10 < 5) ? 0.025 : 0;
    }
    if (killstreakTimer<=0) stopKillstreakMusic();
  } else if (ksOsc) {
    stopKillstreakMusic();
  }

  // Player input
  if (keys.left) { p.vx=-MOVE_SPEED; p.facing=-1; }
  else if (keys.right) { p.vx=MOVE_SPEED; p.facing=1; }
  else p.vx*=0.7;
  if (keys.jumpPressed && (p.onGround || p.canDoubleJump)) {
    if (!p.onGround) { p.canDoubleJump = false; spawnParticles(p.x+5, p.y+p.h-2, 4, COL.star, 2, true); }
    p.vy=JUMP; p.onGround=false; sfxJump();
  }
  keys.jumpPressed=false;

  // Pipe entry (check down key, player must be on pipe)
  if (keys.down && p.onGround) {
    for (const pipe of pipes) {
      if (pipe.enterable && p.x+p.w>pipe.x+2 && p.x<pipe.x+pipe.w-2 && p.y+p.h>=pipe.y-3 && p.y+p.h<=pipe.y+3) {
        enterBonusRoom(pipe); break;
      }
    }
  }
  // Show/hide enter button near enterable pipes
  let nearPipe = false;
  if (!inBonusRoom) {
    for (const pipe of pipes) {
      if (pipe.enterable && Math.abs(p.x-pipe.x)<60 && Math.abs(p.y+p.h-pipe.y)<20) { nearPipe=true; break; }
    }
  }
  document.getElementById('enterBtn').style.display = nearPipe ? 'inline-block' : 'none';
  document.getElementById('fireBtn').style.display = (!inBonusRoom && p.shoot && !p.dead) ? 'inline-block' : 'none';

  // Star timer & invincibility
  if (p.star>0) p.star--;
  if (p.invTimer>0) p.invTimer--;

  // Gravity
  p.vy+=GRAV;
  if (p.vy>MAX_FALL) p.vy=MAX_FALL;

  // Move horizontally
  p.x+=p.vx;
  const pRect={x:p.x, y:p.y, w:p.w, h:p.h};
  for (const plat of platforms) {
    if (!rectCollide(pRect,plat)) continue;
    if (p.vx>0) p.x=plat.x-p.w;
    else if (p.vx<0) p.x=plat.x+plat.w;
  }
  for (const qb of questBlocks) {
    const qr={x:qb.x,y:qb.y,w:qb.w,h:qb.h};
    if (!rectCollide(pRect,qr)||p.vy<0) continue;
    if (p.vx>0) p.x=qb.x-p.w;
    else if (p.vx<0) p.x=qb.x+qb.w;
  }
  for (const pipe of pipes) {
    const pr={x:pipe.x,y:pipe.y,w:pipe.w,h:pipe.h};
    if (!rectCollide(pRect,pr)) continue;
    if (p.vx>0) p.x=pipe.x-p.w;
    else if (p.vx<0) p.x=pipe.x+pipe.w;
  }

  // Move vertically
  p.y+=p.vy;
  p.onGround=false;
  const pRect2={x:p.x, y:p.y, w:p.w, h:p.h};
  for (const plat of platforms) {
    if (!rectCollide(pRect2,plat)) continue;
    if (p.vy>0) { p.y=plat.y-p.h; p.onGround=true; p.canDoubleJump=true; p.vy=0; }
    else if (p.vy<0) { p.y=plat.y+plat.h; p.vy=0; }
  }
  for (const pipe of pipes) {
    const pr={x:pipe.x,y:pipe.y,w:pipe.w,h:pipe.h};
    if (!rectCollide(pRect2,pr)) continue;
    if (p.vy>0) { p.y=pipe.y-p.h; p.onGround=true; p.canDoubleJump=true; p.vy=0; }
    else if (p.vy<0) { p.y=pipe.y+pipe.h; p.vy=0; }
  }
  // Quest blocks: hit from below
  for (const qb of questBlocks) {
    if (qb.hit) continue;
    const qr={x:qb.x,y:qb.y,w:qb.w,h:qb.h};
    if (!rectCollide(pRect2,qr)||p.vy>=0) continue;
    const foot=p.y+p.h;
    if (foot>qb.y+qb.h-5&&foot<qb.y+qb.h+5) {
      qb.hit=true; qb.bounce=4; sfxBlock();
      if (qb.contents==='coin'){coinCount++;score+=100;spawnParticles(qb.x+6,qb.y,6,COL.star);checkExtraLife(qb.x+6,qb.y);if(mp.connected&&qb._id)mpSendEvent('quest_block_hit',{id:qb._id,contents:'coin'});}
      else if (qb.contents==='power'){
        const puType=!p.big?'mushroom':'fire';spawnPowerUp(qb.x+2,qb.y-14,puType,mp.connected?'p_'+qb._id:undefined);
        if(mp.connected&&qb._id)mpSendEvent('quest_block_hit',{id:qb._id,contents:'power',powerupType:puType});
      } else if (qb.contents==='star'){spawnPowerUp(qb.x+2,qb.y-14,'star',mp.connected?'p_'+qb._id:undefined);if(mp.connected&&qb._id)mpSendEvent('quest_block_hit',{id:qb._id,contents:'star',powerupType:'star'});}
      p.y=qb.y+qb.h; p.vy=0;
    }
  }
  // Quest blocks: land on top
  for (const qb of questBlocks) {
    const qr={x:qb.x,y:qb.y,w:qb.w,h:qb.h};
    if (!rectCollide(pRect2,qr)||p.vy<=0) continue;
    const foot=p.y+p.h;
    if (foot>=qb.y-2&&foot<=qb.y+4) {
      p.y=qb.y-p.h; p.onGround=true; p.canDoubleJump=true; p.vy=0;
    }
  }

  // Animation frames
  if (Math.abs(p.vx)>0.3 && p.onGround) {
    p.frameTimer++;
    if (p.frameTimer>5) { p.frame=(p.frame+1)%4; p.frameTimer=0; }
  } else if (p.onGround) { p.frame=0; p.frameTimer=0; }
  else { p.frame=1; } // arms up while jumping

  // Camera
  const targetCam=p.x-40;
  camera.x+=(targetCam-camera.x)*0.1;
  if (camera.x<0) camera.x=0;

  // Distance
  if (p.x>distance) distance=Math.floor(p.x);

  // Biome
  const newBiome=getBiomeAt(p.x);
  if (newBiome!==biome) { biome=newBiome; biomeTrans=30; }
  if (biomeTrans>0) biomeTrans--;

  // ---- Checkpoints ----
  for (const cp of checkpoints) {
    if (cp.reached) continue;
    const pR={x:p.x,y:p.y,w:p.w,h:p.h};
    const cR={x:cp.x,y:cp.y,w:cp.w,h:cp.h};
    if (rectCollide(pR,cR)) { cp.reached=true; sfxCoin(); spawnParticles(cp.x+4,cp.y,6,COL.star); if (mp.connected && cp._id) mpSendEvent('checkpoint_reached', {id: cp._id}); }
  }

  // ---- Moving Platforms ----
  for (const mp of movingPlats) {
    const oldX=mp.x;
    const _elapsed=(Date.now()-mp._startTime)/1000;
    mp.x = mp.startX + (Math.sin(mp._startPhase+mp.speed*1.2*_elapsed)+1)/2 * (mp.endX-mp.startX);
    const dx=mp.x-oldX;
    for (const plat of platforms) { if (plat===mp) plat.x=mp.x; }
    if (p.x+p.w>mp.x && p.x<mp.x+mp.w && p.y+p.h>=mp.y-2 && p.y+p.h<=mp.y+4) {
      p.x+=dx;
    }
  }

  // ---- Periodic enemy spawn ahead (singleplayer only; pre-generated in buildLevel for mp) ----
  if (!mp.periodicSeed && p.x > lastEnemySpawnX + 400 && p.x < L - 20) {
    lastEnemySpawnX = Math.floor(p.x / 400) * 400;
    const startX = lastEnemySpawnX + 200;
    const endX = startX + 300;
    const eType = getBiomeAt(startX) >= BIOME.SKY ? ['ground','big'] : ['ground'];
    for (let x=startX; x<endX; x+=100+Math.random()*60) {
      if (levelGaps.some(g=>x>=g[0]&&x<g[1])) continue;
      enemies.push({x,y:H-28,w:12,h:12,vx:-0.7-Math.random()*0.5,vy:0,type:'ground',alive:true,hp:1,frame:0});
    }
    if (getBiomeAt(startX) !== BIOME.MEADOW) {
      for (let x=startX+50; x<endX; x+=180+Math.random()*80) {
        enemies.push({x,y:H-60-Math.random()*40,w:12,h:12,vx:-0.5-Math.random()*0.3,vy:0,type:'flying',alive:true,hp:1,frame:0,flyOff:0,flyPhase:Math.random()*Math.PI*2});
      }
    }
    if (getBiomeAt(startX) >= BIOME.SKY) {
      for (let x=startX+80; x<endX; x+=250+Math.random()*100) {
        enemies.push({x,y:H-32,w:18,h:16,vx:-0.4-Math.random()*0.3,vy:0,type:'big',alive:true,hp:2,frame:0});
      }
    }
  }

  // ---- Coins ----
  for (const c of coins) {
    if (c.collected) continue;
    const pR={x:p.x,y:p.y,w:p.w,h:p.h};
    const cR={x:c.x,y:c.y,w:c.w,h:c.h};
    if (rectCollide(pR,cR)) {
      c.collected=true; coinCount++; score+=50;
      sfxCoin(); spawnParticles(c.x+3,c.y+4,4,COL.star); checkExtraLife(p.x+5,p.y+7);
      if (mp.connected && c._id) mpSendEvent('coin_collected', {id: c._id});
    }
  }

  // ---- Quest Block bounce ----
  for (const qb of questBlocks) { if (qb.bounce>0) qb.bounce-=0.3; else if (qb.bounce<0) qb.bounce=0; }

  // ---- Power-ups ----
  for (let i=powerups.length-1; i>=0; i--) {
    const pu=powerups[i];
    if (pu.type==='mushroom' || pu.type==='fire' || pu.type==='star') {
      pu.x+=pu.vx || 0;
      pu.vy+=GRAV*0.7;
      pu.y+=pu.vy;
      // Collide with platforms
      const pR={x:pu.x,y:pu.y,w:pu.w,h:pu.h};
      for (const plat of platforms) {
        if (!rectCollide(pR,plat)) continue;
        if (pu.vy>0) { pu.y=plat.y-pu.h; pu.vy=0; }
      }
    }
    // Collect
    const pR={x:p.x,y:p.y,w:p.w,h:p.h};
    const puR={x:pu.x,y:pu.y,w:pu.w,h:pu.h};
    if (rectCollide(pR,puR)) {
      const popup={x:pu.x,y:pu.y-8,type:pu.type,timer:50}
      if (pu.type==='mushroom') {
        p.big=true; p.h=20; p.y=p.y+14-20;
        p.onGround=false; p.vy=GRAV;
        sfxPowerUp(); spawnParticles(pu.x+4,pu.y+4,10,COL.grass);
        popup.label='PILZ'
      }
      else if (pu.type==='fire') { p.shoot=true; sfxPowerUp(); spawnParticles(pu.x+4,pu.y+4,10,COL.grass); popup.label='FEUER'; }
      else if (pu.type==='star') { p.star=300; sfxStar(); spawnParticles(pu.x+4,pu.y+4,12,COL.grass); popup.label='STERN'; }
      powerUpPopups.push(popup);
      if (mp.connected && pu._id) mpSendEvent('powerup_collected', {id: pu._id});
      powerups.splice(i,1); continue;
    }
    if (pu.x<-20 || pu.x>10000+20 || pu.y>H+20) { powerups.splice(i,1); continue; }
    // Bounce animation
    if (pu.bounce>0) { pu.bounce-=0.2; if (pu.bounce<0) pu.bounce=0; }
  }

  // ---- Enemies ----
  for (const e of enemies) {
    if (!e.alive) continue;
    // Flying enemies bob
    if (e.type==='flying') {
      e.flyPhase+=0.05;
      e.flyOff = Math.sin(e.flyPhase)*15;
    }
    e.vy+=GRAV;
    if (e.vy>MAX_FALL) e.vy=MAX_FALL;
    e.x+=e.vx;
    const eRect={x:e.x, y:e.y+(e.type==='flying'?e.flyOff:0), w:e.w, h:e.h};
    for (const plat of platforms) {
      if (!rectCollide(eRect,plat) || e.type==='flying') continue;
      if (e.vx>0) { e.x=plat.x-e.w; e.vx*=-1; }
      else { e.x=plat.x+plat.w; e.vx*=-1; }
    }
    if (e.type!=='flying') {
      e.y+=e.vy;
      const eRect2={x:e.x,y:e.y,w:e.w,h:e.h};
      for (const plat of platforms) {
        if (!rectCollide(eRect2,plat)) continue;
        if (e.vy>0) { e.y=plat.y-e.h; e.vy=0; }
        else if (e.vy<0) { e.y=plat.y+plat.h; e.vy=0; }
      }
    }
    if (e.y>H+30) { e.alive=false; continue; }
    if (e.x < camera.x - 200) { e.alive=false; continue; }

    e.frame=Math.floor(animTick/12)%2;

    // Player collision
    const pR={x:p.x,y:p.y,w:p.w,h:p.h};
    const eY = e.y+(e.type==='flying'?e.flyOff:0);
    const eR={x:e.x,y:eY,w:e.w,h:e.h};
    if (rectCollide(pR,eR)) {
      if (p.star>0) {
        e.alive=false; score+=300; sfxStomp(); onEnemyKill();
        if (killstreakTimer>0) score += 300;
        spawnParticles(e.x+e.w/2,eY+e.h/2,10,COL.star);
        if (mp.connected && e._id) mpSendEvent('enemy_killed', {id: e._id});
        continue;
      }
      const stompThreshold = (e.type==='big') ? 10 : 8;
      if (p.vy>0 && p.y+p.h-eY < stompThreshold) {
        e.hp--;
        if (e.hp<=0) {
          e.alive=false; score+=200*(1+comboCount); comboCount++; comboTimer=60; onEnemyKill();
          if (killstreakTimer>0) score += 200*(1+comboCount-1);
          p.vy=-5; sfxStomp();
          spawnParticles(e.x+e.w/2,eY+e.h/2,10,COL.grass);
          if (mp.connected && e._id) mpSendEvent('enemy_killed', {id: e._id});
        } else {
          p.vy=-5; sfxStomp();
          e.vx*=1.5; // angry!
        }
      } else if (p.star<=0 && p.invTimer<=0) {
        playerDie(false);
      }
    }
  }

  // ---- Fireballs ----
  if (keys.shootPressed && p.shoot && !p.dead) {
    keys.shootPressed = false;
    sfxFire();
    fireballs.push({
      x: p.x + (p.facing > 0 ? p.w : -4),
      y: p.y + p.h - 10,
      w: 4, h: 4,
      vx: p.facing * 4,
      life: 40
    });
  }
  keys.shootPressed = false;
  for (let i = fireballs.length - 1; i >= 0; i--) {
    const fb = fireballs[i];
    fb.x += fb.vx;
    fb.life--;
    if (fb.life <= 0) { fireballs.splice(i, 1); continue; }
    // Collide with platforms
    const fbR = { x: fb.x, y: fb.y, w: fb.w, h: fb.h };
    let hitWall = false;
    for (const plat of platforms) {
      if (rectCollide(fbR, plat)) { hitWall = true; break; }
    }
    if (!hitWall) {
      for (const qb of questBlocks) {
        if (rectCollide(fbR, { x: qb.x, y: qb.y, w: qb.w, h: qb.h })) { hitWall = true; break; }
      }
    }
    if (!hitWall) {
      for (const pipe of pipes) {
        if (rectCollide(fbR, { x: pipe.x, y: pipe.y, w: pipe.w, h: pipe.h })) { hitWall = true; break; }
      }
    }
    if (hitWall) { fireballs.splice(i, 1); continue; }
    // Collide with enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      const eY = e.y + (e.type === 'flying' ? e.flyOff : 0);
      if (rectCollide(fbR, { x: e.x, y: eY, w: e.w, h: e.h })) {
        e.alive = false;
        score += 200; onEnemyKill();
        if (killstreakTimer > 0) score += 200;
        sfxStomp();
        spawnParticles(e.x + e.w / 2, eY + e.h / 2, 10, COL.lava);
        if (mp.connected && e._id) mpSendEvent('enemy_killed', {id: e._id});
        fireballs.splice(i, 1);
        break;
      }
    }
  }

  // Fall off
  if (p.y>H) { if (!p.dead) playerDie(true); }

  // Win — flagpole
  if (goalFlag && !goalFlag.reached && !p.won) {
    if (p.x + p.w > goalFlag.x && p.x < goalFlag.x + goalFlag.w &&
        p.y + p.h > goalFlag.y && p.y < goalFlag.y + goalFlag.h) {
      goalFlag.reached = true;
      const hitY = p.y + p.h / 2;
      let bonus = 1000;
      if (hitY < 40) bonus = 8000;
      else if (hitY < 60) bonus = 5000;
      else if (hitY < 80) bonus = 3000;
      goalFlag.bonus = bonus;
      goalFlag.sliding = true;
      p.vx = 0; p.vy = 0;
      sfxFlagpole();
    }
  }
  if (p.x > 10100) { playerWins(1000); }

  // Particles
  for (let i=particles.length-1; i>=0; i--) {
    const pt=particles[i];
    pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=0.15; pt.life--;
    if (pt.life<=0) particles.splice(i,1);
  }

  // Screen shake
  if (screenShake>0) screenShake*=0.85;
  if (screenShake<0.1) screenShake=0;

  // UI
  document.getElementById('scoreDisplay').textContent=String(score).padStart(6,'0');
  document.getElementById('coinsDisplay').textContent=String(coinCount).padStart(2,'0');
  let ls = 'LEBEN '+lives;
  if (p.big) ls+=' BIG';
  if (p.star>0) ls+=' STERN';
  if (p.shoot) ls+=' FEUER';
  if (killstreakTimer>0) { ls+=' 2X'; document.getElementById('livesDisplay').style.color=COL.red; }
  else document.getElementById('livesDisplay').style.color=COL.grass;
  document.getElementById('livesDisplay').textContent=ls;
  for (let i=powerUpPopups.length-1; i>=0; i--) { powerUpPopups[i].timer--; if (powerUpPopups[i].timer<=0) powerUpPopups.splice(i,1); }
  if (killstreakPopup>0) killstreakPopup--;

  // Send player state to server (every other frame)
  if (mp.connected && gameScreen === 'playing' && !inBonusRoom && animTick % 2 === 0) {
    mpSend({
      type: 'player_state',
      x: Math.round(p.x), y: Math.round(p.y),
      vx: Math.round(p.vx * 10) / 10, vy: Math.round(p.vy * 10) / 10,
      facing: p.facing, frame: p.frame,
      onGround: p.onGround, big: p.big,
      star: p.star, shoot: p.shoot,
      dead: p.dead, won: p.won,
      canDoubleJump: p.canDoubleJump,
      invTimer: p.invTimer
    });
  }
}

function spawnPowerUp(x,y,type,id) {
  const pu={x,y,w:8,h:8,type,vy:0,bounce:6,_id:id};
  if (type==='mushroom'||type==='fire') pu.vx=1.2;
  powerups.push(pu);
}

function playerDie(fromPit) {
  if (player.dead || player.invTimer>0) return;
  stopStarMusic();
  stopKillstreakMusic();
  killstreakCount=0; killstreakWindow=0; killstreakTimer=0; killstreakPopup=0;
  // Immortal cheat: only pit kills, no enemy damage
  if (cheatImmortal && !fromPit) {
    player.invTimer=20; sfxHit(); screenShake=2;
    return;
  }
  // If big, shrink instead of dying
  if (player.big) {
    player.big=false; player.h=14; player.w=10; player.y+=6;
    player.invTimer=40; // brief invincibility
    sfxHit(); screenShake=4;
    spawnParticles(player.x+5,player.y+7,10,COL.dark,3,true);
    setTimeout(()=>{ player.dead=false; },300);
    return;
  }
  player.dead=true;
  if (!cheatInfiniteLives) lives--;
  if (cheatInfiniteLives && lives<=0) lives=0;
  if (mp.connected && !cheatInfiniteLives) mpSendEvent('player_died', {});
  sfxDie(); screenShake=8;
  spawnParticles(player.x+5,player.y+7,15,COL.darkest,4,true);
  if (lives<=0) {
    gameRunning=false; gameOver=true;
    document.getElementById('finalScore').textContent='PUNKTE: '+score;
    document.getElementById('finalCoins').textContent='MUNZEN: '+coinCount;
    document.getElementById('finalDist').textContent='STRECKE: '+distance+'m';
    if (score>highScore) { highScore=score; saveHighScore(); document.getElementById('finalHS').textContent='NEUER HIGHSCORE!'; }
    else document.getElementById('finalHS').textContent='HIGHSCORE: '+highScore;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    if (mp.connected) {
      if (mp.host) { document.getElementById('mpGameOverMsg').classList.add('hidden'); document.getElementById('restartBtn').style.display = ''; }
      else { document.getElementById('mpGameOverMsg').classList.remove('hidden'); document.getElementById('restartBtn').style.display = 'none'; }
    }
  } else {
    // Respawn at last checkpoint or start
    setTimeout(()=>{
      let cx = 20;
      for (const cp of checkpoints) { if (cp.reached && cp.x>cx) cx=cp.x+20; }
      player.x=cx; player.y=80; player.vy=0; player.vx=0;
      player.dead=false; player.star=0;
    },500);
  }
}

function playerWins(bonus) {
  if (player.won) return;
  stopStarMusic(); stopKillstreakMusic(); killstreakCount=0; killstreakWindow=0; killstreakTimer=0; killstreakPopup=0; player.won=true; sfxWin();
  score += bonus || 2000;
  document.getElementById('scoreDisplay').textContent=String(score).padStart(6,'0');
  if (score>highScore) { highScore=score; saveHighScore(); }
  levels[currentLevel].completed = true;
  setTimeout(()=>{
    keys.jumpPressed=false; keys.jump=false;
    keys.shootPressed=false; keys.shoot=false;
    keys.left=false; keys.right=false; keys.down=false;
    document.getElementById('gameOverScreen').classList.add('hidden');
    if (mp.connected) { returnToMap(); return; }
    gameScreen = 'map';
    gameRunning = true;
    gameOver = false;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('confirmDialog').classList.add('hidden');
    document.getElementById('mapScreen').classList.remove('hidden');
  }, 1500);
  // Notify other players
  if (mp.connected) mpSendEvent('player_won', {});
}

function checkExtraLife(px, py) {
  if (coinCount > 0 && coinCount % 25 === 0) {
    lives++;
    if (mp.connected) mpSendEvent('extra_life', {});
    sfxPowerUp();
    spawnParticles(px, py, 20, COL.star, 5, true);
  }
}
function sfxWin() {
  playBeep(523,0.1,'square',0.06);
  setTimeout(()=>playBeep(659,0.1,'square',0.06),100);
  setTimeout(()=>playBeep(784,0.1,'square',0.06),200);
  setTimeout(()=>playBeep(1047,0.15,'square',0.07),300);
}

// ---- Draw ----
function drawBackground() {
  const colors = {};
  if (biome===BIOME.MEADOW) {
    colors.sky=COL.sky; colors.mid=COL.light; colors.ground=COL.ground; colors.groundDark=COL.darkest; colors.grass=COL.grass;
  } else if (biome===BIOME.CAVE) {
    colors.sky=COL.caveBg; colors.mid='#0f1f0f'; colors.ground=COL.caveStone; colors.groundDark=COL.darkest; colors.grass=COL.ground;
  } else if (biome===BIOME.SKY) {
    colors.sky=COL.skyDark; colors.mid=COL.skyLight; colors.ground=COL.ground; colors.groundDark=COL.darkest; colors.grass=COL.grass;
  } else if (biome===BIOME.VOLCANO) {
    colors.sky='#1a0a0a'; colors.mid='#2a1515'; colors.ground='#3a2020'; colors.groundDark=COL.darkest; colors.grass='#5a3030';
  }
  // Sky gradient — darker at top, lighter at bottom
  ctx.fillStyle=colors.sky; ctx.fillRect(0,0,W,H*0.7);
  ctx.fillStyle=colors.mid; ctx.fillRect(0,H*0.5,W,H*0.35);
  ctx.fillStyle=colors.sky; ctx.fillRect(0,H*0.7,W,H*0.3);

  const cx=Math.floor(camera.x);

  // Background hills
  if (biome===BIOME.MEADOW || biome===BIOME.SKY) {
    const hillColor = biome===BIOME.SKY ? '#5a7a2a' : '#4a7a2a';
    for (let i=0; i<6; i++) {
      const hx = (i*38 - cx*0.1)%(W+30) - 15;
      const hy = H*0.7 + Math.sin(i*1.3)*4;
      ctx.fillStyle=hillColor;
      ctx.fillRect(hx,hy,8,4); ctx.fillRect(hx+1,hy-2,6,2); ctx.fillRect(hx+2,hy-4,4,2);
      ctx.fillStyle=COL.skyLight;
      ctx.fillRect(hx+2,hy-3,2,1);
    }
  }

  // Decorative elements per biome
  if (biome===BIOME.MEADOW || biome===BIOME.SKY) {
    for (let x=-cx*0.15; x<W; x+=36) {
      ctx.fillStyle=COL.cloud;
      if (biome===BIOME.SKY) ctx.fillStyle=COL.skyLight;
      ctx.fillRect(Math.floor(x)+16, 16+Math.sin(x*0.05)*6, 4,2);
      ctx.fillRect(Math.floor(x)+18, 14+Math.sin(x*0.05)*6, 6,2);
      ctx.fillRect(Math.floor(x)+22, 12+Math.sin(x*0.05)*6, 4,2);
    }
  }
  if (biome===BIOME.CAVE) {
    // Stalactites
    for (let x=0; x<W; x+=24) {
      const sh = 6+Math.sin(x*0.5+animTick*0.02)*3;
      ctx.fillStyle=COL.darkest;
      ctx.fillRect(x,0,3,sh);
      ctx.fillRect(x+2,0,2,sh-2);
    }
    // Glowing crystals
    for (let i=0; i<3; i++) {
      const cx2 = (i*47 + animTick*0.5)%W;
      const cy2 = 30 + Math.sin(i*2.1+animTick*0.03)*15;
      ctx.fillStyle='rgba(155,188,15,0.08)';
      ctx.fillRect(cx2-2,cy2-2,6,6);
      ctx.fillStyle='#9bbc0f';
      ctx.fillRect(cx2,cy2,2,2);
    }
  }
  if (biome===BIOME.VOLCANO) {
    // Lava glow at bottom
    const glow = Math.sin(animTick*0.05)*0.3+0.7;
    ctx.fillStyle=`rgba(160,32,32,${glow*0.15})`;
    ctx.fillRect(0,H-20,W,20);
    // Embers
    for (let i=0; i<4; i++) {
      const ex = (i*53+animTick*2)%W;
      const ey = H-10-Math.abs(Math.sin(animTick*0.03+i)*20);
      ctx.fillStyle=COL.lava;
      ctx.fillRect(ex,ey,2,2);
      ctx.fillStyle=COL.lavaGlow;
      ctx.fillRect(ex+1,ey+1,1,1);
    }
  }
}

function drawGround(plat, cx) {
  const dx=plat.x-cx;
  if (biome===BIOME.VOLCANO) {
    ctx.fillStyle='#4a2828';
    ctx.fillRect(dx,plat.y,plat.w,plat.h);
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(dx,plat.y,plat.w,2);
    ctx.fillStyle='#6a3838';
    ctx.fillRect(dx,plat.y,plat.w,3);
    ctx.fillStyle=COL.darkest;
    for (let gx=0; gx<plat.w; gx+=8) { ctx.fillRect(dx+gx,plat.y+6,1,1); ctx.fillRect(dx+gx+4,plat.y+10,1,1); }
    // Lava cracks
    if (Math.random()<0.01) {
      ctx.fillStyle='#d03020';
      ctx.fillRect(dx+Math.floor(Math.random()*(plat.w-4)),plat.y-1,3,2);
    }
  } else if (biome===BIOME.CAVE) {
    ctx.fillStyle=COL.caveStone;
    ctx.fillRect(dx,plat.y,plat.w,plat.h);
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(dx,plat.y,plat.w,2);
    ctx.fillStyle=COL.groundLight;
    ctx.fillRect(dx,plat.y,plat.w,3);
    ctx.fillStyle=COL.darkest;
    for (let gx=0; gx<plat.w; gx+=8) { ctx.fillRect(dx+gx,plat.y+6,1,1); ctx.fillRect(dx+gx+4,plat.y+10,1,1); }
  } else if (biome===BIOME.SKY) {
    ctx.fillStyle=COL.ground;
    ctx.fillRect(dx,plat.y,plat.w,plat.h);
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(dx,plat.y,plat.w,2);
    ctx.fillStyle=COL.groundLight;
    ctx.fillRect(dx,plat.y,plat.w,3);
    ctx.fillStyle=COL.darkest;
    for (let gx=0; gx<plat.w; gx+=8) { ctx.fillRect(dx+gx,plat.y+6,1,1); ctx.fillRect(dx+gx+4,plat.y+10,1,1); }
  } else {
    ctx.fillStyle=COL.ground; ctx.fillRect(dx,plat.y,plat.w,plat.h);
    ctx.fillStyle=COL.darkest; ctx.fillRect(dx,plat.y,plat.w,2);
    ctx.fillStyle=COL.grass; ctx.fillRect(dx,plat.y,plat.w,3);
    ctx.fillStyle=COL.darkest;
    for (let gx=0; gx<plat.w; gx+=8) { ctx.fillRect(dx+gx,plat.y+6,1,1); ctx.fillRect(dx+gx+4,plat.y+10,1,1); }
  }
}

function drawPlatform(plat,cx) {
  const dx=plat.x-cx;
  if (plat.w===32 && plat.h===6) { // moving platform indicator
    ctx.fillStyle=COL.ground; ctx.fillRect(dx,plat.y,plat.w,plat.h);
    ctx.fillStyle=COL.grass; ctx.fillRect(dx,plat.y,plat.w,2);
    ctx.fillStyle=COL.darkest; ctx.fillRect(dx,plat.y+2,1,plat.h-2); ctx.fillRect(dx+plat.w-1,plat.y+2,1,plat.h-2);
  } else {
    ctx.fillStyle=COL.ground; ctx.fillRect(dx,plat.y,plat.w,plat.h);
    ctx.fillStyle=COL.darkest; ctx.fillRect(dx,plat.y,plat.w,1);
    ctx.fillStyle=COL.grass; ctx.fillRect(dx,plat.y,plat.w,2);
    for (let bx=0; bx<plat.w; bx+=8) { ctx.fillStyle=COL.darkest; ctx.fillRect(dx+bx+2,plat.y+3,4,1); ctx.fillRect(dx+bx+4,plat.y+6,4,1); }
  }
}

function drawPlayer(px, py, facing, frame, onGround, big, star) {
  // Star/invincibility flash
  if ((star>0||player.invTimer>0) && Math.floor((star||player.invTimer)/4)%2===0) {
    ctx.fillStyle=COL.light; ctx.globalAlpha=0.5;
  }

  // Select sprite frame
  const key = big ? 'b' : 's';
  let spr;
  if (!onGround) spr = SP[key+'1'];
  else if (frame === 2) spr = SP[key+'2'];
  else spr = SP[key + (frame % 2 === 0 ? '0' : '3')];

  // Build a star-palette override
  let pal = SP.pl;
  if (star > 0) {
    pal = { ...SP.pl, 'H': COL.white, 'h': COL.whiteOff, 'B': COL.red, 'b': COL.blue, 'O': COL.red, };
  }

  const drawX = Math.round(px);
  const drawY = Math.round(py) - 2;

  drawSprite(spr, pal, drawX, drawY);
  ctx.globalAlpha = 1;
}

function drawEnemy(e,cx) {
  const dx=Math.round(e.x-cx);
  const eY = Math.round(e.y+(e.type==='flying'?e.flyOff:0));
  if (e.type==='ground') {
    drawSprite(SP.goomba, SP.goombaPal, dx, eY);
  } else if (e.type==='big') {
    const pal = e.hp===1
      ? { ...SP.koopaPal, 'R': COL.redLight, 's': COL.skinDark }
      : SP.koopaPal;
    drawSprite(SP.koopa, pal, dx, eY);
  } else if (e.type==='flying') {
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(dx,eY+1,12,2); ctx.fillRect(dx+1,eY+3,10,5);
    ctx.fillStyle=COL.light;
    ctx.fillRect(dx+2,eY+3,3,2); ctx.fillRect(dx+7,eY+3,3,2);
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(dx+3,eY+3,2,2); ctx.fillRect(dx+8,eY+3,2,2);
    // Wings
    ctx.fillStyle=COL.light;
    if (e.frame===0) { ctx.fillRect(dx-2,eY+2,3,4); ctx.fillRect(dx+11,eY+2,3,4); }
    else { ctx.fillRect(dx-1,eY+1,3,4); ctx.fillRect(dx+10,eY+1,3,4); }
  }
}

function drawCoin(c,cx,frame) {
  const dx=c.x-cx; if (dx>W+8||dx<-8) return;
  const wobble=Math.sin(frame*0.1)*1;
  const rot=Math.sin(frame*0.08);
  const scaleW=Math.max(2,Math.floor(4+rot*2));
  const ox=Math.floor((6-scaleW)/2);
  const y=c.y+wobble;
  // Outer ring
  ctx.fillStyle=COL.yellow;
  ctx.fillRect(dx+ox,y,scaleW,8);
  ctx.fillRect(dx+ox+1,y+1,scaleW-2,6);
  // Inner fill (brighter)
  ctx.fillStyle=COL.star;
  ctx.fillRect(dx+ox+1,y+1,scaleW-2,6);
  // Top highlight
  ctx.fillStyle=COL.white;
  ctx.fillRect(dx+ox+2,y+2,scaleW-4,1);
  // Center mark
  ctx.fillStyle=COL.yellow;
  ctx.fillRect(dx+ox+2,y+3,scaleW-4,2);
  // Bottom shadow
  ctx.fillStyle=COL.orange;
  ctx.fillRect(dx+ox+scaleW-3,y+6,2,1);
  ctx.fillRect(dx+ox+scaleW-2,y+5,1,2);
}

function drawQuestBlock(qb,cx) {
  const dx=qb.x-cx; if (dx>W+16||dx<-16) return;
  const bounce = qb.bounce||0;
  const by = qb.y - Math.floor(bounce);
  let cFill, cLight, cDark, cMark, cMarkHi, cMarkLo, cHit;
  if (biome===BIOME.CAVE) {
    cFill='#306230'; cLight='#8bac0f'; cDark='#0f380f';
    cMark=COL.star; cMarkHi=COL.white; cMarkLo='#8b8010'; cHit='#1a4a1a';
  } else if (biome===BIOME.VOLCANO) {
    cFill='#5a3030'; cLight='#8b4040'; cDark='#0f380f';
    cMark=COL.star; cMarkHi=COL.white; cMarkLo='#8b8010'; cHit='#3a2020';
  } else if (biome===BIOME.SKY) {
    cFill='#9bbc0f'; cLight='#a0b84f'; cDark='#306230';
    cMark='#0f380f'; cMarkHi='#306230'; cMarkLo=COL.darkest; cHit='#8bac0f';
  } else {
    cFill='#9bbc0f'; cLight='#a0b84f'; cDark='#306230';
    cMark='#0f380f'; cMarkHi='#306230'; cMarkLo=COL.darkest; cHit='#306230';
  }
  const hit = qb.hit && qb.contents!=='coin';

  // Outer shadow (bottom-right)
  ctx.fillStyle=cDark;
  ctx.fillRect(dx+2,by+2,qb.w,qb.h);
  // 3D bevel — dark bottom & right edges
  ctx.fillStyle=hit ? cDark : cDark;
  ctx.fillRect(dx,by+1,qb.w,1);
  ctx.fillRect(dx,by+1,1,qb.h);
  ctx.fillRect(dx+13,by,1,14);
  ctx.fillRect(dx,by+13,14,1);
  // 3D bevel — light top & left edges
  ctx.fillStyle=hit ? cLight : cLight;
  ctx.fillRect(dx,by,13,1);
  ctx.fillRect(dx,by,1,13);
  // Block face
  ctx.fillStyle=hit ? cHit : cFill;
  ctx.fillRect(dx+1,by+1,12,12);
  // Brick texture on face
  if (!hit) {
    const bCol = cDark;
    ctx.fillStyle=bCol;
    // Horizontal mortar lines
    ctx.fillRect(dx+1,by+4,12,1);
    ctx.fillRect(dx+1,by+8,12,1);
    ctx.fillRect(dx+1,by+12,12,1);
    // Vertical mortar lines (offset every other row)
    ctx.fillRect(dx+5,by+1,1,4);
    ctx.fillRect(dx+9,by+1,1,4);
    ctx.fillRect(dx+3,by+5,1,4);
    ctx.fillRect(dx+7,by+5,1,4);
    ctx.fillRect(dx+11,by+5,1,4);
    ctx.fillRect(dx+5,by+9,1,4);
    ctx.fillRect(dx+9,by+9,1,4);
    // Highlight — top-left corner shine
    ctx.fillStyle=cLight;
    ctx.fillRect(dx+1,by+1,1,1);
    ctx.fillRect(dx+2,by+1,2,1);
    // Highlight on brick tops
    ctx.fillStyle=cLight;
    ctx.fillRect(dx+2,by+5,1,1);
    ctx.fillRect(dx+6,by+5,1,1);
    ctx.fillRect(dx+10,by+5,1,1);
    ctx.fillRect(dx+2,by+9,1,1);
    ctx.fillRect(dx+6,by+9,1,1);
    ctx.fillRect(dx+10,by+9,1,1);
  } else {
    // Hit state: dark cracks
    ctx.fillStyle=cDark;
    ctx.fillRect(dx+3,by+2,2,1); ctx.fillRect(dx+8,by+4,2,1);
    ctx.fillRect(dx+5,by+7,1,2); ctx.fillRect(dx+10,by+9,2,1);
    ctx.fillRect(dx+2,by+11,3,1);
  }
  // ? mark (sprite-based with 3D shading)
  if (!qb.hit || qb.contents!=='coin') {
    // Shadow of ? (offset right-down)
    drawSprite([
      '..QQQQQ...',
      '.QQQQQQQ..',
      'QQQ...QQQ.',
      'QQQ...QQQ.',
      '..QQQQQ...',
      '...QQQQ...',
      '....QQ....',
      '....QQ....',
      '..........',
      '...QQ.....',
      '...QQ.....',
      '...QQ.....',
    ], { 'Q': cMarkLo, '.': null }, dx+2, by+2);
    // Main ? mark
    drawSprite([
      '..QQQQQ...',
      '.QQQQQQQ..',
      'QQQ...QQQ.',
      'QQQ...QQQ.',
      '..QQQQQ...',
      '...QQQQ...',
      '....QQ....',
      '....QQ....',
      '..........',
      '...QQ.....',
      '...QQ.....',
      '...QQ.....',
    ], { 'Q': cMark, '.': null }, dx+1, by+1);
    // Top-left highlight on ?
    drawSprite([
      '..HHHHH...',
      '.HHHHHHH..',
      'HHH...HHH.',
      'HHH...HHH.',
      '..HHHHH...',
      '...HHHH...',
      '....HH....',
      '....HH....',
      '..........',
      '...HH.....',
      '...HH.....',
      '...HH.....',
    ], { 'H': cMarkHi, '.': null }, dx+1, by+1);
  }
}

function drawPowerUp(pu,cx) {
  const dx=pu.x-cx; if (dx>W+16||dx<-16) return;
  const bounce = pu.bounce||0;
  const by = pu.y - Math.floor(bounce);
  if (pu.type==='mushroom') {
    ctx.fillStyle=COL.redLight;
    ctx.fillRect(dx+1,by,6,3);
    ctx.fillStyle=COL.red;
    ctx.fillRect(dx,by+3,8,1);
    ctx.fillStyle=COL.light;
    ctx.fillRect(dx+2,by+1,4,2);
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(dx+3,by+4,2,3);
    ctx.fillRect(dx+2,by,1,3);
  } else if (pu.type==='fire') {
    ctx.fillStyle=COL.red;
    ctx.fillRect(dx+1,by,6,6);
    ctx.fillStyle=COL.white;
    ctx.fillRect(dx+2,by+1,4,2);
    ctx.fillRect(dx+3,by+5,2,1);
    ctx.fillStyle=COL.yellow;
    ctx.fillRect(dx+3,by+4,2,1);
  } else if (pu.type==='star') {
    drawSprite(SP.star, SP.starPal, dx, by);
  }
}

function drawPipe(pipe,cx) {
  const dx=pipe.x-cx; if (dx>W+24||dx<-24) return;
  const pCol = biome===BIOME.VOLCANO ? '#4a2020' : COL.pipeDark;
  const pHigh = biome===BIOME.VOLCANO ? '#6a3030' : COL.pipeLight;
  ctx.fillStyle=pCol;
  ctx.fillRect(dx,pipe.y,pipe.w,pipe.h);
  // Shading: dark sides, lighter center
  ctx.fillStyle=COL.darkest;
  ctx.fillRect(dx,pipe.y,pipe.w,2);
  ctx.fillRect(dx,pipe.y,3,pipe.h);
  ctx.fillRect(dx+pipe.w-3,pipe.y,3,pipe.h);
  // Pipe lip
  ctx.fillRect(dx-2,pipe.y-4,pipe.w+4,4);
  ctx.fillStyle=pHigh;
  ctx.fillRect(dx,pipe.y-4,pipe.w+2,2);
  // Highlight stripe down center
  ctx.fillStyle=pHigh;
  ctx.fillRect(dx+4,pipe.y+2,2,pipe.h-4);
  ctx.fillRect(dx+pipe.w-6,pipe.y+2,2,pipe.h-4);
  ctx.fillStyle=COL.darkest;
  ctx.fillRect(dx-2,pipe.y-4,pipe.w+4,1);
  // "!" indicator for enterable pipes
  if (pipe.enterable) {
    ctx.fillStyle=COL.white;
    ctx.fillRect(dx+pipe.w/2-2,pipe.y-10,4,2);
    ctx.fillRect(dx+pipe.w/2-1,pipe.y-8,2,3);
    ctx.fillRect(dx+pipe.w/2-2,pipe.y-4,4,2);
  }
}

function drawCheckpoint(cp,cx) {
  const dx=cp.x-cx; if (dx>W+16||dx<-16) return;
  const poleColor = cp.reached ? COL.light : COL.dark;
  const flagColor = cp.reached ? COL.red : COL.darkest;
  ctx.fillStyle=poleColor;
  ctx.fillRect(dx+2,cp.y-6,4,22);
  ctx.fillStyle=COL.darkest;
  ctx.fillRect(dx+3,cp.y-6,2,22);
  // Flag
  ctx.fillStyle=flagColor;
  ctx.fillRect(dx+5,cp.y-4,6,6);
  if (cp.reached) {
    ctx.fillStyle=COL.light;
    ctx.fillRect(dx+6,cp.y-3,4,2);
  }
}

function drawMap() {
  // Sky gradient — darker blue at top, warm horizon
  ctx.fillStyle='#5a7a2a'; ctx.fillRect(0,0,W,Math.floor(H*0.3));
  ctx.fillStyle='#7b9e2f'; ctx.fillRect(0,Math.floor(H*0.2),W,Math.floor(H*0.15));
  ctx.fillStyle='#8aaf2f'; ctx.fillRect(0,Math.floor(H*0.3),W,Math.floor(H*0.1));
  ctx.fillStyle='#7bae0f'; ctx.fillRect(0,Math.floor(H*0.35),W,Math.floor(H*0.15));
  // Distant mountains
  ctx.fillStyle='#4a6a2a';
  for (let i=0; i<4; i++) {
    const mx=i*48-10, my=36+Math.sin(i*1.3)*6;
    for (let r=0; r<6; r++) {
      const mw=20-r*2;
      ctx.fillRect(mx+r,my+r,mw,1);
    }
  }
  // Mid-ground hills
  ctx.fillStyle='#3a5a1a';
  for (let i=0; i<6; i++) {
    const hx=i*30-5, hy=52+Math.sin(i*1.7)*4;
    for (let r=0; r<4; r++) ctx.fillRect(hx+r,hy+r,10-r*2,1);
  }
  // Ground layer
  ctx.fillStyle=COL.ground;
  ctx.fillRect(0,60,W,84);
  // Ground top edge with grass
  for (let gx=0; gx<W; gx+=4) {
    const gh = 2+Math.sin(gx*0.3)*1;
    ctx.fillStyle=COL.grass; ctx.fillRect(gx,60-gh,4,gh);
  }
  ctx.fillStyle=COL.darkest;
  ctx.fillRect(0,60,W,1);
  // Ground texture — dirt speckles
  ctx.fillStyle='#3a6a2a';
  for (let i=0; i<20; i++) {
    const sx=(i*17+3)%W, sy=65+(i*13+7)%50;
    ctx.fillRect(sx,sy,2,1);
  }
  // Path / road between levels (paved stones)
  for (let i=0; i<levels.length-1; i++) {
    const a=levels[i], b=levels[i+1];
    const ax=a.x+12, ay=a.y+12, bx=b.x+12, by=b.y+12;
    const dx=bx-ax, dy=by-ay;
    const len=Math.sqrt(dx*dx+dy*dy);
    // Stones along path
    for (let t=0; t<len; t+=6) {
      const px=ax+dx*t/len, py=ay+dy*t/len;
      ctx.fillStyle=COL.brownLight;
      ctx.fillRect(px-2,py-1,5,3);
      ctx.fillStyle=COL.brown;
      ctx.fillRect(px-3,py,7,2);
    }
  }

  // Lake / water feature
  ctx.fillStyle=COL.water;
  for (let i=0; i<8; i++) {
    const wx=10+i*18, wy=90+Math.sin(i*0.7)*3;
    ctx.fillRect(wx,wy,12,8);
  }
  ctx.fillStyle=COL.waterLight;
  for (let i=0; i<4; i++) ctx.fillRect(15+i*36,90+Math.sin(i*1.1)*3,6,2);

  // Decorative bushes
  for (let i=0; i<6; i++) {
    const bx=(i*27+5)%W, by=58+Math.sin(i*0.8)*4;
    ctx.fillStyle=COL.ground; ctx.fillRect(bx,by,6,3);
    ctx.fillStyle=COL.grass; ctx.fillRect(bx+1,by-1,4,2);
  }

  // Flowers
  for (let i=0; i<5; i++) {
    const fx=(i*31+13)%W, fy=54+Math.sin(i*1.3)*5;
    ctx.fillStyle=['#d04040','#4040c0','#f0e840','#d06020','#c8c8c8'][i%5];
    ctx.fillRect(fx,fy,2,2);
    ctx.fillStyle=COL.ground; ctx.fillRect(fx+1,fy+2,1,2);
  }

  // Clouds
  for (let i=0; i<3; i++) {
    const cx=(i*55+mapTimer*0.2)%(W+30)-15;
    const cy=8+Math.sin(i*1.1+mapTimer*0.01)*4;
    ctx.fillStyle=COL.cloud; ctx.fillRect(cx,cy+2,16,4);
    ctx.fillStyle=COL.skyLight; ctx.fillRect(cx+3,cy,10,3);
    ctx.fillStyle=COL.white; ctx.fillRect(cx+5,cy-1,6,2);
    ctx.fillStyle='#8bac0f'; ctx.fillRect(cx+1,cy+3,14,1);
  }

  // Small details — rocks
  for (let i=0; i<4; i++) {
    const rx=(i*29+11)%W, ry=68+(i*7+3)%15;
    ctx.fillStyle=COL.caveStone; ctx.fillRect(rx,ry,3,2);
    ctx.fillStyle=COL.darkest; ctx.fillRect(rx,ry,3,1);
  }

  // Draw level icons (castles/towers)
  for (let i=0; i<levels.length; i++) {
    const l=levels[i];
    const lx=l.x-1, ly=l.y-1, lw=26, lh=26;
    const unlocked = i===0||levels[i-1].completed;
    const cMain = l.completed ? COL.light : (unlocked ? COL.grass : COL.ground);
    const cTrim = l.completed ? COL.grass : (unlocked ? COL.light : COL.caveStone);
    const cWin = l.completed ? COL.grass : COL.ground;
    const cRoof = l.completed ? COL.red : COL.darkest;
    // Shadow
    ctx.fillStyle=COL.darkest; ctx.fillRect(lx+3,ly+3,lw-4,lh-2);
    // Main body
    ctx.fillStyle=cMain; ctx.fillRect(lx+2,ly+6,lw-4,20);
    ctx.fillStyle=COL.darkest; ctx.fillRect(lx+4,ly+8,lw-8,16);
    // Tower base
    ctx.fillStyle=cMain; ctx.fillRect(lx+6,ly,lw-12,8);
    ctx.fillRect(lx+4,ly+2,lw-8,2);
    // Roof
    ctx.fillStyle=cRoof; ctx.fillRect(lx+8,ly-2,lw-16,3);
    ctx.fillRect(lx+9,ly-4,lw-18,2);
    // Battlements
    if (l.completed) {
      ctx.fillStyle=COL.yellow; ctx.fillRect(lx+10,ly-5,2,1);
      ctx.fillRect(lx+14,ly-5,2,1);
    }
    // Windows
    if (unlocked) {
      ctx.fillStyle=cWin; ctx.fillRect(lx+8,ly+12,3,3);
      ctx.fillRect(lx+15,ly+12,3,3);
      ctx.fillRect(lx+8,ly+18,3,3);
      ctx.fillRect(lx+15,ly+18,3,3);
    }
    // Door
    ctx.fillStyle=COL.darkest; ctx.fillRect(lx+10,ly+20,6,5);
    ctx.fillStyle=cMain; ctx.fillRect(lx+12,ly+22,2,2);
    // Completed flag
    if (l.completed) {
      ctx.fillStyle=COL.light; ctx.fillRect(lx+14,ly-8,2,4); // pole
      ctx.fillStyle=COL.red; ctx.fillRect(lx+16,ly-8,5,4); // flag
      ctx.fillStyle=COL.yellow; ctx.fillRect(lx+18,ly-7,2,2); // star
    }
    // Lock indicator
    if (!unlocked) {
      ctx.fillStyle=COL.darkest; ctx.fillRect(lx+10,ly+10,6,6);
      ctx.fillStyle='#5a3030'; ctx.fillRect(lx+11,ly+11,4,4);
      ctx.fillStyle=COL.white; ctx.fillRect(lx+12,ly+12,2,2);
    }
  }

  // Player character on map
  const sl=levels[selectedLevel];
  const cx=sl.x+12, cy=sl.y+12;
  const bob=Math.sin(mapTimer*0.08)*3;
  // Shadow under player
  ctx.fillStyle='rgba(15,56,15,0.3)';
  ctx.fillRect(cx-3,cy-6+bob+6,6,2);
  drawSprite([
    '.HHHHHH.',
    'HHHHHHHH',
    '..SssS..',
    '.SsSSsS.',
    '.E.w.wE.',
    '.EewwEe.',
    'BBBBBBBB',
    'BBBBBBBB',
    '..bbbb..',
    '..bbbb..',
    '.OOOOOO.',
    '.OOOOOO.',
  ], { 'H': COL.darkest, 'S': COL.skin, 's': COL.skinDark, 'E': COL.light, 'w': COL.white, 'e': COL.darkest, 'B': COL.light, 'b': COL.dark, 'O': COL.darkest, '.': null }, cx-4, cy-14+bob);
  // Level name panel at bottom
  ctx.fillStyle=COL.darkest;
  ctx.fillRect(6,H-22,W-12,16);
  ctx.fillStyle=COL.ground;
  ctx.fillRect(6,H-22,W-12,1);
  ctx.fillRect(6,H-22,1,16);
  ctx.fillRect(W-7,H-22,1,16);
  ctx.fillRect(6,H-7,W-12,1);
  ctx.fillStyle=COL.star;
  drawPixelText('> '+sl.name, 12, H-19, COL.star);
}

function draw() {
  if (countdown > 0) {
    const num = Math.ceil(countdown / 60);
    ctx.save();
    ctx.scale(S, S);
    ctx.fillStyle = COL.darkest;
    ctx.fillRect(0, 0, W, H);
    const ts = String(num);
    drawPixelText(ts, Math.floor(W/2 - ts.length * 3), Math.floor(H/2 - 3), COL.star);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.scale(S, S);

  // ---- Map Screen ----
  if (gameScreen === 'map') { drawMap(); ctx.restore(); return; }
  if (gameScreen === 'mpLobby') { ctx.restore(); return; }

  if (screenShake>0.5/2) ctx.translate(Math.random()*screenShake-screenShake/2, Math.random()*screenShake-screenShake/2);

  // ---- Bonus Room ----
  if (inBonusRoom) {
    ctx.fillStyle=COL.caveBg;
    ctx.fillRect(0,0,W,H);
    // Exit pipe (bottom-left area)
    ctx.fillStyle=COL.pipeDark;
    ctx.fillRect(W-36,H-28,24,16);
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(W-36,H-28,24,2);
    ctx.fillRect(W-36,H-28,2,16);
    ctx.fillRect(W-16,H-28,2,16);
    ctx.fillRect(W-38,H-32,28,4);
    ctx.fillStyle=COL.pipeLight;
    ctx.fillRect(W-36,H-32,26,2);
    // Arrow hint
    ctx.fillStyle=COL.star;
    ctx.fillRect(W-26,H-18,4,2);
    ctx.fillRect(W-24,H-16,2,2);
    ctx.fillRect(W-26,H-14,4,2);
    // Draw stepping blocks
    for (const b of bonusBlocks) {
      ctx.fillStyle=COL.ground;
      ctx.fillRect(b.x,b.y,b.w,b.h);
      ctx.fillStyle=COL.darkest;
      ctx.fillRect(b.x,b.y,b.w,1);
      ctx.fillRect(b.x,b.y,1,b.h);
      ctx.fillRect(b.x+b.w-1,b.y,1,b.h);
      ctx.fillStyle=COL.grass;
      ctx.fillRect(b.x,b.y+b.h-1,b.w,1);
    }
    // Draw bonus coins (on top of blocks)
    for (const c of bonusCoins) {
      if (c.collected) continue;
      const frame=Math.floor(animTick/8)%3;
      const bw=frame===0?6:frame===1?4:2;
      ctx.fillStyle=COL.yellow;
      ctx.fillRect(c.x+(3-bw/2),c.y,bw,8);
      ctx.fillStyle=COL.star;
      ctx.fillRect(c.x+1+(3-bw/2),c.y+1,bw-2,2);
      ctx.fillRect(c.x+1+(3-bw/2),c.y+5,bw-2,2);
    }
    // Timer
    ctx.fillStyle=COL.ground;
    ctx.fillRect(2,2,50,8);
    ctx.fillStyle=COL.star;
    ctx.fillRect(2,2,50*(bonusRoomTimer/600),8);
    ctx.fillStyle=COL.darkest;
    ctx.fillRect(2,2,50,1); ctx.fillRect(2,2,1,8);
    drawPixelText('ZEIT',4,12,COL.light);
    // Draw player
    if (!player.dead) drawPlayer(player.x, player.y, player.facing, player.frame, player.onGround, player.big, player.star);
    ctx.restore();
    return;
  }

  drawBackground();

  const cx=Math.floor(camera.x);

  // Pipes
  for (const pipe of pipes) drawPipe(pipe,cx);

  // Ground and platforms
  for (const plat of platforms) {
    const dx=plat.x-cx;
    if (dx>W+16||dx<-plat.w-16) continue;
    if (plat.type==='ground') drawGround(plat,cx);
    else drawPlatform(plat,cx);
  }

  // Checkpoints
  for (const cp of checkpoints) drawCheckpoint(cp,cx);

  // Coins
  for (const c of coins) { if (!c.collected) drawCoin(c,cx,animTick); }

  // Question blocks
  for (const qb of questBlocks) drawQuestBlock(qb,cx);

  // Power-ups
  for (const pu of powerups) drawPowerUp(pu,cx);

  // Enemies
  for (const e of enemies) { if (e.alive) drawEnemy(e,cx); }

  // Fireballs
  for (const fb of fireballs) {
    const dx = fb.x - cx;
    ctx.fillStyle = COL.lava;
    ctx.fillRect(dx, fb.y, fb.w, fb.h);
    ctx.fillStyle = COL.lavaGlow;
    ctx.fillRect(dx + 1, fb.y + 1, 2, 2);
    ctx.fillStyle = COL.yellow;
    ctx.fillRect(dx, fb.y, 2, 1);
  }

  // Flagpole
  if (goalFlag) {
    const gx=goalFlag.x-cx;
    // Pole
    ctx.fillStyle=COL.pipeDark;
    ctx.fillRect(gx+1,goalFlag.y,2,goalFlag.h);
    // Top ball
    ctx.fillStyle=COL.star;
    ctx.fillRect(gx,goalFlag.y-4,4,4);
    ctx.fillStyle=COL.yellow;
    ctx.fillRect(gx+1,goalFlag.y-3,2,2);
    // Flag (near top, hangs to the right)
    ctx.fillStyle=COL.red;
    ctx.fillRect(gx+3,goalFlag.y+6,14,12);
    ctx.fillStyle=COL.redLight;
    ctx.fillRect(gx+5,goalFlag.y+8,10,3);
    ctx.fillRect(gx+5,goalFlag.y+13,10,3);
    // Flag star
    ctx.fillStyle=COL.star;
    ctx.fillRect(gx+8,goalFlag.y+9,2,1);
    ctx.fillRect(gx+10,goalFlag.y+10,2,2);
    ctx.fillRect(gx+8,goalFlag.y+12,2,1);
  }

  // Player
  if (!player.dead) {
    drawPlayer(player.x-cx, player.y, player.facing, player.frame, player.onGround, player.big, player.star);
    if (mp.connected && mp.localName) {
      const n = 'P' + mp.localName.replace(/.*\s(\d+).*/, '$1');
      const tx = Math.round(player.x - cx - n.length * 2.5 + 6);
      const ty = Math.round(player.y - 18);
      drawPixelText(n, tx, ty, COL.white);
    }
  }
  // Remote players (multiplayer)
  if (mp.connected) {
    for (const pid in mp.players) {
      const rp = mp.players[pid];
      if (!rp || rp.dead || rp.x == null || rp.inBonusRoom) continue;
      ctx.globalAlpha = 0.8;
      drawPlayer(rp.x - cx, rp.y, rp.facing || 1, rp.frame || 0, rp.onGround, rp.big || false, rp.star || 0);
      ctx.globalAlpha = 1;
      if (rp.name) {
        const n = 'P' + rp.name.replace(/.*\s(\d+).*/, '$1');
        const tx = Math.round(rp.x - cx - n.length * 2.5 + 6);
        const ty = Math.round(rp.y - 18);
        drawPixelText(n, tx, ty, COL.white);
      }
    }
  }

  // Power-up popups
  for (const pop of powerUpPopups) {
    const dx=pop.x-cx, dy=pop.y-Math.floor((50-pop.timer)*0.8), a=pop.timer/50;
    ctx.globalAlpha=a<0.3?a/0.3:1;
    ctx.fillStyle=COL.grass;
    // Mini icon + label
    if (pop.type==='mushroom') {
      ctx.fillStyle=COL.red; ctx.fillRect(dx+1,dy,4,3);
      ctx.fillStyle=COL.grass; ctx.fillRect(dx+2,dy+3,2,3);
    } else if (pop.type==='fire') {
      ctx.fillStyle=COL.red; ctx.fillRect(dx+2,dy,2,2); ctx.fillRect(dx+1,dy+2,4,4);
      ctx.fillStyle=COL.yellow; ctx.fillRect(dx+3,dy+2,2,2);
    } else if (pop.type==='star') {
      drawSprite(SP.starSmall, SP.starSmallPal, dx+1, dy+1);
    }
    drawPixelText(pop.label, dx+3-Math.floor(pop.label.length*3), dy+8, COL.grass);
    ctx.globalAlpha=1;
  }

  // Particles
  for (const pt of particles) {
    const dx=pt.x-cx;
    ctx.fillStyle=pt.color;
    ctx.fillRect(dx,pt.y,pt.size,pt.size);
  }

  ctx.restore();

  // Multiplayer minimap
  if (mp.connected && gameScreen === 'playing' && !inBonusRoom) {
    const WW = W * S, HH = H * S;
    const barY = 3, barH = 3, pad = 16;
    const barW = WW - pad * 2, barLeft = pad;
    const levelLen = 10000;
    // Bar background + border
    ctx.fillStyle = COL.darkest;
    ctx.fillRect(barLeft, barY, barW, barH);
    ctx.fillStyle = COL.light;
    ctx.fillRect(barLeft, barY, barW, 1);
    ctx.fillRect(barLeft, barY, 1, barH);
    ctx.fillRect(barLeft + barW - 1, barY, 1, barH);
    ctx.fillRect(barLeft, barY + barH - 1, barW, 1);
    // Draw level endpoint markers
    ctx.fillStyle = COL.star;
    ctx.fillRect(barLeft - 1, barY + 1, 2, barH - 2);
    ctx.fillRect(barLeft + barW - 1, barY + 1, 2, barH - 2);
    // Helper: get short name
    const shortName = (full) => 'P' + (full || '').replace(/.*\s(\d+).*/, '$1');
    // Local player
    const lx = Math.min(Math.max(barLeft + (player.x / levelLen) * barW, barLeft + 2), barLeft + barW - 2);
    ctx.fillStyle = COL.white;
    ctx.fillRect(lx - 1, barY - 2, 3, barH + 4);
    const ln = shortName(mp.localName);
    drawPixelText(ln, Math.round(lx - ln.length * 2.5), barY + barH + 2, COL.white);
    // Remote players
    for (const pid in mp.players) {
      const rp = mp.players[pid];
      if (!rp || rp.x == null || rp.inBonusRoom) continue;
      const rx = Math.min(Math.max(barLeft + (rp.x / levelLen) * barW, barLeft + 2), barLeft + barW - 2);
      ctx.fillStyle = COL.yellow;
      ctx.fillRect(rx - 1, barY - 2, 3, barH + 4);
      if (rp.name) {
        const rn = shortName(rp.name);
        const rty = barY + barH + 2;
        drawPixelText(rn, Math.round(rx - rn.length * 2.5), rty, COL.yellow);
      }
    }
  }

  // Scanline effect (at canvas-native resolution)
  ctx.fillStyle='rgba(15,56,15,0.05)';
  for (let y=0; y<H*S; y+=3) ctx.fillRect(0,y,W*S,1);

  // Killstreak popup
  if (killstreakPopup > 0 && gameScreen === 'playing' && !inBonusRoom) {
    const a = Math.min(killstreakPopup / 15, 1);
    ctx.globalAlpha = a < 0.3 ? a / 0.3 : 1;
    ctx.fillStyle = COL.red;
    const ksW = W*S, ksH = H*S;
    drawPixelText('KILLSTREAK', Math.floor(ksW/2 - 5*6/2), Math.floor(ksH/2 - 8), COL.red);
    ctx.globalAlpha = 1;
  }

  // Killstreak timer bar
  if (killstreakTimer > 0 && gameScreen === 'playing' && !inBonusRoom) {
    const bw = 45;
    ctx.fillStyle = COL.ground;
    ctx.fillRect(2, 2, bw, 6);
    ctx.fillStyle = COL.red;
    ctx.fillRect(2, 2, bw * (killstreakTimer / 600), 6);
    ctx.fillStyle = COL.darkest;
    ctx.fillRect(2, 2, bw, 1); ctx.fillRect(2, 2, 1, 6);
    drawPixelText('2X', 4, 10, COL.red);
  }

  // Biome transition overlay
  if (biomeTrans>0) {
    ctx.fillStyle=`rgba(15,56,15,${biomeTrans*0.01})`;
    ctx.fillRect(0,0,W*S,H*S);
  }

  // Border
  ctx.fillStyle=COL.darkest;
  const WW=W*S, HH=H*S;
  ctx.fillRect(0,0,WW,1); ctx.fillRect(0,HH-1,WW,1);
  ctx.fillRect(0,0,1,HH); ctx.fillRect(WW-1,0,1,HH);
}

// ---- Pixel Font ----
const FONT={
  A:[0b01110,0b10001,0b11111,0b10001,0b10001,0b10001],
  B:[0b11110,0b10001,0b11110,0b10001,0b10001,0b11110],
  C:[0b01110,0b10001,0b10000,0b10000,0b10001,0b01110],
  D:[0b11110,0b10001,0b10001,0b10001,0b10001,0b11110],
  E:[0b11111,0b10000,0b11110,0b10000,0b10000,0b11111],
  F:[0b11111,0b10000,0b11110,0b10000,0b10000,0b10000],
  G:[0b01110,0b10001,0b10000,0b10111,0b10001,0b01110],
  H:[0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  I:[0b00100,0b01110,0b00100,0b00100,0b00100,0b01110],
  J:[0b00010,0b00010,0b00010,0b00010,0b10010,0b01100],
  K:[0b10001,0b10010,0b11100,0b10010,0b10001,0b10001],
  L:[0b01000,0b01000,0b01000,0b01000,0b01000,0b01111],
  M:[0b10001,0b11011,0b10101,0b10001,0b10001,0b10001],
  N:[0b10001,0b10001,0b11001,0b10101,0b10011,0b10001],
  O:[0b01110,0b10001,0b10001,0b10001,0b10001,0b01110],
  P:[0b01110,0b10001,0b10001,0b11110,0b10000,0b10000],
  Q:[0b01110,0b10001,0b10001,0b10001,0b10011,0b01110],
  R:[0b11110,0b10001,0b11110,0b10100,0b10010,0b10001],
  S:[0b01110,0b10001,0b01100,0b00110,0b10001,0b01110],
  T:[0b11111,0b00100,0b00100,0b00100,0b00100,0b00100],
  U:[0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  V:[0b10001,0b10001,0b10001,0b10001,0b01110,0b00100],
  W:[0b10001,0b10001,0b10001,0b10101,0b11011,0b10001],
  X:[0b10001,0b10001,0b01110,0b10001,0b10001,0b10001],
  Y:[0b10001,0b10001,0b01110,0b00100,0b00100,0b00100],
  Z:[0b11111,0b00001,0b00011,0b00110,0b01100,0b11111],
  ' ':[0,0,0,0,0,0],
  '0':[0b01110,0b10001,0b10011,0b10101,0b11001,0b01110],
  '1':[0b00100,0b01100,0b00100,0b00100,0b00100,0b01110],
  '2':[0b01110,0b10001,0b00001,0b00110,0b01000,0b11111],
  '3':[0b01110,0b10001,0b00110,0b00001,0b10001,0b01110],
  '4':[0b00010,0b00110,0b01010,0b11111,0b00010,0b00010],
  '5':[0b11111,0b10000,0b11110,0b00001,0b10001,0b01110],
  '6':[0b01110,0b10000,0b11110,0b10001,0b10001,0b01110],
  '7':[0b11111,0b00001,0b00010,0b00100,0b01000,0b01000],
  '8':[0b01110,0b10001,0b01110,0b10001,0b10001,0b01110],
  '9':[0b01110,0b10001,0b10001,0b01111,0b00001,0b01110],
};
// Lowercase = same as uppercase for the pixel font
for (const ch of 'abcdefghijklmnopqrstuvwxyz') FONT[ch] = FONT[ch.toUpperCase()];
function drawPixelChar(ch,x,y,color){
  const g=FONT[ch]; if(!g)return;
  ctx.fillStyle=color;
  for(let r=0;r<6;r++)for(let c=0;c<5;c++)if(g[r]&(1<<(4-c)))ctx.fillRect(x+c,y+r,1,1);
}
function drawPixelText(t,x,y,color){for(let i=0;i<t.length;i++)drawPixelChar(t[i],x+i*6,y,color);}

// ---- Multiplayer Connection & Logic ----
function mpConnect(roomCode) {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = location.host || 'localhost:8080';
  const url = protocol + '//' + host;
  if (mpConn) { try { mpConn.close(); } catch(e) {} }
  mp.players = {};
  document.getElementById('mpError').textContent = 'Verbinde...';
  try {
    mpConn = new WebSocket(url);
  } catch(e) {
    document.getElementById('mpError').textContent = 'Verbindung fehlgeschlagen!';
    return;
  }
  mpConn.onopen = () => {
    document.getElementById('mpError').textContent = '';
    mpSend({ type: 'join', room: roomCode || undefined });
  };
  mpConn.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch(e) { return; }
    mpHandleMessage(msg);
  };
  mpConn.onclose = () => {
    if (mp.connected) mpDisconnect('Verbindung getrennt');
    else document.getElementById('mpError').textContent = 'Server nicht erreichbar';
  };
  mpConn.onerror = () => {
    document.getElementById('mpError').textContent = 'Verbindungsfehler';
  };
}
function mpDisconnect(reason) {
  mp.connected = false; mp.room = null; mp.id = null; mp.host = false;
  mp.seed = null; mp.players = {};
  if (mpConn) { try { mpConn.close(); } catch(e) {} mpConn = null; }
  document.getElementById('mpScreen').classList.add('hidden');
  document.getElementById('mpMsgOverlay').classList.add('hidden');
  document.getElementById('mpJoin').style.display = '';
  document.getElementById('mpLobby').style.display = 'none';
  document.getElementById('mpStatus').textContent = reason || 'Getrennt';
  if (gameScreen === 'playing' || gameScreen === 'mpLobby') {
    gameScreen = 'start'; gameRunning = false;
    document.getElementById('startScreen').classList.remove('hidden');
  }
}
function mpStartLevel(level, seed) {
  cheatInfiniteLives = false; cheatImmortal = false; cheatUnlockAll = false;
  mp.seed = seed;
  mp.prng = mpPRNG(seed);
  // Override Math.random globally so all direct calls inside buildLevel use the seeded PRNG
  const _origRandom = Math.random;
  Math.random = function() { return mp.prng(); };
  stopStarMusic(); stopKillstreakMusic();
  score = 0; coinCount = 0; distance = 0; camera.x = 0;
  gameOver = false; screenShake = 0; gameRunning = true;
  comboCount = 0; comboTimer = 0;
  killstreakCount = 0; killstreakWindow = 0; killstreakTimer = 0; killstreakPopup = 0;
  lastEnemySpawnX = 0; inBonusRoom = false; bonusRoomPipe = null;
  bonusCoins = []; bonusBlocks = []; bonusExitCooldown = 0;
  fireballs = []; powerUpPopups = [];
  currentLevel = level;
  // Multiplayer: shared lives = number of players × 3
  lives = (1 + Object.keys(mp.players).length) * 3;
  buildLevel(level);
  Math.random = _origRandom;
  mp.seed = null;
  mp.periodicSeed = seed;
  resetPlayer();
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('mpGameOverMsg').classList.add('hidden');
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('mapScreen').classList.add('hidden');
  document.getElementById('mpScreen').classList.add('hidden');
  document.getElementById('mpMsgOverlay').classList.add('hidden');
  document.getElementById('controls').style.display = 'flex';
  document.getElementById('rightGroup').style.display = '';
  document.getElementById('enterBtn').style.display = '';
  document.getElementById('fireBtn').style.display = '';
  if (mp.connected && !mp.host) {
    document.getElementById('restartTouchBtn').style.display = 'none';
  } else {
    document.getElementById('restartTouchBtn').style.display = '';
  }
  document.getElementById('mapTouchBtn').style.display = '';
  document.getElementById('statusBar').style.display = '';
  document.getElementById('powerUpBar').style.display = '';
  goFullscreen();
  gameScreen = 'playing';
}
function mpHandleMessage(msg) {
  switch (msg.type) {
    case 'joined':
      // Cheats im Multiplayer nicht erlaubt
      cheatInfiniteLives = false; cheatImmortal = false; cheatUnlockAll = false;
      document.getElementById('infiniteLivesBtn').textContent = 'UNENDLICH LEBEN: AUS';
      document.getElementById('immortalBtn').textContent = 'UNSTERBLICH: AUS';
      document.getElementById('unlockAllBtn').textContent = 'ALLE LEVEL FREISCHALTEN: AUS';
      mp.connected = true; mp.id = msg.id; mp.room = msg.room; mp.host = msg.host; mp.localName = msg.name;
      mp.players = {};
      for (const p of msg.players) {
        if (p.id !== mp.id) mp.players[p.id] = { id: p.id, name: p.name, host: p.host };
      }
      document.getElementById('mpRoomCode').textContent = msg.room;
      document.getElementById('mpJoin').style.display = 'none';
      document.getElementById('mpLobby').style.display = '';
      document.getElementById('mpStartBtn').style.display = msg.host ? 'inline-block' : 'none';
      document.getElementById('mpStatus').textContent = 'Verbunden – Raum ' + msg.room;
      updateMpPlayerList();
      break;
    case 'player_joined':
      mp.players[msg.id] = { id: msg.id, name: msg.name, host: false };
      updateMpPlayerList();
      break;
    case 'player_left':
      delete mp.players[msg.id];
      updateMpPlayerList();
      break;
    case 'host_changed':
      mp.host = (msg.id === mp.id);
      document.getElementById('mpStartBtn').style.display = mp.host ? 'inline-block' : 'none';
      for (const pid in mp.players) mp.players[pid].host = (pid === msg.id);
      updateMpPlayerList();
      break;
    case 'player_states':
      if (gameScreen !== 'playing') break;
      for (const ps of msg.players) {
        if (ps.id === mp.id) continue;
        mp.players[ps.id] = mp.players[ps.id] || {};
        Object.assign(mp.players[ps.id], ps);
      }
      break;
    case 'game_event':
      if (gameScreen !== 'playing') break;
      if (msg.id === mp.id) break;
      mpHandleEvent(msg.event, msg.data);
      break;
    case 'level_start':
      if (countdown > 0 || gameScreen === 'playing') break;
      countdown = 180;
      pendingLevel = msg.level;
      pendingSeed = msg.seed;
      stopStarMusic();
      document.getElementById('mpScreen').classList.add('hidden');
      document.getElementById('mpMsgOverlay').classList.add('hidden');
      document.getElementById('controls').style.display = 'flex';
      document.getElementById('rightGroup').style.display = '';
      document.getElementById('enterBtn').style.display = '';
      document.getElementById('fireBtn').style.display = '';
      document.getElementById('mapTouchBtn').style.display = '';
      if (mp.host) document.getElementById('restartTouchBtn').style.display = '';
      else document.getElementById('restartTouchBtn').style.display = 'none';
      document.getElementById('statusBar').style.display = '';
      document.getElementById('powerUpBar').style.display = '';
      break;
    case 'error':
      document.getElementById('mpError').textContent = msg.message;
      break;
    case 'level_select':
      mp.lobbyLevel = msg.level;
      document.getElementById('mpLevelName').textContent = levels[mp.lobbyLevel].name;
      break;
    case 'pong':
      break;
  }
}
function mpHandleEvent(event, data) {
  switch (event) {
    case 'coin_collected':
      for (const c of coins) {
        if (c._id === data.id && !c.collected) {
          c.collected = true;
          spawnParticles(c.x + 3, c.y + 4, 4, COL.star);
          break;
        }
      }
      break;
    case 'enemy_killed':
      for (const e of enemies) {
        if (e._id === data.id && e.alive) {
          e.alive = false;
          spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 10, COL.grass);
          break;
        }
      }
      break;
    case 'powerup_collected':
      for (let i = powerups.length - 1; i >= 0; i--) {
        if (powerups[i]._id === data.id) {
          powerups.splice(i, 1);
          break;
        }
      }
      break;
    case 'quest_block_hit':
      for (const qb of questBlocks) {
        if (qb._id === data.id && !qb.hit) {
          qb.hit = true; qb.bounce = 4;
          if (data.powerupType) spawnPowerUp(qb.x + 2, qb.y - 14, data.powerupType, 'p_' + qb._id);
          break;
        }
      }
      break;
    case 'checkpoint_reached':
      for (const cp of checkpoints) {
        if (cp._id === data.id && !cp.reached) {
          cp.reached = true;
          spawnParticles(cp.x + 4, cp.y, 6, COL.star);
          break;
        }
      }
      break;
    case 'player_died':
      lives--;
      if (lives <= 0) {
        gameRunning = false; gameOver = true;
        document.getElementById('finalScore').textContent = 'PUNKTE: ' + score;
        document.getElementById('finalCoins').textContent = 'MUNZEN: ' + coinCount;
        document.getElementById('finalDist').textContent = 'STRECKE: ' + distance + 'm';
        if (score > highScore) { highScore = score; saveHighScore(); document.getElementById('finalHS').textContent = 'NEUER HIGHSCORE!'; }
        else document.getElementById('finalHS').textContent = 'HIGHSCORE: ' + highScore;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        if (mp.host) { document.getElementById('mpGameOverMsg').classList.add('hidden'); document.getElementById('restartBtn').style.display = ''; }
        else { document.getElementById('mpGameOverMsg').classList.remove('hidden'); document.getElementById('restartBtn').style.display = 'none'; }
      }
      break;
    case 'bonus_room': {
      const pid = data.senderId;
      if (data.inBonusRoom) {
        mp.players[pid] = mp.players[pid] || {};
        mp.players[pid].inBonusRoom = true;
      } else {
        if (mp.players[pid]) {
          mp.players[pid].inBonusRoom = false;
          if (data.x != null) {
            mp.players[pid].x = data.x;
            mp.players[pid].y = data.y;
          }
        }
      }
      break;
    }
    case 'extra_life':
      lives++;
      break;
    case 'player_won':
      levels[currentLevel].completed = true;
      stopStarMusic();
      returnToMap();
      document.getElementById('mpMsgText').textContent = 'SPIELER HAT GEWONNEN!';
      document.getElementById('mpMsgOverlay').classList.remove('hidden');
      setTimeout(() => { document.getElementById('mpMsgOverlay').classList.add('hidden'); }, 3000);
      break;
    case 'player_left_level':
      document.getElementById('mpMsgText').textContent = (data.name || 'Ein Spieler') + ' HAT DAS LEVEL VERLASSEN';
      document.getElementById('mpMsgOverlay').classList.remove('hidden');
      setTimeout(() => { document.getElementById('mpMsgOverlay').classList.add('hidden'); }, 3000);
      break;
  }
}
function updateMpPlayerList() {
  const list = document.getElementById('mpPlayerList');
  list.innerHTML = '';
  if (mp.connected) {
    const me = document.createElement('div');
    me.textContent = mp.localName + ' (DU)';
    me.style.color = '#9bbc0f';
    list.appendChild(me);
  }
  for (const pid in mp.players) {
    const p = mp.players[pid];
    const div = document.createElement('div');
    div.textContent = p.name || 'Spieler';
    if (p.host) div.className = 'mp-host';
    list.appendChild(div);
  }
}
// ---- Input ----
function setupInput() {
  function bindBtn(el,key) {
    el.addEventListener('touchstart',e=>{keys[key]=true;if(key==='jump')keys.jumpPressed=true;if(key==='shoot')keys.shootPressed=true;e.preventDefault();},{passive:false});
    el.addEventListener('touchend',e=>{keys[key]=false;e.preventDefault();},{passive:false});
    el.addEventListener('touchcancel',e=>{keys[key]=false;e.preventDefault();},{passive:false});
    el.addEventListener('mousedown',e=>{keys[key]=true;if(key==='jump')keys.jumpPressed=true;if(key==='shoot')keys.shootPressed=true;});
    el.addEventListener('mouseup',e=>{keys[key]=false;});
  }
  bindBtn(document.getElementById('leftBtn'),'left');
  bindBtn(document.getElementById('rightBtn'),'right');
  bindBtn(document.getElementById('jumpBtn'),'jump');
  bindBtn(document.getElementById('enterBtn'),'down');
  bindBtn(document.getElementById('fireBtn'),'shoot');
  document.addEventListener('keydown',e=>{
    if (e.key==='ArrowLeft') keys.left=true;
    if (e.key==='ArrowRight') keys.right=true;
    if (e.key===' '||e.key==='ArrowUp'){keys.jump=true;keys.jumpPressed=true;e.preventDefault();}
    if (e.key==='ArrowDown'){keys.down=true;e.preventDefault();}
    if (e.code==='ControlRight'){keys.shoot=true;keys.shootPressed=true;e.preventDefault();}
    if (e.key==='r'||e.key==='R') restartGame();
    if (e.key==='f'||e.key==='F') goFullscreen();
    if (e.key==='Escape'||e.key==='m'||e.key==='M') returnToMap();
  });
  document.addEventListener('keyup',e=>{
    if (e.key==='ArrowLeft') keys.left=false;
    if (e.key==='ArrowRight') keys.right=false;
    if (e.key===' '||e.key==='ArrowUp'){keys.jump=false;e.preventDefault();}
    if (e.key==='ArrowDown'){keys.down=false;e.preventDefault();}
    if (e.code==='ControlRight'){keys.shoot=false;e.preventDefault();}
  });
}

// ---- Main Loop (fixed timestep 60fps) ----
const FIXED_DT = 1000 / 60;
let lastFrameTime = 0, accTime = 0;
function gameLoop() {
  const now = performance.now();
  if (!lastFrameTime) lastFrameTime = now;
  const frameTime = Math.min(now - lastFrameTime, 50);
  lastFrameTime = now;
  accTime += frameTime;
  while (accTime >= FIXED_DT) { update(); accTime -= FIXED_DT; }
  draw();
  requestAnimationFrame(gameLoop);
}

// ---- Start ----
function goFullscreen() {
  const el=document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}
function requestNewGame() {
  if (localStorage.getItem('splDxSave')) {
    document.getElementById('newGameConfirm').style.display = 'flex';
  } else {
    newGame();
  }
}
function newGame() {
  document.getElementById('newGameConfirm').style.display = 'none';
  for (const l of levels) l.completed = false;
  cheatUnlockAll = false;
  document.getElementById('unlockAllBtn').textContent = 'ALLE LEVEL FREISCHALTEN: AUS';
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('singleplayerScreen').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('helpScreen').classList.add('hidden');
  document.getElementById('cheatScreen').classList.add('hidden');
  document.getElementById('confirmDialog').classList.add('hidden');
  currentLevel = 0; selectedLevel = 0; lives = 3; score = 0; coinCount = 0;
  document.getElementById('scoreDisplay').textContent='000000';
  document.getElementById('coinsDisplay').textContent='00';
  try { localStorage.removeItem('splDxSave'); } catch(e) {}
  gameScreen = 'map'; gameRunning = true; gameOver = false;
  document.getElementById('mapScreen').classList.remove('hidden');
  goFullscreen();
}
function updateContinueBtn() {
  document.getElementById('continueBtn').disabled = !localStorage.getItem('splDxSave');
}
function restartFromGameOver() {
  if (mp.connected) {
    if (mp.host) { document.getElementById('gameOverScreen').classList.add('hidden'); restartGame(); }
    return;
  }
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
  document.getElementById('mapScreen').classList.add('hidden');
  document.getElementById('confirmDialog').classList.add('hidden');
  gameOver = false; gameRunning = false;
  currentLevel = 0; selectedLevel = 0; lives = 3;
  updateContinueBtn();
}
function showHelp() {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('helpScreen').classList.remove('hidden');
}
function hideHelp() {
  document.getElementById('helpScreen').classList.add('hidden');
  document.getElementById('cheatScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
}

loadHighScore();
document.getElementById('newGameBtn').addEventListener('click',requestNewGame);
document.getElementById('newGameBtn').addEventListener('touchend',e=>{e.preventDefault();requestNewGame();});
document.getElementById('newGameConfirmYes').addEventListener('click',newGame);
document.getElementById('newGameConfirmYes').addEventListener('touchend',e=>{e.preventDefault();newGame();});
document.getElementById('newGameConfirmNo').addEventListener('click',()=>{document.getElementById('newGameConfirm').style.display='none';});
document.getElementById('newGameConfirmNo').addEventListener('touchend',e=>{e.preventDefault();document.getElementById('newGameConfirm').style.display='none';});
document.getElementById('continueBtn').addEventListener('click',continueGame);
document.getElementById('continueBtn').addEventListener('touchend',e=>{e.preventDefault();continueGame();});
document.getElementById('restartBtn').addEventListener('click',restartFromGameOver);
document.getElementById('restartBtn').addEventListener('touchend',e=>{e.preventDefault();restartFromGameOver();});
document.getElementById('restartTouchBtn').addEventListener('click',restartGame);
document.getElementById('restartTouchBtn').addEventListener('touchend',e=>{e.preventDefault();restartGame();});
document.getElementById('mapTouchBtn').addEventListener('click',returnToMap);
document.getElementById('mapTouchBtn').addEventListener('touchend',e=>{e.preventDefault();returnToMap();});
document.getElementById('helpBtn').addEventListener('click',showHelp);
document.getElementById('helpBtn').addEventListener('touchend',e=>{e.preventDefault();showHelp();});
document.getElementById('backBtn').addEventListener('click',hideHelp);
document.getElementById('backBtn').addEventListener('touchend',e=>{e.preventDefault();hideHelp();});
document.getElementById('cheatBtn').addEventListener('click',()=>{document.getElementById('helpScreen').classList.add('hidden');document.getElementById('cheatScreen').classList.remove('hidden');});
document.getElementById('cheatBtn').addEventListener('touchend',e=>{e.preventDefault();document.getElementById('helpScreen').classList.add('hidden');document.getElementById('cheatScreen').classList.remove('hidden');});
document.getElementById('cheatBackBtn').addEventListener('click',()=>{document.getElementById('cheatScreen').classList.add('hidden');document.getElementById('helpScreen').classList.remove('hidden');});
document.getElementById('cheatBackBtn').addEventListener('touchend',e=>{e.preventDefault();document.getElementById('cheatScreen').classList.add('hidden');document.getElementById('helpScreen').classList.remove('hidden');});
document.getElementById('infiniteLivesBtn').addEventListener('click',()=>{if(mp.connected)return;cheatInfiniteLives=!cheatInfiniteLives;document.getElementById('infiniteLivesBtn').textContent='UNENDLICH LEBEN: '+(cheatInfiniteLives?'EIN':'AUS');});
document.getElementById('infiniteLivesBtn').addEventListener('touchend',e=>{e.preventDefault();if(mp.connected)return;cheatInfiniteLives=!cheatInfiniteLives;document.getElementById('infiniteLivesBtn').textContent='UNENDLICH LEBEN: '+(cheatInfiniteLives?'EIN':'AUS');});
document.getElementById('immortalBtn').addEventListener('click',()=>{if(mp.connected)return;cheatImmortal=!cheatImmortal;document.getElementById('immortalBtn').textContent='UNSTERBLICH: '+(cheatImmortal?'EIN':'AUS');});
document.getElementById('immortalBtn').addEventListener('touchend',e=>{e.preventDefault();if(mp.connected)return;cheatImmortal=!cheatImmortal;document.getElementById('immortalBtn').textContent='UNSTERBLICH: '+(cheatImmortal?'EIN':'AUS');});
document.getElementById('unlockAllBtn').addEventListener('click',()=>{if(mp.connected)return;cheatUnlockAll=!cheatUnlockAll;if(cheatUnlockAll)for(const l of levels)l.completed=true;document.getElementById('unlockAllBtn').textContent='ALLE LEVEL FREISCHALTEN: '+(cheatUnlockAll?'EIN':'AUS');});
document.getElementById('unlockAllBtn').addEventListener('touchend',e=>{e.preventDefault();if(mp.connected)return;cheatUnlockAll=!cheatUnlockAll;if(cheatUnlockAll)for(const l of levels)l.completed=true;document.getElementById('unlockAllBtn').textContent='ALLE LEVEL FREISCHALTEN: '+(cheatUnlockAll?'EIN':'AUS');});

// ---- Singleplayer Screen ----
document.getElementById('spBtn').addEventListener('click', ()=>{
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('singleplayerScreen').classList.remove('hidden');
});
document.getElementById('spBtn').addEventListener('touchend', e=>{e.preventDefault();
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('singleplayerScreen').classList.remove('hidden');
});
document.getElementById('spBackBtn').addEventListener('click', ()=>{
  document.getElementById('singleplayerScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
});
document.getElementById('spBackBtn').addEventListener('touchend', e=>{e.preventDefault();
  document.getElementById('singleplayerScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
});
// ---- Multiplayer UI ----
document.getElementById('mpBtn').addEventListener('click', ()=>{
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('mpScreen').classList.remove('hidden');
  document.getElementById('mpJoin').style.display = '';
  document.getElementById('mpLobby').style.display = 'none';
  document.getElementById('mpError').textContent = '';
});
document.getElementById('mpBtn').addEventListener('touchend', e=>{e.preventDefault();
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('mpScreen').classList.remove('hidden');
  document.getElementById('mpJoin').style.display = '';
  document.getElementById('mpLobby').style.display = 'none';
  document.getElementById('mpError').textContent = '';
});
document.getElementById('mpBackBtn').addEventListener('click', ()=>{
  if (mpConn) { try { mpConn.close(); } catch(e) {} mpConn = null; }
  mp.connected = false; mp.players = {};
  document.getElementById('mpScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
});
document.getElementById('mpBackBtn').addEventListener('touchend', e=>{e.preventDefault();
  if (mpConn) { try { mpConn.close(); } catch(e) {} mpConn = null; }
  mp.connected = false; mp.players = {};
  document.getElementById('mpScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
});
document.getElementById('mpCreateBtn').addEventListener('click', ()=>{
  mpConnect('');
});
document.getElementById('mpCreateBtn').addEventListener('touchend', e=>{e.preventDefault();
  mpConnect('');
});
document.getElementById('mpJoinBtn').addEventListener('click', ()=>{
  const code = document.getElementById('mpCodeInput').value.trim().toUpperCase();
  if (!code) { document.getElementById('mpError').textContent = 'Raum-Code eingeben!'; return; }
  mpConnect(code);
});
document.getElementById('mpJoinBtn').addEventListener('touchend', e=>{e.preventDefault();
  const code = document.getElementById('mpCodeInput').value.trim().toUpperCase();
  if (!code) { document.getElementById('mpError').textContent = 'Raum-Code eingeben!'; return; }
  mpConnect(code);
});
document.getElementById('mpLeaveBtn').addEventListener('click', ()=>{
  mpDisconnect('Raum verlassen');
  document.getElementById('startScreen').classList.remove('hidden');
});
document.getElementById('mpLeaveBtn').addEventListener('touchend', e=>{e.preventDefault();
  mpDisconnect('Raum verlassen');
  document.getElementById('startScreen').classList.remove('hidden');
});
document.getElementById('mpStartBtn').addEventListener('click', ()=>{
  if (mp.host && mp.connected) mpSend({ type: 'start_level', level: mp.lobbyLevel });
});
document.getElementById('mpStartBtn').addEventListener('touchend', e=>{e.preventDefault();
  if (mp.host && mp.connected) mpSend({ type: 'start_level', level: mp.lobbyLevel });
});
document.getElementById('mpLevelPrev').addEventListener('click', ()=>{
  if (!mp.host) return;
  mp.lobbyLevel = (mp.lobbyLevel - 1 + levels.length) % levels.length;
  document.getElementById('mpLevelName').textContent = levels[mp.lobbyLevel].name;
  mpSend({ type: 'level_select', level: mp.lobbyLevel });
});
document.getElementById('mpLevelPrev').addEventListener('touchend', e=>{e.preventDefault();
  if (!mp.host) return;
  mp.lobbyLevel = (mp.lobbyLevel - 1 + levels.length) % levels.length;
  document.getElementById('mpLevelName').textContent = levels[mp.lobbyLevel].name;
  mpSend({ type: 'level_select', level: mp.lobbyLevel });
});
document.getElementById('mpLevelNext').addEventListener('click', ()=>{
  if (!mp.host) return;
  mp.lobbyLevel = (mp.lobbyLevel + 1) % levels.length;
  document.getElementById('mpLevelName').textContent = levels[mp.lobbyLevel].name;
  mpSend({ type: 'level_select', level: mp.lobbyLevel });
});
document.getElementById('mpLevelNext').addEventListener('touchend', e=>{e.preventDefault();
  if (!mp.host) return;
  mp.lobbyLevel = (mp.lobbyLevel + 1) % levels.length;
  document.getElementById('mpLevelName').textContent = levels[mp.lobbyLevel].name;
  mpSend({ type: 'level_select', level: mp.lobbyLevel });
});

function beendenSave() {
  if (!cheatInfiniteLives && !cheatImmortal && !cheatUnlockAll) saveProgress();
  document.getElementById('mapScreen').classList.add('hidden');
  document.getElementById('confirmDialog').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
  gameRunning = false;
  stopStarMusic();
  updateContinueBtn();
}
function beendenQuit() {
  document.getElementById('mapScreen').classList.add('hidden');
  document.getElementById('confirmDialog').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
  gameRunning = false;
  stopStarMusic();
  updateContinueBtn();
}
function showQuitDialog() {
  document.getElementById('quitMain').style.display = '';
  document.getElementById('quitConfirm').style.display = 'none';
  const hasCheats = cheatInfiniteLives || cheatImmortal || cheatUnlockAll;
  document.getElementById('confirmSaveQuit').disabled = hasCheats;
  document.getElementById('saveDisabledHint').style.display = hasCheats ? '' : 'none';
  document.getElementById('confirmDialog').classList.remove('hidden');
}
function cancelQuit() {
  document.getElementById('confirmDialog').classList.add('hidden');
  document.getElementById('quitMain').style.display = '';
  document.getElementById('quitConfirm').style.display = 'none';
}
document.getElementById('beendenBtn').addEventListener('click',showQuitDialog);
document.getElementById('beendenBtn').addEventListener('touchend',e=>{e.preventDefault();showQuitDialog();});
document.getElementById('confirmSaveQuit').addEventListener('click',beendenSave);
document.getElementById('confirmSaveQuit').addEventListener('touchend',e=>{e.preventDefault();beendenSave();});
document.getElementById('confirmQuit').addEventListener('click',()=>{document.getElementById('quitMain').style.display='none';document.getElementById('quitConfirm').style.display='';});
document.getElementById('confirmQuit').addEventListener('touchend',e=>{e.preventDefault();document.getElementById('quitMain').style.display='none';document.getElementById('quitConfirm').style.display='';});
document.getElementById('confirmCancel').addEventListener('click',cancelQuit);
document.getElementById('confirmCancel').addEventListener('touchend',e=>{e.preventDefault();cancelQuit();});
document.getElementById('quitConfirmYes').addEventListener('click',beendenQuit);
document.getElementById('quitConfirmYes').addEventListener('touchend',e=>{e.preventDefault();beendenQuit();});
document.getElementById('quitConfirmNo').addEventListener('click',()=>{document.getElementById('quitMain').style.display='';document.getElementById('quitConfirm').style.display='none';});
document.getElementById('quitConfirmNo').addEventListener('touchend',e=>{e.preventDefault();document.getElementById('quitMain').style.display='';document.getElementById('quitConfirm').style.display='none';});

setupInput();

function resize() {
  const ratio=W/H;
  let w=window.innerWidth, h=window.innerHeight;
  if (w/h>ratio) w=h*ratio; else h=w/ratio;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
}
window.addEventListener('resize',resize);
window.addEventListener('orientationchange',resize);
resize();

// Show high score on start
loadHighScore();
document.getElementById('hsText').textContent = highScore > 0 ? 'HIGHSCORE: '+highScore : '';
updateContinueBtn();

buildLevel();
gameLoop();
