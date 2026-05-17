# 🚨 [긴급] 백엔드 응답 인코딩 문제

**심각도**: 🔴 **높음** (FE 개발 진행 불가)  
**발견날짜**: 2026-05-17  
**상태**: ⏸️ **차단됨** (BE 수정 필요)

---

## 문제 상황

### 현재 히트맵 응답

```json
{
  "errorPoints": [
    {
      "issueId": "issue_0",
      "errorType": "?ъ슜???쒖씤??遺議?"  // ← 인코딩 깨짐
    },
    {
      "issueId": "issue_1",
      "errorType": "?묎렐???대┃ ?곸뿭 遺덈챸??"  // ← 인코딩 깨짐
    }
  ]
}
```

### 예상되는 원본 데이터

```json
{
  "errorType": "실제 한글 에러 타입"  // 예: "버튼 클릭 불가", "텍스트 입력 오류" 등
}
```

---

## 왜 이게 문제인가?

### FE 관점에서

```javascript
// 받은 데이터
const errorType = "?ъ슜???쒖씤??遺議?";

// FE에서 표시하려고 해도...
<div>{errorType}</div>
// 결과: "?ъ슜???쒖씤??遺議?" 그대로 화면에 표시됨

// 사용자 입장: "이게 뭐라고 하는 거야?" 😕
```

### 개발 영향도

| 항목 | 상태 |
|------|------|
| 히트맵 데이터 표시 | ❌ 불가능 |
| 에러 타입 필터링 | ❌ 불가능 |
| 사용자 이해도 | ❌ 0% |
| FE 진행률 | ⏸️ 차단됨 |

---

## 원인 분석

### 원인 1: 데이터베이스 인코딩

```sql
-- 현재 상태 (추측)
CREATE TABLE error_point (
  error_type VARCHAR(255)  -- UTF-8이 아닐 수 있음
);
```

### 원인 2: 응답 헤더 미설정

```java
// 현재 상태
Response Headers: Content-Type: application/json
// 개선 필요
Response Headers: Content-Type: application/json; charset=utf-8
```

### 원인 3: 데이터 저장 시 인코딩 손실

```java
// 저장할 때 이미 깨졌을 수 있음
String errorType = "실제 한글";  // ← 저장되지 않음
// DB에는 깨진 상태로 저장됨
```

---

## 백엔드에서 확인할 것

### 🔴 **필수 확인 (지금 당장)**

#### 1. `application.yaml` 확인

```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
    deserialization:
      fail-on-unknown-properties: false
    time-zone: Asia/Seoul
    date-format: "yyyy-MM-dd'T'HH:mm:ssXXX"
    # ← 아래 추가 필요?
    default-property-inclusion: non_null
    
  # ← 데이터베이스 연결 문자셋 확인
  datasource:
    url: jdbc:postgresql://${DB_HOST:127.0.0.1}:${DB_PORT:5433}/${DB_NAME:swarmDB}?charSet=UTF-8
```

#### 2. 데이터베이스 문자셋 확인

```sql
-- PostgreSQL에서 실행
SELECT datname, pg_encoding_to_char(encoding) 
FROM pg_database 
WHERE datname = 'swarmDB';

-- 결과가 UTF8이어야 함
-- 결과: swarmDB | UTF8
```

#### 3. 응답 헤더 확인

```bash
curl -i http://localhost:8080/api/simulations/{projectId}/heatmap

# 확인해야 할 헤더
# Content-Type: application/json; charset=utf-8  ← 이게 있는지 확인
```

---

## 해결 방법

### 방법 1: 응답 헤더에 charset 명시 (빠른 해결)

**파일**: `WebConfig.java`

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(
            new MediaType("application", "json", StandardCharsets.UTF_8)
        );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:[*]")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 방법 2: Jackson 설정 (추천)

**파일**: `application.yaml`

