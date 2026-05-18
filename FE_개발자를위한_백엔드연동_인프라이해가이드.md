# 프론트엔드 개발자를 위한 백엔드 연동 & 인프라 이해 가이드

**v1.0 | 2026-05-18**  
**대상**: React/Vite 프론트엔드 개발자 (당신)  
**목표**: 현재 FE 상태 → 백엔드 연동 → 배포까지의 전체 이해

---

# Part 1: 당신의 프론트엔드 현재 상태 파악

## 지금 당신의 로컬 개발 환경에서 일어나는 일

```
당신의 컴퓨터:
┌─────────────────────────────────────────────────┐
│  Visual Studio Code / WebStorm                   │
│  $ npm run dev                                  │
│                                                 │
│  ↓ Vite Dev Server 실행                        │
│                                                 │
│  http://localhost:5173                          │
│  (React 앱이 브라우저에 로드됨)                 │
├─────────────────────────────────────────────────┤
│  src/                                           │
│  ├── hooks/useSimulation.ts                     │
│  │   └── useCreateSimulation() 사용            │
│  │       → React Query (useMutation)             │
│  │                                              │
│  ├── services/simulation.service.ts             │
│  │   └── SimulationService.createSimulation()   │
│  │       → http-client로 API 호출              │
│  │                                              │
│  ├── http/http-client.ts                        │
│  │   └── axios.create()로 HTTP 클라이언트       │
│  │       → 실제로 어디로 요청 보낼지는?        │
│  │                                              │
│  └── mock-data/simulations.json                 │
│      └── 임시 데이터 (지금 사용 중)             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 핵심 질문: 현재 API 요청이 어디로 가는가?

**현재 상황**: http-client.ts에서 `import.meta.env.VITE_API_BASE_URL`을 읽고, 그것이 **mock-data의 JSON을 바라보거나 로컬 백엔드(localhost:8080)를 바라봄**

---

## 당신의 프로젝트 폴더 구조 (실제)

```
your-project-root/
├── src/
│   ├── components/           ← React 컴포넌트들
│   ├── hooks/                ← React Query 훅들
│   ├── services/             ← API 호출 로직
│   │   └── simulation.service.ts
│   ├── http/
│   │   └── http-client.ts    ← axios 설정
│   ├── types/                ← TypeScript 인터페이스
│   ├── adapters/             ← API 응답 → UI 모델 변환
│   ├── mock-data/            ← 임시 JSON (지금 사용 중)
│   │   └── simulations.json
│   └── App.tsx
├── .env.development          ← 로컬 개발 환경 변수
├── .env.production           ← 배포 환경 변수
├── vite.config.ts            ← Vite 설정
├── package.json
└── README.md
```

---

# Part 2: .env 파일 메커니즘 상세 설명

## 환경 변수가 작동하는 방식 (step by step)

### Step 1: 개발자가 .env.development 파일 생성

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000
VITE_AUTH_TOKEN=your_test_token_here
```

**왜 .env 파일이 필요한가?**
- 같은 코드를 다양한 환경(개발, 스테이징, 프로덕션)에서 사용해야 함
- 환경마다 다른 API 주소를 사용해야 함
- 보안상 민감한 정보(토큰, API Key)를 코드에 하드코딩하면 안 됨

### Step 2: Vite가 .env 파일을 읽음

```bash
$ npm run dev

# Vite는 실행될 때 자동으로 .env.development를 읽음
# 그 안의 변수들을 process.env와 import.meta.env에 주입
```

### Step 3: 코드에서 환경 변수 사용

```typescript
// src/http/http-client.ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
console.log(apiBaseUrl); // 출력: http://localhost:8080/api

const httpClient = axios.create({
  baseURL: apiBaseUrl,  // ← .env.development에서 읽은 값
  timeout: import.meta.env.VITE_API_TIMEOUT,
});
```

### Step 4: HTTP 요청이 실제로 발생

```typescript
// services/simulation.service.ts
async createSimulation(request: CreateSimulationRequest) {
  // http-client.post('/simulations', request)
  // → axios의 baseURL이 'http://localhost:8080/api'이므로
  // → 실제 요청 URL: http://localhost:8080/api/simulations
  
  const response = await httpClient.post('/simulations', request);
  return response.data;
}
```

