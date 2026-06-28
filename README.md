# Super Pixel Land DX

Ein Jump'n'Run im GameBoy-Stil mit Level-Auswahl auf einer Weltkarte, Bonus-Raum-System, Touch-Steuerung und **Multiplayer** (dedizierter WebSocket-Server).

## Steuerung

### Tastatur
| Taste | Aktion |
|-------|--------|
| Pfeiltasten ◀ ▶ | Laufen |
| Pfeiltaste ▲ / Leertaste | Sprung (×2 für Doppelsprung) |
| Pfeiltaste ▼ | Röhre betreten |
| Rechte Strg (Strg) | Feuerball (mit Feuer-Powerup) |
| R | Level neustarten |
| F | Vollbild |
| Esc / M | Zurück zur Karte |

### Touch/Mobil
| Button | Aktion |
|--------|--------|
| ◀ ▶ | Laufen |
| SPRUNG | Springen (×2 für Doppelsprung) |
| ↓ | Röhre betreten |
| FEUER | Feuerball (mit Feuer-Powerup) |
| ↻ | Level neustarten |
| KARTE | Zurück zur Karte |

## Spiel-Mechaniken

### Level & Weltkarte
- 5 Level: WIESE, HOHLE, HIMMEL, VULKAN, FESTUNG
- Navigation mit ◀ ▶ auf der Karte, Sprung zum Betreten
- Nächstes Level erst nach Abschluss des vorherigen freigeschaltet
- BEENDEN-Button oben rechts (speichern, nur beenden oder abbrechen)
- Zielfahnenmast am Ende jedes Levels – je höher getroffen, desto mehr Bonus-Punkte (1000–8000)

### Powerups
| Item | Effekt |
|------|--------|
| **Pilz** | Spieler wird größer (2 Treffer-Punkte) |
| **Feuerblume** | Ermöglicht Feuerbälle (rechte Strg / FEUER-Button) |
| **Stern** | Kurze Unverwundbarkeit + Gegner sterben bei Berührung |

### Gegner
- **Bodengegner**: Laufen hin und her, durch Drauftreten besiegbar
- **Fluggegner**: Schweben in Wellenbewegung
- **Großgegner**: Benötigen 2 Treffer zum Besiegen

### Combo-System
- Aufeinanderfolgende Gegner-Tritte innerhalb kurzer Zeit geben steigende Punkte (×1, ×2, ×3...)

### Killstreak (2× Punkte)
- 3 Gegner innerhalb von 5 Sekunden besiegen → aktiviert 10 Sekunden **doppelte Punkte**
- Während der Killstreak: roter "2X"-Timer oben links, "KILLSTREAK"-Popup in der Mitte
- 3 weitere Kills während der Killstreak verlängern diese

### Bonus-Raum
- Betreten über grüne Röhren (↓-Taste)
- Münzen einsammeln gegen die Zeit (600 Frames ≈ 10 Sekunden)
- Zufällige Münzmuster: Kreis, Quadrat, Rechteck, Raute
- Alle Münzen oder Zeit abgelaufen → Ausgangsröhre erscheint
- Bonus: +2000 Punkte bei eingesammelten Münzen

### Extra-Leben
- Alle 25 eingesammelten Münzen gibt es ein Extra-Leben
- Leben werden zwischen Levels übernommen

### Checkpoints
- Alle 1000px platziert, automatisch bei Berührung aktiviert
- Nach Tod wird am letzten aktivierten Checkpoint neu gestartet

### Röhren
- Grüne Röhren, nach Verlassen nicht mehr begehbar
- Führen in Bonus-Räume

### Doppelsprung
- Ein zusätzlicher Sprung in der Luft (nach Verlassen des Bodens)
- Wird an Landepunkten und Checkpoints zurückgesetzt
- Partikel-Effekt beim Auslösen

## Speichern & Laden

- Automatische Speicherung in `localStorage` (`splDxSave`)
- Speichert: freigeschaltete Level, Punktestand, Münzen, Leben
- **NUR BEENDEN**: Spielstand bleibt unberührt
- **SPEICHERN**: Aktuellen Fortschritt speichern
- **NEUES SPIEL**: Warnt bei vorhandenem Spielstand, löscht diesen dann
- Speichern ist deaktiviert, solange Cheats aktiv sind

## Cheats

Über den Cheat-Bildschirm aktivierbar (Button im Startmenü):

