# MMD 410 Week 1 Lab 1 — Study Guide

Companion to the README. It covers the architecture, a plain-language code walkthrough, common mistakes and a submission checklist.

---

## Part 1 — Architecture

### Overall design

The app is a tree of components. **State lives high** (in `App` and the `useParticipants` hook) and flows **down** as props. User actions flow **up** through callback functions.

```text
main.jsx
  └─ <App>                       owns: status, simulateSpeaking, keyMode, newName
       │                         calls: useParticipants()  -> participants + actions
       ├─ <StatusBadge status>
       ├─ <ConnectionStatus status ...callbacks>   one screen per status
       └─ <CallView participants keyMode ...callbacks>
            └─ <Tile name muted speaking>          (one per participant, key = id)
                 └─ buttons (children) ──click──► onToggleMute(id) / onRemove(id)
```

### Data flow of one click (muting Bob)

1. User clicks **Mute** inside Bob's tile (JSX created in `CallView`).
2. `onClick` calls `onToggleMute(bob.id)`, a function passed down as a prop. It is actually `toggleMute` from the hook.
3. `toggleMute` calls `setParticipants(current => current.map(...))`, producing a **new array** with a **new Bob object** (`muted: true`).
4. React sees a new state value, re-renders `App`, which passes the new array to `CallView`, which passes `muted={true}` to Bob's `Tile`.
5. `Tile` adds the `tile--muted` class and renders the "Muted" badge.

### Why three layers?

| Layer | Folder | Knows about React? | Job |
| --- | --- | --- | --- |
| Pure logic | `lib/` | **No** | Rules and helpers that are easy to test |
| Reusable React logic | `hooks/` | Yes | State + effects, no markup |
| Visual | `components/` | Yes | Turn data into JSX |

---

## Part 5 — Code walkthrough

### Props and callbacks
`<Tile name="Alice" muted={false} speaking />` passes values in, like function arguments. They are read-only. A child that wants something changed calls a function it was given (`onRemove(id)`); it never edits the data.

### Immutable updates (the three tools)

```js
// add     -> spread: copy everything, then append
setParticipants(current => [...current, newParticipant])

// remove  -> filter: keep everyone except the id
setParticipants(current => current.filter(p => p.id !== id))

// change  -> map: new object for the target, same object for the rest
setParticipants(current => current.map(p => p.id === id ? { ...p, muted: !p.muted } : p))
```

React compares old and new state with `===`. An array edited in place is still the same object, so React may not notice. Passing a function (`current => ...`) guarantees you start from the latest state.

### Keys
`key` tells React which list item is which between renders. Use a **stable, unique** value (`participant.id`). An array index describes a *position*, not an *identity*; when items are removed, positions shift and React reuses the wrong DOM. The experiment in the README shows this with uncontrolled inputs.

### Controlled vs uncontrolled input
* **Controlled** (`value` + `onChange`): React state is the single source of truth (the "New participant name" box).
* **Uncontrolled** (`defaultValue`, no `onChange`): the browser DOM stores the text (the note box in `Tile`).

### State machine
`status` is one string out of five. `ConnectionStatus` is one `switch` on it. `connectionStates.js` lists which transitions are legal; `goTo()` in `App` rejects illegal ones, and only the demo panel's `jumpTo()` may skip around.

### `useEffect` and cleanup
The speaking simulation starts a `setInterval`. The function returned from the effect runs `clearInterval`. Without it, each toggle would leave another timer running and timers would keep updating state after the feature was turned off or the component disappeared.

### Common mistakes and how to avoid them

| Mistake | Why it hurts | Do this instead |
| --- | --- | --- |
| `participants.push(p)` or `p.muted = true` | Mutates state; React may not re-render | `[...current, p]`, `{ ...p, muted: true }` |
| `key={index}` | Wrong DOM reused after removals/reordering | `key={participant.id}` |
| Several Booleans (`isConnected`, `isError`…) | Contradictory combinations | One `status` string |
| Forgetting `clearInterval` in the cleanup | Timer leaks, runaway updates | Always return a cleanup from effects that start timers |
| Storing the same data in two places | Copies drift apart | Keep one source of truth and pass props |
| Using `document.querySelector` to update the UI | Fights React | Change state; let React render |
| Calling `setState` while rendering | Infinite loops | Call it in event handlers or effects |
| Writing `onClick={handler(id)}` | Calls it immediately during render | `onClick={() => handler(id)}` |

---

## Part 6 — Submission guide

### Commits

```bash
git add .
git commit -m "Add participant grid, hook and utilities"
git commit -m "Add connection state machine and demo panel"   # after further work
git log --oneline                                              # review your history
git push
```

Small, clearly named commits are easier to mark than one giant commit.

### Final checklist (check against your course's marking criteria)

* [ ] `npm install`, `npm run dev` and `npm run build` all succeed
* [ ] Folder structure matches the brief (`components/`, `hooks/`, `lib/`)
* [ ] Three participants at start; add, remove, mute/unmute work on the selected participant only
* [ ] Speaking indicator is visible and distinct; the simulation can be turned off
* [ ] `key={participant.id}` in normal mode; no key warnings in the browser console
* [ ] No state mutation (`push`, direct assignment) and no direct DOM manipulation
* [ ] Five statuses reachable: idle, connecting, connected, reconnecting, failed
* [ ] Grid stays visible while reconnecting; no blank screen in any state
* [ ] Timer cleanup (`clearInterval`) present
* [ ] Keys experiment performed and clearly labelled as educational
* [ ] Layout checked on desktop, tablet and phone widths (browser dev tools)
* [ ] Comments explain the *why*; README complete
* [ ] Work committed and pushed; repository link submitted
* [ ] `node_modules/` and `dist/` are **not** committed
