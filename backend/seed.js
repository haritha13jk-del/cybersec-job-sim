// seed.js — Run this once to populate your MongoDB with scenarios
// Usage: node seed.js

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ No MONGODB_URI found in .env file!");
  process.exit(1);
}

// Scenario Schema (matches your existing model)
const scenarioSchema = new mongoose.Schema({
  title: String,
  description: String,
  role: String,
  difficulty: String,
  category: String,
  mitre_technique: String,
  scenario_data: Object,
  correct_actions: [String],
  hints: [String],
  max_score: { type: Number, default: 100 },
  time_limit: { type: Number, default: 1800 },
}, { timestamps: true });

const Scenario = mongoose.models.Scenario || mongoose.model("Scenario", scenarioSchema);

const scenarios = [
  // ─── SOC ANALYST ───────────────────────────────────────────
  {
    title: "Phishing Email Investigation",
    description: "Analyze a suspicious email reported by an employee and determine if it is a phishing attempt.",
    role: "SOC Analyst",
    difficulty: "beginner",
    category: "Email Security",
    mitre_technique: "T1566 - Phishing",
    scenario_data: {
      email: {
        from: "hr-noreply@comp4ny.com",
        subject: "Urgent: Update Your Password Now",
        body: "Dear Employee, your account will be suspended in 24 hours. Click here to verify: http://malicious-link.com/verify",
        attachments: [],
        headers: {
          "reply-to": "attacker@gmail.com",
          "received-from": "192.168.1.100"
        }
      },
      indicators: [
        "Misspelled domain (comp4ny vs company)",
        "Urgency language",
        "Suspicious reply-to address",
        "HTTP not HTTPS link"
      ]
    },
    correct_actions: [
      "Identify misspelled sender domain",
      "Check reply-to header mismatch",
      "Flag suspicious URL",
      "Report as phishing",
      "Block sender domain"
    ],
    hints: [
      "Check the sender domain very carefully — one character can be swapped",
      "Look at the reply-to address, it doesn't match the sender",
      "Hover over links before clicking — where does it really go?"
    ],
    max_score: 100,
    time_limit: 1800
  },
  {
    title: "Suspicious Login Detection",
    description: "Investigate multiple failed login attempts followed by a successful login from an unusual location.",
    role: "SOC Analyst",
    difficulty: "beginner",
    category: "Authentication",
    mitre_technique: "T1110 - Brute Force",
    scenario_data: {
      logs: [
        { time: "02:13:01", ip: "185.220.101.45", action: "LOGIN_FAILED", user: "admin" },
        { time: "02:13:05", ip: "185.220.101.45", action: "LOGIN_FAILED", user: "admin" },
        { time: "02:13:09", ip: "185.220.101.45", action: "LOGIN_FAILED", user: "admin" },
        { time: "02:13:15", ip: "185.220.101.45", action: "LOGIN_SUCCESS", user: "admin" }
      ],
      location: "Romania",
      normal_location: "India",
      ip_reputation: "Known Tor exit node"
    },
    correct_actions: [
      "Identify brute force pattern",
      "Flag foreign IP address",
      "Lock compromised account",
      "Reset user credentials",
      "Escalate to incident response"
    ],
    hints: [
      "Count the failed attempts before the success",
      "Check where IP 185.220.101.45 is located",
      "Compare login location to the user's normal location"
    ],
    max_score: 100,
    time_limit: 1800
  },
  {
    title: "Malware Alert Triage",
    description: "Your SIEM flagged a workstation for suspicious process execution. Investigate and respond.",
    role: "SOC Analyst",
    difficulty: "intermediate",
    category: "Malware Analysis",
    mitre_technique: "T1059 - Command and Scripting Interpreter",
    scenario_data: {
      alerts: [{
        severity: "HIGH",
        process: "powershell.exe",
        command: "powershell -enc JABjAGwAaQBlAG4AdA==",
        parent: "winword.exe",
        user: "john.doe",
        host: "WORKSTATION-04"
      }],
      file_hash: "d41d8cd98f00b204e9800998ecf8427e",
      virustotal_hits: 45,
      network_connections: ["192.168.1.50:4444"]
    },
    correct_actions: [
      "Identify suspicious parent-child process",
      "Decode base64 command",
      "Check VirusTotal hash",
      "Isolate affected workstation",
      "Collect forensic artifacts"
    ],
    hints: [
      "Why would Microsoft Word (winword.exe) spawn PowerShell?",
      "Decode the base64 string: JABjAGwAaQBlAG4AdA==",
      "45 VirusTotal hits means this is confirmed malware"
    ],
    max_score: 150,
    time_limit: 2400
  },
  {
    title: "Ransomware Incident Response",
    description: "Multiple workstations are encrypting files and displaying ransom notes. Contain the outbreak.",
    role: "SOC Analyst",
    difficulty: "advanced",
    category: "Incident Response",
    mitre_technique: "T1486 - Data Encrypted for Impact",
    scenario_data: {
      affected_hosts: ["WS-01", "WS-02", "WS-07", "FILE-SERVER-01"],
      ransom_note: "Your files are encrypted. Pay 2 BTC to 1A2b3C...",
      encryption_extension: ".locked",
      lateral_movement_detected: true,
      initial_vector: "Phishing email with malicious macro",
      c2_server: "185.220.101.99:443"
    },
    correct_actions: [
      "Isolate affected workstations immediately",
      "Disable network shares to stop spread",
      "Identify patient zero",
      "Block C2 server IP at firewall",
      "Restore from clean backups",
      "Notify management and legal"
    ],
    hints: [
      "Stop the spread first — isolate before investigating",
      "Check which host was infected first (patient zero)",
      "Block outbound traffic to the C2 server"
    ],
    max_score: 200,
    time_limit: 3600
  },

  // ─── PENETRATION TESTER ────────────────────────────────────
  {
    title: "Network Reconnaissance",
    description: "Perform initial reconnaissance on a target network to identify open ports and services.",
    role: "Penetration Tester",
    difficulty: "beginner",
    category: "Reconnaissance",
    mitre_technique: "T1046 - Network Service Discovery",
    scenario_data: {
      target: "192.168.10.0/24",
      scope: "Internal network penetration test",
      allowed_techniques: ["Port scanning", "Service enumeration", "OS fingerprinting"],
      discovered_hosts: ["192.168.10.1", "192.168.10.5", "192.168.10.20"],
      open_ports: { "192.168.10.1": [22, 80, 443], "192.168.10.5": [21, 22, 3306], "192.168.10.20": [80, 8080, 3389] }
    },
    correct_actions: [
      "Run port scan on target range",
      "Identify open services",
      "Fingerprint operating systems",
      "Document findings",
      "Identify potential attack vectors"
    ],
    hints: [
      "Start with a ping sweep to find live hosts",
      "Use service version detection (-sV in nmap)",
      "Document everything — reporting is 50% of pentesting"
    ],
    max_score: 100,
    time_limit: 2400
  },
  {
    title: "Web Application SQL Injection",
    description: "Test a login form for SQL injection vulnerabilities and demonstrate impact without causing damage.",
    role: "Penetration Tester",
    difficulty: "intermediate",
    category: "Web Application",
    mitre_technique: "T1190 - Exploit Public-Facing Application",
    scenario_data: {
      target_url: "http://testapp.local/login",
      form_fields: ["username", "password"],
      database: "MySQL",
      waf_present: false,
      test_payloads: ["admin' --", "1 OR 1=1", "admin' OR '1'='1"],
      backend_query: "SELECT * FROM users WHERE username='INPUT' AND password='INPUT'"
    },
    correct_actions: [
      "Test basic SQL injection payload",
      "Bypass authentication",
      "Extract database information",
      "Document vulnerability",
      "Provide remediation steps"
    ],
    hints: [
      "Try adding a single quote ' to the username field",
      "Use -- to comment out the password check",
      "Always have written authorization before testing"
    ],
    max_score: 150,
    time_limit: 3600
  },
  {
    title: "Privilege Escalation Challenge",
    description: "You have low-privilege shell access to a Linux server. Escalate to root using misconfigured binaries.",
    role: "Penetration Tester",
    difficulty: "advanced",
    category: "Privilege Escalation",
    mitre_technique: "T1548 - Abuse Elevation Control Mechanism",
    scenario_data: {
      os: "Ubuntu 20.04",
      current_user: "www-data",
      sudo_version: "1.8.31",
      suid_binaries: ["/usr/bin/find", "/usr/bin/python3"],
      writable_paths: ["/tmp", "/var/www/html"],
      interesting_files: ["/etc/passwd (readable)", "/var/backups/passwd.bak"]
    },
    correct_actions: [
      "Enumerate SUID binaries",
      "Check sudo permissions",
      "Exploit misconfigured SUID binary",
      "Gain root shell",
      "Document exploitation path"
    ],
    hints: [
      "Check GTFOBins.github.io for SUID exploit techniques",
      "Python3 with SUID can execute system commands as root",
      "Always enumerate thoroughly before exploiting"
    ],
    max_score: 200,
    time_limit: 3600
  }
];

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing scenarios
    const deleted = await Scenario.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing scenarios`);

    // Insert new scenarios
    const inserted = await Scenario.insertMany(scenarios);
    console.log(`✅ Inserted ${inserted.length} scenarios successfully!\n`);

    inserted.forEach((s, i) => {
      console.log(`  ${i + 1}. [${s.role}] ${s.title} (${s.difficulty})`);
    });

    console.log("\n🎉 Database seeded! Your scenarios will now appear on the site.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
