// ═══════════════════════════════════════════════════════════
//  CYBERSIM APP.JS — Full Application Logic
//  Mini Project CS16 | DY Patil University 2025-26
// ═══════════════════════════════════════════════════════════

// ─── GLOBAL STATE ───────────────────────────────────────────
const STATE = {
  // Scores & metrics
  socScore:        0,
  ptScore:         0,
  alertsAnalyzed:  0,
  alertsCorrect:   0,
  mttdList:        [],
  tasksCompleted:  0,

  // SOC module
  currentAlert:    null,
  alertStartTime:  null,
  alertQueue:      [],
  alertsSpawned:   0,
  loggedAlerts:    [],

  // Pentest module
  currentScenario: null,
  ptPhasesDone:    0,
  ptPhases:        { recon: false, scan: false, vuln: false, exploit: false, post: false, report: false },
  consoleHistory:  [],
  consoleCursor:   0,

  // Chat
  chatHistory:     [],
  chatOpen:        false,

  // Settings
  apiKey:          '',
  userName:        'Analyst',
  soundEnabled:    true,
  autoAlert:       false,
  autoAlertTimer:  null,

  // Leaderboard
  leaderboard:     JSON.parse(JSON.stringify(LEADERBOARD_DEFAULT)),
};

// ─── BOOT SEQUENCE ──────────────────────────────────────────
const BOOT_MSGS = [
  '> Booting CyberSim v2.0.1 — CS16 Edition...',
  '> Loading threat intelligence database [ALERTS: 10] ...... OK',
  '> Loading pentest scenario engine [TARGETS: 2] ......... OK',
  '> MITRE ATT&CK v14.1 framework imported ................ OK',
  '> Claude AI mentor module initialized .................. OK',
  '> All systems nominal. Welcome, Analyst.',
];

window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  bootSequence();
  startClock();
});

function bootSequence() {
  let i = 0;
  function step() {
    if (i < BOOT_MSGS.length) {
      const el = document.getElementById('btl' + (i + 1));
      if (el) { el.textContent = BOOT_MSGS[i]; el.style.opacity = '1'; }
      const pct = Math.round(((i + 1) / BOOT_MSGS.length) * 100);
      document.getElementById('bootProgressBar').style.width = pct + '%';
      document.getElementById('bootPct').textContent = pct + '%';
      i++;
      setTimeout(step, i === 1 ? 300 : 420);
    } else {
      setTimeout(launchApp, 700);
    }
  }
  step();
}

function launchApp() {
  const boot = document.getElementById('bootScreen');
  boot.style.transition = 'opacity 0.6s ease';
  boot.style.opacity = '0';
  setTimeout(() => {
    boot.style.display = 'none';
    const app = document.getElementById('mainApp');
    app.classList.remove('app-hidden');
    app.style.opacity = '0';
    app.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => { app.style.opacity = '1'; });
    renderMitreGrid();
    renderLeaderboard();
    initRadarDots();
    // Show chat notification after 3s
    setTimeout(() => {
      document.getElementById('chatPulse').classList.add('active');
    }, 3000);
  }, 650);
}

