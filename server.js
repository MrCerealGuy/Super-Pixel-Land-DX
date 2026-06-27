const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;

// ---- HTTP static file server ----
const MIME = {
  '.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'application/javascript',
  '.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.json':'application/json',
};
const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? 'index.html' : req.url.replace(/^\//, '');
  filePath = path.normalize(path.join(__dirname, filePath)).replace(/^\.\.\//, '');
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end(); return; }
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// ---- WebSocket server (attached to HTTP) ----
const wss = new WebSocket.Server({ server });

function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars[Math.random() * chars.length | 0];
  return c;
}

let nextId = 1;
const rooms = {};

function broadcast(room, msg, exclude) {
  const data = JSON.stringify(msg);
  for (const p of room.players) {
    if (p.ws !== exclude && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(data);
    }
  }
}

// ---- State broadcast interval (20fps) ----
setInterval(() => {
  for (const code in rooms) {
    const room = rooms[code];
    if (room.players.length < 2) continue;
    const states = [];
    for (const p of room.players) {
      if (p.state) {
        states.push({ id: p.id, ...p.state });
      }
    }
    if (states.length > 0) {
      broadcast(room, { type: 'player_states', players: states });
    }
  }
}, 50);

wss.on('connection', (ws) => {
  ws._pid = null;
  ws._pname = 'Spieler';
  ws._room = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch (e) { return; }

    switch (msg.type) {
      case 'join': {
        let code = msg.room ? msg.room.toUpperCase().trim() : '';

        if (code) {
          if (!rooms[code]) {
            ws.send(JSON.stringify({ type: 'error', message: 'Raum nicht gefunden' }));
            return;
          }
          if (rooms[code].players.length >= 4) {
            ws.send(JSON.stringify({ type: 'error', message: 'Raum voll (max 4)' }));
            return;
          }
        } else {
          do { code = genRoomCode(); } while (rooms[code]);
          rooms[code] = { code, host: ws, players: [], level: 0 };
        }

        const room = rooms[code];
        const playerNum = room.players.length + 1;
        const name = 'Spieler ' + playerNum;
        ws._pid = 'p' + (nextId++);
        ws._pname = name;
        ws._room = code;

        const isHost = room.host === ws;
        room.players.push({ ws, id: ws._pid, name, host: isHost, state: null });

        broadcast(room, { type: 'player_joined', id: ws._pid, name }, ws);
        ws.send(JSON.stringify({
          type: 'joined',
          id: ws._pid,
          name,
          room: code,
          host: isHost,
          players: room.players.map(p => ({ id: p.id, name: p.name, host: p.host }))
        }));
        break;
      }

      case 'player_state': {
        if (!ws._room || !rooms[ws._room]) return;
        const room = rooms[ws._room];
        const p = room.players.find(x => x.ws === ws);
        if (p) p.state = msg;
        break;
      }

      case 'game_event': {
        if (!ws._room || !rooms[ws._room]) return;
        broadcast(rooms[ws._room], { type: 'game_event', id: ws._pid, event: msg.event, data: msg.data }, ws);
        break;
      }

      case 'start_level': {
        if (!ws._room || !rooms[ws._room]) return;
        const room = rooms[ws._room];
        if (room.host !== ws) return;
        room.level = msg.level || 0;
        const seed = ((Date.now() & 0x7fffffff) ^ ((Math.random() * 0x7fffffff) | 0)) >>> 0;
        broadcast(room, { type: 'level_start', level: room.level, seed });
        break;
      }

      case 'ping': {
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      }
    }
  });

  ws.on('close', () => {
    if (ws._room && rooms[ws._room]) {
      const room = rooms[ws._room];
      room.players = room.players.filter(p => p.ws !== ws);
      if (ws._pid) broadcast(room, { type: 'player_left', id: ws._pid });
      if (room.players.length === 0) {
        delete rooms[ws._room];
      } else if (room.host === ws) {
        room.host = room.players[0].ws;
        room.players[0].host = true;
        broadcast(room, { type: 'host_changed', id: room.players[0].id });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log('Super Pixel Land DX — Server running on http://0.0.0.0:' + PORT);
  console.log('Öffne http://localhost:' + PORT + ' im Browser');
  console.log('Mitspieler aus dem Internet: http://<DEINE_OFFENTLICHE_IP>:' + PORT);
});