---

## .env 파일과 JSON 데이터의 관계 (중요!)

### 현재 상황 (임시 JSON 사용)

```
당신의 코드:
┌────────────────────────────────────────────┐
│ useCreateSimulation()                      │
│   ↓ mutationFn 실행                       │
│ SimulationService.createSimulation()       │
│   ↓                                        │
│ httpClient.post('/simulations', data)      │
│   ↓                                        │
│ axios.create({                             │
│   baseURL: 'http://localhost:8080/api'     │
│   ↑ 이것이 .env의 VITE_API_BASE_URL       │
│ })                                         │
│   ↓                                        │
│ 실제 요청: POST /api/simulations           │
│                                            │
│ ??? 어디로 요청이 가나?                    │
│ → .env에 명시된 주소로! (localhost:8080)  │
└────────────────────────────────────────────┘
```

### 만약 백엔드가 로컬에서 돌고 있다면

```bash
# 터미널 1: 프론트엔드 개발자가 실행
npm run dev  # http://localhost:5173

# 터미널 2: 백엔드 개발자가 실행 (Spring Boot)
java -jar application.jar  # http://localhost:8080

# .env.development가 이렇게 설정되어 있으면
VITE_API_BASE_URL=http://localhost:8080/api

# 당신의 브라우저에서 /api/simulations 버튼을 누르면
# → axios는 http://localhost:8080/api/simulations으로 요청
# → 백엔드 서버가 그 요청을 받아 처리
# → 응답을 프론트엔드로 반환
```

### JSON 파일은 언제 쓰는가?

```typescript
// 만약 이렇게 코드를 짜면:
import mockSimulations from '../mock-data/simulations.json';

// useQuery에서
const { data } = useQuery({
  queryKey: ['simulations'],
  queryFn: () => Promise.resolve(mockSimulations),  // ← JSON 직접 반환
});

// → 이 경우 VITE_API_BASE_URL은 무시됨
// → API 호출이 발생하지 않음
// → 순수하게 메모리의 JSON 데이터만 사용

// ❌ 이건 지금 잘못된 패턴임
```

### 올바른 패턴 (현재 당신이 해야 할 것)

```typescript
// hooks/useSimulation.ts
export const useCreateSimulation = () => {
  return useMutation({
    mutationFn: (request: CreateSimulationRequest) => {
      // 항상 http-client를 사용!
      return SimulationService.createSimulation(request);
      // ↑ 이것이 .env의 VITE_API_BASE_URL을 읽음
    },
  });
};

// 백엔드가 없을 때는 .env를 이렇게:
// VITE_API_BASE_URL=http://localhost:3000/mock-api
// (로컬 Mock API 서버를 따로 띄우거나)

// 백엔드가 있을 때는 .env를 이렇게:
// VITE_API_BASE_URL=http://localhost:8080/api
// (실제 Spring 서버를 바라봄)
```

---

# Part 3: 백엔드 개발자로부터 받아야 할 정보 체크리스트

## 지금 바로 이것들을 물어보세요

### ✅ 인프라 정보 (필수)

```
1️⃣ "현재 백엔드 Spring 서버가 돌고 있나요?"
   → YES: 어디서? (로컬? EC2?)
   → 주소: 192.168.x.x / ec2-xx-xxx-xxx.compute-1.amazonaws.com
   → 포트: 8080 / 8443 / 다른 포트?

2️⃣ "EC2에 배포했다고 했는데, Spring 서버의 현재 상태는?"
   → 가동 중인가? 멈춰있는가?
   → $ curl https://ec2-주소:포트/health
   → 응답이 오는가?

3️⃣ "Swagger/OpenAPI 문서는?"
   → URL: https://ec2-주소:포트/swagger-ui/index.html
   → 또는: https://ec2-주소:포트/api-docs
   → 접속 가능한가?

4️⃣ "인증(JWT) 필요한가?"
   → 필요하면: 테스트용 토큰 하나 줘
   → 아니면: 공개 엔드포인트부터 시작
```

### ✅ API 스펙 정보 (필수)

