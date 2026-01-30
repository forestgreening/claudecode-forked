# OMC Workspace Manager

이 프로젝트는 oh-my-claudecode의 커스텀 fork입니다. 여러 프로젝트를 관리하는 허브로 사용됩니다.

---

## QUICK START

세션을 시작하면 `/project` 명령어로 작업할 프로젝트를 선택하세요:

```
/project
```

---

## PROJECT COMMANDS

| 명령 | 설명 |
|------|------|
| `/project` | 프로젝트 선택 프롬프트 |
| `/project list` | 등록된 프로젝트 목록 보기 |
| `/project add` | 새 프로젝트 추가 |
| `/project remove` | 프로젝트 목록에서 제거 |

---

## WORKSPACES.JSON STRUCTURE

프로젝트 정보는 `.omc/workspaces.json`에 저장됩니다:

```json
{
  "workspaces": [
    {
      "path": "C:\\path\\to\\project",
      "name": "Project Name",
      "lastUsed": "2026-01-21T10:00:00Z"
    }
  ],
  "lastWorkspace": "C:\\path\\to\\project"
}
```

---

## AUTO-REGISTRATION (CRITICAL)

새 프로젝트를 생성할 때 **반드시** 워크스페이스에 자동 등록해야 합니다.

### 자동 등록이 필요한 시점

| 상황 | 등록 필요 |
|------|----------|
| Founder 아이디에이션 완료 후 프로젝트 생성 | **YES** |
| `npx create-*`, `npm init` 등으로 프로젝트 생성 | **YES** |
| `git clone`으로 프로젝트 클론 | **YES** |
| 기존 프로젝트 폴더에서 작업 시작 | **YES** (미등록 시) |

### 등록 방법

프로젝트 생성/클론 완료 후 다음 단계를 수행:

```
1. Read .omc/workspaces.json
2. workspaces 배열에 새 프로젝트 추가:
   {
     "path": "C:\\study\\{프로젝트명}",  // 절대 경로
     "name": "{프로젝트명}",
     "lastUsed": "{현재 ISO 시간}"
   }
3. lastWorkspace를 새 프로젝트 경로로 업데이트
4. Write .omc/workspaces.json
5. 사용자에게 알림: "프로젝트가 워크스페이스에 등록되었습니다."
```

### 주의사항

- 중복 경로 체크 (이미 등록된 경로면 스킵)
- Windows 경로는 `\\` 이스케이프 (JSON 내부)
- 등록 후 다음 세션에서 `/project`로 바로 접근 가능

---

## INCLUDED FEATURES

이 프로젝트에는 oh-my-claudecode v3.8.9 + 커스텀 에이전트가 포함되어 있습니다:

### 커스텀 에이전트
- **flutter-engineer**: Flutter/Dart 모바일 개발 전문가
- **founder**: 서비스 구상 컨설턴트

### 주요 기능
- 35개 전문 에이전트 (tier별 variants 포함)
- 30개+ 스킬
- HUD 상태표시줄
- Intelligent Model Routing
- Ralph Loop (지속 모드)
- Ultrawork (병렬 실행)
