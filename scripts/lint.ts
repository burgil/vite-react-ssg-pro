// utils/lint.ts
import { spawn } from 'child_process';
import { promises as fs, existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR = 'src-errors';
const HTML_REPORT = 'errors.html';
const ESLINT_JSON_TEMP = 'eslint-report-temp.json';

interface LintMessage {
  filePath: string;
  messages: Array<{
    ruleId: string | null;
    severity: 1 | 2;        // 1 = warning, 2 = error
    message: string;
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
  }>;
}

interface LintTask {
  id: string;
  name: string;
  command: string;
  args: string[];
  logFile: string;
}

const tasks: LintTask[] = [
  {
    id: '--eslint',
    name: 'ESLint',
    command: 'npx',
    args: [
      'eslint',
      '.',
      '--format',
      'json',
      '--output-file',
      ESLINT_JSON_TEMP,
    ],
    logFile: 'errors-eslint.log',
  },
  {
    id: '--ts',
    name: 'TypeScript',
    command: 'npx',
    args: ['tsc', '-b'],
    logFile: 'errors-ts.log',
  },
  {
    id: '--unused',
    name: 'Unused Dependencies (Knip & Depcheck)',
    command: 'pnpm',
    args: ['unused'],
    logFile: 'errors-unused.log',
  },
];

/**
 * Parse ESLint JSON output and distribute errors to src-errors/*.txt
 */
async function parseAndDistributeErrors() {
  if (!existsSync(ESLINT_JSON_TEMP)) {
    console.log(`${colors.yellow}No ESLint JSON report found.${colors.reset}`);
    return [];
  }

  const raw = await fs.readFile(ESLINT_JSON_TEMP, 'utf-8');
  let report: LintMessage[] = [];

  try {
    report = JSON.parse(raw);
  } catch (err) {
    console.error(`${colors.red}Failed to parse ESLint JSON:${colors.reset}`, err);
    return [];
  }

  const fileMap = new Map<string, string[]>();
  const driveLetter = PROJECT_ROOT.charAt(0);

  for (const entry of report) {
    if (entry.messages.length === 0) continue;

    let absPath = path.resolve(PROJECT_ROOT, entry.filePath);
    absPath = absPath.replace(/\//g, '\\');

    if (!absPath.toLowerCase().startsWith(`${driveLetter.toLowerCase()}:\\`)) continue;

    const lines: string[] = [];
    for (const msg of entry.messages) {
      const sev = msg.severity === 2 ? 'error' : 'warning';
      const rule = msg.ruleId || 'no-rule';
      lines.push(
        `${absPath}:${msg.line}:${msg.column}  ${sev}  ${msg.message}  ${rule}`
      );
    }

    if (!fileMap.has(absPath)) fileMap.set(absPath, []);
    fileMap.get(absPath)!.push(...lines);
  }

  // Write per-file .txt files
  for (const [filePath, errorLines] of fileMap.entries()) {
    let relativePath = '';
    const lowerFilePath = filePath.toLowerCase();
    const lowerRoot = PROJECT_ROOT.toLowerCase();

    if (lowerFilePath.startsWith(lowerRoot)) {
      relativePath = filePath.substring(PROJECT_ROOT.length);
    } else {
      const srcIndex = lowerFilePath.indexOf('\\src\\');
      if (srcIndex !== -1) {
        relativePath = filePath.substring(srcIndex);
      } else {
        continue;
      }
    }

    if (relativePath.startsWith('\\') || relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }

    const outputPath = path.join(process.cwd(), OUTPUT_DIR, relativePath);
    const outputDir = path.dirname(outputPath);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const content = errorLines.join('\n');
    await fs.writeFile(outputPath + '.txt', content, 'utf8');
  }

  // Clean up temp file
  try { await fs.unlink(ESLINT_JSON_TEMP); } catch { }

  return report;
}

/**
 * Generate advanced HTML report with Tailwind CDN, search, filters, copy features
 */
/**
 * Generate advanced HTML report with Tailwind CDN, search, filters, copy features
 * Uses Client-Side Rendering (CSR) with injected JSON data to avoid template literal issues.
 */
function generateHtmlReport(report: LintMessage[]) {
  // Prepare data for injection
  const issuesData = report.map(entry => {
    const abs = path.resolve(PROJECT_ROOT, entry.filePath);
    const rel = path.relative(PROJECT_ROOT, abs).replace(/\\/g, '/');
    return {
      file: abs,
      relative: rel,
      messages: entry.messages,
    };
  }).sort((a, b) => a.relative.localeCompare(b.relative));

  const totalIssues = issuesData.flatMap(i => i.messages).length;
  const totalErrors = issuesData.flatMap(i => i.messages.filter(m => m.severity === 2)).length;
  const totalWarnings = totalIssues - totalErrors;
  const timestamp = new Date().toLocaleString();

  // Data injection
  const injectedData = JSON.stringify({
    issues: issuesData,
    summary: { total: totalIssues, errors: totalErrors, warnings: totalWarnings, files: issuesData.length },
    timestamp
  });

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESLint Advanced Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' };
  </script>
  <style>
    details[open] summary svg { transform: rotate(180deg); transition: transform 0.2s; }
    details:not([open]) summary svg { transform: rotate(0deg); transition: transform 0.2s; }
    .hidden { display: none !important; }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #1f2937; }
    ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
  </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
  <div class="max-w-(--breakpoint-2xl) mx-auto p-4 md:p-6 lg:p-8">
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
      <div>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500 mb-2">Lint Report</h1>
        <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span class="font-mono">${timestamp}</span>
          <span>•</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> ${totalErrors} Errors</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> ${totalWarnings} Warnings</span>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <div class="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
          <button id="viewList" class="px-3 py-1.5 text-sm font-medium rounded-md transition-all">List</button>
          <button id="viewFolder" class="px-3 py-1.5 text-sm font-medium rounded-md transition-all">Folder</button>
        </div>
        <button onclick="toggleDarkMode()" class="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition">
          <svg class="w-5 h-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <svg class="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-4 mb-8 sticky top-4 z-10 backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" id="searchInput" placeholder="Search files, rules, or messages..." 
            class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-gray-100 placeholder-gray-500">
        </div>
        
        <div class="flex gap-2 shrink-0">
          <select id="filterSeverity" class="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm">
            <option value="all">All Severities</option>
            <option value="error">Errors Only</option>
            <option value="warning">Warnings Only</option>
          </select>
          <button onclick="app.copyVisible()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            Copy Report
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div id="content" class="space-y-4 min-h-125"></div>

    <!-- Empty State -->
    <div id="emptyState" class="hidden flex-col items-center justify-center py-20 text-center opacity-50" style="display: none;">
      <svg class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      <p class="text-xl font-medium">No matching issues found</p>
    </div>
  </div>

  <div id="toast" class="fixed bottom-6 right-6 px-4 py-3 bg-gray-800 dark:bg-white text-white dark:text-gray-900 rounded-lg shadow-xl transform translate-y-24 transition-transform duration-300 flex items-center gap-3 z-50 font-medium">
    <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
    <span id="toastMsg">Action successful</span>
  </div>

  <script>
    // --- Data Injection ---
    const DATA = ${injectedData};

    // --- Application Logic ---
    class LintReportApp {
      constructor() {
        this.state = {
          view: localStorage.getItem('lint-view') || 'folder',
          filter: 'all',
          search: '',
          filteredIssues: []
        };
        
        this.dom = {
          content: document.getElementById('content'),
          empty: document.getElementById('emptyState'),
          searchInput: document.getElementById('searchInput'),
          filterSelect: document.getElementById('filterSeverity'),
          btnList: document.getElementById('viewList'),
          btnFolder: document.getElementById('viewFolder'),
        };

        this.init();
      }

      init() {
        this.updateViewButtons();
        
        this.dom.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.dom.filterSelect.addEventListener('change', (e) => this.handleFilter(e.target.value));
        
        this.dom.btnList.onclick = () => this.setView('list');
        this.dom.btnFolder.onclick = () => this.setView('folder');

        this.processData();
      }

      setView(mode) {
        this.state.view = mode;
        localStorage.setItem('lint-view', mode);
        this.updateViewButtons();
        this.render();
      }

      updateViewButtons() {
        const activeClass = 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white';
        const inactiveClass = 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200';
        
        if (this.state.view === 'list') {
          this.dom.btnList.className = \`\${this.dom.btnList.className.split(' ').slice(0,3).join(' ')} \${activeClass}\`;
          this.dom.btnFolder.className = \`\${this.dom.btnFolder.className.split(' ').slice(0,3).join(' ')} \${inactiveClass}\`;
        } else {
          this.dom.btnFolder.className = \`\${this.dom.btnFolder.className.split(' ').slice(0,3).join(' ')} \${activeClass}\`;
          this.dom.btnList.className = \`\${this.dom.btnList.className.split(' ').slice(0,3).join(' ')} \${inactiveClass}\`;
        }
      }

      handleSearch(val) {
        this.state.search = val.toLowerCase();
        this.processData();
      }

      handleFilter(val) {
        this.state.filter = val;
        this.processData();
      }

      processData() {
        this.state.filteredIssues = DATA.issues.filter(file => {
          const hasMatchingSeverity = file.messages.some(msg => {
             if (this.state.filter === 'error') return msg.severity === 2;
             if (this.state.filter === 'warning') return msg.severity === 1;
             return true;
          });
          
          if (!hasMatchingSeverity) return false;

          if (!this.state.search) return true;
          
          if (file.relative.toLowerCase().includes(this.state.search)) return true;
          
          return file.messages.some(msg => 
            msg.message.toLowerCase().includes(this.state.search) || 
            (msg.ruleId && msg.ruleId.toLowerCase().includes(this.state.search))
          );
        });

        this.render();
      }

      render() {
        this.dom.content.innerHTML = '';
        
        if (this.state.filteredIssues.length === 0) {
          this.dom.empty.style.display = 'flex';
          return;
        }
        this.dom.empty.style.display = 'none';

        if (this.state.view === 'list') {
          this.renderListView();
        } else {
          this.renderFolderView();
        }
      }

      renderListView() {
        const html = this.state.filteredIssues.map((file, idx) => this.buildFileCard(file, idx)).join('');
        this.dom.content.innerHTML = html;
      }

      renderFolderView() {
        const structure = {};
        
        this.state.filteredIssues.forEach(file => {
          const parts = file.relative.split('/');
          const fileName = parts.pop();
          const dir = parts.length > 0 ? parts.join('/') : 'Root';
          
          if (!structure[dir]) structure[dir] = [];
          structure[dir].push(file);
        });

        const sortedDirs = Object.keys(structure).sort();

        const html = sortedDirs.map((dir, dirIdx) => {
           const files = structure[dir];
           const dirErrorCount = files.reduce((acc, f) => acc + f.messages.filter(m => m.severity === 2).length, 0);
           
           return \`
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-3 px-2">
                 <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                 <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">\${dir}</h2>
                 <span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">\${files.length} files</span>
                 \${dirErrorCount > 0 ? \`<span class="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">\${dirErrorCount} errors</span>\` : ''}
              </div>
              <div class="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-800 ml-2">
                \${files.map((file, fileIdx) => this.buildFileCard(file, \`\${dirIdx}-\${fileIdx}\`, true)).join('')}
              </div>
            </div>
           \`;
        }).join('');

        this.dom.content.innerHTML = html;
      }

      buildFileCard(file, id, minimalHeader = false) {
        const visibleMessages = file.messages.filter(msg => {
             if (this.state.filter === 'error') return msg.severity === 2;
             if (this.state.filter === 'warning') return msg.severity === 1;
             return true;
        });

        if (visibleMessages.length === 0) return '';

        const errorCount = visibleMessages.filter(m => m.severity === 2).length;
        const warningCount = visibleMessages.length - errorCount;
        const displayName = minimalHeader ? file.relative.split('/').pop() : file.relative;

        return \`
          <details id="card-\${id}" class="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden" \${this.state.search ? 'open' : ''}>
            <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
               <div class="flex items-center gap-3 min-w-0">
                  <div class="\${errorCount > 0 ? 'text-red-500' : 'text-amber-500'}">
                    \${errorCount > 0 
                      ? '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
                      : '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
                    }
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-mono text-sm font-medium truncate text-gray-900 dark:text-gray-100" title="\${file.relative}">\${displayName}</h3>
                     \${minimalHeader ? '' : \`<div class="text-xs text-gray-500 truncate">\${file.file}</div>\`}
                  </div>
               </div>
               <div class="flex items-center gap-4 shrink-0">
                  <div class="flex gap-2 text-xs font-medium">
                    \${errorCount ? \`<span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">\${errorCount} Err</span>\` : ''}
                    \${warningCount ? \`<span class="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">\${warningCount} Warn</span>\` : ''}
                  </div>
                  <svg class="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
               </div>
            </summary>
            
            <div class="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
               \${visibleMessages.map(msg => this.buildMessageRow(msg, file.relative)).join('')}
            </div>
          </details>
        \`;
      }

      buildMessageRow(msg, filepath) {
        const isError = msg.severity === 2;
        const colorClass = isError ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10' : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10';
        
        // Escape content with proper replacement for client-side
        const safeMessage = msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeRule = msg.ruleId ? msg.ruleId : '';
        
        // For attribute usage
        const attrMessage = safeMessage.replace(/"/g, '&quot;');

        return \`
          <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-4 group">
             <div class="font-mono text-xs text-gray-500 dark:text-gray-400 shrink-0 w-16 pt-1">
               \${msg.line}:\${msg.column}
             </div>
             <div class="flex-1 min-w-0">
               <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="text-xs font-bold uppercase tracking-wider \${colorClass} px-2 py-0.5 rounded">\${isError ? 'Error' : 'Warning'}</span>
                  \${safeRule ? \`<span class="text-xs font-mono text-gray-500 dark:text-gray-400">\${safeRule}</span>\` : ''}
               </div>
               <p class="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">\${safeMessage}</p>
             </div>
             <div class="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="app.copySingle('\${filepath}:\${msg.line}:\${msg.column}')" title="Copy Path" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                </button>
                <button onclick="app.askAI(this)"
                        data-rule="\${safeRule}" 
                        data-msg="\${attrMessage}" 
                        data-file="\${filepath}" 
                        data-line="\${msg.line}"
                        title="Ask AI" class="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded text-indigo-500">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </button>
             </div>
          </div>
        \`;
      }
      
      copyVisible() {
         const lines = [];
         
         this.state.filteredIssues.forEach(file => {
           const visibleMessages = file.messages.filter(msg => {
             if (this.state.filter === 'error') return msg.severity === 2;
             if (this.state.filter === 'warning') return msg.severity === 1;
             return true;
           });
           
           if(visibleMessages.length === 0) return;

           lines.push(\`File: \${file.relative}\`);
           visibleMessages.forEach(msg => {
             const sev = msg.severity === 2 ? 'ERROR' : 'WARN';
             lines.push(\`  \${msg.line}:\${msg.column} [\${sev}] \${msg.message} (\${msg.ruleId || 'N/A'})\`);
           });
           lines.push('');
         });
         
         copyText(lines.join('\\n'));
      }
      
      copySingle(text) {
        copyText(text);
      }
      
      askAI(btn) {
        const d = btn.dataset;
        const prompt = \`I have an ESLint error in my code:\\n\\nFile: \${d.file}:\${d.line}\\nRule: \${d.rule}\\nMessage: \${d.msg}\\n\\nPlease explain the issue and provide a fix.\`;
        copyText(prompt);
        showToast('AI Prompt copied!');
      }
    }

    // --- Global Helpers ---
    const app = new LintReportApp();

    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard');
      } catch (err) {
        console.error('Copy failed', err);
        showToast('Copy failed (check console)');
      }
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      document.getElementById('toastMsg').innerText = msg;
      t.classList.remove('translate-y-24');
      setTimeout(() => t.classList.add('translate-y-24'), 2500);
    }
  </script>
</body>
</html>`;
}

async function runTask(task: LintTask): Promise<boolean> {
  console.log(`${colors.cyan}🚀 Running ${task.name}...${colors.reset}`);

  if (task.id === '--eslint') {
    const fullOutputDir = path.join(process.cwd(), OUTPUT_DIR);
    if (existsSync(fullOutputDir)) {
      rmSync(fullOutputDir, { recursive: true, force: true });
    }
  }

  return new Promise((resolve) => {
    const child = spawn(task.command, task.args, { shell: true, cwd: PROJECT_ROOT });
    let output = '';

    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { output += data.toString(); });

    child.on('close', async (code) => {
      const success = code === 0;
      const statusColor = success ? colors.green : colors.red;
      const statusLabel = success ? 'SUCCESS' : 'FAILED';

      console.log(
        `${statusColor}${colors.bright}[${statusLabel}]${colors.reset} ${task.name} completed. ${colors.cyan}(Log: ${task.logFile})${colors.reset}`
      );

      try {
        const noisePatterns = [
          /npm warn Unknown env config/i,
          /npm warn Unknown project config/i,
        ];

        const filteredOutput = output
          .split(/\r?\n/)
          .filter(line => {
            const trimmed = line.trim();
            return trimmed && !noisePatterns.some(p => p.test(trimmed));
          })
          .join('\n');

        let logContent = filteredOutput;
        const timestamp = `\n[${new Date().toISOString()}]`;
        logContent += success
          ? `${timestamp} Successfully completed ${task.name}\n`
          : `${timestamp} Failed ${task.name} with exit code ${code}\n`;

        await fs.writeFile(path.resolve(task.logFile), logContent, 'utf8');

        let htmlContent: string | null = null;

        if (task.id === '--eslint') {
          const report = await parseAndDistributeErrors();
          console.log(
            report.flatMap(r => r.messages).length > 0
              ? `${colors.yellow}📂 ${report.flatMap(r => r.messages).length} ESLint issues parsed into ${OUTPUT_DIR}/${colors.reset}`
              : `${colors.green}No ESLint issues found${colors.reset}`
          );

          if (report.length > 0) {
            htmlContent = generateHtmlReport(report);
            await fs.writeFile(HTML_REPORT, htmlContent, 'utf8');
            console.log(`${colors.cyan}→ Advanced HTML report created: ${HTML_REPORT}${colors.reset}`);

            // Generate standard text log for errors-eslint.log
            let textReport = '';
            let errorCount = 0;
            let warningCount = 0;

            report.forEach(file => {
              if (file.messages.length === 0) return;

              const absPath = path.resolve(PROJECT_ROOT, file.filePath);
              const relPath = path.relative(PROJECT_ROOT, absPath).replace(/\\/g, '/');

              textReport += `${relPath}\n`;

              file.messages.forEach(msg => {
                const severity = msg.severity === 2 ? 'error' : 'warning';
                if (msg.severity === 2) errorCount++; else warningCount++;
                textReport += `  ${msg.line}:${msg.column}  ${severity}  ${msg.message}  ${msg.ruleId || ''}\n`;
              });
              textReport += '\n';
            });

            const total = errorCount + warningCount;
            textReport += `✖ ${total} problems (${errorCount} errors, ${warningCount} warnings)\n`;

            await fs.writeFile(task.logFile, textReport, 'utf8');
            console.log(`${colors.cyan}→ Standard log updated: ${task.logFile}${colors.reset}`);
          }
        }

      } catch (err) {
        console.error(`${colors.red}✖ Failed to handle output for ${task.name}${colors.reset}`, err);
      }

      resolve(success);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const selected = tasks.filter(t => args.includes(t.id));
  const toRun = selected.length > 0 ? selected : tasks;

  console.log(`${colors.bright}${colors.cyan}--- Starting Linting Process ---${colors.reset}`);
  console.log(`${colors.bright}Targeting: ${toRun.map(t => t.name).join(', ')}${colors.reset}\n`);

  const results = await Promise.all(toRun.map(runTask));

  console.log('');
  if (results.every(r => r)) {
    console.log(`${colors.green}${colors.bright}✅ All selected tasks passed successfully!${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}❌ Some tasks failed. Check .log files or ${OUTPUT_DIR} / ${HTML_REPORT}${colors.reset}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});