function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('tbClock').textContent =
      now.toLocaleTimeString('en-US', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── NAVIGATION ─────────────────────────────────────────────
function nav(view) {
  // Update views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');

  // Update nav buttons
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-view="${view}"]`);
  if (btn) btn.classList.add('active');

  // Update topbar
  const topData = {
    dashboard:   ['COMMAND CENTER',    'Select your simulation role to begin'],
    soc:         ['SOC ANALYST',       'Alert triage · Incident classification · MTTD tracking'],
    pentest:     ['PENETRATION TESTER','Enumerate · Exploit · Report findings'],
    report:      ['PERFORMANCE REPORT','Your simulation metrics, grade, and AI feedback'],
    leaderboard: ['LEADERBOARD',       'Top performers in this simulation session'],
  };
  const [title, sub] = topData[view] || ['CYBERSIM', ''];
  document.getElementById('tbTitle').textContent = title;
  document.getElementById('tbSub').textContent   = sub;

  if (view === 'report')      renderReport();
  if (view === 'leaderboard') renderLeaderboard();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ─── DASHBOARD ──────────────────────────────────────────────
function renderMitreGrid() {
  const grid = document.getElementById('mitreGrid');
  if (!grid) return;
  grid.innerHTML = MITRE_TECHNIQUES.map(t => `
    <div class="mitre-tag" style="border-color:${t.color}20;background:${t.color}10">
      <span class="mt-id" style="color:${t.color}">${t.id}</span>
      <span class="mt-name">${t.name}</span>
      <span class="mt-tactic" style="color:${t.color}">${t.tactic}</span>
    </div>
  `).join('');
}

function initRadarDots() {
  const container = document.getElementById('radarDots');
  if (!container) return;
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('div');
    dot.className = 'rdot';
    const angle = Math.random() * 2 * Math.PI;
    const r = 20 + Math.random() * 70;
    dot.style.left = (50 + r * Math.cos(angle)) + '%';
    dot.style.top  = (50 + r * Math.sin(angle)) + '%';
    dot.style.animationDelay = (Math.random() * 2) + 's';
    container.appendChild(dot);
  }
}

function updateStats() {
  const acc = STATE.alertsAnalyzed > 0
    ? Math.round((STATE.alertsCorrect / STATE.alertsAnalyzed) * 100) : 0;
  const avgMttd = STATE.mttdList.length > 0
    ? Math.round(STATE.mttdList.reduce((a, b) => a + b, 0) / STATE.mttdList.length) : null;
  const total = STATE.socScore + STATE.ptScore;

  setEl('sc-alerts', STATE.alertsAnalyzed);
  setEl('sc-acc',    acc + '%');
  setEl('sc-tasks',  STATE.tasksCompleted + '/10');
  setEl('sc-mttd',   avgMttd !== null ? avgMttd + 's' : '--s');
  setEl('sc-total',  total);
  setEl('tbTotalScore', total);

  setWidth('sf-alerts', Math.min((STATE.alertsAnalyzed / 10) * 100, 100));
  setWidth('sf-acc',    acc);
  setWidth('sf-tasks',  (STATE.tasksCompleted / 10) * 100);
  setWidth('sf-mttd',   avgMttd !== null ? Math.max(0, 100 - (avgMttd / 60) * 100) : 0);
  setWidth('sf-total',  Math.min((total / 300) * 100, 100));

  setEl('socScoreDisplay', STATE.socScore);
  setEl('ptScoreDisplay',  STATE.ptScore);
  setEl('socAlertsDisplay', STATE.alertsAnalyzed);
  if (STATE.alertsAnalyzed > 0) setEl('socAccDisplay', acc + '%');
  setEl('ptPhasesDisplay', STATE.ptPhasesDone + '/6');

  // Update sidebar role
  const role = STATE.currentScenario ? 'Pen Tester Active' : STATE.alertsAnalyzed > 0 ? 'SOC Active' : 'No active session';
  setEl('sbRole', role);
  setEl('sbUsername', STATE.userName);
  const initials = STATE.userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AN';
  setEl('sbAvatar', initials);
}

function setEl(id, val)    { const e = document.getElementById(id); if (e) e.textContent = val; }
function setWidth(id, pct) { const e = document.getElementById(id); if (e) e.style.width = pct + '%'; }

// ─── SOC MODULE ─────────────────────────────────────────────
let alertTimerInterval = null;

function spawnAlert() {
  const alert = ALERTS[STATE.alertsSpawned % ALERTS.length];
  STATE.alertsSpawned++;

  // Remove empty state
  const feed = document.getElementById('alertFeed');
  const empty = feed.querySelector('.empty-feed');
  if (empty) empty.remove();

  // Create alert card
  const card = document.createElement('div');
  card.className = `alert-card sev-${alert.severity}`;
  card.id = 'acard-' + alert.id;
  card.setAttribute('data-severity', alert.severity);
  card.innerHTML = `
    <div class="ac-top">
      <span class="ac-id">${alert.id}</span>
      <span class="ac-sev ${alert.severity}">${alert.severity.toUpperCase()}</span>
      <span class="ac-time">${alert.time}</span>
    </div>
    <div class="ac-title">${alert.type}</div>
    <div class="ac-meta">${alert.src_ip} → ${alert.dst_ip} · ${alert.protocol}</div>
    <div class="ac-category">${alert.category} · ${alert.mitre.split(' ')[0]}</div>
  `;
  card.onclick = () => openAlert(alert, card);
  feed.insertBefore(card, feed.firstChild);

  // Update badge
  updateAlertCount();
  // Auto-select first
  openAlert(alert, card);

  const sev = alert.severity;
  toast(`New ${sev.toUpperCase()} alert: ${alert.type}`, sev === 'critical' ? 'error' : sev === 'high' ? 'warning' : 'info');
  playSound(sev === 'critical' || sev === 'high' ? 'alert_high' : 'alert_low');
}

function updateAlertCount() {
  const cards = document.querySelectorAll('.alert-card');
  setEl('alertCountBadge', cards.length + ' active');
}

function filterAlerts() {
  const filter = document.getElementById('alertSevFilter').value;
  document.querySelectorAll('.alert-card').forEach(c => {
    c.style.display = (filter === 'all' || c.getAttribute('data-severity') === filter) ? '' : 'none';
  });
}

function openAlert(alert, card) {
  // Highlight selected card
  document.querySelectorAll('.alert-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');

  STATE.currentAlert  = alert;
  STATE.alertStartTime = Date.now();

  // Start timer
  clearInterval(alertTimerInterval);
  alertTimerInterval = setInterval(() => {
    if (STATE.alertStartTime) {
      const elapsed = Math.round((Date.now() - STATE.alertStartTime) / 1000);
      setEl('invTimer', elapsed + 's');
    }
  }, 1000);

  // Render investigation workspace
  const body = document.getElementById('invBody');
  body.innerHTML = `
    <div class="inv-grid">
      <div class="inv-section">
        <div class="inv-lbl">ALERT INFORMATION</div>
        <div class="inv-table">
          <div class="invt-row"><span class="invt-key">Alert ID</span><span class="invt-val mono">${alert.id}</span></div>
          <div class="invt-row"><span class="invt-key">Type</span><span class="invt-val">${alert.type}</span></div>
          <div class="invt-row"><span class="invt-key">Category</span><span class="invt-val">${alert.category}</span></div>
          <div class="invt-row"><span class="invt-key">Severity</span><span class="invt-val"><span class="ac-sev ${alert.severity} inline">${alert.severity.toUpperCase()}</span></span></div>
          <div class="invt-row"><span class="invt-key">Source IP</span><span class="invt-val mono">${alert.src_ip}</span></div>
          <div class="invt-row"><span class="invt-key">Source Host</span><span class="invt-val mono">${alert.src_hostname}</span></div>
          <div class="invt-row"><span class="invt-key">Destination</span><span class="invt-val mono">${alert.dst_ip}</span></div>
          <div class="invt-row"><span class="invt-key">Protocol</span><span class="invt-val mono">${alert.protocol}</span></div>
          <div class="invt-row"><span class="invt-key">Date/Time</span><span class="invt-val mono">${alert.date} ${alert.time}</span></div>
          <div class="invt-row"><span class="invt-key">MITRE</span><span class="invt-val mitre-ref">${alert.mitre}</span></div>
        </div>
      </div>

      <div class="inv-section">
        <div class="inv-lbl">DESCRIPTION</div>
        <div class="inv-desc">${alert.description}</div>
      </div>

      <div class="inv-section">
        <div class="inv-lbl">INDICATORS OF COMPROMISE (IOCs)</div>
        <div class="inv-iocs">
          ${alert.indicators.map((ioc, i) => `<div class="ioc-item"><span class="ioc-num">${String(i+1).padStart(2,'0')}</span><span class="ioc-text">${ioc}</span></div>`).join('')}
        </div>
      </div>

      <div class="inv-section">
        <div class="inv-lbl">RAW LOG (SIEM)</div>
        <div class="inv-log">${alert.log}</div>
      </div>

      <div class="inv-section">
        <div class="inv-lbl">YOUR CLASSIFICATION</div>
        <div class="inv-classify-row">
          <button class="classify-btn tp" onclick="classifyAlert('tp')">
            <span class="cb-icon">🔴</span>
            <div>
              <div class="cb-label">TRUE POSITIVE</div>
              <div class="cb-sub">Confirmed malicious — escalate</div>
            </div>
          </button>
          <button class="classify-btn fp" onclick="classifyAlert('fp')">
            <span class="cb-icon">🟢</span>
            <div>
              <div class="cb-label">FALSE POSITIVE</div>
              <div class="cb-sub">Benign activity — close alert</div>
            </div>
          </button>
          <button class="classify-btn esc" onclick="classifyAlert('esc')">
            <span class="cb-icon">🟠</span>
            <div>
              <div class="cb-label">ESCALATE</div>
              <div class="cb-sub">Needs Tier 2 investigation</div>
            </div>
          </button>
        </div>
        <div id="classifyFeedback"></div>
      </div>
    </div>
  `;
}

function classifyAlert(choice) {
  const alert = STATE.currentAlert;
  if (!alert) return;

  clearInterval(alertTimerInterval);
  const elapsed = Math.round((Date.now() - STATE.alertStartTime) / 1000);
  STATE.mttdList.push(elapsed);
  STATE.alertsAnalyzed++;

  const isCorrect = (choice === alert.answer);
  const pts = isCorrect ? alert.points[alert.answer] : 0;
  if (isCorrect) STATE.alertsCorrect++;
  STATE.socScore += pts;
  STATE.tasksCompleted = Math.min(STATE.tasksCompleted + 1, 10);

  // Feedback
  const fb = document.getElementById('classifyFeedback');
  fb.innerHTML = `
    <div class="classify-result ${isCorrect ? 'correct' : 'wrong'}">
      <div class="cr-top">
        <span class="cr-verdict">${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}</span>
        <span class="cr-points">+${pts} pts</span>
        <span class="cr-time">Response time: ${elapsed}s</span>
      </div>
      <div class="cr-explanation">${isCorrect ? alert.explanation : alert.wrong_explanation}</div>
      <div class="cr-correct-action">Correct action: <strong>${alert.correct_action}</strong></div>
    </div>
  `;

  // Disable buttons
  document.querySelectorAll('.classify-btn').forEach(b => { b.disabled = true; b.style.opacity = '0.4'; });

  // Log to threat log
  addThreatLogEntry(alert, choice, isCorrect, pts, elapsed);

  // Mark alert card as done
  const card = document.getElementById('acard-' + alert.id);
  if (card) {
    card.classList.remove('selected');
    card.classList.add('resolved');
    card.style.opacity = '0.5';
  }

  setEl('invTimer', elapsed + 's');
  updateStats();
  playSound(isCorrect ? 'correct' : 'wrong');

  // Show SOC badge if not on SOC view
  if (!document.getElementById('view-soc').classList.contains('active')) {
    document.getElementById('socBadge').style.display = 'inline';
  }
}

function addThreatLogEntry(alert, choice, correct, pts, time) {
  const log = document.getElementById('threatLog');
  const empty = log.querySelector('.tl-empty');
  if (empty) empty.remove();

  const entry = document.createElement('div');
  entry.className = 'tl-entry ' + (correct ? 'tl-correct' : 'tl-wrong');
  entry.innerHTML = `
    <div class="tle-top">
      <span class="tle-id">${alert.id}</span>
      <span class="tle-pts ${correct ? 'good' : 'bad'}">${correct ? '+' + pts : '0'}</span>
    </div>
    <div class="tle-name">${alert.type}</div>
    <div class="tle-meta">${choice.toUpperCase()} · ${time}s · ${correct ? '✓ Correct' : '✗ Wrong'}</div>
  `;
  log.insertBefore(entry, log.firstChild);
}

function clearThreatLog() {
  document.getElementById('threatLog').innerHTML = '<div class="tl-empty">No entries yet</div>';
}

// ─── PENTEST MODULE ──────────────────────────────────────────
function loadPentestTarget() {
  const idx = Math.floor(Math.random() * PT_SCENARIOS.length);
  const sc   = PT_SCENARIOS[idx];
  STATE.currentScenario = sc;
  STATE.ptPhasesDone    = 0;
  STATE.ptPhases = { recon: false, scan: false, vuln: false, exploit: false, post: false, report: false };

  // Reset checklist
  ['recon','scan','vuln','exploit','post','report'].forEach(p => {
    const el = document.getElementById('ptck-' + p);
    const st = document.getElementById('ptcks-' + p);
    if (el) el.classList.remove('done');
    if (st) st.textContent = '○';
  });
  document.getElementById('btnGenReport').disabled = true;

  // Render target info
  document.getElementById('targetBody').innerHTML = `
    <div class="ti-header">
      <div class="ti-name">${sc.name}</div>
      <div class="ti-industry">${sc.industry}</div>
    </div>
    <div class="ti-table">
      <div class="tit-row"><span class="tit-k">IP Address</span><span class="tit-v mono">${sc.ip}</span></div>
      <div class="tit-row"><span class="tit-k">Domain</span><span class="tit-v mono">${sc.domain}</span></div>
      <div class="tit-row"><span class="tit-k">OS</span><span class="tit-v">${sc.os}</span></div>
      <div class="tit-row"><span class="tit-k">Web Server</span><span class="tit-v">${sc.web_server}</span></div>
      <div class="tit-row"><span class="tit-k">Scope</span><span class="tit-v">${sc.scope}</span></div>
      <div class="tit-row"><span class="tit-k">Authorization</span><span class="tit-v auth-ok">✓ ${sc.authorization}</span></div>
    </div>

    <div class="ti-section-lbl">OPEN SERVICES</div>
    <div class="ti-services">
      ${sc.services.map(s => `
        <div class="ti-service">
          <span class="ts-port">${s.port}</span>
          <span class="ts-state ${s.state}">${s.state.toUpperCase()}</span>
          <span class="ts-svc">${s.service}</span>
          <span class="ts-ver">${s.version}</span>
        </div>
      `).join('')}
    </div>

    <div class="ti-section-lbl">KNOWN VULNERABILITIES</div>
    <div class="ti-vulns">
      ${sc.vulns.map(v => `
        <div class="ti-vuln">
          <span class="tv-sev ${v.severity}">${v.severity.toUpperCase()}</span>
          <span class="tv-name">${v.name}</span>
          <span class="tv-cve">${v.cve}</span>
          <span class="tv-cvss">CVSS: ${v.cvss}</span>
        </div>
      `).join('')}
    </div>
  `;

  // Set tool buttons
  document.getElementById('consoleToolBar').innerHTML = `
    <span class="ct-label">TOOLS:</span>
    <button class="ct-btn" onclick="runTool('nmap')">nmap</button>
    <button class="ct-btn" onclick="runTool('nikto')">nikto</button>
    <button class="ct-btn" onclick="runTool('sqlmap')">sqlmap</button>
    <button class="ct-btn" onclick="runTool('dirb')">dirb</button>
    <button class="ct-btn" onclick="runTool('exploit')">exploit</button>
    <button class="ct-btn" onclick="runTool('post')">post-exploit</button>
  `;

  clearConsole();
  conLog(`// Target loaded: ${sc.name} (${sc.ip})`, 'cmd');
  conLog(`// Authorization confirmed: ${sc.authorization}`, 'ok');
  conLog(`// Type 'help' for available commands`, 'dim');

  markPTPhase('recon');
  toast('Pentest target loaded: ' + sc.name, 'info');
}

