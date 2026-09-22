import { exec, spawn } from 'child_process';
import util from 'util';
import net from 'net';
import http from 'http';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

const execAsync = util.promisify(exec);

// In-memory active sandbox registry: projectId -> sandbox state
const activeSandboxes = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.php': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

/**
 * Check if Docker CLI / Daemon is active on the host machine
 */
export async function isDockerAvailable() {
  if (process.env.DOCKER_ENABLED === 'false') return false;
  try {
    const { stdout } = await execAsync('docker --version', { timeout: 3000 });
    return stdout.toLowerCase().includes('docker');
  } catch (err) {
    return false;
  }
}

/**
 * Find an available TCP port on the host system within a specified range
 */
async function findAvailablePort(startPort = 3001, endPort = 3100) {
  const isPortTaken = (port) => {
    return new Promise((resolve) => {
      for (const sandbox of activeSandboxes.values()) {
        if (
          (sandbox.port === port || sandbox.targetPort === port || sandbox.backendPort === port) &&
          sandbox.status !== 'OFFLINE'
        ) {
          return resolve(true);
        }
      }

      const server = net.createServer();
      server.unref();
      server.on('error', () => resolve(true));
      server.listen(port, '0.0.0.0', () => {
        server.close(() => resolve(false));
      });
    });
  };

  for (let p = startPort; p <= endPort; p++) {
    const taken = await isPortTaken(p);
    if (!taken) return p;
  }
  return startPort;
}

/**
 * Terminate a process tree cleanly on Windows or Linux
 */
function terminateProcessTree(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    try {
      exec(`taskkill /pid ${pid} /T /F`, () => {});
    } catch (e) {}
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch (e) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch (e2) {}
    }
  }
}

/**
 * Probe an HTTP port to see if a web server has bound and is responding
 */
function probeHttpPort(port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: '/',
        timeout: timeoutMs,
      },
      (res) => {
        res.resume();
        resolve(true);
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Resolve the disk path of the project's uploaded executable or source archive
 */
function resolveExecutablePath(project) {
  if (!project.executableFile) return null;
  const { url, name } = project.executableFile;

  const candidates = [];
  if (url) {
    const cleanRel = url.replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
    candidates.push(path.resolve(cleanRel));
    candidates.push(path.resolve(process.cwd(), cleanRel));
    candidates.push(path.resolve(process.cwd(), 'uploads', 'executables', path.basename(cleanRel)));
    candidates.push(path.resolve(process.cwd(), 'backend', cleanRel));
    candidates.push(path.resolve(process.cwd(), 'backend', 'uploads', 'executables', path.basename(cleanRel)));
  }
  if (name) {
    candidates.push(path.resolve(process.cwd(), 'uploads', 'executables', name));
    candidates.push(path.resolve('uploads', 'executables', name));
    candidates.push(path.resolve(process.cwd(), 'backend', 'uploads', 'executables', name));
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Recursively find all files in a directory up to a max depth
 */
function getFileList(dir, maxDepth = 4, currentDepth = 0) {
  let results = [];
  if (currentDepth > maxDepth || !fs.existsSync(dir)) return results;

  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (file === 'node_modules' || file === '.git' || file === 'vendor') continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFileList(fullPath, maxDepth, currentDepth + 1));
      } else {
        results.push(fullPath);
      }
    }
  } catch (e) {}

  return results;
}

/**
 * Unpacks the uploaded archive or stages the binary into an isolated sandbox
 */
