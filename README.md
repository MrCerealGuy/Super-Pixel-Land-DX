# Super Pixel Land DX

Ein Jump'n'Run im GameBoy-Stil mit Level-Auswahl auf einer Weltkarte, Bonus-Raum-System und vollständiger Touch-Steuerung.

## Steuerung

### Tastatur
| Taste | Aktion |
|-------|--------|
| Pfeiltasten ◀ ▶ | Laufen |
| Pfeiltaste ▲ / Leertaste | Sprung |
| Pfeiltaste ▼ | Röhre betreten |
| Rechte Strg (Strg) | Feuerball (mit Feuer-Powerup) |
| R | Level neustarten |
| F | Vollbild |
| Esc / M | Zurück zur Karte |

### Touch/Mobil
| Button | Aktion |
|--------|--------|
| ◀ ▶ | Laufen |
| SPRUNG | Springen |
| ↓ | Röhre betreten |
| FEUER | Feuerball (mit Feuer-Powerup) |
| ↻ | Level neustarten |
| KARTE | Zurück zur Karte |

## Spiel-Mechaniken

### Level & Weltkarte
- 5 Level: WIESE, HOHLE, HIMMEL, VULKAN, FESTUNG
- Navigation mit ◀ ▶ auf der Karte, Sprung zum Betreten
- Nächstes Level erst nach Abschluss des vorherigen freigeschaltet
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

## Technik

- **Canvas**: 160×144 Pixel (GameBoy-Auflösung)
- **Palette**: 4-Farb-GameBoy-Palette (#9bbc0f, #8bac0f, #306230, #0f380f)
- **Audio**: Web Audio API (Square-Wave-Oszillatoren)
- **Keine externen Abhängigkeiten** – reines HTML + CSS + JavaScript

## Ausführen

Mit einem lokalen Server:

```
npx serve .
```

Oder live auf GitHub Pages:
https://mrcerealguy.github.io/Super-Pixel-Land-DX/