const TOOL_PHASES  = { nmap: 'scan', nikto: 'vuln', sqlmap: 'vuln', dirb: 'vuln', exploit: 'exploit', post: 'post' };
const TOOL_POINTS  = { nmap: 10, nikto: 15, sqlmap: 20, dirb: 12, exploit: 25, post: 20 };
const TOOL_DELAYS  = { nmap: 1200, nikto: 1500, sqlmap: 2000, dirb: 1000, exploit: 1800, post: 1600 };
const TOOL_CMDS    = {
  nmap:    s => `nmap -sV -sC -O -A ${s.ip}`,
  nikto:   s => `nikto -h http://${s.ip} -ssl`,
  sqlmap:  s => `sqlmap -u "http://${s.ip}/login" --dbs --level=3`,
  dirb:    s => `dirb http://${s.ip} /usr/share/dirb/wordlists/common.txt`,
  exploit: s => `exploit --target ${s.ip} --vuln CVE-2021-41773 --payload reverse_shell`,
  post:    s => `post-exploit --session 1 --actions recon,privesc,loot`,
};

function runTool(tool) {
  const sc = STATE.currentScenario;
  if (!sc) { conLog('[ERROR] No target loaded. Click "New Target" first.', 'err'); return; }

  conLog(`root@cybersim:~# ${TOOL_CMDS[tool](sc)}`, 'cmd');
  conLog('[*] Running... please wait', 'dim');

  setTimeout(() => {
    const output = sc.toolOutputs[tool] || 'No output available for this tool.';
    output.split('\n').forEach(line => {
      const cls = line.startsWith('[CRITICAL]') || line.startsWith('[+]') ? 'highlight'
                : line.startsWith('[HIGH]') ? 'warn'
                : line.startsWith('[*]') || line.startsWith('[INFO]') ? 'dim'
                : line.startsWith('[ERROR]') ? 'err'
                : '';
      conLog(line, cls);
    });

    const phase = TOOL_PHASES[tool];
    if (phase) markPTPhase(phase);

    const pts = TOOL_POINTS[tool] || 10;
    STATE.ptScore += pts;
    STATE.tasksCompleted = Math.min(STATE.tasksCompleted + 1, 10);
    updateStats();

    conLog(`\n[+] ${tool} complete. +${pts} pts awarded.`, 'ok');

    if (STATE.ptPhasesDone >= 4) {
      document.getElementById('btnGenReport').disabled = false;
    }
  }, TOOL_DELAYS[tool] || 1000);
}

