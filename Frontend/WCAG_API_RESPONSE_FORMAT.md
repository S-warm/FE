# WCAG API Response Format Specification

## Quick Summary
**Endpoint:** `/api/simulations/{simulationId}/wcag`  
**Required Format:** `pages[]` (array of page objects)  
**Current Issue:** Flat format is being sent → causes single "전체 페이지" aggregate display  
**Solution:** Return `pages[]` format → enables per-page error display with left sidebar selection

---

## Expected Response Format

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
          "wcagIssueId": "wcag-criterion-1-4-3",
          "title": "Contrast (Minimum)",
          "severity": "Critical",
          "description": "The contrast ratio of text and background colors do not meet WCAG standards",
          "html": "<button style='color: #888; background: #999;'>Submit</button>"
        },
        {
          "wcagIssueId": "wcag-criterion-2-1-1",
          "title": "Keyboard",
          "severity": "Moderate",
          "description": "Some functionality is not available using keyboard only",
          "html": "<div onmousedown='alert(\"click\")'>Interactive element</div>"
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
    },
    {
      "order": 3,
      "pageName": "Contact Page",
      "pageUrl": "https://example.com/contact",
      "screenshotUrl": "https://cdn.example.com/screenshots/contact.png",
      "score": 92,
      "wcagLabel": "AAA",
      "totalIssueCount": 2,
      "distribution": {
        "critical": 0,
        "moderate": 1,
        "minor": 1
      },
      "issues": [...]
    }
  ]
}
```

---

## Field Specifications

### Root Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pages` | array | ✅ Yes | Array of page results |

### Page Object (in pages array)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order` | number | ✅ Yes | Page order in sequence (1, 2, 3, ...) |
| `pageName` | string | ⚠️ Recommended | Display name for the page (e.g., "Home Page", "Product Listing") |
| `pageUrl` | string | ⚠️ Recommended | Full URL of the tested page |
| `screenshotUrl` | string | ❌ Optional | URL to screenshot image for preview in sidebar |
| `score` | number | ✅ Yes | WCAG compliance score (0-100) for this page |
| `wcagLabel` | string | ✅ Yes | WCAG conformance level ("A", "AA", "AAA") |
| `totalIssueCount` | number | ⚠️ Recommended | Total WCAG issues found on this page |
| `distribution` | object | ✅ Yes | Severity distribution of issues |
| `issues` | array | ✅ Yes | Array of WCAG issues found on this page |

### Distribution Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `critical` | number | ✅ Yes | Count of critical severity issues |
| `moderate` | number | ✅ Yes | Count of moderate severity issues |
| `minor` | number | ✅ Yes | Count of minor severity issues |

### Issue Object (in issues array)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `wcagIssueId` | string | ✅ Yes | WCAG criterion ID (e.g., "wcag-1-4-3", "wcag-2-1-1") |
| `title` | string | ✅ Yes | Human-readable issue title |
| `severity` | string | ✅ Yes | Severity level: "Critical", "Moderate", or "Minor" |
| `description` | string | ✅ Yes | Detailed explanation of the issue |
| `html` | string | ❌ Optional | HTML element that violates the criterion |
| `wcagCriteria` | string | ❌ Optional | Full WCAG criterion reference/URL |

---

## Severity Mapping

Map your severity levels to these exact strings:

| Your Severity | Map To | Rank |
|---------------|--------|------|
| Critical / Error / High | `"Critical"` | 3 |
| Moderate / Warning / Medium | `"Moderate"` | 2 |
| Minor / Info / Low | `"Minor"` | 1 |

---

## Example Issues

### Critical Issue Example
```json
{
  "wcagIssueId": "wcag-criterion-1-4-3",
  "title": "Contrast (Minimum)",
  "severity": "Critical",
  "description": "The contrast ratio of 1:2 for text on background is below the minimum of 4.5:1 required for AA conformance",
  "html": "<p style='color: #888888; background: #999999;'>Low contrast text</p>",
  "wcagCriteria": "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum"
}
```

