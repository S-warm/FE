export interface ResultUxIssueLinkViewModel {
  issueType: "ux"
  issueId: string
}

export interface ResultWcagIssueLinkViewModel {
  issueType: "wcag"
  wcagIssueId: string
}

export type ResultIssueLinkViewModel = ResultUxIssueLinkViewModel | ResultWcagIssueLinkViewModel
