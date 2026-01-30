/**
 * Auto Slash Command Executor
 *
 * Discovers and executes slash commands from various sources.
 *
 * Adapted from oh-my-opencode's auto-slash-command hook.
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, basename, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import type {
  ParsedSlashCommand,
  CommandInfo,
  CommandMetadata,
  CommandScope,
  ExecuteResult,
} from './types.js';

/** Get __dirname for ESM modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Claude config directory */
const CLAUDE_CONFIG_DIR = join(homedir(), '.claude');

/**
 * Parse YAML-like frontmatter from markdown file
 * Simple implementation - supports basic key: value format
 */
function parseFrontmatter(content: string): { data: Record<string, string>; body: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, body: content };
  }

  const [, yamlContent, body] = match;
  const data: Record<string, string> = {};

  for (const line of yamlContent.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  return { data, body };
}

/**
 * Discover commands from a directory
 */
function discoverCommandsFromDir(
  commandsDir: string,
  scope: CommandScope
): CommandInfo[] {
  if (!existsSync(commandsDir)) {
    return [];
  }

  let entries;
  try {
    entries = readdirSync(commandsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const commands: CommandInfo[] = [];

  for (const entry of entries) {
    // Only process .md files
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const commandPath = join(commandsDir, entry.name);
    const commandName = basename(entry.name, '.md');

    try {
      const content = readFileSync(commandPath, 'utf-8');
      const { data, body } = parseFrontmatter(content);

      const metadata: CommandMetadata = {
        name: commandName,
        description: data.description || '',
        argumentHint: data['argument-hint'],
        model: data.model,
        agent: data.agent,
      };

      commands.push({
        name: commandName,
        path: commandPath,
        metadata,
        content: body,
        scope,
      });
    } catch {
      continue;
    }
  }

  return commands;
}

/**
 * Discover skills from a directory (each subdirectory may have a SKILL.md)
 */
function discoverSkillsFromDir(
  skillsDir: string,
  scope: CommandScope
): CommandInfo[] {
  if (!existsSync(skillsDir)) {
    return [];
  }

  const skills: CommandInfo[] = [];
  try {
    const skillDirs = readdirSync(skillsDir, { withFileTypes: true });
    for (const dir of skillDirs) {
      if (!dir.isDirectory()) continue;

      const skillPath = join(skillsDir, dir.name, 'SKILL.md');
      if (existsSync(skillPath)) {
        try {
          const content = readFileSync(skillPath, 'utf-8');
          const { data, body } = parseFrontmatter(content);

          const metadata: CommandMetadata = {
            name: data.name || dir.name,
            description: data.description || '',
            argumentHint: data['argument-hint'],
            model: data.model,
            agent: data.agent,
          };

          skills.push({
            name: data.name || dir.name,
            path: skillPath,
            metadata,
            content: body,
            scope,
          });
        } catch {
          continue;
        }
      }
    }
  } catch {
    // Ignore errors reading skills directory
  }

  return skills;
}

/**
 * Get OMC project root directory
 * Walks up from current file to find the project root (where package.json lives)
 */
function getOmcProjectRoot(): string | null {
  // Try to find OMC root by looking for package.json with oh-my-claudecode-sisyphus
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        if (pkg.name === 'oh-my-claudecode-sisyphus') {
          return dir;
        }
      } catch {
        // Continue searching
      }
    }
    const parent = join(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// Cache OMC project root
let cachedOmcRoot: string | null | undefined;

/**
 * Discover all available commands from multiple sources
 */
export function discoverAllCommands(): CommandInfo[] {
  const userCommandsDir = join(CLAUDE_CONFIG_DIR, 'commands');
  const projectCommandsDir = join(process.cwd(), '.claude', 'commands');
  const userSkillsDir = join(CLAUDE_CONFIG_DIR, 'skills');

  const userCommands = discoverCommandsFromDir(userCommandsDir, 'user');
  const projectCommands = discoverCommandsFromDir(projectCommandsDir, 'project');

  // Discover skills from ~/.claude/skills/
  const userSkills = discoverSkillsFromDir(userSkillsDir, 'skill');

  // Discover skills from OMC project root's skills/ directory (bundled skills)
  if (cachedOmcRoot === undefined) {
    cachedOmcRoot = getOmcProjectRoot();
  }
  const bundledSkills: CommandInfo[] = [];
  if (cachedOmcRoot) {
    const bundledSkillsDir = join(cachedOmcRoot, 'skills');
    bundledSkills.push(...discoverSkillsFromDir(bundledSkillsDir, 'skill'));
  }

  // Priority: project > user commands > user skills > bundled skills
  // Deduplicate by name (first one wins)
  const seen = new Set<string>();
  const result: CommandInfo[] = [];

  for (const cmd of [...projectCommands, ...userCommands, ...userSkills, ...bundledSkills]) {
    const lowerName = cmd.name.toLowerCase();
    if (!seen.has(lowerName)) {
      seen.add(lowerName);
      result.push(cmd);
    }
  }

  return result;
}

/**
 * Find a specific command by name
 */
export function findCommand(commandName: string): CommandInfo | null {
  const allCommands = discoverAllCommands();
  return (
    allCommands.find(
      (cmd) => cmd.name.toLowerCase() === commandName.toLowerCase()
    ) ?? null
  );
}

/**
 * Resolve $ARGUMENTS placeholder in command content
 */
function resolveArguments(content: string, args: string): string {
  return content.replace(/\$ARGUMENTS/g, args || '(no arguments provided)');
}

/**
 * Format command template with metadata header
 */
function formatCommandTemplate(cmd: CommandInfo, args: string): string {
  const sections: string[] = [];

  sections.push(`<command-name>/${cmd.name}</command-name>\n`);

  if (cmd.metadata.description) {
    sections.push(`**Description**: ${cmd.metadata.description}\n`);
  }

  if (args) {
    sections.push(`**Arguments**: ${args}\n`);
  }

  if (cmd.metadata.model) {
    sections.push(`**Model**: ${cmd.metadata.model}\n`);
  }

  if (cmd.metadata.agent) {
    sections.push(`**Agent**: ${cmd.metadata.agent}\n`);
  }

  sections.push(`**Scope**: ${cmd.scope}\n`);
  sections.push('---\n');

  // Resolve arguments in content
  const resolvedContent = resolveArguments(cmd.content || '', args);
  sections.push(resolvedContent.trim());

  if (args && !cmd.content?.includes('$ARGUMENTS')) {
    sections.push('\n\n---\n');
    sections.push('## User Request\n');
    sections.push(args);
  }

  return sections.join('\n');
}

/**
 * Execute a slash command and return replacement text
 */
export function executeSlashCommand(parsed: ParsedSlashCommand): ExecuteResult {
  const command = findCommand(parsed.command);

  if (!command) {
    return {
      success: false,
      error: `Command "/${parsed.command}" not found. Available commands are in ~/.claude/commands/ or .claude/commands/`,
    };
  }

  try {
    const template = formatCommandTemplate(command, parsed.args);
    return {
      success: true,
      replacementText: template,
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to load command "/${parsed.command}": ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

/**
 * List all available commands
 */
export function listAvailableCommands(): Array<{
  name: string;
  description: string;
  scope: CommandScope;
}> {
  const commands = discoverAllCommands();
  return commands.map((cmd) => ({
    name: cmd.name,
    description: cmd.metadata.description,
    scope: cmd.scope,
  }));
}
