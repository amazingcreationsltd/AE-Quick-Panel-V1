# Minimal Tools — After Effects CEP Extension

## Files
```
MinimalTools/
├── CSXS/
│   └── manifest.xml        ← CEP manifest (bundle ID, AE version range)
├── lib/
│   └── CSInterface.js      ← ⚠️ YOU MUST ADD THIS (see below)
├── js/
│   └── main.js             ← Button handler + CEP bridge
├── jsx/
│   └── extendscript.jsx    ← All After Effects operations
└── index.html              ← The panel UI
```

---

## Step 1 — Get CSInterface.js

Download it from Adobe's official repo and drop it into the `lib/` folder:

https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/CSInterface.js

Click **Raw** → Save As → `lib/CSInterface.js`

---

## Step 2 — Enable unsigned extensions (one-time)

Open Terminal and run:

```bash
# macOS
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1

# Windows (run as Administrator in CMD)
reg add HKCU\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add HKCU\Software\Adobe\CSXS.10 /v PlayerDebugMode /t REG_SZ /d 1 /f
```

---

## Step 3 — Install the extension

Copy the entire `MinimalTools` folder to:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Adobe/CEP/extensions/` |
| Windows | `%APPDATA%\Adobe\CEP\extensions\` |

Final path should look like:
`.../CEP/extensions/MinimalTools/CSXS/manifest.xml`

---

## Step 4 — Open in After Effects

1. Launch After Effects
2. **Window → Extensions → Minimal Tools**

---

## Features

### Easy Shortcut
| Button | Action |
|--------|--------|
| Solid | Creates a new solid layer in the active comp |
| Null | Creates a null layer centered in the comp |
| Camera | Creates a camera with default position |
| Pre-Comp | Pre-composes selected layers |
| Adjustment | Creates an adjustment layer |
| re-Center | Moves selected layers' position to comp center |

### Anchor Point Tools
9-position grid to move any selected layer's anchor point:
- Corners: TL, TR, BL, BR
- Edges: TC (top), BC (bottom), ML (left), MR (right)
- Center: MC

The layer's visual position is automatically compensated so it doesn't jump.

---

## Notes
- All operations support undo (Ctrl+Z / Cmd+Z)
- Tested against AE 15.0+ (CC 2021 and later)
- `setAnchorPoint` uses `sourceRectAtTime` — works on text, shape, footage, and precomp layers