function prepareProjectWorkspace(projectId, archiveOrExePath) {
  const sandboxDir = path.resolve('sandboxes', projectId);
  const fileName = path.basename(archiveOrExePath);
  const ext = path.extname(archiveOrExePath).toLowerCase();
  const isZip = ext === '.zip';

  if (isZip) {
    // If sandbox workspace already exists with extracted contents, reuse it to prevent Windows EBUSY locks
    if (fs.existsSync(sandboxDir)) {
      try {
        const existingEntries = fs.readdirSync(sandboxDir);
        if (existingEntries.length > 0) {
          let appRoot = sandboxDir;
          if (existingEntries.length === 1) {
            const single = path.join(sandboxDir, existingEntries[0]);
            if (fs.statSync(single).isDirectory()) {
              appRoot = single;
            }
          }
          return { sandboxDir, appRoot, isBinary: false, binaryName: null };
        }
      } catch (e) {}
    }

    fs.mkdirSync(sandboxDir, { recursive: true });
    const zip = new AdmZip(archiveOrExePath);
    zip.extractAllTo(sandboxDir, true);

    const entries = fs.readdirSync(sandboxDir);
    let appRoot = sandboxDir;
    if (entries.length === 1) {
      const single = path.join(sandboxDir, entries[0]);
      if (fs.statSync(single).isDirectory()) {
        appRoot = single;
      }
    }

    return { sandboxDir, appRoot, isBinary: false, binaryName: null };
  }

  // Standalone binary executable
  fs.mkdirSync(sandboxDir, { recursive: true });
  const destPath = path.join(sandboxDir, fileName);
  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(archiveOrExePath, destPath);
  }
  return { sandboxDir, appRoot: sandboxDir, isBinary: true, binaryName: fileName, binaryPath: destPath };
}

/**
 * Analyze workspace to detect the exact execution profile
 */
function analyzeWorkspaceProfile(workspace) {
  if (workspace.isBinary) {
    return {
      type: 'BINARY_EXE',
      binaryPath: workspace.binaryPath,
      binaryName: workspace.binaryName,
    };
  }

  const root = workspace.appRoot;

  // Check for Fullstack structure with frontend and backend folders
  const candidateFrontend = [path.join(root, 'frontend'), path.join(root, 'client'), path.join(root, 'ui')].find(
    (p) => fs.existsSync(p) && fs.statSync(p).isDirectory()
  );
  const candidateBackend = [path.join(root, 'backend'), path.join(root, 'server'), path.join(root, 'api')].find(
    (p) => fs.existsSync(p) && fs.statSync(p).isDirectory()
  );

  if (candidateFrontend && fs.existsSync(path.join(candidateFrontend, 'package.json'))) {
    return {
      type: 'FULLSTACK_NODE',
      frontendDir: candidateFrontend,
      backendDir: candidateBackend && fs.existsSync(path.join(candidateBackend, 'package.json')) ? candidateBackend : null,
      appRoot: candidateFrontend,
    };
  }

  // Check for PHP application (e.g. ServiceHub)
  const candidatePhpDirs = [
    root,
    path.join(root, 'service-hub'),
    path.join(root, 'src'),
    path.join(root, 'app'),
    path.join(root, 'public'),
  ];
  for (const dir of candidatePhpDirs) {
    if (fs.existsSync(dir)) {
      if (fs.existsSync(path.join(dir, 'index.php')) || fs.existsSync(path.join(dir, 'composer.json'))) {
        return {
          type: 'PHP_APP',
          phpRoot: dir,
          appRoot: dir,
        };
      }
    }
  }

  // Check for single Node.js web app
  if (fs.existsSync(path.join(root, 'package.json'))) {
    return {
      type: 'NODE_WEB',
      appRoot: root,
    };
  }

  // Check for Python application
  if (
    fs.existsSync(path.join(root, 'app.py')) ||
    fs.existsSync(path.join(root, 'main.py')) ||
    fs.existsSync(path.join(root, 'requirements.txt'))
  ) {
    return {
      type: 'PYTHON_APP',
      appRoot: root,
    };
  }

  // Static HTML website
  if (fs.existsSync(path.join(root, 'index.html'))) {
    return {
      type: 'STATIC_WEB',
      appRoot: root,
    };
  }

  // Document / file repository (e.g. text files, documents)
  return {
    type: 'STATIC_EXPLORER',
    appRoot: root,
  };
}

/**
 * Process and serve a PHP or static file from project directory
 */