```
5️⃣ "POST /api/simulations 요청/응답 형식"
   → Swagger에 명시된 DTO (정확한 필드명, 타입)
   → 필수/선택 필드
   → enum 값들 (digitalLiteracy, personaDevice 등)

6️⃣ "응답 데이터 래퍼 형식"
   → 직접 { id, status, ... } 인가?
   → 아니면 { data: {...}, result: true, payload: {...} } 인가?
   → 이것이 매우 중요 (Adapter 레이어 작성에 영향)

7️⃣ "에러 응답 형식"
   → { error: "message", code: 400 } ?
   → { status: "FAIL", details: {...} } ?
```

### ✅ 배포/운영 정보

```
8️⃣ "EC2에 직접 배포한 방식이 뭔가?"
   → Git clone한 후 gradle build?
   → Docker image 사용?
   → 전체 CI/CD 파이프라인이 있나?

9️⃣ "앞으로 코드 수정할 때마다 EC2 재배포?"
   → GitHub에 push → 자동 배포?
   → 수동으로 ssh 접속해서 배포?
   → Jenkins/GitHub Actions 같은 자동화?

🔟 "팀장님이 '스프링으로 같이 올려두라'는 게 뭐?"
   → (결과를 가지고 백엔드 개발자에게 물어봐야 함)
```

---

# Part 4: EC2 배포 구조 완벽 이해

## "EC2에 배포"는 정확히 무엇인가?

### ❌ 흔한 오해

**오해**: "EC2는 GitHub 전체 폴더를 업로드하는 건가?"

**현실**: EC2 = AWS에서 제공하는 **가상 컴퓨터** 일 뿐임. 당신의 컴퓨터와 같음.

```
당신의 컴퓨터 (로컬):
┌──────────────────────────┐
│ Windows/Mac/Linux OS     │
│                          │
│ src/ 폴더 ← 코드         │
│ node_modules/            │
│ Java Runtime             │
│ Spring Boot App          │
└──────────────────────────┘

AWS EC2 (원격 컴퓨터):
┌──────────────────────────┐
│ Linux OS (Ubuntu)        │
│                          │
│ /home/ubuntu/src/        │
│ /home/ubuntu/node_...    │
│ Java Runtime             │
│ Spring Boot App 실행 중  │
└──────────────────────────┘
```

### 실제 배포 프로세스

```
Step 1: 백엔드 코드 작성
└─ GitHub에 커밋/푸시

Step 2: EC2 인스턴스 생성 (AWS Console)
└─ 보안 그룹 설정 (8080, 8443 포트 개방)
└─ SSH 키페어 생성 (EC2 접속용)

Step 3: EC2에 접속해서 코드 받기
$ ssh -i key.pem ubuntu@ec2-주소
$ git clone https://github.com/team/backend.git
$ cd backend

Step 4: 빌드
$ ./gradlew build

Step 5: 실행
$ java -jar build/libs/application-1.0.jar

Step 6: 계속 돌리기
$ nohup java -jar build/libs/application-1.0.jar > log.txt &
# (터미널을 종료해도 백그라운드에서 계속 실행)

Result:
EC2의 8080 포트에 Spring 앱이 실행 중
→ https://ec2-주소:8080 으로 접속 가능
```

### 팀장님이 "스프링으로 같이 올려두라"는 의미

```
해석 1 (가능성 높음):
"백엔드 코드(Spring)를 GitHub에 올려두면,
 프론트엔드 개발자가 clone해서 로컬에서
 Spring을 실행하고 FE와 통합 테스트할 수 있도록"

해석 2 (가능성 낮음):
"CI/CD 파이프라인에서 Spring build + 배포를
 자동화해서 EC2에 올려두라" (DevOps 작업)

→ 확인 방법: 팀장님 또는 백엔드 리드에게 직접 물어봐야 함
```

---

# Part 5: 당신이 현재 해야 할 것 (체크리스트)

## 지금 바로 (오늘)

### ☐ 1단계: 백엔드 개발자와 대화

