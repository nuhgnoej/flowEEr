# 🌸 FlowEEr – 온디바이스 앱 프로젝트 (MVP)

## 🏗️ 프로젝트 개요

**FlowEEr는 파워 T들을 위한 루틴 알림 앱입니다.**

- 플로우를 설계하고, 스텝을 연결하고, 조건에 따라 자동으로 알람을 받습니다.
- 서버 없이 **온디바이스(Local DB)** 환경에서 작동합니다.
- 반복되는 일상과 업무를 체계적으로 관리할 수 있습니다.

---

## 🚀 핵심 개념 및 작동 원리

| 요소        | 설명                                                          |
| ----------- | ------------------------------------------------------------- |
| **Flow**    | 하나의 작업 흐름, 루틴 단위 (예: 아침 준비, 운동 루틴 등)     |
| **Step**    | 플로우 내 단일 작업 또는 알림 단위 (예: 기상, 양치, 출근)     |
| **Trigger** | 특정 시간 또는 다른 Step과의 관계로 Step을 실행하는 조건 설정 |

- 기준 스텝(예: 기상)의 **절대시간** 또는 **상대시간(오프셋)**으로 시간 계산
- 트리거는 **“시간 기반”** 또는 **“스텝 의존 기반”**으로 구성

---

## 🔥 기능 스코프 (MVP 기준)

| 기능                    | 상태                              |
| ----------------------- | --------------------------------- |
| 플로우 생성/수정/삭제   | ✅ 완료                           |
| 스텝 추가/편집/삭제     | ✅ 완료                           |
| 트리거 설정 (시간/상대) | ✅ 완료 (휠 피커 UI 적용)         |
| 로컬 저장 (SQLite)      | ✅ 완료                           |
| 로컬 알림 실행          | ⏳ 개발 예정 (expo-notifications) |
| 클라우드 연동           | ❌ 미지원 (MVP는 온디바이스 전용) |
| 사용자 계정             | ❌ 미지원                         |

---

## ⏰ Trigger Type 정의

| 타입                  | 설명                                | 필드                                   |
| --------------------- | ----------------------------------- | -------------------------------------- |
| **`at_time`**         | 특정 절대 시간에 실행               | `time` (필수)                          |
| **`after_step`**      | 특정 스텝 완료 후 실행              | `targetStepId` (필수), `offset` (선택) |
| **`delay_from_step`** | 특정 스텝 시작 후 지연 시간 뒤 실행 | `targetStepId` (필수), `offset` (필수) |
| **`immediate`**       | 특정 스텝 완료 직후 즉시 실행       | `targetStepId` (필수)                  |
| **`manual`**          | 수동으로 직접 실행                  | 없음                                   |
| **`after_all`**       | 플로우 내 모든 스텝 완료 후 실행    | 없음                                   |

> ✔️ 트리거 배열 중 **하나라도 조건을 만족하면 해당 스텝이 실행됩니다.**

---

## 🗂️ 데이터베이스 스키마

```plaintext
flow (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
)

step (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY(flow_id) REFERENCES flow(id) ON DELETE CASCADE
)

trigger (
  id TEXT PRIMARY KEY,
  step_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  target_step_id INTEGER,
  offset INTEGER,
  time TEXT,
  FOREIGN KEY(step_id) REFERENCES step(id) ON DELETE CASCADE
)
```

---

## 🎨 UI 구성 및 특징

- ✅ 플로우 → 스텝 → 트리거 편집 모달 방식
- ✅ 휠 피커(Flip Clock 스타일) 시간 설정
- ✅ 트리거 목록을 Step 하단에 작게 표시
- ✅ 헤더와 Row 정렬 문제 개선 완료

---

## 📦 폴더 구조

```plaintext
app/
├── (tabs)/
│   ├── index.tsx        // 홈 대시보드
│   ├── flow.tsx         // 플로우 목록
│   ├── step.tsx         // 스텝 목록
│   ├── settings.tsx     // 설정
│   └── _layout.tsx      // 탭 네비게이션
├── flow/
│   ├── [id].tsx         // 플로우 상세/편집
│   └── newFlow.tsx      // 플로우 생성
components/
├── FlowEditor.tsx
├── StepEditor.tsx
└── TriggerEditor.tsx
db/
├── db.ts                // SQLite 초기화 및 연결
└── flowRepository.ts    // CRUD 함수
lib/
└── types.ts             // 데이터 타입
```

---

## 🏗️ 예시 JSON (플로우 저장 구조)

```json
{
  "id": 1,
  "name": "아침 준비",
  "description": "기상부터 출근까지 준비",
  "steps": [
    {
      "id": 101,
      "name": "기상",
      "triggers": [
        {
          "id": "t1",
          "type": "at_time",
          "time": "07:00"
        }
      ]
    },
    {
      "id": 102,
      "name": "양치",
      "triggers": [
        {
          "id": "t2",
          "type": "after_step",
          "targetStepId": 101,
          "offset": 120
        }
      ]
    }
  ]
}
```

---

## 🔧 기술 스택

| 영역         | 사용 기술                                   |
| ------------ | ------------------------------------------- |
| 프레임워크   | React Native + Expo                         |
| 상태 관리    | React Context (Zustand 추후 도입 가능)      |
| 데이터베이스 | SQLite (expo-sqlite, Async 기반)            |
| UI 컴포넌트  | React Native + Custom Modal + Wheely Picker |
| 알람         | Expo Notifications (구현 예정)              |

---

## 🚀 향후 확장 계획

- [ ] 알람 기능 완성
- [ ] 플로우 실행 화면 구현 (현재 상태 표시, Step 완료 체크)
- [ ] 푸시 알림 (서버 연결)
- [ ] 클라우드 동기화 (Supabase 고려)
- [ ] 사용자 계정 및 멀티 디바이스 지원
- [ ] 웹 버전 추가 (Next.js 기반)

---

## 💡 슬로건

> **“시간을 설계하고, 흐름을 만들고, 삶을 피워낸다.” – FlowEEr**

---

## ✅ 현재 진행 상황

- [x] 플로우 → 스텝 → 트리거 전체 편집 기능 완료
- [x] 휠 피커 UI 개선
- [x] 데이터베이스 설계 및 동작 확인
- [ ] 로컬 알람 기능 도입 진행 중
- [ ] 플로우 실행 모드 개발 예정

---

## 📜 실행 방법

```bash
npx expo start
```

- DB 초기화는 앱 구동 시 자동 수행됨
- 또는 수동 실행

```ts
import { initDatabase } from "@/lib/db";
initDatabase();
```

---

> © 2025 flowEEr. All rights reserved.
