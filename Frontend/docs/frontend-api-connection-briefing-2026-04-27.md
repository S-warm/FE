# Frontend API Connection Briefing

Date: 2026-04-27
Source of truth used for this briefing:
- `C:\Users\skyko\Desktop\SWARM\BE\src\main\java\com\swarm\dashboard\controller\SimulationController.java`
- `C:\Users\skyko\Desktop\SWARM\BE\src\main\java\com\swarm\dashboard\service\SimulationService.java`
- `C:\Users\skyko\Desktop\SWARM\BE\src\main\java\com\swarm\dashboard\dto\request\SimulationCreateRequest.java`
- `C:\Users\skyko\Desktop\SWARM\BE\src\main\java\com\swarm\dashboard\dto\response\*.java`
- `C:\Users\skyko\Desktop\SWARM\BE\src\main\java\com\swarm\dashboard\exception\GlobalExceptionHandler.java`
- `C:\Users\skyko\Desktop\SWARM\BE\src\main\resources\application.yaml`
- `C:\Users\skyko\Desktop\SWARM\BE\src\main\java\com\swarm\dashboard\config\WebConfig.java`

Note:
- The documents named by request were not present in the local BE workspace.
- This briefing is reconstructed from backend code on branch `jihyun`.

## 1. Backend status summary

Backend branch status:
- Local BE repo is on `jihyun`
- Branch state at check time: `jihyun...origin/main [ahead 4]`

Backend runtime assumptions:
- API base path: `/api`
- Server port: `8080`
- DB: PostgreSQL on `127.0.0.1:5433/swarmDB`
- CORS currently allows only `http://localhost:3000`

Important backend reality:
- `POST /api/simulations`
- `GET /api/simulations`
  These two are implemented against DB.
- `GET /api/simulations/{simulationId}/overview`
- `GET /api/simulations/{simulationId}/issues`
- `GET /api/simulations/{simulationId}/ai-fix`
- `GET /api/simulations/{simulationId}/heatmap`
- `GET /api/simulations/{simulationId}/wcag`
  These currently validate `simulationId` against DB, but return mock-shaped data assembled in service code.

Implication for frontend:
- Creation flow can be connected to real persistence first.
- Result pages can be connected to stable endpoint contracts next, even though payload content is still mock-backed.
- We should not wait for full backend completion before wiring the result pages.

## 2. Confirmed backend endpoints

### 2.1 Create simulation

`POST /api/simulations?userId={uuid}`

Request body:
```json
{
  "title": "string",
  "targetUrl": "string",
  "personaCount": 500,
  "digitalLiteracy": "high | medium | low",
  "successCondition": "string",
  "personaDevice": "desktop | mobile | tablet",
  "ageRatioTeen": 25,
  "ageRatioFifty": 25,
  "ageRatioEighty": 50,
  "visionImpairment": 20,
  "attentionLevel": 70
}
```

Response body:
```json
{
  "id": "uuid",
  "title": "string",
  "status": "pending | running | completed | failed",
  "createdAt": "2026-04-11T10:30:45+09:00"
}
```

Validation notes:
- `userId` is required as query param
- `ageRatioTeen + ageRatioFifty + ageRatioEighty` must equal `100`
- `visionImpairment` and `attentionLevel` are optional

### 2.2 Simulation list

`GET /api/simulations?userId={uuid}`

Response:
```json
[
  {
    "id": "uuid",
    "title": "string",
    "status": "completed | pending | running | failed",
    "createdAt": "2026-04-11T10:30:45+09:00"
  }
]
```

Purpose:
- Sidebar / recent simulations source
- Also provides header metadata reused by result layout

### 2.3 Result overview

`GET /api/simulations/{simulationId}/overview`

Response shape:
- `summary`
- `funnelPanels`

Header metadata is not included here:
- no `title`
- no `status`
- no `createdAt`

Frontend must combine:
- list API metadata
- overview API metrics

### 2.4 Issues

`GET /api/simulations/{simulationId}/issues`

Response shape:
- top-level `pages[]`
- each page has `order`, `pageName`, `pageUrl`, `screenshotUrl`, `totalIssueCount`, `issues[]`

### 2.5 AI fix

`GET /api/simulations/{simulationId}/ai-fix`

Response shape:
- top-level `pages[]`
- each page has `fixes[]`
- each fix is keyed by `issueId`

Important coupling:
- `issueId` is shared with issues API

### 2.6 Heatmap

`GET /api/simulations/{simulationId}/heatmap?ageGroup=all&page=0&size=100`

Response shape:
- top-level `pages[]`
- each page has `errorPoints[]`
- each error point may have `issueId`
- includes `pagination`

Important params:
- `ageGroup`: `all`, `10대`, `20대`, `30대`, `40대`, `50대`, `60대`, `70대`, `80대`
- `page`, `size`

### 2.7 WCAG

`GET /api/simulations/{simulationId}/wcag`

Response shape:
- flat response, not page-grouped
- fields: `summary`, `distribution`, `issues`

Important mismatch:
- Current frontend WCAG page assumes side-page navigation
- Backend WCAG response is simulation-level aggregate

## 3. Frontend current state

Current frontend API layer:
- [simulation-api.ts](C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/features/simulation-setup/model/simulation-api.ts)
- [result-api.ts](C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/features/result/shared/result-api.ts)
- [http-client.ts](C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/shared/api/http-client.ts)