```bash
# Part 3에서 준 10개 질문 항목을 백엔드 개발자와 이 순서대로 논의:
1. 현재 Spring 서버가 어디에 있나?
2. 그 서버의 상태는?
3. Swagger URL?
4. 인증 필요한가? 테스트 토큰은?
5. 요청/응답 DTO 정확한 형식?
6. 응답 래퍼 형식?
7. 에러 응답 형식?
8. EC2 배포 방식?
9. 코드 수정 후 배포 프로세스?
10. "스프링으로 같이 올려두라" = ?

# 그리고 기록:
# - Spring 서버 URL (예: http://localhost:8080)
# - 포트 (8080? 8443?)
# - Swagger 엔드포인트
# - 인증 여부 + 테스트 토큰
# - 응답 DTO 구조
```

### ☐ 2단계: 당신의 로컬 .env 파일 확인

```bash
# 프로젝트 루트에서
cat .env.development

# 출력 예:
# VITE_API_BASE_URL=http://localhost:8080/api
# VITE_API_TIMEOUT=30000

# 없으면 생성:
touch .env.development

# 내용 입력:
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000
VITE_MOCK_MODE=false
VITE_AUTH_TOKEN=  # 백엔드에서 받은 토큰
```

### ☐ 3단계: 백엔드 응답 구조 확인

```bash
# Postman 또는 cURL로 테스트
curl -X GET http://localhost:8080/health

# 응답 예시 1:
# {"status":"UP"}

# 응답 예시 2:
# {"data":{"status":"UP"},"result":true}

# 어느 형식인지 확인해두기
```

---

## 1주일 후 (백엔드가 준비되면)

### ☐ 4단계: Swagger로 API 스펙 재확인

```bash
# 브라우저에서
http://localhost:8080/swagger-ui/index.html  # 로컬 백엔드
또는
https://ec2-52-xxx-xxx-xxx.compute-1.amazonaws.com:8443/swagger-ui/index.html  # EC2

# 확인사항:
- POST /api/simulations DTO
- 응답 구조
- 에러 코드들
```

### ☐ 5단계: types/simulation.ts 수정

```typescript
// Swagger DTO와 정확히 일치하도록

export interface CreateSimulationRequest {
  title: string;
  task: string;
  targetUrl: string;
  successCondition: {
    type: 'CONTAINS' | 'REGEX' | 'EQUALS';  // ← Swagger와 일치
    value: string;
  };
  userProfile: {
    digitalLiteracy: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    personaDevice: 'DESKTOP' | 'MOBILE' | 'TABLET';
    ageGroup: 'teens' | 'twenties' | 'thirties' | 'forties' | 'fifties' | 'sixties';
    visionImpairment: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
    attentionLevel: 'LOW' | 'NORMAL' | 'HIGH';
  };
  demographicDistribution: {
    teens: number;
    twenties: number;
    thirties: number;
    forties: number;
    fifties: number;
    sixties: number;
  };
}
```

### ☐ 6단계: 응답 Adapter 작성

```typescript
// adapters/simulation.adapter.ts

// 백엔드 응답 형식 (Swagger에서 확인)
interface BackendSimulationDTO {
  id: string;
  status: string;  // "RUNNING" | "COMPLETED" | etc
  createdAt: string;
  progressPercentage: number;
  results?: {
    issues: Array<{...}>;
    wcagScore: number;
    // ... 다른 필드들
  };
}

// UI 모델 (프론트엔드가 사용할 형식)
export interface SimulationResult {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: {
    issues: Array<{...}>;
    wcagScore: number;
  };
}

// Adapter 변환
export class SimulationAdapter {
  static toDomain(dto: BackendSimulationDTO): SimulationResult {
    return {
      id: dto.id,
      status: this.mapStatus(dto.status),
      progress: dto.progressPercentage || 0,
      results: dto.results ? this.mapResults(dto.results) : undefined,
    };
  }

  private static mapStatus(status: string): 'pending' | 'running' | 'completed' | 'failed' {
    const map = {
      'PENDING': 'pending',
      'RUNNING': 'running',
      'COMPLETED': 'completed',
      'FAILED': 'failed',
    };
    return map[status as keyof typeof map] || 'pending';
  }

  private static mapResults(dto: any) {
    // 실제 구조로 변환
    return {
      issues: dto.issues || [],
      wcagScore: dto.wcagScore || 0,
    };
  }
}
```

