---
description: Switch between registered workspaces or manage workspace list
---

# Workspace Command

작업 프로젝트를 전환하거나 관리합니다.

## Usage

| Command | Description |
|---------|-------------|
| `/workspace` 또는 `/ws` | 다른 프로젝트로 전환 |
| `/workspace list` | 등록된 프로젝트 목록 |
| `/workspace add` | 새 프로젝트 추가 |
| `/workspace remove <name>` | 프로젝트 제거 |

## Implementation

### /workspace (전환)

1. `.omc/workspaces.json` 읽기
2. AskUserQuestion으로 프로젝트 선택 (최근 사용순)
3. 선택된 프로젝트로 `cd`
4. `lastUsed`와 `lastWorkspace` 업데이트

### /workspace list

1. `.omc/workspaces.json` 읽기
2. 테이블 형식으로 출력:

```
| Name | Path | Last Used |
|------|------|-----------|
| Project A | C:\path\a | 2026-01-21 |
| Project B | C:\path\b | 2026-01-20 |
```

### /workspace add

1. AskUserQuestion으로 입력받기:
   - 프로젝트 경로
   - 프로젝트 이름 (선택사항, 기본값: 폴더명)
2. 경로 존재 확인
3. workspaces.json에 추가
4. 해당 경로로 이동 여부 확인

### /workspace remove <name>

1. workspaces.json에서 해당 프로젝트 찾기
2. 확인 후 제거
3. 실제 폴더는 삭제하지 않음 (목록에서만 제거)

## JSON Update

workspaces.json 업데이트 시 다음 형식 유지:

```json
{
  "workspaces": [
    {
      "path": "절대 경로",
      "name": "프로젝트 이름",
      "lastUsed": "ISO 8601 형식 날짜"
    }
  ],
  "lastWorkspace": "마지막 사용 프로젝트 경로"
}
```

## Notes

- 경로는 항상 절대 경로로 저장
- lastUsed 기준으로 최근 사용순 정렬
- 존재하지 않는 경로는 경고 표시
