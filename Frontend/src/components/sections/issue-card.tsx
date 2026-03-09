import { CommonButton, IssueBadge } from "@/components/atoms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IssueItem } from "@/mocks/data-visualization.mock"

interface IssueCardProps {
  issue: IssueItem
}

function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <IssueBadge variant={issue.severity}>{issue.severity.toUpperCase()}</IssueBadge>
          <CommonButton variant="secondary" size="sm">
            AI 수정 제안
          </CommonButton>
        </div>
        <CardTitle className="text-subtitle-18-semibold">{issue.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-body-14-regular text-muted-foreground">{issue.description}</p>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-caption-12-medium text-foreground">수정 방향</p>
          <p className="mt-1 text-body-14-regular text-muted-foreground">{issue.suggestion}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { IssueCard }