### ☐ 7단계: Service 계층 수정

```typescript
// services/simulation.service.ts

import { httpClient } from '../http/http-client';
import { SimulationAdapter } from '../adapters/simulation.adapter';
import { CreateSimulationRequest, SimulationResult } from '../types/simulation';

export class SimulationService {
  static async createSimulation(
    request: CreateSimulationRequest
  ): Promise<SimulationResult> {
    try {
      // http-client는 이미 .env의 baseURL 읽음
      const response = await httpClient.post<{
        data: any;  // 백엔드 응답 구조
        result: boolean;
        payload?: any;
      }>('/simulations', request);

      // 래퍼 제거 + Adapter로 변환
      const backendDto = response.data.data;  // "data" 필드 추출
      return SimulationAdapter.toDomain(backendDto);
    } catch (error) {
      console.error('Failed to create simulation:', error);
      throw error;
    }
  }

  static async getSimulation(id: string): Promise<SimulationResult> {
    const response = await httpClient.get<{
      data: any;
      result: boolean;
    }>(`/simulations/${id}`);

    return SimulationAdapter.toDomain(response.data.data);
  }

  static async listSimulations() {
    const response = await httpClient.get<{
      data: any[];
      result: boolean;
    }>('/simulations');

    return response.data.data.map(item => SimulationAdapter.toDomain(item));
  }
}
```

### ☐ 8단계: React Query Hook 확인

```typescript
// hooks/useSimulation.ts (기존 코드가 올바른지 확인)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SimulationService } from '../services/simulation.service';
import { CreateSimulationRequest } from '../types/simulation';

export const useCreateSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSimulationRequest) =>
      SimulationService.createSimulation(request),  // ← Service 호출
    onSuccess: (data) => {
      // 생성 성공 후
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      console.log('Created simulation:', data);
    },
    onError: (error) => {
      console.error('Failed to create:', error);
    },
  });
};

export const useSimulationStatus = (simulationId: string | null) => {
  return useQuery({
    queryKey: ['simulation', simulationId],
    queryFn: () => SimulationService.getSimulation(simulationId!),
    enabled: !!simulationId,
    refetchInterval: 2000,  // 2초마다 폴링
    retry: 3,
  });
};

export const useSimulationList = () => {
  return useQuery({
    queryKey: ['simulations'],
    queryFn: () => SimulationService.listSimulations(),
  });
};
```

### ☐ 9단계: http-client 확인

```typescript
// http/http-client.ts (Bearer 토큰 자동 주입 확인)

import axios, { AxiosInstance, AxiosError } from 'axios';

export class ApiServiceError extends Error {
  constructor(
    public statusCode: number,
    public details?: any
  ) {
    super(`API Error: ${statusCode}`);
    this.name = 'ApiServiceError';
  }
}

const createClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,  // ← .env에서 읽음!
    timeout: 30000,
  });

  // 요청 전에 Bearer 토큰 자동 주입
  client.interceptors.request.use((config) => {
    const token =
      import.meta.env.VITE_AUTH_TOKEN ||
      localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // 응답 에러 처리
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // 토큰 만료
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw new ApiServiceError(
        error.response?.status || 0,
        error.response?.data
      );
    }
  );

  return client;
};

export const httpClient = createClient();
```

---

# Part 6: 백엔드 서버가 켜졌을 때 당신이 할 일

## 상황: 백엔드 개발자가 "서버 올렸습니다" 라고 말했을 때

### 🔍 Step 1: 서버가 실제로 돌고 있는지 확인

```bash
# 터미널에서:
curl http://localhost:8080/health

# 응답 예시:
# {"status":"UP"}  또는
# {"data":{"status":"UP"},"result":true}

# 응답이 없거나 에러 → "서버가 안 돌고 있습니다" 라고 백엔드에 알려줌
```

### 📖 Step 2: Swagger 확인

```bash
# 브라우저에서
http://localhost:8080/swagger-ui/index.html  # 로컬 백엔드

# 또는 EC2라면
https://ec2-52-xxx-xxx-xxx.compute-1.amazonaws.com:8443/swagger-ui/index.html

# 확인사항:
✓ POST /api/simulations 있는가?
✓ DTO 필드들 정확한가?
✓ enum 값들이 내 types/simulation.ts와 일치하는가?
```

