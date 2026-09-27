#!/usr/bin/env node
/**
 * ShipSafe MCP Server
 * Exposes static analysis tools to IBM Bob specialist agents.
 * Registered in .bob/mcp.json — Bob calls these tools during scans.
 *
 * Tools exposed:
 *   - run_tests        : executes test suite, returns coverage JSON
 *   - scan_secrets     : scans for committed secrets / hardcoded credentials
 *   - check_complexity : measures cyclomatic complexity per function
 *   - audit_deps       : runs npm audit, returns structured vulnerability list
 *   - list_source_files: returns all source file paths for agent scanning
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// ── Server Setup ──────────────────────────────────────────────────────────────
const server = new McpServer({
  name: 'shipsafe',
  version: '1.0.0',
});

// ── Tool: run_tests ───────────────────────────────────────────────────────────
server.registerTool(
  'run_tests',
  {
    description:
      'Run the project test suite and return structured coverage results. ' +
      'Supports npm (jest) and Python (pytest). Returns coverage percentages ' +
      'and a list of uncovered files.',
    inputSchema: z.object({
      project_path: z
        .string()
        .describe('Absolute or relative path to the project root directory'),
      framework: z
        .enum(['npm', 'python'])
        .default('npm')
        .describe('Test framework to use'),
    }),
  },
  async ({ project_path, framework }) => {
    try {
      const absPath = path.resolve(project_path);

      let cmd, output;
      if (framework === 'npm') {
        cmd = 'npm test -- --coverage --coverageReporters=json-summary --forceExit 2>&1';
        output = execSync(cmd, {
          cwd: absPath,
          timeout: 60000,
          encoding: 'utf8',
        });
      } else {
        cmd = 'python -m pytest --cov --cov-report=term-missing 2>&1';
        output = execSync(cmd, {
          cwd: absPath,
          timeout: 60000,
          encoding: 'utf8',
        });
      }

      // Parse jest coverage-summary.json if available
      const summaryPath = path.join(absPath, 'coverage', 'coverage-summary.json');
      if (fs.existsSync(summaryPath)) {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        const total = summary.total;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                coverage: {
                  lines: total.lines.pct,
                  branches: total.branches.pct,
                  functions: total.functions.pct,
                  statements: total.statements.pct,
                },
                raw_output: output.slice(-2000), // last 2000 chars of output
                uncovered_files: Object.entries(summary)
                  .filter(([k, v]) => k !== 'total' && v.lines.pct === 0)
                  .map(([k]) => k),
              }),
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ success: true, raw_output: output }) }],
      };
    } catch (error) {
      // Tests can "fail" (non-zero exit) but still produce coverage data
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message,
              raw_output: error.stdout || error.stderr || '',
            }),
          },
        ],
      };
    }
  },
);

// ── Tool: scan_secrets ────────────────────────────────────────────────────────
server.registerTool(
  'scan_secrets',
  {
    description:
      'Scan a project directory for hardcoded secrets, API keys, passwords, ' +
      'and committed .env files. Returns a list of findings with file/line locations.',
    inputSchema: z.object({
      project_path: z.string().describe('Path to the project root directory'),
    }),
  },
  async ({ project_path }) => {
    const absPath = path.resolve(project_path);
    const findings = [];

    // Patterns that indicate hardcoded secrets
    const secretPatterns = [
      { regex: /const\s+\w*(SECRET|PASSWORD|API_KEY|TOKEN|PRIVATE_KEY)\w*\s*=\s*['"`][^'"`\$]{4,}/gi, severity: 'CRITICAL', type: 'hardcoded_secret' },
      { regex: /['"`](sk_live_[a-zA-Z0-9]{20,})/g, severity: 'CRITICAL', type: 'stripe_key' },
      { regex: /['"`](AKIA[A-Z0-9]{16})/g, severity: 'CRITICAL', type: 'aws_access_key' },
      { regex: /['"`](ghp_[a-zA-Z0-9]{36})/g, severity: 'CRITICAL', type: 'github_token' },
      { regex: /console\.log\([^)]*(?:password|secret|token|key)[^)]*\)/gi, severity: 'HIGH', type: 'secret_in_log' },
      { regex: /jwt\.sign\([^,]+,\s*['"`][^'"`]+['"`]\s*\)(?!\s*,)/g, severity: 'HIGH', type: 'jwt_no_expiry' },
    ];

    // Walk source files
    function walkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.env') continue;
        if (entry.name === 'node_modules' || entry.name === 'coverage') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full);
        } else if (/\.(js|ts|py|rb|go|env)$/.test(entry.name) || entry.name === '.env') {
          // Check for .env file committed
          if (entry.name === '.env') {
            findings.push({
              severity: 'CRITICAL',
              type: 'committed_env_file',
              file: path.relative(absPath, full),
              line: 0,
              description: '.env file found — likely contains real credentials',
            });
          }
          const content = fs.readFileSync(full, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            for (const pattern of secretPatterns) {
              if (pattern.regex.test(line)) {
                findings.push({
                  severity: pattern.severity,
                  type: pattern.type,
                  file: path.relative(absPath, full),
                  line: idx + 1,
                  snippet: line.trim().slice(0, 100),
                });
              }
              pattern.regex.lastIndex = 0; // reset stateful regex
            }
          });
        }
      }
    }

    walkDir(absPath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            findings,
            total: findings.length,
            critical: findings.filter((f) => f.severity === 'CRITICAL').length,
            high: findings.filter((f) => f.severity === 'HIGH').length,
          }),
        },
      ],
    };
  },
);

// ── Tool: check_complexity ────────────────────────────────────────────────────
server.registerTool(
  'check_complexity',
  {
    description:
      'Measure cyclomatic complexity of all JavaScript/TypeScript functions in a directory. ' +
      'Returns functions above the threshold (default: 10) as findings.',
    inputSchema: z.object({
      project_path: z.string().describe('Path to the project root directory'),
      threshold: z.number().default(10).describe('Complexity threshold for findings'),
    }),
  },
  async ({ project_path, threshold }) => {
    const absPath = path.resolve(project_path);
    const findings = [];

    function measureComplexity(content, filePath) {
      // Simple heuristic: count decision points per function block
      const functionRegex = /(?:function\s+(\w+)|(\w+)\s*[=:]\s*(?:async\s*)?\([^)]*\)\s*(?:=>|{))/g;
      const decisionPoints = ['if', 'else if', 'for', 'while', 'case', '&&', '||', '\\?'];
      const lines = content.split('\n');

      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        const fnName = match[1] || match[2] || 'anonymous';
        const startIdx = match.index;
        // Extract rough function body (up to 100 chars for complexity estimate)
        const body = content.slice(startIdx, startIdx + 1500);
        let complexity = 1;
        for (const dp of decisionPoints) {
          const count = (body.match(new RegExp(`\\b${dp}\\b`, 'g')) || []).length;
          complexity += count;
        }
        if (complexity > threshold) {
          const lineNum = content.slice(0, startIdx).split('\n').length;
          findings.push({
            severity: complexity > 15 ? 'HIGH' : 'MEDIUM',
            function: fnName,
            file: path.relative(absPath, filePath),
            line: lineNum,
            complexity,
            threshold,
          });
        }
      }
    }

    function walkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'coverage' || entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full);
        } else if (/\.(js|ts)$/.test(entry.name)) {
          const content = fs.readFileSync(full, 'utf8');
          measureComplexity(content, full);
        }
      }
    }

    walkDir(absPath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            findings,
            total_high_complexity: findings.length,
          }),
        },
      ],
    };
  },
);

// ── Tool: audit_deps ──────────────────────────────────────────────────────────
server.registerTool(
  'audit_deps',
  {
    description:
      'Run npm audit on a project and return structured vulnerability findings. ' +
      'Returns a summary of CRITICAL/HIGH/MODERATE/LOW CVEs in dependencies.',
    inputSchema: z.object({
      project_path: z.string().describe('Path to the project root directory'),
    }),
  },
  async ({ project_path }) => {
    const absPath = path.resolve(project_path);
    try {
      const output = execSync('npm audit --json 2>&1', {
        cwd: absPath,
        timeout: 30000,
        encoding: 'utf8',
      });
      const audit = JSON.parse(output);
      const meta = audit.metadata?.vulnerabilities || {};
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              critical: meta.critical || 0,
              high: meta.high || 0,
              moderate: meta.moderate || 0,
              low: meta.low || 0,
              total: meta.total || 0,
              advisories: Object.values(audit.advisories || {}).slice(0, 10).map((a) => ({
                title: a.title,
                severity: a.severity,
                module: a.module_name,
                cve: a.cves?.[0] || 'N/A',
              })),
            }),
          },
        ],
      };
    } catch (e) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: e.message, raw: e.stdout || '' }) }],
      };
    }
  },
);

// ── Tool: list_source_files ───────────────────────────────────────────────────
server.registerTool(
  'list_source_files',
  {
    description:
      'List all source files in a project directory, grouped by type (source, test, config). ' +
      'Used by agents to discover what needs to be scanned.',
    inputSchema: z.object({
      project_path: z.string().describe('Path to the project root directory'),
    }),
  },
  async ({ project_path }) => {
    const absPath = path.resolve(project_path);
    const result = { source: [], tests: [], config: [], other: [] };

    function walkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'coverage' || entry.name === '.git') continue;
        const full = path.join(dir, entry.name);
        const rel = path.relative(absPath, full);
        if (entry.isDirectory()) {
          walkDir(full);
        } else {
          if (/\.(test|spec)\.(js|ts|py)$/.test(entry.name) || /tests?\//.test(rel)) {
            result.tests.push(rel);
          } else if (/\.(js|ts|py|rb|go)$/.test(entry.name)) {
            result.source.push(rel);
          } else if (/\.(json|yaml|yml|env|toml|ini)$/.test(entry.name)) {
            result.config.push(rel);
          } else {
            result.other.push(rel);
          }
        }
      }
    }

    walkDir(absPath);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  },
);

// ── Start Server ──────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('ShipSafe MCP Server running on stdio');
