import { Card, CardContent } from "@/components/ui/card"

function ResultPlaceholderPage({ title }: { title: string }) {
  return (
    <Card className="rounded-2xl border border-[#d6ddea] bg-white shadow-none">
      <CardContent className="px-6 py-8">
        <p className="text-body-16-medium text-foreground">{title}</p>
        <p className="mt-2 text-caption-12-regular text-muted-foreground">준비 중입니다. (더미 화면)</p>
      </CardContent>
    </Card>
  )
}

export default ResultPlaceholderPage

