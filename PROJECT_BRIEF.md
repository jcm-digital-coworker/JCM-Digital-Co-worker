# JCM Digital Co-worker

Goal: Build a plant-wide responsive web app/PWA for machine-side tablets, Windows desktops, Apple devices, and Android devices.

Core direction:
- Plant-wide companion, not just CNC.
- Departments: Machine Shop, Saddles Dept, Material Handling.
- Main areas: Dashboard, Machines, Simulation, Maintenance, Documents, Alerts, Risk/Signoffs.
- Read-only/simulation-first by default. Do not control machines.
- Future: role access, co-worker signoffs, supervisor signoffs, risk escalation, email/push notifications.
- UI should be tablet-friendly, simple, fast, card-based, and usable at machines.

Current app structure:
- React + TypeScript + Vite
- src/data = machine, maintenance, documents, risk data
- src/logic = simulator and warning logic
- src/pages = main pages
- src/components = reusable UI
- src/components/shell = app header/drawer/department cards

Important safety:
- LV4500 JCM suite is read-only simulation only.
- Hard fixture clearance: 1.5 inches from top of part to fixture.
- Anything near/beyond 1.5 inches must be high risk.

Machine groups:
Machine Shop:
- Wia KH80G
- DMG Mori NLX 4000/750
- Yama Seiki GV-1200
- Mori Seiki SL400
- Wia L300C
- Quickmill Intimidator

Saddles Dept:
- Wia LV4500R-1
- Wia LV4500R-2
- LV4500 JCM suite simulator

Material Handling:
- Altra Plasma Table
- HK Laser Table
- Messer Plasma
- CNC Roll 1
- CNC Roll 2

Development rules:
- Prefer full-file replacements when possible.
- Avoid hunting through App.tsx.
- Keep App.tsx small.
- Refactor into pages/components.
- Commit after every working pass.
- Use beginner-friendly explanations.