### 💾 Step 3: 당신의 .env.development 수정

```bash
# 현재:
VITE_API_BASE_URL=http://localhost:8080/api

# 이미 이렇게 되어 있으면 그대로 두기
# 백엔드 서버가 localhost:8080에 켜졌으니까!
```

### 🧪 Step 4: Postman으로 한 번 테스트

```bash
POST http://localhost:8080/api/simulations

Body (JSON):
{
  "title": "Test",
  "task": "Find something",
  "targetUrl": "https://example.com",
  "successCondition": {
    "type": "CONTAINS",
    "value": "test"
  },
  "userProfile": {
    "digitalLiteracy": "INTERMEDIATE",
    "personaDevice": "DESKTOP",
    "ageGroup": "twenties",
    "visionImpairment": "NONE",
    "attentionLevel": "NORMAL"
  },
  "demographicDistribution": {
    "teens": 0,
    "twenties": 5,
    "thirties": 3,
    "forties": 2,
    "fifties": 0,
    "sixties": 0
  }
}

# 응답 예시 (200 OK):
{
  "data": {
    "id": "sim_abc123",
    "status": "RUNNING",
    "createdAt": "2026-05-18T12:00:00Z",
    "progressPercentage": 0
  },
  "result": true
}

# ✓ 성공하면 진행
# ✗ 실패하면 에러 메시지 캡처해서 백엔드에 보내기
```

### 🔧 Step 5: 실제 코드에서 테스트

```bash
# 터미널에서
npm run dev

# 브라우저에서 당신의 앱 열기
http://localhost:5173

# 버튼 클릭해서 시뮬레이션 생성 시도
# → 성공: 화면에 결과 표시
# → 실패: 브라우저 개발자 도구 Console 확인
#   (Network 탭에서 /api/simulations 요청 확인)
```

### 🐛 Step 6: 에러가 나면 무엇을 확인하나?

```
에러 1: "Cannot GET /api/simulations"
→ .env의 VITE_API_BASE_URL 확인
→ 경로 끝에 /api가 들어가 있나? (http://localhost:8080/api)

에러 2: "CORS error"
→ 백엔드의 WebMvcConfigurer 확인
→ localhost:5173이 allowedOrigins에 포함되어 있나?

에러 3: "401 Unauthorized"
→ Bearer 토큰 필요함
→ http-client.ts에서 VITE_AUTH_TOKEN 확인
→ .env에 토큰 값이 있나?

에러 4: "400 Bad Request"
→ 요청 데이터 형식이 잘못됨
→ Swagger와 비교해서 필드명, 타입 확인
→ types/simulation.ts 재확인

에러 5: "500 Internal Server Error"
→ 백엔드 문제
→ 백엔드 로그 확인해달라고 요청
→ 백엔드 개발자에게 알려주기
```

---

# Part 7: 배포 후 (EC2에 올렸을 때)

## 상황: 팀장님이 "EC2에 배포했다"고 했을 때

### 수정할 것 1개: .env.production

```bash
# .env.development (로컬 - 지금)
VITE_API_BASE_URL=http://localhost:8080/api

# .env.production (배포 - 나중)
VITE_API_BASE_URL=https://ec2-52-xxx-xxx-xxx.compute-1.amazonaws.com:8443/api

# 백엔드 팀에게 물어본 EC2 주소를 여기에 넣기!
```

### npm run build 전 체크리스트

```bash
# 1. .env.production 파일 있나?
cat .env.production

# 2. 올바른 EC2 주소가 입력되어 있나?
VITE_API_BASE_URL=https://ec2-주소:포트/api  ← 맞나?

# 3. 모든 코드가 http-client를 사용하고 있나?
#    (Mock JSON 직접 import 안 하고 있나?)
grep -r "import.*simulations.json" src/
# (출력이 없으면 OK)

# 4. 빌드 테스트
npm run build

# 성공하면 dist/ 폴더가 생김
# 실패하면 에러 메시지 확인하고 수정
```

### Vercel/S3에 배포할 때

