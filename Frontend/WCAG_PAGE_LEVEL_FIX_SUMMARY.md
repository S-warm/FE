# WCAG Per-Page Error Display - Issue Analysis & Solution

## Problem Summary

The WCAG page currently displays all errors as a single aggregate "전체 페이지" (entire page) instead of breaking down errors **per page/site** with functional left sidebar page selection.

**User Requirement:**
> "각 사이트마다 확인한 에러사항을 보는거야..좌측 페이지 선택도 되야한다는거임"
> (Show errors found for each site with working left sidebar page selection)

---

## Root Cause Analysis

### Frontend Status ✅
The `ResultWcagPage` component is **already fully implemented** to support per-page error display:
- ✅ Left sidebar (ResultPageSidePanel) for page selection
- ✅ Page filtering and switching logic
- ✅ Per-page issue display
- ✅ Per-page summary metrics and distribution charts

**Code Evidence:**
- Lines 479-488: ResultPageSidePanel properly rendered with page list
- Lines 355-360: Page selection state management
- Lines 366-397: Page-specific data filtering and display
- Lines 430-445: sidePages data transformation

### Backend API Response Format Issue ❌
The backend is sending **flat format** WCAG response instead of **pages[] format**:

**Current (Flat Format):**
```json
{
  "score": 82.5,
  "wcagLabel": "AA",
  "distributionCritical": 2,
  "distributionModerate": 5,
  "distributionMinor": 3,
  "issues": [
    {
      "wcagIssueId": "wcag-001",
      "title": "Issue Title",
      "severity": "Critical",
      "description": "...",
      "html": "<div>...</div>"
    }
  ]
}
```

**Result:** Creates single page named "전체 페이지" with aggregate of all errors across all sites/pages.

---

## Solution: Backend Must Return pages[] Format

### Expected Backend Response (pages[] Format)

```json
{
  "pages": [
    {
      "order": 1,
      "pageName": "Home Page",
      "pageUrl": "https://example.com/",
      "screenshotUrl": "https://cdn.example.com/screenshots/home.png",
      "score": 85,
      "wcagLabel": "AA",
      "totalIssueCount": 5,
      "distribution": {
        "critical": 1,
        "moderate": 3,
        "minor": 1
      },
      "issues": [
        {
          "wcagIssueId": "wcag-001",
          "title": "Issue Title",
          "severity": "Critical",
          "description": "...",
          "html": "<div>...</div>"
        }
      ]
    },
    {
      "order": 2,
      "pageName": "Product Page",
      "pageUrl": "https://example.com/products",
      "screenshotUrl": "https://cdn.example.com/screenshots/products.png",
      "score": 78,
      "wcagLabel": "AA",
      "totalIssueCount": 8,
      "distribution": {
        "critical": 2,
        "moderate": 4,
        "minor": 2
      },
      "issues": [...]
    }
  ]
}
```

### Format Type Definition
See: `SimulationWcagPagesResponseDto` in `/src/types/api/simulation/simulation-wcag.response.ts`

```typescript
interface SimulationWcagPageDto {
  order: number                           // Page order in results
  pageName?: string                       // Display name for page
  pageUrl?: string                        // Full URL of the page tested
  screenshotUrl?: string | null           // Screenshot URL for preview
  totalIssueCount?: number                // Total WCAG issues on this page
  score?: number                          // WCAG compliance score (0-100)
  wcagLabel?: string                      // WCAG level (AA, AAA, etc.)
  summary?: {                             // Optional summary metrics
    complianceScore: number
    wcagLabel: string
    totalTests: number
    passedTests: number
    foundIssues: number
  }
  distribution?: {                        // Severity distribution
    critical: number
    moderate: number
    minor: number
  }
  distributionCritical?: number           // Alternative flat distribution fields
  distributionModerate?: number
  distributionMinor?: number
  issues: WcagIssueDto[]                 // Issues specific to this page
}

interface SimulationWcagPagesResponseDto {
  pages: SimulationWcagPageDto[]
}
```

---

## Frontend Changes Made

### 1. Enhanced Adapter Logging & Documentation
**File:** `/src/adapters/result/result-wcag.adapter.ts`

- Added detailed comments in `toFlatPages()` function explaining format limitation
- Added console warning when flat format is detected
- Documented expected backend response format

