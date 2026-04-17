-- Fix scenarios table to match your model
ALTER TABLE scenarios 
ADD COLUMN IF NOT EXISTS role VARCHAR(100),
ADD COLUMN IF NOT EXISTS mitre_technique VARCHAR(255),
ADD COLUMN IF NOT EXISTS scenario_data JSON,
ADD COLUMN IF NOT EXISTS correct_actions JSON,
ADD COLUMN IF NOT EXISTS hints JSON,
ADD COLUMN IF NOT EXISTS max_score INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS time_limit INT DEFAULT 1800;

-- SOC Analyst Scenarios
INSERT INTO scenarios (title, description, role, difficulty, category, mitre_technique, scenario_data, correct_actions, hints, max_score, time_limit) VALUES
(
  'Phishing Email Investigation',
  'Analyze a suspicious email reported by an employee and determine if it is a phishing attempt.',
  'SOC Analyst',
  'beginner',
  'Email Security',
  'T1566 - Phishing',
  '{"email":{"from":"hr-noreply@comp4ny.com","subject":"Urgent: Update Your Password Now","body":"Dear Employee, your account will be suspended in 24 hours. Click here to verify: http://malicious-link.com/verify","attachments":[],"headers":{"reply-to":"attacker@gmail.com","received-from":"192.168.1.100"}},"indicators":["Misspelled domain","Urgency language","Suspicious reply-to","HTTP not HTTPS"]}',
  '["Identify misspelled sender domain","Check reply-to header mismatch","Flag suspicious URL","Report as phishing","Block sender domain"]',
  '["Check the sender domain carefully","Look at the reply-to address","Hover over links before clicking"]',
  100,
  1800
),
(
  'Suspicious Login Detection',
  'Investigate multiple failed login attempts followed by a successful login from an unusual location.',
  'SOC Analyst',
  'beginner',
  'Authentication',
  'T1110 - Brute Force',
  '{"logs":[{"time":"02:13:01","ip":"185.220.101.45","action":"LOGIN_FAILED","user":"admin"},{"time":"02:13:05","ip":"185.220.101.45","action":"LOGIN_FAILED","user":"admin"},{"time":"02:13:09","ip":"185.220.101.45","action":"LOGIN_FAILED","user":"admin"},{"time":"02:13:15","ip":"185.220.101.45","action":"LOGIN_SUCCESS","user":"admin"}],"location":"Romania","normal_location":"India"}',
  '["Identify brute force pattern","Flag foreign IP address","Lock compromised account","Reset user credentials","Escalate to incident response"]',
  '["Count the failed attempts","Check where the IP is from","Compare with users normal login location"]',
  100,
  1800
),
(
  'Malware Alert Triage',
  'Your SIEM has flagged a workstation for suspicious process execution. Investigate and respond.',
  'SOC Analyst',
  'intermediate',
  'Malware Analysis',
  'T1059 - Command and Scripting Interpreter',
  '{"alerts":[{"severity":"HIGH","process":"powershell.exe","command":"powershell -enc JABjAGwAaQBlAG4AdA==","parent":"winword.exe","user":"john.doe","host":"WORKSTATION-04"}],"file_hash":"d41d8cd98f00b204e9800998ecf8427e","virustotal_hits":45}',
  '["Identify suspicious parent-child process","Decode base64 command","Check VirusTotal hash","Isolate affected workstation","Collect forensic artifacts"]',
  '["Why would Word spawn PowerShell?","Decode the base64 string","45 VT hits means confirmed malware"]',
  150,
  2400
),

-- Penetration Tester Scenarios
(
  'Network Reconnaissance',
  'Perform initial reconnaissance on a target network to identify open ports and services.',
  'Penetration Tester',
  'beginner',
  'Reconnaissance',
  'T1046 - Network Service Discovery',
  '{"target":"192.168.10.0/24","scope":"Internal network","allowed_techniques":["Port scanning","Service enumeration","OS fingerprinting"],"discovered_hosts":["192.168.10.1","192.168.10.5","192.168.10.20"]}',
  '["Run port scan on target range","Identify open services","Fingerprint operating systems","Document findings","Identify potential attack vectors"]',
  '["Start with a ping sweep","Use service version detection","Document everything you find"]',
  100,
  2400
),
(
  'Web Application SQL Injection',
  'Test a login form for SQL injection vulnerabilities and demonstrate impact.',
  'Penetration Tester',
  'intermediate',
  'Web Application',
  'T1190 - Exploit Public-Facing Application',
  '{"target_url":"http://testapp.local/login","form_fields":["username","password"],"database":"MySQL","waf_present":false,"test_payloads":["admin'"'"' --","1 OR 1=1","admin'"'"' OR '"'"'1'"'"'='"'"'1"]}',
  '["Test basic SQL injection payload","Bypass authentication","Extract database information","Document vulnerability","Provide remediation steps"]',
  '["Try adding a single quote to the input","Comment out the rest of the query","Always get written permission first"]',
  150,
  3600
),
(
  'Privilege Escalation Challenge',
  'You have low-privilege access to a Linux system. Find a way to escalate to root.',
  'Penetration Tester',
  'advanced',
  'Privilege Escalation',
  'T1548 - Abuse Elevation Control Mechanism',
  '{"os":"Ubuntu 20.04","current_user":"www-data","sudo_version":"1.8.31","suid_binaries":["/usr/bin/find","/usr/bin/python3"],"writable_paths":["/tmp","/var/www/html"]}',
  '["Enumerate SUID binaries","Check sudo permissions","Exploit misconfigured SUID","Gain root shell","Document exploitation path"]',
  '["Check GTFOBins for SUID exploits","Look at what python3 can do as SUID","enumerate before exploiting"]',
  200,
  3600
);ss