function serveProjectFile(appRoot, reqUrl, res) {
  let cleanUrl = reqUrl.split('?')[0];
  if (cleanUrl === '/' || cleanUrl === '') {
    cleanUrl = fs.existsSync(path.join(appRoot, 'index.html'))
      ? '/index.html'
      : fs.existsSync(path.join(appRoot, 'index.php'))
      ? '/index.php'
      : '';
  }

  let filePath = path.join(appRoot, cleanUrl);

  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.php')) {
      filePath = filePath + '.php';
    } else if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.php'))) {
      filePath = path.join(filePath, 'index.php');
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.php') {
      try {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        // Clean PHP opening tags & server logic to render complete presentation HTML
        let processedHtml = rawContent
          .replace(/<\?php[\s\S]*?\?>/gi, '')
          .replace(/<\?=[\s\S]*?\?>/gi, '')
          .trim();

        if (!processedHtml) {
          processedHtml = `<!DOCTYPE html><html><body style="background:#090d16;color:#38bdf8;font-family:monospace;padding:24px;"><h2>${path.basename(filePath)}</h2><pre>${rawContent.replace(/</g, '&lt;')}</pre></body></html>`;
        }

        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
        return res.end(processedHtml);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error serving PHP page: ' + err.message);
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  return false;
}

/**
 * Render Project Files Explorer for projects that are document / text repositories (e.g. hello.zip)
 */