- **Alle Level freischalten**: Macht alle 5 Level auf der Karte spielbar
- Cheats deaktivieren Speichern, bis sie ausgeschaltet werden

## Multiplayer

Gemeinsames Spielen über einen dedizierten Node.js-WebSocket-Server.

### Server starten

```bash
npm install
node server.js
```

Der Server läuft standardmäßig auf Port **8080** (HTTP + WebSocket auf einem Port, änderbar über `PORT`-Umgebungsvariable). Er serviert die Spieldateien (index.html, Favicons) direkt und akzeptiert WebSocket-Verbindungen.

### Spielen

1. Browser öffnen: `http://localhost:8080`
2. **MULTIPLAYER** auswählen
3. Eigenen Namen eingeben
4. Raum erstellen (neuer 4-Zeichen-Code) oder einem bestehenden beitreten
5. Raum-Code mit Mitspielern teilen
6. Host startet das Level

### Features

- **Shared World**: Alle Spieler sehen sich gegenseitig, Münzen und Gegner werden synchronisiert
- **Raum-Verwaltung**: 4-Zeichen-Codes, max. 4 Spieler pro Raum
- **Host-Übergabe**: Fällt der Host aus, übernimmt der nächste Spieler
- **Remote Player**: 80% Deckkraft + Namensschild über dem Spieler
- **Event-Sync**: Geteilte Münzen (`coin_collected`), Gegner-Kills (`enemy_killed`), Block-Aktivierungen (`quest_block_hit`)
- **Deterministische Level-Genese**: Seeded PRNG (Mulberry32) stellt sicher, dass alle Clients dasselbe Level sehen
- **State-Übertragung**: 20 fps Spieler-State-Broadcast vom Server
- **Remote-Zugriff**: Server von außen via Port-Forwarding oder Tunnel erreichbar

### Protokoll-Übersicht

| Richtung | Typ | Beschreibung |
|----------|-----|-------------|
| Client → Server | `join` | Raum beitreten/erstellen |
| Client → Server | `player_state` | Eigene Position/Daten |
| Client → Server | `game_event` | Aktion (Münze, Gegner, Block, Sieg) |
| Client → Server | `start_level` | Level starten (nur Host) |
| Client → Server | `ping` | Verbindung testen |
| Server → Client | `joined` | Verbunden + Spielerdaten |
| Server → Client | `player_joined/left` | Spieler beitritt/verlässt |
| Server → Client | `player_states` | Alle Spieler-Positionen (20 fps) |
| Server → Client | `game_event` | Aktion eines Mitspielers |
| Server → Client | `level_start` | Level + Seed für alle |
| Server → Client | `host_changed` | Host-Übergabe |

## Technik

- **Canvas**: 160×144 Pixel (GameBoy-Auflösung)
- **Palette**: 4-Farb-GameBoy-Palette (#9bbc0f, #8bac0f, #306230, #0f380f)
- **Audio**: Web Audio API (Square-Wave-Oszillatoren)
- **Keine externen Abhängigkeiten** (Client) – reines HTML + CSS + JavaScript
- **Server**: Node.js mit `ws`-Bibliothek (einzige Abhängigkeit)

## Ausführen

### Singleplayer (lokal)

```bash
npx serve .
```

### Multiplayer (mit Server)

```bash
npm install
node server.js
```

Dann `http://localhost:8080` im Browser öffnen. Für Remote-Spieler den Port freigeben (Firewall/Port-Forwarding) und die öffentliche IP verwenden.

### Öffentlicher Server (Render)

Das Spiel läuft dauerhaft auf **Render**:

```
https://super-pixel-land-dx.onrender.com
```

Einfach die URL im Browser öffnen – kein eigener Server nötig. WebSocket und HTTP laufen auf demselben Port. Hinweis: Der Render Free-Tier schaltet nach 15 Min Inaktivität ab (erster Aufruf nach Pause dauert ~30s).

### Build-Version

Auf dem Startbildschirm unten rechts wird die aktuelle Commit-ID + Datum angezeigt (`version.js`). `version.js` wird nicht in Git getrackt, sondern vor Ort generiert.

**Lokal (PowerShell):**
```powershell
.\update-version.ps1
```

**Lokal (Unix):**
```bash
chmod +x update-version.sh && ./update-version.sh
```

**Render (Build Command im Render-Dashboard – bestehendes `npm install` ergänzen):**
```bash
git log -1 --format="const BUILD_VERSION = '%h %cd';" --date=format:%Y-%m-%d > version.js && npm install
```