function handleConsoleKey(e) {
  const input = document.getElementById('ciInput');
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    if (!cmd) return;
    STATE.consoleHistory.unshift(cmd);
    STATE.consoleCursor = -1;
    conLog(`root@cybersim:~# ${cmd}`, 'cmd');
    processCmd(cmd);
    input.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    STATE.consoleCursor = Math.min(STATE.consoleCursor + 1, STATE.consoleHistory.length - 1);
    input.value = STATE.consoleHistory[STATE.consoleCursor] || '';
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    STATE.consoleCursor = Math.max(STATE.consoleCursor - 1, -1);
    input.value = STATE.consoleCursor >= 0 ? STATE.consoleHistory[STATE.consoleCursor] : '';
  }
}

function processCmd(cmd) {
  const lower = cmd.toLowerCase().trim();
  const sc = STATE.currentScenario;

  if (lower === 'help') {
    conLog('Available tools: nmap, nikto, sqlmap, dirb, exploit, post-exploit');
    conLog('Commands: help, clear, whoami, target, phases, history');
    return;
  }
  if (lower === 'clear')  { clearConsole(); return; }
  if (lower === 'whoami') { conLog('pentester@cybersim [authorized session]', 'ok'); return; }
  if (lower === 'target') {
    if (sc) conLog(`Target: ${sc.ip} — ${sc.name} [${sc.os}]`);
    else    conLog('No target loaded.', 'dim');
    return;
  }
  if (lower === 'phases') {
    Object.entries(STATE.ptPhases).forEach(([k, v]) => conLog(`  ${v ? '✓' : '○'} ${k}`, v ? 'ok' : 'dim'));
    return;
  }
  if (lower === 'history') {
    STATE.consoleHistory.slice(0, 10).forEach((h, i) => conLog(`  ${i+1}. ${h}`, 'dim'));
    return;
  }

  // Tool shortcuts
  for (const tool of ['nmap','nikto','sqlmap','dirb']) {
    if (lower.startsWith(tool)) { runTool(tool); return; }
  }
  if (lower.includes('exploit') || lower.includes('metasploit')) { runTool('exploit'); return; }
  if (lower.includes('post') || lower.includes('priv'))          { runTool('post'); return; }

  conLog(`bash: ${cmd}: command not found  (type 'help' for available tools)`, 'err');
}

