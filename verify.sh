echo "=== 핵심 파일 상태 검증 ==="
files=(
  "src/layouts/AuthLayout.tsx"
  "src/components/sections/result/issue-detail-panel-new.tsx"
  "src/components/sections/result/issue-detail-modal-new.tsx"
  "src/components/charts/stacked-bar-chart.tsx"
  "src/services/core/http-client.ts"
  "src/services/result/result-overview.service.ts"
)

for f in "${files[@]}"; do
  lines=$(wc -l < "$f")
  nulls=$(grep -c $'\0' "$f" 2>/dev/null || echo "0")
  status="✓"
  [ "$nulls" -gt 0 ] && status="✗"
  printf "%s %s (%d lines, %d null bytes)\n" "$status" "$f" "$lines" "$nulls"
done

echo ""
echo "=== 변경사항 요약 ==="
echo "1. AuthLayout.tsx: 사이드바 [Title] - [DateTime] 포맷"
echo "2. issue-detail-panel-new.tsx: failureRate 필드 제거, grid-cols-3"
echo "3. issue-detail-modal-new.tsx: failureRate 필드 제거, grid-cols-3"  
echo "4. stacked-bar-chart.tsx: radius=[8,0,0,8] 고정값 (100% 라운딩)"
echo "5. http-client.ts: Mock 경로 폴백 로직"
echo "6. result-overview.service.ts: API 다중경로 시도"
