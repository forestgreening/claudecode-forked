# OMC Workspace Manager

이 프로젝트는 oh-my-claudecode의 커스텀 fork입니다. 여러 프로젝트를 관리하는 허브로 사용됩니다.

---

## SESSION START PROTOCOL (CRITICAL - MUST FOLLOW)

**세션이 시작되면 반드시 아래 순서를 따르세요:**

### Step 1: 작업 디렉토리 선택

1. `.omc/workspaces.json` 파일을 읽어서 기존 프로젝트 목록을 확인
2. AskUserQuestion 도구를 사용하여 사용자에게 질문:

**질문 형식:**
- 헤더: "Workspace"
- 질문: "어떤 프로젝트에서 작업할까요?"
- 옵션:
  - 기존 프로젝트들 (workspaces 배열에서 가져옴, 최근 사용순 정렬)
  - 마지막 옵션: "새 프로젝트 추가"

### Step 2: 선택 처리

**기존 프로젝트 선택 시:**
1. 해당 프로젝트 경로로 `cd` 명령 실행
2. workspaces.json의 해당 프로젝트 `lastUsed` 업데이트
3. `lastWorkspace` 업데이트
4. "**[프로젝트명]** 에서 작업을 시작합니다. 무엇을 도와드릴까요?" 출력

**"새 프로젝트 추가" 선택 시:**
1. AskUserQuestion으로 프로젝트 경로와 이름 입력받기
2. 경로가 존재하는지 확인 (`ls` 명령)
3. workspaces.json에 새 프로젝트 추가
4. 해당 경로로 이동
5. "**[프로젝트명]**이 추가되었습니다. 무엇을 도와드릴까요?" 출력

### Step 3: 작업 진행

작업 디렉토리가 설정된 후에는 해당 디렉토리 컨텍스트에서 모든 작업을 수행합니다.

---

## WORKSPACE COMMANDS

사용자가 다음 명령을 사용할 수 있습니다:

| 명령 | 설명 |
|------|------|
| `/workspace` 또는 `/ws` | 다른 프로젝트로 전환 |
| `/workspace list` | 등록된 프로젝트 목록 보기 |
| `/workspace add` | 새 프로젝트 추가 |
| `/workspace remove` | 프로젝트 목록에서 제거 |

---

## WORKSPACES.JSON STRUCTURE

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

## IMPORTANT RULES

1. **세션 시작 시 항상 작업 디렉토리를 먼저 확인**하세요
2. **작업 디렉토리가 설정되기 전에는 코드 작업을 시작하지 마세요**
3. 프로젝트 전환 시 현재 작업 상태를 저장하거나 확인하세요
4. oh-my-claudecode의 모든 기능(에이전트, 스킬, 커맨드)을 활용하세요

---

## INCLUDED FEATURES

이 프로젝트에는 oh-my-claudecode v3.1.0 + 커스텀 에이전트가 포함되어 있습니다:

### 커스텀 에이전트
- **flutter-engineer**: Flutter/Dart 모바일 개발 전문가
- **founder**: 서비스 구상 컨설턴트

### 주요 기능
- 27개 전문 에이전트 (tier별 variants 포함)
- 26개 스킬
- HUD 상태표시줄
- Intelligent Model Routing
- Ralph Loop (지속 모드)
- Ultrawork (병렬 실행)
