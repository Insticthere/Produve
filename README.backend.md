# Produve UI Backend Handoff (Quick)

## Current Data Model (UI-only for now)
- Shared in-memory state lives in [lib/app-state.tsx](C:/Users/Nitin/Desktop/Produve/lib/app-state.tsx)
- Key domains:
  - `todos`
  - `plannerBlocks`
  - `subjects` (with resources, chapters/sections, questions, notes, reading logs)
  - `guides`
  - `threads`
  - `group` (chat, polls, members)

No API writes are connected yet. Data resets on app reload, except theme selection.

## Theme Editing
- Theme system lives in [lib/theme.tsx](C:/Users/Nitin/Desktop/Produve/lib/theme.tsx)
- Presets: `current`, `midnight`, `arctic`, `emerald`, `sunset`, `custom`
- Custom theme edits are done in Profile screen and persisted to `localStorage` (`produve:theme:v1`)
- To add a new preset:
  1. Add it to `THEMES` in `theme.tsx`
  2. Ensure it conforms to `AppPalette`
  3. It auto-appears in Profile theme selector

## New UI Features Added
- Todo:
  - list/table/board (side-by-side columns: `todo`, `doing`, `done`)
- Groups chat:
  - share selected tasks into chat
  - recipients can use `Add Similar` to clone a task
- Study:
  - richer composer toolbar (headings, list, todo list, code block, table, math snippet, links)
  - guide cards and thread cards can open into dedicated pages
  - detail pages with comments:
    - [app/guide/[id].tsx](C:/Users/Nitin/Desktop/Produve/app/guide/[id].tsx)
    - [app/thread/[id].tsx](C:/Users/Nitin/Desktop/Produve/app/thread/[id].tsx)

## Where To Plug Backend
- Recommended pattern:
  1. Keep `types` in `lib/app-state.tsx` or move to `lib/types/*.ts`
  2. Replace `useState` seed arrays in `AppStateProvider` with API fetch + cache
  3. Keep optimistic updates in UI, then persist to server

- First endpoints to add:
  - `GET/POST/PATCH /todos`
  - `GET/POST/PATCH /subjects`
  - `GET/POST/PATCH /resources`
  - `GET/POST/PATCH /sections`
  - `GET/POST/PATCH /questions`
  - `GET/POST/PATCH /guides` and `/guides/:id/comments`
  - `GET/POST/PATCH /threads` and `/threads/:id/comments`
  - `GET/POST /groups/:id/chat` (including task-share payload)

## Suggested Minimal Refactor Before Backend
- Move route-safe data selectors into helpers (for `guide by id`, `thread by id`)
- Add `loading/error` states around `AppStateProvider`
- Replace `as any` route pushes with generated typed routes once route typing picks up new files

## Quick Dev Checks
- Type check:
  - `./node_modules/.bin/tsc --noEmit`
- Web build check:
  - `npx expo export --platform web`