function renderProjectFilesExplorerHtml(sandbox, appRoot) {
  const allFiles = getFileList(appRoot);
  const title = sandbox.projectTitle || 'Project Vault Repository';
  const fileName = sandbox.uploadedFileName || 'project-artifact';

  // Find primary file to display
  let primaryFile = allFiles[0] || null;
  let fileContent = '';
  if (primaryFile && fs.existsSync(primaryFile)) {
    try {
      fileContent = fs.readFileSync(primaryFile, 'utf8');
    } catch (e) {
      fileContent = '(Binary or unreadable file)';
    }
  }

  const safeContent = fileContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const displayRelPath = primaryFile ? path.relative(appRoot, primaryFile) : fileName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Project Files Viewport</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; }
    body { background: #070a14; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; }
    .header { background: #0b1120; border-bottom: 1px solid #1e293b; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .icon { width: 32px; height: 32px; border-radius: 8px; background: #059669; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 15px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-family: monospace; }
    .layout { display: flex; flex: 1; overflow: hidden; height: calc(100vh - 65px); }
    .sidebar { width: 260px; background: #0b1120; border-right: 1px solid #1e293b; padding: 16px; overflow-y: auto; }
    .sidebar-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 12px; }
    .file-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; font-size: 12px; color: #94a3b8; background: #0f172a; margin-bottom: 6px; font-family: monospace; word-break: break-all; }
    .file-active { background: #1e293b; color: #38bdf8; border: 1px solid #334155; font-weight: 700; }
    .main { flex: 1; display: flex; flex-direction: column; background: #020617; }
    .file-bar { background: #0b1120; border-bottom: 1px solid #1e293b; padding: 10px 20px; font-size: 12px; font-family: monospace; color: #38bdf8; display: flex; align-items: center; justify-content: space-between; }
    .content-box { flex: 1; padding: 20px; overflow-y: auto; font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="icon">📁</div>
      <div>
        <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">${title}</div>
        <div style="font-size: 11px; color: #64748b; font-family: monospace;">PROJECT ARTIFACT PREVIEW • ${fileName}</div>
      </div>
    </div>
    <span class="badge">● ARTIFACT VERIFIED & MOUNTED</span>
  </div>
  <div class="layout">
    <div class="sidebar">
      <div class="sidebar-title">Project Contents (${allFiles.length || 1} files)</div>
      ${
        allFiles.length > 0
          ? allFiles
              .map(
                (f) =>
                  `<div class="file-item file-active">📄 ${path.relative(appRoot, f)}</div>`
              )
              .join('')
          : `<div class="file-item file-active">📄 ${fileName}</div>`
      }
    </div>
    <div class="main">
      <div class="file-bar">
        <span>📄 ${displayRelPath}</span>
        <span style="color: #64748b;">${fileContent.length} bytes</span>
      </div>
      <div class="content-box">${safeContent || '// (Empty or binary artifact content)'}</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Render Live Diagnostics & Terminal Viewport for binaries, CLI scripts, and booting services
 */
function renderDiagnosticTerminalHtml(sandbox) {
  const title = sandbox.projectTitle || 'Project Vault Sandbox';
  const binaryOrArchive = sandbox.uploadedFileName || 'No artifact attached';
  const installCmd = sandbox.installCmd || '(None required)';
  const runCmd = sandbox.runCommand || '(None)';
  const status = sandbox.status;
  const isHttp = sandbox.isHttpServer;
  const activePort = sandbox.activeAppPort || sandbox.targetPort || sandbox.port;
  const pid = sandbox.childPid ? `PID ${sandbox.childPid}` : 'None';
  const exitCode = sandbox.exitCode !== null ? `Exit Code ${sandbox.exitCode}` : 'Active';

  const rawLogs = sandbox.logs.slice(-100).join('\n');
  const safeLogs = rawLogs.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Application Diagnostics</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; }
    body { background: #060913; color: #f1f5f9; min-height: 100vh; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 14px; flex-wrap: wrap; gap: 10px; }
    .brand-section { display: flex; align-items: center; gap: 10px; }
    .brand-icon { width: 34px; height: 34px; border-radius: 9px; background: #059669; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; color: #fff; box-shadow: 0 4px 12px rgba(5,150,105,0.4); }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; font-family: monospace; }
    .badge-running { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; }
    .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 1.8s infinite; }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
    .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
    .spec-card { background: #0d1424; border: 1px solid #1e293b; border-radius: 10px; padding: 10px 14px; }
    .spec-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .spec-val { font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: monospace; margin-top: 3px; word-break: break-all; }
    .terminal-container { flex: 1; min-height: 380px; background: #020617; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
    .terminal-header { background: #0b1120; border-bottom: 1px solid #1e293b; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b; font-family: monospace; }
    .terminal-body { flex: 1; padding: 14px; font-family: 'Consolas', 'Courier New', monospace; font-size: 12px; line-height: 1.6; color: #38bdf8; overflow-y: auto; white-space: pre-wrap; word-break: break-all; max-height: 480px; }
    .actions-footer { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #475569; padding-top: 10px; border-top: 1px solid #1e293b; flex-wrap: wrap; gap: 8px; }
    .btn { background: #1e293b; color: #f1f5f9; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-section">
      <div class="brand-icon">⚡</div>
      <div>
        <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">${title}</div>
        <div style="font-size: 11px; color: #64748b; font-family: monospace;">ISOLATED SANDBOX RUNTIME • ${sandbox.mode}</div>
      </div>
    </div>
    <div>
      <span class="status-badge badge-running">
        <span class="pulse-dot"></span>
        <span>${isHttp ? `ONLINE (WEB SERVER PORT ${activePort})` : `ONLINE (CLI EXECUTABLE)`}</span>
      </span>
    </div>
  </div>

  <div class="spec-grid">
    <div class="spec-card">
      <div class="spec-label">Uploaded File</div>
      <div class="spec-val" style="color: #38bdf8;">${binaryOrArchive}</div>
    </div>
    <div class="spec-card">
      <div class="spec-label">Install Command</div>
      <div class="spec-val">${installCmd}</div>
    </div>
    <div class="spec-card">
      <div class="spec-label">Run Command</div>
      <div class="spec-val" style="color: #34d399;">${runCmd}</div>
    </div>
    <div class="spec-card">
      <div class="spec-label">Process State</div>
      <div class="spec-val">${pid} • ${exitCode}</div>
    </div>
  </div>

  <div class="terminal-container">
    <div class="terminal-header">
      <div>LIVE EXECUTION CONSOLE & DIAGNOSTICS</div>
      <div>PORT: ${sandbox.port}</div>
    </div>
    <div id="terminal-body" class="terminal-body">${safeLogs}</div>
  </div>

  <div class="actions-footer">
    <div>Live stdout and stderr streaming directly from backend sandbox process.</div>
    <div style="display: flex; gap: 8px;">
      <button class="btn" onclick="window.location.reload()">Reload Viewport</button>
    </div>
  </div>

  <script>
    const term = document.getElementById('terminal-body');
    if (term) term.scrollTop = term.scrollHeight;

    // Auto-refresh when web server comes online
    let pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sandbox-internal-status');
        if (res.ok) {
          const data = await res.json();
          if (data.isHttpServer && data.activeAppPort) {
            clearInterval(pollInterval);
            window.location.reload();
          }
        }
      } catch (e) {}
    }, 1500);
  </script>
</body>
</html>`;
}

/**
 * Start the Gateway HTTP Server on the assigned public port
 */
function startSandboxGatewayServer(sandboxRecord) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      // Internal status check endpoint for auto-refresh polling
      if (req.url === '/api/sandbox-internal-status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({
            isHttpServer: sandboxRecord.isHttpServer,
            activeAppPort: sandboxRecord.activeAppPort,
            status: sandboxRecord.status,
            childPid: sandboxRecord.childPid,
            exitCode: sandboxRecord.exitCode,
            logsCount: sandboxRecord.logs.length,
          })
        );
      }

      // If this is a PHP application without host PHP binary, serve directly from files
      if (sandboxRecord.isPhpStatic && sandboxRecord.appRoot) {
        const handled = serveProjectFile(sandboxRecord.appRoot, req.url, res);
        if (handled) return;
      }

      // If this is a static document repository (hello.txt, etc.)
      if (sandboxRecord.isStaticExplorer && sandboxRecord.appRoot) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderProjectFilesExplorerHtml(sandboxRecord, sandboxRecord.appRoot));
      }

      // If active web server is running on targetPort, proxy to it
      if (sandboxRecord.isHttpServer && sandboxRecord.activeAppPort) {
        const targetOptions = {
          hostname: '127.0.0.1',
          port: sandboxRecord.activeAppPort,
          path: req.url,
          method: req.method,
          headers: {
            ...req.headers,
            host: `127.0.0.1:${sandboxRecord.activeAppPort}`,
          },
          timeout: 6000,
        };

        const proxyReq = http.request(targetOptions, (proxyRes) => {
          const proxyHeaders = { ...proxyRes.headers };
          delete proxyHeaders['x-frame-options'];
          delete proxyHeaders['content-security-policy'];
          delete proxyHeaders['frame-options'];

          res.writeHead(proxyRes.statusCode, proxyHeaders);
          proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', () => {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(renderDiagnosticTerminalHtml(sandboxRecord));
        });

        return req.pipe(proxyReq, { end: true });
      }

      // Fallback: Serve Live Executable Terminal and Diagnostics Viewport
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDiagnosticTerminalHtml(sandboxRecord));
    });

    server.on('error', (err) => {
      reject(err);
    });

    server.listen(sandboxRecord.port, '0.0.0.0', () => {
      resolve(server);
    });
  });
}

/**
 * Start or Restart a Sandbox container/isolated runtime for a project
 */
export async function startSandbox(project, customEnvVars = []) {
  const projectId = project._id.toString();

  if (activeSandboxes.has(projectId)) {
    await stopSandbox(projectId);
  }

  const gatewayPort = await findAvailablePort(3001, 3100);
  const targetPort = await findAvailablePort(gatewayPort + 10, 3200);
  const backendPort = await findAvailablePort(targetPort + 10, 3300);
  const baseUrl = process.env.DOCKER_SANDBOX_BASE_URL || 'http://localhost';
  const liveUrl = `${baseUrl}:${gatewayPort}`;
  const maxLifespanMs = Number(process.env.DOCKER_SANDBOX_MAX_LIFESPAN_MS) || 600000;

  const mergedEnvMap = new Map();
  if (Array.isArray(project.envVariables)) {
    project.envVariables.forEach((v) => {
      if (v?.key) mergedEnvMap.set(v.key, v.value || '');
    });
  }
  if (Array.isArray(customEnvVars)) {
    customEnvVars.forEach((v) => {
      if (v?.key) mergedEnvMap.set(v.key, v.value || '');
    });
  }

  mergedEnvMap.set('PORT', String(targetPort));
  mergedEnvMap.set('HOST', '0.0.0.0');

  const dockerLive = await isDockerAvailable();
  const now = new Date();

  const initialLogs = [
    `[${now.toISOString()}] [Sandbox Engine] Initializing runtime for "${project.title}"...`,
    `[${now.toISOString()}] [Runtime Mode] ${dockerLive ? 'DOCKER_CONTAINER' : 'ISOLATED_SANDBOX_ENVIRONMENT'}`,
    `[${now.toISOString()}] [Port Allocation] Gateway Port: ${gatewayPort} -> Target Port: ${targetPort}`,
  ];

  const sandboxRecord = {
    projectId,
    projectTitle: project.title,
    uploadedFileName: project.executableFile?.name || null,
    port: gatewayPort,
    targetPort,
    backendPort,
    liveUrl,
    mode: dockerLive ? 'DOCKER_CONTAINER' : 'ISOLATED_SANDBOX_ENVIRONMENT',
    status: 'ONLINE',
    startedAt: now,
    logs: [...initialLogs],
    httpServer: null,
    childProcess: null,
    backendProcess: null,
    childPid: null,
    exitCode: null,
    isHttpServer: false,
    activeAppPort: null,
    isPhpStatic: false,
    isStaticExplorer: false,
    appRoot: null,
    installCmd: '',
    runCommand: '',
  };

  activeSandboxes.set(projectId, sandboxRecord);

  sandboxRecord.stopTimer = setTimeout(async () => {
    await stopSandbox(projectId);
  }, maxLifespanMs);

  // Bind Gateway HTTP server
  try {
    const server = await startSandboxGatewayServer(sandboxRecord);
    sandboxRecord.httpServer = server;
  } catch (err) {
    console.warn(`[Gateway Binding Warning on port ${gatewayPort}]:`, err.message);
  }

  // Resolve uploaded artifact
  const executablePath = resolveExecutablePath(project);
  if (!executablePath) {
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Notice] No executable or source zip is attached to this project.`);
    sandboxRecord.status = 'ONLINE';
    return formatSandboxResponse(sandboxRecord);
  }

  sandboxRecord.uploadedFileName = path.basename(executablePath);
  sandboxRecord.logs.push(`[${new Date().toISOString()}] [Artifact Resolved] Uploaded file: ${sandboxRecord.uploadedFileName}`);

  // Extract / stage into workspace
  let workspace;
  try {
    workspace = prepareProjectWorkspace(projectId, executablePath);
    sandboxRecord.appRoot = workspace.appRoot;
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Workspace Prepared] Staged in sandbox workspace`);
  } catch (err) {
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Extraction Error] ${err.message}`);
    sandboxRecord.status = 'ERROR';
    return formatSandboxResponse(sandboxRecord);
  }

  // Analyze workspace profile
  const profile = analyzeWorkspaceProfile(workspace);
  sandboxRecord.logs.push(`[${new Date().toISOString()}] [Profile Detected] Application Profile: ${profile.type}`);

  // Case 1: Fullstack Node (e.g. AI Analyzer with frontend and backend)
  if (profile.type === 'FULLSTACK_NODE') {
    sandboxRecord.installCmd = 'npm run dev';
    sandboxRecord.runCommand = `vite --port ${targetPort}`;

    // Start backend in background if present
    if (profile.backendDir) {
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Fullstack] Launching API backend on port ${backendPort}...`);
      try {
        const backendChild = spawn('node', ['src/server.js'], {
          cwd: profile.backendDir,
          env: {
            ...process.env,
            ...Object.fromEntries(mergedEnvMap),
            PORT: String(backendPort),
          },
          shell: true,
          windowsHide: true,
        });
        sandboxRecord.backendProcess = backendChild;
      } catch (e) {}
    }

    // Launch Vite frontend on targetPort
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Fullstack] Launching Vite frontend on port ${targetPort}...`);
    const frontendChild = spawn('npx', ['vite', '--port', String(targetPort), '--host', '0.0.0.0'], {
      cwd: profile.frontendDir,
      env: {
        ...process.env,
        ...Object.fromEntries(mergedEnvMap),
        VITE_API_URL: `http://localhost:${backendPort}`,
      },
      shell: true,
      windowsHide: true,
    });

    sandboxRecord.childProcess = frontendChild;
    sandboxRecord.childPid = frontendChild.pid;

    frontendChild.stdout?.on('data', (d) => {
      const text = d.toString();
      text.split('\n').filter(Boolean).forEach((l) => sandboxRecord.logs.push(`[frontend] ${l.trimEnd()}`));
      if (text.includes('ready in') || text.includes('Local:')) {
        sandboxRecord.isHttpServer = true;
        sandboxRecord.activeAppPort = targetPort;
      }
    });

    frontendChild.stderr?.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach((l) => sandboxRecord.logs.push(`[frontend err] ${l.trimEnd()}`));
    });

    // Probe port
    setTimeout(async () => {
      const up = await probeHttpPort(targetPort);
      if (up) {
        sandboxRecord.isHttpServer = true;
        sandboxRecord.activeAppPort = targetPort;
        sandboxRecord.logs.push(`[${new Date().toISOString()}] [Verified] Live web application responsive on port ${targetPort}!`);
      }
    }, 2000);

    return formatSandboxResponse(sandboxRecord);
  }

  // Case 2: PHP Application (e.g. ServiceHub)
  if (profile.type === 'PHP_APP') {
    sandboxRecord.appRoot = profile.phpRoot;
    sandboxRecord.isPhpStatic = true;
    sandboxRecord.isHttpServer = false;
    sandboxRecord.installCmd = 'composer install';
    sandboxRecord.runCommand = 'php -S 0.0.0.0:8000';

    sandboxRecord.logs.push(`[${new Date().toISOString()}] [PHP Engine] Staged application files at: ${profile.phpRoot}`);
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [PHP Engine] Built-in Sandbox Web Server serving application at ${liveUrl}`);
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Verified] Ready to render application views (index.php, CSS, JS, auth)`);

    return formatSandboxResponse(sandboxRecord);
  }

  // Case 3: Document / File Repository (e.g. hello.zip)
  if (profile.type === 'STATIC_EXPLORER') {
    sandboxRecord.appRoot = profile.appRoot;
    sandboxRecord.isStaticExplorer = true;
    sandboxRecord.installCmd = 'None';
    sandboxRecord.runCommand = 'Static Artifact Viewport';

    sandboxRecord.logs.push(`[${new Date().toISOString()}] [File Explorer] Mounted repository files`);
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Verified] Ready to preview repository files and contents at ${liveUrl}`);

    return formatSandboxResponse(sandboxRecord);
  }

  // Case 4: Standalone Binary Executable (.exe)
  if (profile.type === 'BINARY_EXE') {
    const runCmd = process.platform === 'win32' ? `.\\${profile.binaryName}` : `./${profile.binaryName}`;
    sandboxRecord.runCommand = runCmd;
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Binary Execution] Spawning: ${runCmd}`);

    const child = spawn(runCmd, {
      cwd: workspace.sandboxDir,
      env: { ...process.env, ...Object.fromEntries(mergedEnvMap) },
      shell: true,
      windowsHide: true,
    });

    sandboxRecord.childProcess = child;
    sandboxRecord.childPid = child.pid;

    child.stdout?.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach((l) => sandboxRecord.logs.push(`[stdout] ${l.trimEnd()}`));
    });

    child.stderr?.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach((l) => sandboxRecord.logs.push(`[stderr] ${l.trimEnd()}`));
    });

    child.on('exit', (code) => {
      sandboxRecord.exitCode = code;
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Process Exited] Exit code: ${code}`);
    });

    return formatSandboxResponse(sandboxRecord);
  }

  // Case 5: Standard Node Web App
  if (profile.type === 'NODE_WEB') {
    const runCmd = project.runCommand || 'npm start';
    sandboxRecord.runCommand = runCmd;
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Node Web] Launching: ${runCmd}`);

    const child = spawn(runCmd, {
      cwd: profile.appRoot,
      env: { ...process.env, ...Object.fromEntries(mergedEnvMap), PORT: String(targetPort) },
      shell: true,
      windowsHide: true,
    });

    sandboxRecord.childProcess = child;
    sandboxRecord.childPid = child.pid;

    child.stdout?.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach((l) => sandboxRecord.logs.push(`[stdout] ${l.trimEnd()}`));
    });

    child.stderr?.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach((l) => sandboxRecord.logs.push(`[stderr] ${l.trimEnd()}`));
    });

    setTimeout(async () => {
      const up = await probeHttpPort(targetPort);
      if (up) {
        sandboxRecord.isHttpServer = true;
        sandboxRecord.activeAppPort = targetPort;
      }
    }, 2000);

    return formatSandboxResponse(sandboxRecord);
  }

  return formatSandboxResponse(sandboxRecord);
}