function conLog(text, cls = '') {
  const out = document.getElementById('consoleOut');
  const line = document.createElement('div');
  line.className = 'co-line ' + cls;
  line.textContent = text;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function clearConsole() {
  document.getElementById('consoleOut').innerHTML = '<div class="co-line dim">// Console cleared</div>';
}

function markPTPhase(phase) {
  if (STATE.ptPhases[phase]) return;
  STATE.ptPhases[phase] = true;
  STATE.ptPhasesDone++;

  const el = document.getElementById('ptck-' + phase);
  const st = document.getElementById('ptcks-' + phase);
  if (el) el.classList.add('done');
  if (st) st.textContent = '✓';

  setEl('ptPhasesDisplay', STATE.ptPhasesDone + '/6');
  updateStats();
}

function generatePTReport() {
  const sc = STATE.currentScenario;
  if (!sc) return;

  markPTPhase('report');
  STATE.ptScore += 30;
  updateStats();
  nav('report');
  toast('Pentest report generated!', 'success');
}

// ─── REPORT ──────────────────────────────────────────────────
function renderReport() {
  const body = document.getElementById('reportBody');
  if (STATE.socScore === 0 && STATE.ptScore === 0) return; // Keep empty state

  const total   = STATE.socScore + STATE.ptScore;
  const maxPts  = 300;
  const pct     = Math.min(Math.round((total / maxPts) * 100), 100);
  const grade   = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D';
  const gcol    = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--orange)' : 'var(--red)';
  const acc     = STATE.alertsAnalyzed > 0
    ? Math.round((STATE.alertsCorrect / STATE.alertsAnalyzed) * 100) : 0;
  const avgMttd = STATE.mttdList.length > 0
    ? Math.round(STATE.mttdList.reduce((a,b) => a+b,0) / STATE.mttdList.length) : null;

  // AI feedback generation
  const feedback = [];
  if (STATE.alertsAnalyzed === 0) feedback.push('Start the SOC module to analyze security alerts and build triage skills.');
  else if (acc < 60) feedback.push('Alert classification accuracy is below 60%. Review each MITRE ATT&CK technique — focus on distinguishing IOCs from benign activity.');
  else if (acc < 80) feedback.push('Good alert analysis! To reach 80%+, focus on IDOR vs authorized scans and understanding MFA fatigue patterns.');
  else              feedback.push('Excellent alert classification accuracy — above 80% is professional-grade SOC analyst performance.');

  if (avgMttd !== null) {
    if (avgMttd > 45)  feedback.push(`Average MTTD of ${avgMttd}s is high. Practice faster IOC pattern recognition — industry benchmark is under 20 seconds for Tier-1 triage.`);
    else if (avgMttd > 20) feedback.push(`Average MTTD of ${avgMttd}s is acceptable. Target under 15s for excellent performance by building alert recognition muscle memory.`);
    else               feedback.push(`Outstanding MTTD of ${avgMttd}s — below 15s is excellent. You\'re reacting at professional SOC analyst speed.`);
  }

  if (STATE.ptPhasesDone === 0)       feedback.push('Complete the Pen Tester module to practice recon, scanning, and exploitation methodology.');
  else if (STATE.ptPhasesDone < 4)    feedback.push('Good start on pentest! Complete exploitation and post-exploitation phases to build a full attack chain understanding.');
  else if (!STATE.ptPhases.report)    feedback.push('Remember: always generate a formal report after a penetration test. Documentation is critical for professional pentesters.');
  else                                 feedback.push('Full pentest methodology completed! Ensure you can explain each finding and its business impact to non-technical stakeholders.');

  if (STATE.alertsCorrect > 0 && STATE.alertsCorrect === STATE.alertsAnalyzed)
    feedback.push('Perfect accuracy! Consider enabling the Auto-Alert feature in Settings to practice under time pressure.');

  body.innerHTML = `
    <div class="rpt-grid">

      <!-- Overall score card -->
      <div class="rpt-card rpt-score-card">
        <div class="rsc-grade" style="color:${gcol}">${grade}</div>
        <div class="rsc-pct" style="color:${gcol}">${pct}%</div>
        <div class="rsc-label">Overall Performance</div>
        <div class="rsc-bar-wrap">
          <div class="rsc-bar" style="width:${pct}%;background:${gcol}"></div>
        </div>
        <div class="rsc-sub">${total} / ${maxPts} points</div>
      </div>

      <!-- SOC Metrics -->
      <div class="rpt-card">
        <div class="rpt-card-title">◈ SOC ANALYST METRICS</div>
        <div class="rpt-metrics">
          <div class="rpt-m"><span class="rpm-k">SOC Score</span><span class="rpm-v cyan">${STATE.socScore} pts</span></div>
          <div class="rpt-m"><span class="rpm-k">Alerts Analyzed</span><span class="rpm-v">${STATE.alertsAnalyzed}</span></div>
          <div class="rpt-m"><span class="rpm-k">Correct Classifications</span><span class="rpm-v green">${STATE.alertsCorrect}</span></div>
          <div class="rpt-m"><span class="rpm-k">Classification Accuracy</span><span class="rpm-v ${acc >= 80 ? 'green' : acc >= 60 ? 'orange' : 'red'}">${acc}%</span></div>
          <div class="rpt-m"><span class="rpm-k">Average MTTD</span><span class="rpm-v">${avgMttd !== null ? avgMttd + 's' : '--'}</span></div>
          <div class="rpt-m"><span class="rpm-k">Best MTTD</span><span class="rpm-v green">${STATE.mttdList.length ? Math.min(...STATE.mttdList) + 's' : '--'}</span></div>
        </div>
      </div>

      <!-- Pentest Metrics -->
      <div class="rpt-card">
        <div class="rpt-card-title">◉ PENTEST METRICS</div>
        <div class="rpt-metrics">
          <div class="rpt-m"><span class="rpm-k">PT Score</span><span class="rpm-v red">${STATE.ptScore} pts</span></div>
          <div class="rpt-m"><span class="rpm-k">Phases Completed</span><span class="rpm-v">${STATE.ptPhasesDone}/6</span></div>
          ${['recon','scan','vuln','exploit','post','report'].map(p => `
            <div class="rpt-m">
              <span class="rpm-k">${p.charAt(0).toUpperCase()+p.slice(1)}</span>
              <span class="rpm-v ${STATE.ptPhases[p] ? 'green' : 'red'}">${STATE.ptPhases[p] ? '✓ Done' : '✗ Incomplete'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI Feedback -->
      <div class="rpt-card rpt-feedback">
        <div class="rpt-card-title">🤖 AI MENTOR FEEDBACK</div>
        <div class="rpt-fb-items">
          ${feedback.map(f => `<div class="rpt-fb-item">${f}</div>`).join('')}
        </div>
        <div class="rpt-card-title" style="margin-top:20px">📚 RECOMMENDED RESOURCES</div>
        <div class="rpt-resources">
          ${['MITRE ATT&CK Navigator','TryHackMe','HackTheBox','CyberDefenders','BlueTeamLabsOnline','OWASP WebGoat','SANS Cyber Aces'].map(r => `<span class="rsc-tag">${r}</span>`).join('')}
        </div>
      </div>

      <!-- MTTD Chart -->
      ${STATE.mttdList.length > 0 ? `
      <div class="rpt-card rpt-chart-card">
        <div class="rpt-card-title">⏱ MTTD PER ALERT (seconds)</div>
        <div class="mttd-chart">
          ${STATE.mttdList.map((t, i) => `
            <div class="mttd-bar-wrap" title="Alert ${i+1}: ${t}s">
              <div class="mttd-bar ${t <= 15 ? 'good' : t <= 30 ? 'ok' : 'slow'}"
                   style="height:${Math.min((t/60)*100, 100)}%"></div>
              <div class="mttd-lbl">${t}s</div>
            </div>
          `).join('')}
        </div>
        <div class="mttd-legend">
          <span class="ml-item green">≤15s Excellent</span>
          <span class="ml-item orange">≤30s Acceptable</span>
          <span class="ml-item red">&gt;30s Needs work</span>
        </div>
      </div>` : ''}

    </div>
  `;
}

function exportReport() {
  toast('Export feature — print this page with Ctrl+P / Cmd+P to save as PDF', 'info');
}

// ─── LEADERBOARD ─────────────────────────────────────────────
function renderLeaderboard() {
  const body = document.getElementById('leaderboardBody');
  if (!body) return;

  const sorted = [...STATE.leaderboard].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));

  body.innerHTML = `
    <div class="lb-table">
      <div class="lb-header">
        <span class="lbh-rank">RANK</span>
        <span class="lbh-name">ANALYST</span>
        <span class="lbh-score">SCORE</span>
        <span class="lbh-acc">ACCURACY</span>
        <span class="lbh-mttd">MTTD</span>
        <span class="lbh-grade">GRADE</span>
        <span class="lbh-role">ROLE</span>
      </div>
      ${sorted.map((e, i) => `
        <div class="lb-row ${i < 3 ? 'top' + (i+1) : ''}">
          <span class="lbr-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i+1)}</span>
          <span class="lbr-name">${e.name}</span>
          <span class="lbr-score">${e.score}</span>
          <span class="lbr-acc">${e.accuracy}%</span>
          <span class="lbr-mttd">${e.mttd}s</span>
          <span class="lbr-grade" style="color:${e.grade.startsWith('A') ? 'var(--green)' : e.grade === 'B' ? 'var(--orange)' : 'var(--red)'}">${e.grade}</span>
          <span class="lbr-role">${e.role}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function addLeaderboardEntry() {
  const total = STATE.socScore + STATE.ptScore;
  if (total === 0) { toast('Complete a simulation first!', 'warning'); return; }

  const acc     = STATE.alertsAnalyzed > 0 ? Math.round((STATE.alertsCorrect / STATE.alertsAnalyzed) * 100) : 0;
  const avgMttd = STATE.mttdList.length > 0 ? Math.round(STATE.mttdList.reduce((a,b) => a+b,0) / STATE.mttdList.length) : 99;
  const pct     = Math.min(Math.round((total / 300) * 100), 100);
  const grade   = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D';
  const role    = STATE.socScore > 0 && STATE.ptScore > 0 ? 'SOC+PT' : STATE.ptScore > 0 ? 'PT' : 'SOC';

  const existing = STATE.leaderboard.findIndex(e => e.name === STATE.userName);
  if (existing >= 0) {
    if (total > STATE.leaderboard[existing].score) STATE.leaderboard[existing] = { name: STATE.userName, score: total, accuracy: acc, mttd: avgMttd, grade, role };
    else { toast('Your current score is lower than your best!', 'info'); return; }
  } else {
    STATE.leaderboard.push({ name: STATE.userName, score: total, accuracy: acc, mttd: avgMttd, grade, role });
  }

  renderLeaderboard();
  toast('Score added to leaderboard!', 'success');
}

// ─── AI CHATBOT ──────────────────────────────────────────────
function toggleChat() {
  STATE.chatOpen = !STATE.chatOpen;
  const panel = document.getElementById('chatPanel');
  panel.classList.toggle('open', STATE.chatOpen);
  if (STATE.chatOpen) {
    document.getElementById('chatPulse').classList.remove('active');
    setTimeout(() => document.getElementById('cpInput').focus(), 200);
  }
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
}

function sendSug(btn) {
  document.getElementById('cpInput').value = btn.textContent;
  document.getElementById('cpSuggestions').style.display = 'none';
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('cpInput');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';
  input.style.height = 'auto';

  appendMsg(msg, 'user');
  STATE.chatHistory.push({ role: 'user', content: msg });

  const sendBtn = document.getElementById('cpSendBtn');
  sendBtn.disabled = true;
  setEl('cpStatus', '● Thinking...');

  const loading = appendMsg('...', 'ai loading');

  try {
    const apiKey = STATE.apiKey || localStorage.getItem('csim_apikey') || '';

    if (!apiKey) {
      loading.remove();
      appendMsg('⚠️ No API key found. Go to ⚙ Settings and enter your Anthropic API key to enable the AI Mentor.', 'ai');
      sendBtn.disabled = false;
      setEl('cpStatus', '● Online · Powered by Claude');
      return;
    }

    const acc   = STATE.alertsAnalyzed > 0 ? Math.round((STATE.alertsCorrect / STATE.alertsAnalyzed) * 100) : 0;
    const sysPr = `You are CyberSim AI Mentor, an expert cybersecurity educator embedded inside a hands-on job simulation platform for university students. The platform is Mini Project CS16 at DY Patil University, Navi Mumbai (Academic Year 2025-26).

You specialize in:
- SOC Analyst workflows: SIEM alert triage, MTTD/MTTR, IOC analysis, alert fatigue, true/false positive classification
- Penetration testing: OWASP Top 10, MITRE ATT&CK, Nmap/Nikto/SQLmap/Dirb tool usage, CVE exploitation concepts
- Incident response: containment, eradication, recovery, forensics
- Cybersecurity concepts at undergraduate level

Student context:
- SOC Score: ${STATE.socScore} points, ${STATE.alertsAnalyzed} alerts analyzed, ${acc}% accuracy
- Pentest Score: ${STATE.ptScore} points, ${STATE.ptPhasesDone}/6 phases completed
- Current pentest target: ${STATE.currentScenario ? STATE.currentScenario.name : 'none'}

Guidelines:
- Be encouraging and educational, not condescending
- Give concrete examples and relate to MITRE ATT&CK techniques when relevant
- Keep responses focused and actionable (max 3-4 paragraphs)
- If asked about offensive techniques, frame answers defensively (how to detect/prevent)
- Never provide actual working malware code or real exploit code`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: sysPr,
        messages: STATE.chatHistory,
      })
    });

    const data  = await resp.json();
    const reply = data.content?.[0]?.text || 'I could not generate a response. Please try again.';
    STATE.chatHistory.push({ role: 'assistant', content: reply });

    loading.remove();
    appendMsg(reply, 'ai');
  } catch (err) {
    loading.remove();
    appendMsg('Connection error. Please check your API key in Settings and your internet connection.', 'ai');
  }

  sendBtn.disabled = false;
  setEl('cpStatus', '● Online · Powered by Claude');
}

function appendMsg(text, cls) {
  const msgs = document.getElementById('cpMessages');
  const div  = document.createElement('div');
  div.className = 'cp-msg ' + cls;
  const bubble = document.createElement('div');
  bubble.className = 'cpm-bubble';
  if (cls.includes('loading')) {
    bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  } else {
    // Simple markdown: **bold**, `code`, newlines
    bubble.innerHTML = text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/`(.+?)`/g,'<code>$1</code>')
      .replace(/\n/g,'<br>');
  }
  div.appendChild(bubble);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

// ─── SETTINGS ────────────────────────────────────────────────
function openSettings() {
  document.getElementById('settingName').value   = STATE.userName;
  document.getElementById('settingApiKey').value = STATE.apiKey || localStorage.getItem('csim_apikey') || '';
  document.getElementById('settingSound').checked = STATE.soundEnabled;
  document.getElementById('settingAutoAlert').checked = STATE.autoAlert;
  document.getElementById('settingsModal').classList.add('open');
}

function saveSettings() {
  STATE.userName    = document.getElementById('settingName').value || 'Analyst';
  const key         = document.getElementById('settingApiKey').value.trim();
  STATE.apiKey      = key;
  STATE.soundEnabled = document.getElementById('settingSound').checked;
  const autoAlert   = document.getElementById('settingAutoAlert').checked;

  if (key) localStorage.setItem('csim_apikey', key);

  if (autoAlert && !STATE.autoAlert) {
    STATE.autoAlert = true;
    STATE.autoAlertTimer = setInterval(spawnAlert, 30000);
  } else if (!autoAlert && STATE.autoAlert) {
    STATE.autoAlert = false;
    clearInterval(STATE.autoAlertTimer);
  }

  updateStats();
  closeModal('settingsModal');
  toast('Settings saved!', 'success');
}

function loadSettings() {
  const savedKey = localStorage.getItem('csim_apikey');
  if (savedKey) STATE.apiKey = savedKey;
}

// ─── MODALS ───────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function confirmReset() { openModal('resetModal'); }

function doReset() {
  // Reset state
  Object.assign(STATE, {
    socScore: 0, ptScore: 0, alertsAnalyzed: 0, alertsCorrect: 0,
    mttdList: [], tasksCompleted: 0,
    currentAlert: null, alertStartTime: null, alertQueue: [], alertsSpawned: 0, loggedAlerts: [],
    currentScenario: null, ptPhasesDone: 0,
    ptPhases: { recon: false, scan: false, vuln: false, exploit: false, post: false, report: false },
    consoleHistory: [], consoleCursor: 0, chatHistory: [],
  });
  clearInterval(alertTimerInterval);
  clearInterval(STATE.autoAlertTimer);

  // Reset UI
  document.getElementById('alertFeed').innerHTML = `
    <div class="empty-feed">
      <div class="ef-icon">◈</div>
      <div class="ef-text">No alerts yet</div>
      <div class="ef-sub">Click "+ New Alert" to receive a simulated security alert</div>
    </div>`;
  document.getElementById('invBody').innerHTML = `
    <div class="empty-feed" style="margin-top:60px">
      <div class="ef-icon">⬡</div>
      <div class="ef-text">Select an alert to investigate</div>
      <div class="ef-sub">Click any alert in the feed to open it here</div>
    </div>`;
  document.getElementById('threatLog').innerHTML = '<div class="tl-empty">No entries yet</div>';
  document.getElementById('targetBody').innerHTML = `
    <div class="empty-feed" style="margin-top:40px">
      <div class="ef-icon">◉</div>
      <div class="ef-text">No target loaded</div>
      <div class="ef-sub">Click "New Target" to load a pentest scenario</div>
    </div>`;
  clearConsole();
  document.getElementById('consoleToolBar').innerHTML = '<span class="ct-label">TOOLS:</span>';
  ['recon','scan','vuln','exploit','post','report'].forEach(p => {
    const el = document.getElementById('ptck-' + p);
    const st = document.getElementById('ptcks-' + p);
    if (el) el.classList.remove('done');
    if (st) st.textContent = '○';
  });
  document.getElementById('btnGenReport').disabled = true;
  document.getElementById('reportBody').innerHTML = `
    <div class="empty-feed big">
      <div class="ef-icon">▤</div>
      <div class="ef-text">No simulation data yet</div>
      <div class="ef-sub">Complete at least one SOC or Pentest simulation to see your report</div>
    </div>`;
  setEl('invTimer', '--');
  setEl('alertCountBadge', '0 active');
  updateStats();
  closeModal('resetModal');
  toast('All progress reset', 'info');
}

// ─── SOUND SYSTEM ────────────────────────────────────────────
function playSound(type) {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const sounds = {
      alert_high: [880, 0.3, 'square'],
      alert_low:  [440, 0.2, 'sine'],
      correct:    [660, 0.2, 'sine'],
      wrong:      [220, 0.3, 'sawtooth'],
    };
    const [freq, vol, wave] = sounds[type] || [440, 0.1, 'sine'];
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

// ─── TOAST ───────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}
