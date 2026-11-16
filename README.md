# MMD 410 — Week 1, Lab 1: The Application Shell

A small **video-conferencing interface** built with React and Vite. Nothing is real (no video, audio or server): participants and connection states are simulated locally so you can focus on **React fundamentals**: components, props, state, immutable updates, keys, effects and a connection state machine.

The code is heavily commented for beginners. For the architecture, a code walkthrough, common mistakes and the submission checklist, read [`GUIDE.md`](./GUIDE.md).

---

## 1. Prerequisites

| Tool | What it is | Check it is installed |
| --- | --- | --- |
| **Node.js** (version 18 or newer) | Runs JavaScript tools on your computer | `node -v` |
| **npm** | Comes with Node.js; downloads libraries | `npm -v` |
| **Git** | Saves versions of your project | `git --version` |

Download Node.js from <https://nodejs.org> (choose the LTS version) and Git from <https://git-scm.com>.

## 2. Installation

Open a terminal (Terminal on macOS/Linux, PowerShell on Windows) and go to the project folder:

```bash
cd mmd410-project
npm install
```

`npm install` reads `package.json` and downloads React and Vite into a `node_modules/` folder (this is normal; it is ignored by Git).

### Creating the project from scratch (instead of using these files)

```bash
npm create vite@latest mmd410-project -- --template react
cd mmd410-project
npm install
```

Then replace/add the files listed in section 5, and delete the template files you do not need (e.g. `src/assets/`). This project's `package.json` pins React 18.

## 3. Run the development server

```bash
npm run dev
```