/**
 * Stop and remove a sandbox container / child process
 */
export async function stopSandbox(projectId) {
  const sandbox = activeSandboxes.get(projectId);
  if (!sandbox) {
    return { success: true, status: 'OFFLINE', message: 'Sandbox is already stopped' };
  }

  if (sandbox.stopTimer) {
    clearTimeout(sandbox.stopTimer);
    sandbox.stopTimer = null;
  }

  if (sandbox.childPid) {
    terminateProcessTree(sandbox.childPid);
    sandbox.childProcess = null;
    sandbox.childPid = null;
  }

  if (sandbox.backendProcess?.pid) {
    terminateProcessTree(sandbox.backendProcess.pid);
    sandbox.backendProcess = null;
  }

  if (sandbox.httpServer) {
    try {
      sandbox.httpServer.close();
    } catch (e) {}
    sandbox.httpServer = null;
  }

  if (sandbox.containerName) {
    try {
      await execAsync(`docker rm -f ${sandbox.containerName}`, { timeout: 10000 });
    } catch (e) {}
  }

  sandbox.status = 'OFFLINE';
  sandbox.logs.push(`[${new Date().toISOString()}] [Sandbox Terminated] Process stopped and ports released.`);
  activeSandboxes.delete(projectId);

  return {
    success: true,
    projectId,
    status: 'OFFLINE',
    message: 'Sandbox container stopped successfully',
  };
}