```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
      # ← 아래 추가
      indent-output: true
      
    deserialization:
      fail-on-unknown-properties: false
      
    # ← 아래 추가 (한글 처리)
    default-charset: UTF-8
    time-zone: Asia/Seoul
    date-format: "yyyy-MM-dd'T'HH:mm:ssXXX"
```

### 방법 3: 데이터베이스 확인 및 수정

```bash
# 1. 현재 인코딩 확인
psql -U swarm -d swarmDB -c "SELECT datname, pg_encoding_to_char(encoding) FROM pg_database WHERE datname='swarmDB';"

# 2. 만약 UTF8이 아니면 데이터베이스 재생성 필요
# (이미 생성된 DB는 인코딩 변경 불가)

# 3. Flyway 마이그레이션도 UTF-8 명시
-- 파일: db/migration/V001__init.sql
-- CREATE DATABASE swarmDB ENCODING 'UTF8';
```

### 방법 4: 기존 데이터 복구 (데이터가 있으면)

```sql
-- 데이터가 이미 깨졌으면 복구 필요
-- (원본 데이터가 있으면 재입력)

-- 또는 인코딩 변환
UPDATE error_point 
SET error_type = convert_from(convert_to(error_type, 'UTF8'), 'LATIN1')
WHERE error_type LIKE '%?%';  -- 깨진 문자 패턴
```

---

## 해결 후 검증

### BE에서 확인할 것

```bash
# 1. 서버 재시작 후 히트맵 API 호출
curl http://localhost:8080/api/simulations/{projectId}/heatmap

# 2. 응답 헤더 확인
# Content-Type: application/json; charset=utf-8 ✅

# 3. 응답 본문에서 한글 확인
# "errorType": "실제 한글 텍스트" ✅ (깨지지 않음)
```

### FE에서 테스트

```typescript
// FE가 받은 데이터
const response = await fetch(
  'http://localhost:8080/api/simulations/{projectId}/heatmap'
);
const data = await response.json();

console.log(data.errorPoints[0].errorType);
// 출력: "실제 한글" ✅ (깨지지 않음)
```

---

## 현재 FE 진행률 영향도

| 작업 | 상태 | 원인 |
|------|------|------|
| 히트맵 조회 API | ⏸️ 차단 | errorType 인코딩 문제 |
| 히트맵 UI 구현 | ⏸️ 차단 | 데이터가 표시 불가능 |
| 다른 API 연동 | ✅ 진행 중 | 한글 필드 없음 |
| **전체 진행률** | **40% 차단** | **이 이슈 해결 필요** |

---

## 조치 계획

### 즉시 (오늘)

```
[ ] BE팀: 위의 4가지 확인 방법 실행
[ ] BE팀: 원인 파악
[ ] BE팀: 해결 방법 선택
```

### 오늘 내에 (2-4시간)

```
[ ] BE팀: application.yaml 또는 WebConfig 수정
[ ] BE팀: 데이터베이스 확인/수정 (필요시)
[ ] BE팀: 서버 재시작 후 테스트
```

### 확인 (1시간)

```
[ ] BE팀: 히트맵 API 응답 확인 (한글 제대로 보이는지)
[ ] BE팀: FE팀에 완료 통보
[ ] FE팀: 로컬 테스트로 재확인
```

### 완료

```
[ ] FE팀: 히트맵 UI 개발 진행 재개
```

---

## 백엔드팀에게

> 안녕하세요! 🙏  
> 히트맵 데이터를 확인해보니 한글 인코딩 문제가 있네요.  
> 위의 **방법 1 또는 방법 2** 중 하나로 간단히 수정하면 될 것 같습니다.  
> 
> **예상 소요시간**: 30분 ~ 1시간  
> **난이도**: 낮음 (설정 변경만 하면 됨)  
> 
> 완료되면 바로 FE 개발을 진행할 수 있으니,  
> 가능하면 오늘 중에 부탁드립니다! 🙏

---

**FE팀 요청**  
**2026-05-17 긴급**