Open the address printed in the terminal (normally <http://localhost:5173>). The page updates automatically whenever you save a file. Stop the server with `Ctrl + C`.

## 4. Build for production

```bash
npm run build      # creates an optimised copy in the dist/ folder
npm run preview    # optional: serves dist/ locally to check it
```

> The **demo panel** (jump to any connection state) is **development only**: it appears under `npm run dev` and is hidden in the production build. The "Simulate success / failure" buttons on the connecting and reconnecting screens are always available.

## 5. Folder structure

```text
mmd410-project/
├── public/                  Static files copied as-is (nothing needed yet)
├── src/
│   ├── components/          VISUAL React components
│   │   ├── Tile.jsx             One participant card (presentational)
│   │   ├── CallView.jsx         The grid + per-participant buttons
│   │   ├── ConnectionStatus.jsx One screen/banner per connection state
│   │   └── CameraPreview.jsx    Shows a live camera stream in a <video>
│   ├── hooks/               Reusable React LOGIC
│   │   ├── useParticipants.js   Participant state + add/remove/mute + timer
│   │   └── useCamera.js         Camera permission, stream and cleanup
│   ├── lib/                 Plain JavaScript, NO React
│   │   ├── participantUtils.js  Create/validate participants, helpers
│   │   └── connectionStates.js  The five statuses and legal transitions
│   ├── App.jsx              Coordinator: owns status, wires everything
│   ├── App.css              Styles for the layout and all components
│   ├── index.css            Global styles, colour variables, reset
│   └── main.jsx             Entry point; mounts <App /> into index.html
├── index.html               The single HTML page
├── package.json             Dependencies and npm scripts
├── vite.config.js           Vite configuration (enables React/JSX)
├── .gitignore               Files Git must not track
├── README.md                This file
└── GUIDE.md                 Architecture, walkthrough, checklist
```

**Extra files and why they exist:** `vite.config.js` (Vite needs the React plugin to understand JSX), `.gitignore` (keeps `node_modules/` and `dist/` out of Git), `lib/connectionStates.js` (keeps the state-machine rules out of React so they stay testable), `GUIDE.md` (longer explanations than a README should hold).

## 6. Responsibilities

* **`App.jsx`** – holds the connection `status`, small UI settings, calls `useParticipants`, and passes data/callbacks to the children.
* **`useParticipants.js`** – the only place that changes the participant list. Every change creates a *new* array.
* **`CallView.jsx`** – maps the array to tiles using `participant.id` as the key and reports button clicks via callbacks.
* **`Tile.jsx`** – draws one participant; contains the uncontrolled note input.
* **`ConnectionStatus.jsx`** – picks the correct screen for the current status.
* **`participantUtils.js` / `connectionStates.js`** – pure helper functions and constants.

## 7. How to test participant management

1. Run `npm run dev`, click **Join call**, then **Simulate success**.
2. **Initial state:** Alice, Bob and Charlie appear; the header says "3 participants".
3. **Add:** type a name (or leave it empty) and click **Add participant** → a new tile appears at the end and the count increases. Empty names get a default such as "Diana".
4. **Mute:** click **Mute** on Bob → only Bob shows the red "Muted" badge and his button changes to **Unmute**. Click again to unmute.
5. **Remove:** click **Remove** on Alice → only Alice disappears; the count goes down; Bob and Charlie remain.
6. **Speaking:** click **Simulate speaking: Off** → every ~1.5 s a different unmuted participant gets a green border and "Speaking" badge. Muted people are never chosen. Click again to stop; all highlights clear.
7. **Empty list:** remove everybody → a friendly "Nobody is in the call" message appears (never a blank area).

## 8. How to demonstrate all five connection states

| State | How to reach it | What you should see |
| --- | --- | --- |
| `idle` | Page load, **Leave call**, **Cancel**, or **Back to start** | Welcome message and **Join call** button |
| `connecting` | Click **Join call** (or **Retry**) | Spinner, "Connecting…", buttons *Simulate success*, *Simulate failure*, *Cancel* |
| `connected` | Click **Simulate success** | Green connected message, controls and participant grid |
| `reconnecting` | Demo panel → **Reconnecting** | Orange banner with the grid **still visible** (controls disabled) and *Simulate reconnected / failure* buttons |
| `failed` | Click **Simulate failure** | Error message, **Retry** and **Back to start** |

The **demo panel** at the top (development only) jumps to any of the five states directly. The header badge and the "Learn" panel always show the current state.

## 9. The React keys experiment

1. In the connected state, scroll to **Experiment: why React keys matter**.
2. Tick **Use array index as key**. (Switching modes remounts the tiles, so any notes are cleared.)
3. Type a different note in each tile: "Alice note", "Bob note", "Charlie note".
4. Click **Remove** on **Alice** (the first tile).
5. **Expected with index keys (the bug):** Bob's tile now shows **"Alice note"**, and Charlie's shows "Bob note". React saw keys `0` and `1` still existed, so it reused those tiles' DOM nodes (with the text typed into the uncontrolled inputs) and only changed the props (names), then deleted the last DOM node.
6. Untick the box (back to `participant.id` keys), type the notes again and remove Alice.
7. **Expected with id keys (correct):** Bob still shows "Bob note" and Charlie "Charlie note". React matches each tile by its stable id, so it removes only Alice's DOM nodes.

The experiment works because the note `<input>` is **uncontrolled** (the browser, not React, stores its text) and sits inside the element React reuses. The exact behaviour depends on the component structure and on React's reconciliation (the process React uses to compare the old and new element lists). The index-key mode exists **only** for teaching; the normal app always uses ids.

To try it manually in the code, open `src/components/CallView.jsx` and temporarily change `key={keyMode === 'index' ? index : participant.id}` to `key={index}`, then restore it afterwards.

## 9b. Using your camera (new)

1. Run `npm run dev`, open <http://localhost:5173> (cameras only work on `https://` or `localhost`), click **Join call** → **Simulate success**.
2. Click **Turn camera on**. The browser asks for permission: click **Allow**.
3. A **You** tile appears first in the grid showing your live (mirrored) video. Click **Turn camera off** to stop it; the camera light goes off.
4. The camera also stops automatically when you **Leave call**, or when the status becomes idle, connecting or failed.
5. Try **Block** in the prompt: a red message explains how to re-enable the camera. A device with no camera shows "No camera was found".

The "You" tile is not part of the participants array, so it has no Mute/Remove buttons and is not counted in the participant count. Video is never sent anywhere; it stays in your browser.

## 10. Main React concepts practised

* Functional **components** and **JSX**; **props** and `children`
* **State** with `useState`, **lifting state up**, callbacks (data down, events up)
* **Immutable updates** with `.map()`, `.filter()` and the spread operator
* **Custom hooks** (`useParticipants`)
* **Keys** and reconciliation; **controlled vs uncontrolled** inputs
* **Conditional rendering** (`&&`, `switch`)
* **State machine** vs multiple Booleans
* **`useEffect`** with cleanup (`clearInterval`, stopping camera tracks)
* **Refs** (`useRef`) to attach a media stream to a `<video>` element
* Separating React code (`components/`, `hooks/`) from plain JavaScript (`lib/`)

## 11. Git: initialize and push

```bash
# 1. Inside the project folder, create a repository
git init
git branch -M main

# 2. Tell Git who you are (once per computer)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 3. Save your first version
git add .
git status                      # check that node_modules/ and dist/ are NOT listed
git commit -m "Complete MMD 410 Week 1 Lab 1 application shell"

# 4. Create an EMPTY repository on GitHub (no README), copy its URL, then:
git remote add origin https://github.com/YOUR-USERNAME/mmd410-project.git
git push -u origin main
```

After later changes: `git add .` → `git commit -m "Describe the change"` → `git push`.

> If GitHub asks for a password, use a **personal access token** (GitHub → Settings → Developer settings → Personal access tokens) or sign in with GitHub CLI (`gh auth login`).
