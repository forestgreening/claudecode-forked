# Oh-My-Claude-Sisyphus Setup Guide

## Prerequisites (사전 준비)

| 항목 | 버전 | 확인 방법 |
|------|------|-----------|
| Node.js | >= 20 | `node --version` |
| Git Bash | 최신 (Windows) | Git 설치 시 포함 |
| Claude Code CLI | 최신 | `claude --version` |

---

## Initial Setup (초기 설치)

### 1. Clone

```bash
git clone https://github.com/<YOUR-USERNAME>/oh-my-claude-sisyphus.git
cd oh-my-claude-sisyphus
```

### 2. One-Command Setup

```bash
bash scripts/setup.sh
```

`setup.sh`가 자동으로 처리하는 작업:

| 단계 | 작업 |
|------|------|
| 1 | `npm install` - 의존성 설치 |
| 2 | `npm run build` - 에이전트/스킬/HUD 빌드 |
| 3 | `.git/hooks/post-merge` 설치 - 머지 후 자동 재빌드 |
| 4 | `~/.claude/hud/omc-hud.mjs` 작성 - HUD 래퍼 (현재 레포 경로 자동 주입) |
| 5 | `~/.claude/settings.json` 업데이트 - `statusLine` 항목 추가 (기존 설정 보존) |
| 6 | `upstream` 리모트 추가 (없는 경우에만) |

스크립트는 멱등성을 보장합니다. 이미 설정된 항목은 덮어쓰지 않고 건너뜁니다.

### 3. Verify (검증)

설치 후 정상 동작 확인:

```bash
# 업데이트 플로우 전체 실행 (변경 없으면 빠르게 완료)
npm run update

# HUD 빌드 결과물 확인
ls dist/hud/index.js

# settings.json에 statusLine 항목 확인
cat ~/.claude/settings.json | grep statusLine
```

Claude Code를 열면 터미널 하단에 HUD 상태줄이 표시됩니다.

---

## Daily Usage (일상 사용)

### Update (업데이트)

```bash
npm run update
```

내부적으로 `bash scripts/pull-update.sh`를 실행합니다.

| 플래그 | 설명 | 예시 |
|--------|------|------|
| (없음) | upstream/main에서 풀, 변경 감지 후 선택적 재빌드 | `npm run update` |
| `--force` | 변경 여부와 무관하게 install + build 강제 실행 | `npm run update -- --force` |
| `--origin` | upstream 대신 origin에서 풀 | `npm run update -- --origin` |
| `--branch <name>` | 기본 브랜치(main) 대신 다른 브랜치 사용 | `npm run update -- --branch dev` |

### What Happens Automatically (자동 처리)

`post-merge` 훅이 설치되어 있으면, `git merge` / `git pull` 이후 자동으로:

- `package.json`이 바뀌었으면 → `npm install` 실행
- `src/`, `agents/`, `skills/`, `scripts/`, `bridge/` 아래 파일이 바뀌었으면 → `npm run build` 실행
- 관련 없는 파일만 바뀐 경우 → 아무것도 실행하지 않고 조용히 종료

머지 자체는 훅 실패 여부와 무관하게 항상 성공합니다 (exit 0 보장).

---

## Troubleshooting (문제 해결)

### HUD가 표시되지 않을 때

1. `~/.claude/settings.json`에 `statusLine` 항목이 있는지 확인:
   ```bash
   cat ~/.claude/settings.json
   ```
2. `~/.claude/hud/omc-hud.mjs`가 존재하는지 확인:
   ```bash
   ls ~/.claude/hud/omc-hud.mjs
   ```
3. `dist/hud/index.js`가 빌드되었는지 확인:
   ```bash
   ls dist/hud/index.js
   ```
4. 없으면 수동 빌드:
   ```bash
   npm run build
   ```

### 풀 이후 빌드가 실패할 때

강제 재설치 후 빌드:

```bash
npm run update -- --force
```

여전히 실패하면:

```bash
rm -rf node_modules
npm install
npm run build
```

### 머지 충돌 발생 시

1. 충돌 파일 확인:
   ```bash
   git status
   ```
2. 충돌 해결 후 스테이징:
   ```bash
   git add <파일>
   git merge --continue
   ```
3. post-merge 훅은 자동 실행되지 않으므로 수동으로 재빌드:
   ```bash
   npm run build
   ```

### 새 PC에서 HUD 래퍼 경로가 틀릴 때

`setup.sh`를 다시 실행하면 현재 레포 경로로 `omc-hud.mjs`를 재생성합니다:

```bash
bash scripts/setup.sh
```

---

## File Reference (파일 참조)

| 파일 | 용도 |
|------|------|
| `scripts/setup.sh` | 신규 PC 원커맨드 설치 스크립트 |
| `scripts/pull-update.sh` | upstream 업데이트 + 선택적 재빌드 |
| `scripts/hooks/post-merge` | git post-merge 훅 템플릿 (버전 관리됨) |
| `.git/hooks/post-merge` | 실제 설치된 훅 (setup.sh가 복사) |
| `~/.claude/hud/omc-hud.mjs` | HUD 래퍼 - 로컬 레포 경로 포함 |
| `~/.claude/settings.json` | Claude Code 설정 - `statusLine` 항목 |
| `dist/hud/index.js` | 빌드된 HUD 진입점 |
| `dist/` | 전체 빌드 결과물 (에이전트, 스킬, MCP 서버 등) |