### Moderate Issue Example
```json
{
  "wcagIssueId": "wcag-criterion-2-1-1",
  "title": "Keyboard",
  "severity": "Moderate",
  "description": "Custom button component does not respond to keyboard navigation",
  "html": "<div class='custom-button' onclick='handleClick()'>Click Me</div>",
  "wcagCriteria": "https://www.w3.org/WAI/WCAG21/Understanding/keyboard"
}
```

### Minor Issue Example
```json
{
  "wcagIssueId": "wcag-criterion-1-3-1",
  "title": "Info and Relationships",
  "severity": "Minor",
  "description": "Form inputs are not properly associated with their labels",
  "html": "<label>Email</label><input type='email'/>",
  "wcagCriteria": "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships"
}
```

---

## What Changed from Current Format

### Current (Flat Format) ❌
```json
{
  "score": 82,
  "wcagLabel": "AA",
  "distributionCritical": 5,
  "distributionModerate": 12,
  "distributionMinor": 8,
  "issues": [...]  // All issues from all pages mixed
}
```

**Result:** Single "전체 페이지" (entire page)

### New (pages[] Format) ✅
```json
{
  "pages": [
    {
      "order": 1,
      "pageUrl": "https://example.com/page1",
      "score": 85,
      "distribution": { "critical": 1, "moderate": 3, "minor": 2 },
      "issues": [...]  // Issues specific to this page
    },
    {
      "order": 2,
      "pageUrl": "https://example.com/page2",
      "score": 78,
      "distribution": { "critical": 2, "moderate": 4, "minor": 3 },
      "issues": [...]  // Issues specific to this page
    }
  ]
}
```

**Result:** Per-page display with left sidebar page selection

---

## Benefits of pages[] Format

| Benefit | Impact |
|---------|--------|
| **Per-page metrics** | Users see score, distribution, issue count per page |
| **Page navigation** | Users can click sidebar to jump between pages |
| **Targeted fixes** | Users know exactly which page needs fixing |
| **Better UX** | Sidebar preview thumbnails show which page is selected |
| **Scalability** | Supports any number of pages tested |

---

## Implementation Checklist

- [ ] Update API endpoint to return `pages[]` array
- [ ] For each tested page, create a page object with:
  - [ ] `order` (sequence number)
  - [ ] `pageUrl` (full URL)
  - [ ] `pageName` (optional but recommended)
  - [ ] `score` (0-100)
  - [ ] `wcagLabel` ("A", "AA", or "AAA")
  - [ ] `distribution` (critical, moderate, minor counts)
  - [ ] `issues` (array of page-specific issues)
- [ ] Include page-specific issues only (not aggregate)
- [ ] Set correct severity strings ("Critical", "Moderate", "Minor")
- [ ] Test response structure in development

---

## Testing Your Implementation

1. **API Response Check:**
   ```bash
   curl https://api.example.com/api/simulations/{simulationId}/wcag
   # Should return: { "pages": [...] }
   ```

2. **Browser DevTools:**
   - Network tab → Find `/wcag` request
   - Response should have `pages` array (not `score`, `wcagLabel` at root)

3. **Frontend Verification:**
   - Load WCAG page
   - Should NOT see console warning about flat format
   - Left sidebar should show multiple pages
   - Can switch between pages
   - Error counts and scores update per page

---

## Support References

- **Frontend implementation:** `/Frontend/src/pages/result/ResultWcagPage.tsx`
- **Type definitions:** `/Frontend/src/types/api/simulation/simulation-wcag.response.ts`
- **Adapter handling:** `/Frontend/src/adapters/result/result-wcag.adapter.ts`
- **Full documentation:** `WCAG_PAGE_LEVEL_FIX_SUMMARY.md`

---

**Note:** Frontend is ready to receive this format. Once API is updated, WCAG per-page display will work automatically with no additional changes needed.
