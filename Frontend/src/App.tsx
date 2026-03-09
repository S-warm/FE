import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function App() {
  return (
    // 전역 토큰(index.css) 적용 확인용 샘플 화면
    <main className="min-h-screen bg-background px-6 py-10 text-foreground font-sans">
      <section className="mx-auto grid w-full max-w-3xl gap-6">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Foundation Token Check</CardTitle>
            <CardDescription>
              bg-primary, text-foreground, rounded-lg, font-sans 적용 상태를 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* shadcn Button + 토큰(primary/secondary/ghost) 확인 */}
            <div className="flex flex-wrap items-center gap-3">
              <Button>기본 버튼</Button>
              <Button variant="secondary">보조 버튼</Button>
              <Button variant="ghost">고스트 버튼</Button>
            </div>

            {/* shadcn Input + 텍스트 토큰 확인 */}
            <div className="grid gap-2">
              <label className="text-body-14-medium text-foreground">이메일</label>
              <Input placeholder="name@example.com" />
            </div>

            {/* 배경/전경 토큰 조합 확인 */}
            <div className="rounded-lg bg-primary p-4 text-primary-foreground">
              토큰 확인: primary 배경 + primary 전경색
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default App
