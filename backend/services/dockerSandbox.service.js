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
/**
 * Find an available TCP port on the host system within a specified range
 */
async function findAvailablePort(startPort = 3001, endPort = 3100) {
  const isPortTaken = (port) => {
    return new Promise((resolve) => {
      // Check in-memory registry first
      for (const sandbox of activeSandboxes.values()) {
        if ((sandbox.port === port || sandbox.targetPort === port || sandbox.activeAppPort === port) && sandbox.status !== 'OFFLINE') {
          return resolve(true);
        }
      }

      // Check TCP socket availability on OS
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
 * Terminate a process and all its child processes cleanly (cross-platform)
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
 * Probe a TCP port or HTTP endpoint to check if an application web server is responsive
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
        res.resume(); // consume response data to free up memory
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
 * Resolve the local path of the uploaded project executable or archive file
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
 * Locate the primary runnable directory inside an extracted workspace
 */
function findRunnableSubdir(rootDir) {
  const isRunnable = (dir) => {
    return (
      fs.existsSync(path.join(dir, 'package.json')) ||
      fs.existsSync(path.join(dir, 'requirements.txt')) ||
      fs.existsSync(path.join(dir, 'composer.json')) ||
      fs.existsSync(path.join(dir, 'index.php')) ||
      fs.existsSync(path.join(dir, 'main.py')) ||
      fs.existsSync(path.join(dir, 'app.py'))
    );
  };

  if (isRunnable(rootDir)) return rootDir;

  try {
    const entries = fs.readdirSync(rootDir);
    // Priority order for candidate subdirectories
    const preferred = ['backend', 'server', 'service-hub', 'app', 'src', 'frontend'];
    for (const name of preferred) {
      const candidate = path.join(rootDir, name);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory() && isRunnable(candidate)) {
        return candidate;
      }
    }

    for (const entry of entries) {
      const sub = path.join(rootDir, entry);
      if (fs.statSync(sub).isDirectory() && isRunnable(sub)) {
        return sub;
      }
    }
  } catch (e) {}

  return rootDir;
}

/**
 * Prepare an isolated sandbox workspace for the project:
 * - Unzips project archive into sandbox/src
 * - Or copies standalone binary .exe into sandbox/src
 */
function prepareProjectWorkspace(projectId, archiveOrExePath) {
  const sandboxDir = path.resolve('sandboxes', projectId);
  if (fs.existsSync(sandboxDir)) {
    try {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
    } catch (e) {}
  }
  fs.mkdirSync(sandboxDir, { recursive: true });

  const fileName = path.basename(archiveOrExePath);
  const ext = path.extname(archiveOrExePath).toLowerCase();
  const isZip = ext === '.zip';

  if (isZip) {
    const zip = new AdmZip(archiveOrExePath);
    zip.extractAllTo(sandboxDir, true);

    // Detect if archive extracted into a single wrapper folder
    const entries = fs.readdirSync(sandboxDir);
    let appRoot = sandboxDir;
    if (entries.length === 1) {
      const single = path.join(sandboxDir, entries[0]);
      if (fs.statSync(single).isDirectory()) {
        appRoot = single;
      }
    }

    // Intelligently find directory with package.json / requirements / index.php
    appRoot = findRunnableSubdir(appRoot);

    return { sandboxDir, appRoot, isBinary: false, binaryName: null };
  }

  // Standalone executable binary (.exe or other)
  const destPath = path.join(sandboxDir, fileName);
  fs.copyFileSync(archiveOrExePath, destPath);
  return { sandboxDir, appRoot: sandboxDir, isBinary: true, binaryName: fileName, binaryPath: destPath };
}

/**
 * Retrieve and deduce all execution commands strictly from project details
 */
function extractProjectCommands(project, workspace) {
  let installCmd = (project.installCmd || '').trim();
  let runCommand = (project.runCommand || '').trim();

  // If commands are not directly stored on project root, check aiEvaluation.RUN_COMMANDS
  const aiCommands = Array.isArray(project.aiEvaluation?.RUN_COMMANDS)
    ? project.aiEvaluation.RUN_COMMANDS.filter(Boolean)
    : [];

  if (!installCmd && aiCommands.length > 1) {
    const candidate = aiCommands[0].trim();
    if (/^(npm|yarn|pnpm|pip|composer)\s+(install|i|add)/i.test(candidate)) {
      installCmd = candidate;
    }
  }

  if (!runCommand && aiCommands.length > 0) {
    const candidate = aiCommands.length > 1 ? aiCommands[1].trim() : aiCommands[0].trim();
    if (!/^(npm|yarn|pnpm|pip|composer)\s+(install|i|add)/i.test(candidate)) {
      runCommand = candidate;
    }
  }

  // If this is a standalone binary executable (.exe)
  if (workspace.isBinary && workspace.binaryName) {
    if (!runCommand) {
      runCommand = process.platform === 'win32'
        ? `.\\${workspace.binaryName}`
        : `./${workspace.binaryName}`;
    }
    return { installCmd: '', runCommand };
  }

  // Check filesystem markers in appRoot for intelligent fallbacks if empty
  const appRoot = workspace.appRoot;
  if (!installCmd && appRoot && fs.existsSync(appRoot)) {
    if (fs.existsSync(path.join(appRoot, 'package.json'))) {
      installCmd = 'npm install';
    } else if (fs.existsSync(path.join(appRoot, 'requirements.txt'))) {
      installCmd = 'pip install -r requirements.txt';
    } else if (fs.existsSync(path.join(appRoot, 'composer.json'))) {
      installCmd = 'composer install';
    }
  }

  if (!runCommand && appRoot && fs.existsSync(appRoot)) {
    if (fs.existsSync(path.join(appRoot, 'package.json'))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
        if (pkg.scripts?.dev) {
          runCommand = 'npm run dev';
        } else if (pkg.scripts?.start) {
          runCommand = 'npm start';
        } else if (pkg.main) {
          runCommand = `node ${pkg.main}`;
        } else {
          runCommand = 'node index.js';
        }
      } catch (e) {
        runCommand = 'npm start';
      }
    } else if (fs.existsSync(path.join(appRoot, 'main.py'))) {
      runCommand = 'python main.py';
    } else if (fs.existsSync(path.join(appRoot, 'app.py'))) {
      runCommand = 'python app.py';
    } else if (fs.existsSync(path.join(appRoot, 'index.php'))) {
      runCommand = 'php -S 0.0.0.0:8000';
    }
  }

  return { installCmd, runCommand };
}

/**
 * Render the live terminal and diagnostics viewport for applications, binaries, and build steps
 */
function renderDiagnosticTerminalHtml(sandbox) {
  const title = sandbox.projectTitle || 'Project Vault Sandbox';
  const binaryOrArchive = sandbox.uploadedFileName || 'No artifact attached';
  const installCmd = sandbox.installCmd || '(None)';
  const runCmd = sandbox.runCommand || '(None)';
  const status = sandbox.status;
  const isHttp = sandbox.isHttpServer;
  const activePort = sandbox.activeAppPort || sandbox.targetPort || sandbox.port;
  const pid = sandbox.childPid ? `PID ${sandbox.childPid}` : 'None';
  const exitCode = sandbox.exitCode !== null ? `Exit Code ${sandbox.exitCode}` : 'Active';

  // Sanitize logs for HTML output
  const rawLogs = sandbox.logs.slice(-100).join('\n');
  const safeLogs = rawLogs
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

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
    .brand-title { font-size: 15px; font-weight: 800; color: #f8fafc; }
    .brand-sub { font-size: 11px; color: #64748b; font-family: monospace; }
    
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; font-family: monospace; }
    .badge-running { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; }
    .badge-building { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; }
    .badge-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; }
    .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 1.8s infinite; }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
    
    .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
    .spec-card { background: #0d1424; border: 1px solid #1e293b; border-radius: 10px; padding: 10px 14px; }
    .spec-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .spec-val { font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: monospace; margin-top: 3px; word-break: break-all; }
    
    .terminal-container { flex: 1; min-height: 380px; background: #020617; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
    .terminal-header { background: #0b1120; border-bottom: 1px solid #1e293b; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b; font-family: monospace; }
    .terminal-dots { display: flex; gap: 6px; }
    .terminal-dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }
    
    .terminal-body { flex: 1; padding: 14px; font-family: 'Consolas', 'Courier New', Courier, monospace; font-size: 12px; line-height: 1.6; color: #38bdf8; overflow-y: auto; white-space: pre-wrap; word-break: break-all; max-height: 480px; }
    .terminal-cursor { display: inline-block; width: 8px; height: 14px; background: #38bdf8; vertical-align: text-bottom; animation: blink 1s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    
    .actions-footer { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #475569; padding-top: 10px; border-top: 1px solid #1e293b; flex-wrap: wrap; gap: 8px; }
    .btn { background: #1e293b; color: #f1f5f9; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-section">
      <div class="brand-icon">⚡</div>
      <div>
        <div class="brand-title">${title}</div>
        <div class="brand-sub">SANDBOX RUNTIME • ${sandbox.mode}</div>
      </div>
    </div>
    <div>
      <span class="status-badge ${status === 'ONLINE' ? 'badge-running' : status === 'STARTING' ? 'badge-building' : 'badge-error'}">
        <span class="pulse-dot"></span>
        <span>${status === 'ONLINE' ? (isHttp ? `ONLINE (WEB SERVER PORT ${activePort})` : `ONLINE (CLI EXECUTABLE)`) : status}</span>
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
      <div class="terminal-dots">
        <span class="terminal-dot dot-red"></span>
        <span class="terminal-dot dot-yellow"></span>
        <span class="terminal-dot dot-green"></span>
      </div>
      <div>LIVE EXECUTION CONSOLE & DIAGNOSTICS</div>
      <div>PORT: ${sandbox.port}</div>
    </div>
    <div id="terminal-body" class="terminal-body">${safeLogs}
<span class="terminal-cursor"></span></div>
  </div>

  <div class="actions-footer">
    <div>Live stdout and stderr streaming directly from backend sandbox process.</div>
    <div style="display: flex; gap: 8px;">
      <button class="btn" onclick="copyLogs()">Copy Terminal Logs</button>
      <button class="btn" onclick="window.location.reload()">Reload Viewport</button>
    </div>
  </div>

  <script>
    const term = document.getElementById('terminal-body');
    if (term) term.scrollTop = term.scrollHeight;

    function copyLogs() {
      navigator.clipboard.writeText(term.innerText);
      alert('Terminal logs copied to clipboard.');
    }

    // Auto-refresh polling to detect when the project starts listening on a web server port
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
 * Start the Gateway HTTP Server on the assigned public port:
 * - If the project web application is listening on activeAppPort: reverse-proxies requests, stripping iframe security headers
 * - If the project is a CLI binary, compiling, or not serving HTTP: renders live diagnostic terminal view
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
        return res.end(JSON.stringify({
          isHttpServer: sandboxRecord.isHttpServer,
          activeAppPort: sandboxRecord.activeAppPort,
          status: sandboxRecord.status,
          childPid: sandboxRecord.childPid,
          exitCode: sandboxRecord.exitCode,
          logsCount: sandboxRecord.logs.length,
        }));
      }

      // If the target web server is active, reverse-proxy request to it
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
          // Strip frame-blocking headers so iframe preview renders without errors
          delete proxyHeaders['x-frame-options'];
          delete proxyHeaders['content-security-policy'];
          delete proxyHeaders['frame-options'];

          res.writeHead(proxyRes.statusCode, proxyHeaders);
          proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (err) => {
          // If the target port failed momentarily, show diagnostic terminal
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(renderDiagnosticTerminalHtml(sandboxRecord));
        });

        return req.pipe(proxyReq, { end: true });
      }

      // Otherwise, serve the Live Executable Terminal and Diagnostics Viewport
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
 *
 * @param {Object} project - MongoDB Project document
 * @param {Array} customEnvVars - Optional custom environment variable overrides
 * @returns {Promise<Object>} Sandbox status and diagnostic details
 */
export async function startSandbox(project, customEnvVars = []) {
  const projectId = project._id.toString();

  // If already running, clean up previous instance
  if (activeSandboxes.has(projectId)) {
    await stopSandbox(projectId);
  }

  const gatewayPort = await findAvailablePort(3001, 3100);
  const targetPort = await findAvailablePort(gatewayPort + 10, 3200);
  const baseUrl = process.env.DOCKER_SANDBOX_BASE_URL || 'http://localhost';
  const liveUrl = `${baseUrl}:${gatewayPort}`;
  const maxLifespanMs = Number(process.env.DOCKER_SANDBOX_MAX_LIFESPAN_MS) || 600000; // 10 minutes

  // Merge environment variables
  const mergedEnvMap = new Map();
  if (Array.isArray(project.envVariables)) {
    project.envVariables.forEach(v => {
      if (v?.key) mergedEnvMap.set(v.key, v.value || '');
    });
  }
  if (Array.isArray(customEnvVars)) {
    customEnvVars.forEach(v => {
      if (v?.key) mergedEnvMap.set(v.key, v.value || '');
    });
  }

  // Force port configuration to target port
  mergedEnvMap.set('PORT', String(targetPort));
  mergedEnvMap.set('HOST', '0.0.0.0');

  const envArray = Array.from(mergedEnvMap.entries()).map(([k, v]) => ({ key: k, value: v }));
  const dockerLive = await isDockerAvailable();

  const now = new Date();
  const initialLogs = [
    `[${now.toISOString()}] [Sandbox Initializer] Starting execution runtime for "${project.title}"...`,
    `[${now.toISOString()}] [Isolation Engine] Mode: ${dockerLive ? 'DOCKER_CONTAINER' : 'PROCESS_SANDBOX_ISOLATION'}`,
    `[${now.toISOString()}] [Network Bridge] Gateway Port: ${gatewayPort} -> Application Port: ${targetPort}`,
    `[${now.toISOString()}] [Environment] Injected ${envArray.length} environment variables into runtime`,
  ];

  const sandboxRecord = {
    projectId,
    projectTitle: project.title,
    uploadedFileName: project.executableFile?.name || null,
    port: gatewayPort,
    targetPort,
    liveUrl,
    mode: dockerLive ? 'DOCKER_CONTAINER' : 'PROCESS_SANDBOX_ISOLATION',
    status: 'STARTING',
    startedAt: now,
    logs: [...initialLogs],
    httpServer: null,
    childProcess: null,
    childPid: null,
    exitCode: null,
    isHttpServer: false,
    activeAppPort: null,
    stopTimer: null,
    installCmd: '',
    runCommand: '',
  };

  activeSandboxes.set(projectId, sandboxRecord);

  // Auto-termination timer
  sandboxRecord.stopTimer = setTimeout(async () => {
    console.log(`⏱️ [Docker Sandbox] Auto-terminating inactive container for project ${projectId}.`);
    await stopSandbox(projectId);
  }, maxLifespanMs);

  // Step 1: Start Gateway HTTP Server immediately so preview viewport can connect
  try {
    const server = await startSandboxGatewayServer(sandboxRecord);
    sandboxRecord.httpServer = server;
  } catch (err) {
    console.warn(`[Sandbox Gateway Binding Warning on port ${gatewayPort}]:`, err.message);
  }

  // Step 2: Resolve uploaded executable / archive file
  const executablePath = resolveExecutablePath(project);
  if (!executablePath) {
    const errorMsg = `[Sandbox Diagnostic Warning] No uploaded executable (.exe) or archive (.zip) was found on disk for this project.`;
    sandboxRecord.logs.push(`[${new Date().toISOString()}] ${errorMsg}`);
    sandboxRecord.logs.push(`[${new Date().toISOString()}] Staged path check failed. Please ensure an executable or source zip is uploaded.`);
    sandboxRecord.status = 'ONLINE';
    return formatSandboxResponse(sandboxRecord);
  }

  sandboxRecord.uploadedFileName = path.basename(executablePath);
  sandboxRecord.logs.push(`[${new Date().toISOString()}] [Artifact Resolved] Uploaded file: ${sandboxRecord.uploadedFileName}`);

  // Step 3: Extract or stage in isolated workspace
  let workspace;
  try {
    workspace = prepareProjectWorkspace(projectId, executablePath);
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Workspace Prepared] Staged at: ${workspace.appRoot}`);
  } catch (err) {
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Extraction Error] ${err.message}`);
    sandboxRecord.status = 'ERROR';
    return formatSandboxResponse(sandboxRecord);
  }

  // Step 4: Extract execution commands strictly from project details
  const { installCmd, runCommand } = extractProjectCommands(project, workspace);
  sandboxRecord.installCmd = installCmd;
  sandboxRecord.runCommand = runCommand;

  sandboxRecord.logs.push(`[${new Date().toISOString()}] [Project Details] Install Command: ${installCmd || '(None specified)'}`);
  sandboxRecord.logs.push(`[${new Date().toISOString()}] [Project Details] Run Command: ${runCommand || '(None specified)'}`);

  if (!runCommand) {
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Diagnostic Error] No run command could be identified for this project.`);
    sandboxRecord.status = 'ERROR';
    return formatSandboxResponse(sandboxRecord);
  }

  // Step 5: Execute application
  // If Docker CLI is available, run containerized
  if (dockerLive) {
    try {
      const containerName = `pv-box-${projectId.slice(-6)}-${Date.now()}`;
      sandboxRecord.containerName = containerName;
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Docker CLI] Launching container ${containerName}...`);

      const envFlags = envArray.map(e => `-e "${e.key}=${String(e.value).replace(/"/g, '\\"')}"`).join(' ');
      const dockerRunCmd = `docker run -d --name ${containerName} -p ${targetPort}:${targetPort} -v "${workspace.appRoot}:/app" -w /app ${envFlags} node:18-alpine sh -c "${runCommand.replace(/"/g, '\\"')}"`;

      const { stdout } = await execAsync(dockerRunCmd, { timeout: 30000 });
      sandboxRecord.containerId = stdout.trim();
      sandboxRecord.status = 'ONLINE';
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Docker Started] Container ID: ${sandboxRecord.containerId.slice(0, 12)}`);

      // Monitor container port
      setTimeout(async () => {
        const responsive = await probeHttpPort(targetPort);
        if (responsive) {
          sandboxRecord.isHttpServer = true;
          sandboxRecord.activeAppPort = targetPort;
          sandboxRecord.logs.push(`[${new Date().toISOString()}] [Healthcheck] Container web server verified active on port ${targetPort}!`);
        }
      }, 3000);

      return formatSandboxResponse(sandboxRecord);
    } catch (dockerErr) {
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Docker Notice] Container spawn failed (${dockerErr.message}). Switching to isolated process sandbox.`);
      sandboxRecord.mode = 'PROCESS_SANDBOX_ISOLATION';
    }
  }

  // Process Sandbox Isolation Execution Flow
  (async () => {
    // 5A: Execute dependency installation command if present
    if (installCmd) {
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Dependency Resolver] Executing: ${installCmd}...`);
      try {
        await new Promise((resolve) => {
          const installChild = exec(installCmd, {
            cwd: workspace.appRoot,
            env: { ...process.env, ...Object.fromEntries(mergedEnvMap) },
            timeout: 120000,
          });

          installChild.stdout?.on('data', (d) => {
            const lines = d.toString().split('\n').filter(Boolean);
            lines.forEach(l => sandboxRecord.logs.push(`[npm] ${l.trim()}`));
          });

          installChild.stderr?.on('data', (d) => {
            const lines = d.toString().split('\n').filter(Boolean);
            lines.forEach(l => sandboxRecord.logs.push(`[npm warn] ${l.trim()}`));
          });

          installChild.on('close', (code) => {
            sandboxRecord.logs.push(`[${new Date().toISOString()}] [Dependency Resolver] Finished (Exit Code: ${code})`);
            resolve();
          });
        });
      } catch (err) {
        sandboxRecord.logs.push(`[${new Date().toISOString()}] [Dependency Resolver Warning] ${err.message}`);
      }
    }

    // 5B: Execute project run command / executable
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Application Launch] Executing: "${runCommand}" in ${workspace.appRoot}`);

    const spawnEnv = {
      ...process.env,
      ...Object.fromEntries(mergedEnvMap),
      PORT: String(targetPort),
    };

    const child = spawn(runCommand, {
      cwd: workspace.appRoot,
      env: spawnEnv,
      shell: true,
      windowsHide: true,
    });

    sandboxRecord.childProcess = child;
    sandboxRecord.childPid = child.pid;
    sandboxRecord.status = 'ONLINE';
    sandboxRecord.logs.push(`[${new Date().toISOString()}] [Process Spawned] PID: ${child.pid}`);

    child.stdout?.on('data', (data) => {
      const text = data.toString();
      const lines = text.split('\n').filter(Boolean);
      lines.forEach((l) => {
        sandboxRecord.logs.push(`[stdout] ${l.trimEnd()}`);
      });

      // Check if stdout contains an explicit port announcement
      const portMatch = text.match(/(?:localhost|127\.0\.0\.1|port)\s*[:=]?\s*(\d{4,5})/i);
      if (portMatch && !sandboxRecord.isHttpServer) {
        const detectedPort = Number(portMatch[1]);
        if (detectedPort > 1024 && detectedPort < 65535) {
          sandboxRecord.activeAppPort = detectedPort;
          sandboxRecord.isHttpServer = true;
          sandboxRecord.logs.push(`[${new Date().toISOString()}] [Auto-Discovery] Detected application listening on port ${detectedPort}!`);
        }
      }
    });

    child.stderr?.on('data', (data) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach((l) => {
        sandboxRecord.logs.push(`[stderr] ${l.trimEnd()}`);
      });
    });

    child.on('error', (err) => {
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Diagnostic Error] Process failed to execute: ${err.message}`);
      sandboxRecord.status = 'ERROR';
    });

    child.on('exit', (code, signal) => {
      sandboxRecord.exitCode = code;
      sandboxRecord.logs.push(`[${new Date().toISOString()}] [Process Exited] Exit code: ${code}, signal: ${signal || 'none'}`);
      if (code !== 0 && code !== null) {
        sandboxRecord.logs.push(`[${new Date().toISOString()}] [Diagnostic Notice] Executable returned non-zero exit code ${code}. Check stderr logs above.`);
      }
    });

    // Probe the assigned target port for web server availability
    let attempts = 0;
    const probeInterval = setInterval(async () => {
      attempts++;
      if (sandboxRecord.isHttpServer || attempts > 15 || sandboxRecord.exitCode !== null) {
        clearInterval(probeInterval);
        return;
      }

      const isUp = await probeHttpPort(targetPort);
      if (isUp) {
        clearInterval(probeInterval);
        sandboxRecord.isHttpServer = true;
        sandboxRecord.activeAppPort = targetPort;
        sandboxRecord.logs.push(`[${new Date().toISOString()}] [Diagnostic Healthcheck] Web server responsive on http://127.0.0.1:${targetPort}!`);
      }
    }, 1000);
  })();

  sandboxRecord.status = 'ONLINE';
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

  // Terminate child process tree
  if (sandbox.childPid) {
    terminateProcessTree(sandbox.childPid);
    sandbox.childProcess = null;
    sandbox.childPid = null;
  }

  // Close Gateway HTTP server
  if (sandbox.httpServer) {
    try {
      sandbox.httpServer.close();
    } catch (e) {}
    sandbox.httpServer = null;
  }

  // If Docker container was running, stop and remove it
  if (sandbox.containerName) {
    try {
      await execAsync(`docker rm -f ${sandbox.containerName}`, { timeout: 10000 });
    } catch (e) {}
  }

  sandbox.status = 'OFFLINE';
  sandbox.logs.push(`[${new Date().toISOString()}] [Sandbox Terminated] Sandbox process stopped and ports released.`);
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
