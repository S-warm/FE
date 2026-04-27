# Backend Questions For Stage 0

Date: 2026-04-27

These are the questions the frontend needs answered before or during Stage 1.

## 1. WCAG response shape mismatch

Conflict found:
- `ALL_API_ENDPOINTS_EXACT_SPEC.md` says `GET /api/simulations/{simulationId}/wcag` returns:
  `pages[]`
- Backend code in `SimulationWcagResponse.java` and `SimulationService.java` currently returns:
  flat aggregate response with `summary`, `distribution`, `issues`

Question:
- Which shape is the real contract the frontend should implement against now?

Needed answer:
- `pages[]` grouped response
- or flat aggregate response

## 2. Temporary user identity strategy

Current backend requirement:
- `POST /api/simulations?userId={uuid}`
- `GET /api/simulations?userId={uuid}`

Frontend needs one stable approach for local development.

Question:
- Should frontend hardcode one shared dev `userId` for now, or is there a seeded user UUID we should use?

Needed answer:
- exact UUID to use in local/dev
- and whether this UUID is guaranteed to exist in the development DB seed

## 3. CORS vs proxy

Current backend code allows:
- `http://localhost:3000`

Frontend currently runs on Vite and commonly uses:
- `http://localhost:5173`

Frontend Stage 0 added a Vite `/api` proxy to avoid browser CORS issues locally.

Question:
- Is proxy-based local development acceptable as the intended flow, or does backend want CORS widened to `5173` too?

## 4. personaDevice mapping

Frontend UI stores:
- `mac`
- `windows`
- `iphone`
- `android`
- `ipad`
- `android_tablet`

Backend expects:
- `desktop`
- `mobile`
- `tablet`

Frontend mapping chosen for Stage 0:
- `mac`, `windows` -> `desktop`
- `iphone`, `android` -> `mobile`
- `ipad`, `android_tablet` -> `tablet`

Question:
- Is this exact mapping acceptable as the backend contract assumption?

## 5. Optional fields semantics

Frontend currently treats:
- `visionImpairment`
- `attentionLevel`
as optional and omits them from request body when unset.

Question:
- When user does not touch these controls, should frontend omit the fields, or send default numeric values such as `0` / `50`?

## 6. Result endpoints data maturity

Observed from backend service code:
- overview/issues/ai-fix/heatmap/wcag currently validate `simulationId`
- then return mock-assembled payloads

Question:
- Which of these endpoints are expected to stabilize first with real DB-backed values?

Needed answer:
- preferred frontend connection order if backend has one
- any endpoint that should be deliberately delayed because its payload is still likely to change