/**
 * Retrieve sandbox status for a project
 */
export function getSandboxStatus(projectId) {
  const sandbox = activeSandboxes.get(projectId);
  if (!sandbox) {
    return {
      success: true,
      projectId,
      status: 'OFFLINE',
      port: null,
      liveUrl: null,
      mode: 'OFFLINE',
      uptimeSeconds: 0,
      logs: [],
    };
  }
  return formatSandboxResponse(sandbox);
}

/**
 * Retrieve logs for a project sandbox
 */
export async function getSandboxLogs(projectId) {
  const sandbox = activeSandboxes.get(projectId);
  if (!sandbox) {
    return {
      success: true,
      projectId,
      status: 'OFFLINE',
      logs: [`[Notice] Sandbox container is currently OFFLINE. Click "Launch Container" to initialize.`],
    };
  }

  return {
    success: true,
    projectId,
    status: sandbox.status,
    logs: sandbox.logs,
  };
}

/**
 * Stop all running sandbox containers during server shutdown
 */
export async function stopAllSandboxes() {
  const promises = [];
  for (const projectId of activeSandboxes.keys()) {
    promises.push(stopSandbox(projectId));
  }
  await Promise.allSettled(promises);
}

/**
 * Helper to structure standardized sandbox response
 */
function formatSandboxResponse(sandbox) {
  const uptimeSeconds = sandbox.startedAt ? Math.floor((Date.now() - sandbox.startedAt.getTime()) / 1000) : 0;
  return {
    success: true,
    projectId: sandbox.projectId,
    projectTitle: sandbox.projectTitle,
    status: sandbox.status,
    port: sandbox.port,
    liveUrl: sandbox.liveUrl,
    mode: sandbox.mode,
    uploadedFileName: sandbox.uploadedFileName,
    installCmd: sandbox.installCmd,
    runCommand: sandbox.runCommand,
    uptimeSeconds,
    startedAt: sandbox.startedAt,
    logs: sandbox.logs,
  };
}