```bash
# Vercel이라면
# 1. vercel.json 설정 확인
cat vercel.json

# 2. git push
git add .
git commit -m "Update API endpoint for production"
git push origin main

# → Vercel이 자동으로 배포함

# S3 + CloudFront라면
# 1. dist/ 폴더를 S3에 업로드
# 2. CloudFront에서 캐시 무효화
# (구체적인 방법은 팀장님 또는 DevOps에게 물어봐야 함)
```

---

# Part 8: 임시 JSON은 언제 정말 지워?

## 타이밍: 배포 1주일 전

```bash
# 1단계: Mock 파일 찾기
find src/ -name "*mock*" -o -name "*Mock*"

# 2단계: 코드에서 Mock import 제거
# 예: src/pages/SimulationCreate.tsx
# ❌ 삭제:
import mockSimulations from '../mock-data/simulations.json';

# ✓ 이미 http-client 사용 중이면 OK

# 3단계: git에서 제거
git rm --cached src/mock-data/simulations.json
git add .
git commit -m "Remove mock data - using real API"

# 4단계: .gitignore에 추가 (혹시 모르니)
echo "src/mock-data/" >> .gitignore
git add .gitignore
git commit -m "Ignore mock data directory"
```

---

# 최종 정리: 당신의 일

## 지금 (오늘)

| 할 일 | 체크 |
|------|------|
| 백엔드 개발자와 Part 3 질문 10개 논의 | ☐ |
| Swagger URL 확보 | ☐ |
| 테스트 토큰 받기 | ☐ |
| 응답 데이터 형식 확인 | ☐ |
| .env.development 파일 생성/확인 | ☐ |

## 1주일 후 (백엔드 준비됨)

| 할 일 | 체크 |
|------|------|
| types/simulation.ts 수정 (Swagger와 일치) | ☐ |
| adapters/simulation.adapter.ts 작성 | ☐ |
| services/simulation.service.ts 수정 | ☐ |
| http-client.ts Bearer 토큰 확인 | ☐ |
| Postman 테스트 (정상 작동) | ☐ |
| React Query Hook 통합 확인 | ☐ |
| 로컬 npm run dev에서 테스트 | ☐ |

## 배포 2주일 전

| 할 일 | 체크 |
|------|------|
| .env.production 파일 수정 (EC2 주소) | ☐ |
| npm run build 테스트 | ☐ |
| Mock 파일 제거 | ☐ |
| git 커밋 | ☐ |

## 배포 후

| 할 일 | 체크 |
|------|------|
| 배포 사이트에서 기능 테스트 | ☐ |
| 에러 모니터링 (콘솔, 네트워크) | ☐ |
| 백엔드 팀과 문제 해결 | ☐ |

---

## 핵심 개념 요약

```
┌─────────────────────────────────────────────────────────┐
│ 환경 변수 (.env)                                        │
│ VITE_API_BASE_URL=http://localhost:8080/api             │
│                                                         │
│ ↓ (npm run dev 실행 시 Vite가 읽음)                    │
│                                                         │
│ http-client.ts                                          │
│ baseURL: import.meta.env.VITE_API_BASE_URL              │
│                                                         │
│ ↓ (axios 설정됨)                                        │
│                                                         │
│ 실제 API 요청                                           │
│ POST http://localhost:8080/api/simulations              │
│                                                         │
│ ↓ (백엔드 서버에서 응답)                               │
│                                                         │
│ 응답 데이터 (JSON)                                      │
│ { data: {...}, result: true }                           │
│                                                         │
│ ↓ (Adapter에서 변환)                                    │
│                                                         │
│ UI 모델                                                 │
│ { id, status, progress, ... }                           │
│                                                         │
│ ↓ (React Query에서 관리)                               │
│                                                         │
│ 화면에 표시됨                                           │
└─────────────────────────────────────────────────────────┘
```

**가장 중요한 것:**
1. `.env` 파일에서 API 주소를 환경별로 관리
2. 모든 API 호출은 `http-client`를 통해 (Mock JSON 직접 import X)
3. Swagger와 types 필드 일치
4. Adapter로 응답 데이터 변환
5. React Query로 상태 관리

끝! 이 가이드를 북마크하고 필요할 때마다 해당 섹션을 참고하세요. 🚀