**Purpose:** Help developers understand why per-page display isn't working and what needs to be fixed

### 2. Improved Service Format Detection
**File:** `/src/services/result/result-wcag.service.ts`

- Enhanced `hasRecognizableWcagPayload()` with format preference ordering
- Added development-mode logging to identify which format is being used
- Clear console messages indicating when flat format requires backend changes

**Purpose:** Better visibility during development of which response format the backend is sending

---

## Adapter Response Format Support

The adapter supports **4 different response formats** (in order of preference):

| Format | Handler | Per-Page Support | When to Use |
|--------|---------|-----------------|-------------|
| `pages[]` | `toPageListResponse()` | ✅ Full Support | **PREFERRED** - Multiple pages with individual metrics |
| `urls{}` | `toBusinessPages()` | ✅ Full Support | Multiple URLs in object format |
| Legacy `summary/distribution/issues` | `toLegacyPages()` | ❌ Aggregate Only | Old/simple responses |
| Flat `score/wcagLabel/distributionXxx/issues` | `toFlatPages()` | ❌ Aggregate Only | Current deployment (needs fixing) |

**Format Detection Order** (in `/src/adapters/result/result-wcag.adapter.ts` line 245-272):
1. First checks for `pages[]` format (preferred)
2. Then checks for `urls{}` format
3. Then checks for legacy format
4. Finally falls back to flat format

---

## Testing & Verification

### To verify the fix is working:

1. **Check Backend Response Format**
   - Open browser DevTools → Network tab
   - Trigger WCAG page load
   - Find request to `/api/simulations/{simulationId}/wcag`
   - Verify response contains `pages: [...]` array instead of flat `score/wcagLabel` fields

2. **Check Console Warnings**
   - Open browser DevTools → Console tab
   - Load WCAG page
   - Should NOT see warning: `"[WCAG Adapter] Flat format response detected..."`
   - If warning appears, backend is still sending flat format

3. **Functional Testing**
   - [ ] Left sidebar shows multiple pages
   - [ ] Clicking page name switches to that page's errors
   - [ ] Error count, severity distribution, compliance score changes per page
   - [ ] Screenshot preview works for each page

---

## Next Steps

### For Backend Team:
1. Update WCAG API endpoint to return `pages[]` format instead of flat format
2. For each page tested, include:
   - `pageUrl` - Full URL of tested page
   - `pageName` - Display name (can be derived from URL)
   - `screenshotUrl` - Screenshot for preview (optional but recommended)
   - `issues` - Array of WCAG issues found on that specific page
   - `score`, `wcagLabel`, `distribution` - Per-page metrics

### For Frontend Verification:
1. Run WCAG page in development mode and check console
2. Open DevTools Network tab to inspect API response format
3. Verify `pages[]` array is being returned with multiple page entries
4. Test left sidebar page selection functionality

---

## Related Files

### Frontend Implementation:
- **Page Component:** `/src/pages/result/ResultWcagPage.tsx`
- **Adapter:** `/src/adapters/result/result-wcag.adapter.ts`
- **Service:** `/src/services/result/result-wcag.service.ts`
- **Query Hook:** `/src/queries/result/use-result-wcag-query.ts`
- **Type Definitions:** 
  - `/src/types/api/simulation/simulation-wcag.response.ts`
  - `/src/types/view-model/result/result-wcag.ts`

### Reference Pages (already working correctly with pages[] format):
- **Issues Page:** `/src/pages/result/ResultIssuesPage.tsx`
- **Heatmap Page:** `/src/pages/result/ResultHeatmapPage.tsx`
- **AI Fix Page:** `/src/pages/result/ResultAiFixPage.tsx`

All three of these pages already support per-page data display and can be used as reference implementations for the expected data structure.

---

## Development Mode Visibility

When running in development mode (`NODE_ENV === "development"`):
- If flat format is detected → console.log() message indicates backend needs updating
- Enhanced format detection logging helps identify which response format is being received
- Console warnings clearly state what's needed to enable per-page support

---

## Timeline

- **✅ Frontend Changes Made:** Enhanced adapter documentation and service logging
- **⏳ Pending:** Backend API update to return `pages[]` format
- **🔄 Verification:** Once backend sends `pages[]` format, WCAG per-page display will work automatically (no additional frontend changes needed)

The frontend is ready. The backend response format needs to be updated.