Current mismatches already visible:
- FE create payload uses `projectTitle`, nested `ageRatios`, and no `userId`
- BE expects `title`, flat age ratio fields, and required `userId` query param
- FE has `fetchResultPages("/results/{id}/pages")`
- BE does not expose `/results/{id}/pages`
- Result pages still consume mocks directly in many screens
- FE store `personaDevice` values look device-brand oriented, but BE expects `desktop | mobile | tablet`
- Vite config has no dev proxy, while BE CORS only allows `http://localhost:3000`
- FE dev server is likely Vite default `5173`, so direct browser calls will hit CORS unless fixed

## 4. Recommended rollout plan

We should do this in stages, not all at once.

### Stage 0. Contract alignment first

Goal:
- Remove avoidable mismatch before touching screens

Tasks:
- Define frontend domain types that mirror backend DTOs exactly
- Define frontend view-model adapters that convert backend DTOs into current UI shapes
- Decide temporary `userId` strategy
- Decide `personaDevice` mapping strategy
- Fix local connection path:
  either add Vite proxy to `http://localhost:8080`
  or widen backend CORS to the actual FE origin

Why this first:
- Without this layer, every screen patch will hardcode assumptions and create churn

### Stage 1. Real create flow only

Goal:
- Make simulation creation persist to DB for real

Tasks:
- Replace current create request shape with backend-compatible request
- Attach temporary `userId` query param
- On success, store returned `simulationId`, `title`, `status`, `createdAt`
- Route process page and result layout using real `simulationId`

Do not do yet:
- Do not replace every result screen in the same change

Why this first:
- It creates the real simulation record, which all result endpoints require

### Stage 2. Real simulation list and result header metadata

Goal:
- Remove `recentSimulations` mock dependency from layout/sidebar

Tasks:
- Connect `GET /api/simulations?userId=...`
- Build shared simulation summary store/cache
- Feed result header and sidebar from list response

Why this second:
- Backend overview intentionally omits title/status/createdAt
- Result layout needs this source anyway

### Stage 3. Overview page contract swap

Goal:
- Make result overview page render from backend overview response

Tasks:
- Add overview API function
- Create adapter from `SimulationOverviewResponse` to current cards/charts
- Keep UI component tree mostly intact

Why this is a good first result page:
- The backend response is relatively self-contained
- It establishes the list+detail composition pattern

### Stage 4. Issues and AI fix together

Goal:
- Replace issue mocks and keep AI fix linkage intact

Tasks:
- Connect issues API
- Connect ai-fix API
- Normalize shared page identity and shared `issueId`
- Replace mock page lists with backend page groups

Why together:
- These two screens are coupled by `issueId`
- Splitting them too far apart creates temporary mismatch handling

### Stage 5. Heatmap

Goal:
- Replace heatmap data source, preserve current canvas interaction

Tasks:
- Connect heatmap API with `ageGroup`, `page`, `size`
- Adapt backend `errorPoints` into current heatmap marker model
- Decide whether current FE log-session analysis stays or is retired

Why later:
- Current heatmap screen is the most custom and mock-heavy
- It will need careful adapter work, not just fetch replacement

### Stage 6. WCAG final

Goal:
- Reconcile backend flat WCAG response with current FE page-based UX

Tasks:
- Decide whether FE should become simulation-level aggregate
- Or whether BE should later restore page-grouped WCAG
- Then wire the chosen contract

Why last:
- This is the largest product-contract mismatch, not just a fetch task

## 5. Decisions we should make before implementation

These should be agreed explicitly:

1. Temporary `userId`
- Backend requires query param now
- Frontend needs one stable source for local development

2. Device mapping
- FE currently stores something like `mac`
- BE expects `desktop | mobile | tablet`

3. Local API connection method
- Vite proxy
- or backend CORS expansion

4. WCAG product direction
- keep current page-level UI and ask backend to reshape later
- or adapt frontend to backend aggregate response now

5. Heatmap product direction
- use backend `errorPoints` as final source of truth
- or keep local derived analysis layer temporarily

## 6. Suggested implementation order for frontend PRs

Recommended PR slicing:

1. PR-1: API foundation
- env/proxy
- error typing
- backend DTO types
- adapters

2. PR-2: create simulation
- request payload alignment
- temporary userId wiring
- success routing with real simulation id

3. PR-3: simulation list + result layout metadata
- sidebar and result header source replacement

4. PR-4: overview page

5. PR-5: issues + ai-fix

6. PR-6: heatmap

7. PR-7: wcag

## 7. Immediate risks

- CORS mismatch is likely to block browser testing immediately if FE runs on `5173`
- Current FE create API contract does not match BE request or response shape
- Current FE result fetch path `/results/{id}/pages` does not exist in BE
- WCAG is not contract-compatible with current FE structure
- Result endpoints return mock content today, so we can test shape integration but not final analytics truth yet

## 8. Recommendation

Start with Stage 0 and Stage 1 only.

That means:
- align request/response contracts
- establish temp auth/userId handling
- make create simulation real
- preserve mocks for result screens until list and overview wiring are ready

This is the smallest slice that gives us real backend integration without forcing all result pages into the same risky change.
