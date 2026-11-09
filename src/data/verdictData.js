export const verdictStates = {
  phishing: {
    key: "phishing",
    title: "PHISHING DETECTED",
    riskBadge: "High Risk Threat Level",
    headline: "Impersonation & Credential Harvesting Attack",
    desc: "This target simulates a PayPal authentication endpoint. The multi-stage classifier detected severe structural anomalies: domain squatting in subdomains, unencrypted transmission channels, and high string entropy.",
    confidence: "97.4%",
    confidenceNum: 97.4,
    gaugeOffset: 6.5, // (1 - 0.974) * 251.2
    gaugeCertainty: "High Threat Certainty",
    gaugeColorClass: "text-error",
    certaintyColorClass: "text-error",
    statusChipBg: "bg-error-container text-on-error-container",
    statusIcon: "gpp_bad",
    auraColor: "bg-error-container/40",
    urlProtocol: "Insecure HTTP",
    protocolClass: "bg-error text-on-error",
    protocolIcon: "lock_open",
    tldTag: ".online (High-Risk TLD)",
    targetUrl: "http://paypal-security-update.account-verify.online/login.php?session=auth_token_9801",
    urlStringHtml: 'http://<span class="text-error-container font-semibold underline decoration-dotted">paypal-security-update</span>.<span class="text-secondary-fixed">account-verify.online</span>/login.php?session=auth_token_9801',
    shapData: [
      { name: "1. Domain Squatting in Subdomain", impact: "+34.0%", width: "34%", color: "bg-error", textColor: "text-error", desc: "Excessive subdomain depth disguising target brand 'paypal-security-update' inside non-official host." },
      { name: "2. URL Length > 65 Characters", impact: "+26.0%", width: "26%", color: "bg-error", textColor: "text-error", desc: "Abnormally long URL string (67 chars) engineered to conceal the root domain on mobile browsers." },
      { name: "3. Absence of Valid SSL/HTTPS", impact: "+18.0%", width: "18%", color: "bg-error", textColor: "text-error", desc: "Target transmits user-submitted authentication inputs via cleartext HTTP." },
      { name: "4. High Lexical String Entropy", impact: "+14.0%", width: "14%", color: "bg-error", textColor: "text-error", desc: "High Shannon entropy score (4.82 bits/char) in query parameters, typical of disposable DGAs." },
      { name: "5. Known Financial Brand Token", impact: "+8.0%", width: "8%", color: "bg-error", textColor: "text-error", desc: "Token 'paypal' detected outside the apex DNS authority zone." }
    ],
    features: [
      { name: "URL Length", domain: "Lexical Syntax", val: "67 characters", bench: "≤ 54 chars (Safe Mean)", risky: true },
      { name: "IP Address As Hostname", domain: "Network Identity", val: "False (Named Host)", bench: "DNS Resolution Required", risky: false },
      { name: "Transport Protocol", domain: "Cryptographic Channel", val: "http:// (Plaintext)", bench: "https:// (TLS v1.3)", risky: true },
      { name: "Subdomain Hierarchy Count", domain: "DNS Architecture", val: "3 Subdomains", bench: "≤ 1 Subdomain (Safe)", risky: true },
      { name: "'@' Symbol In URI", domain: "Lexical Syntax", val: "0 Occurrences", bench: "0 Occurrences", risky: false },
      { name: "URL Redirection Service (Shortener)", domain: "Routing Obfuscation", val: "Direct Host", bench: "No Forwarding Wrapper", risky: false },
      { name: "Hyphen Count In Domain", domain: "Syntactic Heuristic", val: "2 Hyphens", bench: "0 - 1 Hyphens", risky: true },
      { name: "Search Engine Index Presence", domain: "Search Authority", val: "Not Indexed", bench: "Indexed > 90 days", risky: true },
      { name: "Alexa / Tranco Global Rank", domain: "Global Web Traffic", val: "Unranked (> 10M)", bench: "Top 1,000,000 Verified", risky: true }
    ]
  },
  suspicious: {
    key: "suspicious",
    title: "SUSPICIOUS WARNING",
    riskBadge: "Moderate Caution Level",
    headline: "Obfuscated Redirect Chain & Shortened URL",
    desc: "Target leverages a bit.ly link masking downstream destinations. While cryptographic TLS is intact, rapid redirection hops and ambiguous endpoint metadata triggered defensive security flags.",
    confidence: "68.2%",
    confidenceNum: 68.2,
    gaugeOffset: 79.8, // (1 - 0.682) * 251.2
    gaugeCertainty: "Elevated Risk Flag",
    gaugeColorClass: "text-secondary-container",
    certaintyColorClass: "text-secondary-container",
    statusChipBg: "bg-secondary-fixed text-on-secondary-fixed",
    statusIcon: "warning_amber",
    auraColor: "bg-secondary-fixed/40",
    urlProtocol: "Encrypted HTTPS",
    protocolClass: "bg-secondary text-on-secondary",
    protocolIcon: "lock",
    tldTag: ".ly (Generic Shortener)",
    targetUrl: "https://bit.ly/3xZ9wQk?redirect=secure-portal",
    urlStringHtml: 'https://<span class="text-secondary-fixed font-semibold">bit.ly</span>/3xZ9wQk?<span class="text-secondary-fixed underline">redirect=secure-portal</span>',
    shapData: [
      { name: "1. Known URL Shortening Wrapper", impact: "+38.0%", width: "38%", color: "bg-secondary-container", textColor: "text-secondary-container", desc: "Shortener hop conceals true endpoint authority and canonical reputation." },
      { name: "2. Dynamic Redirection Parameter", impact: "+22.0%", width: "22%", color: "bg-secondary-container", textColor: "text-secondary-container", desc: "Query string contains open-redirect syntax prone to evasion bypass." },
      { name: "3. Brief Domain Age (<30 Days)", impact: "+12.0%", width: "12%", color: "bg-secondary-container", textColor: "text-secondary-container", desc: "Downstream host spun up within the last month." },
      { name: "4. Valid TLS Certificate", impact: "-15.0%", width: "15%", color: "bg-on-tertiary-container", textColor: "text-on-tertiary-container", desc: "Trusted TLS certificate issued by Let's Encrypt Authority." },
      { name: "5. Standard Character Length", impact: "-8.0%", width: "8%", color: "bg-on-tertiary-container", textColor: "text-on-tertiary-container", desc: "Short URL length limits payload delivery vector directly in header." }
    ],
    features: [
      { name: "URL Length", domain: "Lexical Syntax", val: "38 characters", bench: "≤ 54 chars (Safe Mean)", risky: false },
      { name: "IP Address As Hostname", domain: "Network Identity", val: "False (Named Host)", bench: "DNS Resolution Required", risky: false },
      { name: "Transport Protocol", domain: "Cryptographic Channel", val: "https:// (TLS v1.3)", bench: "https:// (TLS v1.3)", risky: false },
      { name: "Subdomain Hierarchy Count", domain: "DNS Architecture", val: "0 Subdomains", bench: "≤ 1 Subdomain (Safe)", risky: false },
      { name: "'@' Symbol In URI", domain: "Lexical Syntax", val: "0 Occurrences", bench: "0 Occurrences", risky: false },
      { name: "URL Redirection Service (Shortener)", domain: "Routing Obfuscation", val: "Bit.ly Wrapper Active", bench: "No Forwarding Wrapper", risky: true },
      { name: "Hyphen Count In Domain", domain: "Syntactic Heuristic", val: "0 Hyphens", bench: "0 - 1 Hyphens", risky: false },
      { name: "Search Engine Index Presence", domain: "Search Authority", val: "Indexed (Wrapper)", bench: "Indexed > 90 days", risky: false },
      { name: "Alexa / Tranco Global Rank", domain: "Global Web Traffic", val: "Ranked #14,200", bench: "Top 1,000,000 Verified", risky: false }
    ]
  },
  safe: {
    key: "safe",
    title: "VERIFIED LEGITIMATE",
    riskBadge: "Verified Trusted Endpoint",
    headline: "Authenticated Institutional Web Infrastructure",
    desc: "URL confirmed as legitimate academic domain cs.stanford.edu. Features long-standing DNS stability, active Tranco high-tier authority, valid institutional TLS certificates, and zero lexical anomalies.",
    confidence: "99.1%",
    confidenceNum: 99.1,
    gaugeOffset: 2.2, // (1 - 0.991) * 251.2
    gaugeCertainty: "Clean Site Posture",
    gaugeColorClass: "text-on-tertiary-container",
    certaintyColorClass: "text-on-tertiary-container",
    statusChipBg: "bg-tertiary-fixed text-on-tertiary-fixed",
    statusIcon: "verified",
    auraColor: "bg-tertiary-fixed/30",
    urlProtocol: "Encrypted HTTPS",
    protocolClass: "bg-tertiary-container text-on-tertiary",
    protocolIcon: "verified_user",
    tldTag: ".edu (Accredited Entity)",
    targetUrl: "https://cs.stanford.edu/research/artificial-intelligence/faculty",
    urlStringHtml: 'https://<span class="text-tertiary-fixed font-semibold">cs.stanford.edu</span>/research/artificial-intelligence/faculty',
    shapData: [
      { name: "1. Established Domain Age (> 20 Years)", impact: "-42.0%", width: "42%", color: "bg-on-tertiary-container", textColor: "text-on-tertiary-container", desc: "Root domain registered since 1985 with uninterrupted ownership history." },
      { name: "2. Top 500 Global Tranco Ranking", impact: "-28.0%", width: "28%", color: "bg-on-tertiary-container", textColor: "text-on-tertiary-container", desc: "Extremely high organic crawl frequency and global reputation anchor." },
      { name: "3. Valid Extended Validation SSL", impact: "-16.0%", width: "16%", color: "bg-on-tertiary-container", textColor: "text-on-tertiary-container", desc: "Institutional certificate backed by trusted academic root certificate authority." },
      { name: "4. Natural Lexical Composition", impact: "-10.0%", width: "10%", color: "bg-on-tertiary-container", textColor: "text-on-tertiary-container", desc: "Low entropy directory paths matching standard semantic ontology." },
      { name: "5. Absence of Deceptive Tokens", impact: "-8.0%", width: "8%", color: "bg-on-tertiary-container", textColor: "text-on-tertiary-container", desc: "No brand squatting, punctuation evasion, or homoglyph substitutions." }
    ],
    features: [
      { name: "URL Length", domain: "Lexical Syntax", val: "52 characters", bench: "≤ 54 chars (Safe Mean)", risky: false },
      { name: "IP Address As Hostname", domain: "Network Identity", val: "False (Named Host)", bench: "DNS Resolution Required", risky: false },
      { name: "Transport Protocol", domain: "Cryptographic Channel", val: "https:// (TLS v1.3)", bench: "https:// (TLS v1.3)", risky: false },
      { name: "Subdomain Hierarchy Count", domain: "DNS Architecture", val: "1 Subdomain (cs.)", bench: "≤ 1 Subdomain (Safe)", risky: false },
      { name: "'@' Symbol In URI", domain: "Lexical Syntax", val: "0 Occurrences", bench: "0 Occurrences", risky: false },
      { name: "URL Redirection Service (Shortener)", domain: "Routing Obfuscation", val: "Direct Host", bench: "No Forwarding Wrapper", risky: false },
      { name: "Hyphen Count In Domain", domain: "Syntactic Heuristic", val: "0 Hyphens", bench: "0 - 1 Hyphens", risky: false },
      { name: "Search Engine Index Presence", domain: "Search Authority", val: "Indexed (5.2M results)", bench: "Indexed > 90 days", risky: false },
      { name: "Alexa / Tranco Global Rank", domain: "Global Web Traffic", val: "Ranked #241 (High Trust)", bench: "Top 1,000,000 Verified", risky: false }
    ]
  }
};

export const recentTelemetry = [
  {
    id: 1,
    url: "https://github.com/torvalds/linux",
    time: "2 mins ago",
    note: "Verified Canonical Repository",
    status: "Safe",
    score: "99.4%",
    badgeBg: "bg-[#ecfdf5]",
    badgeText: "text-[#065f46]",
    dotColor: "bg-[#10b981]",
    stateKey: "safe"
  },
  {
    id: 2,
    url: "http://192.168.1.105:8080/auth/apple",
    time: "14 mins ago",
    note: "IP-based Credential Harvesting",
    status: "Phishing",
    score: "96.8%",
    badgeBg: "bg-[#fef2f2]",
    badgeText: "text-[#991b1b]",
    dotColor: "bg-error",
    stateKey: "phishing"
  },
  {
    id: 3,
    url: "https://bit.ly/3xXk92z-update",
    time: "1 hr ago",
    note: "Obfuscated URL Shortener Chain",
    status: "Suspicious",
    score: "68.2%",
    badgeBg: "bg-[#fffbeb]",
    badgeText: "text-[#92400e]",
    dotColor: "bg-[#f59e0b]",
    stateKey: "suspicious"
  },
  {
    id: 4,
    url: "https://chase.com/personal/banking",
    time: "3 hrs ago",
    note: "High Reputable Financial Institution",
    status: "Safe",
    score: "98.9%",
    badgeBg: "bg-[#ecfdf5]",
    badgeText: "text-[#065f46]",
    dotColor: "bg-[#10b981]",
    stateKey: "safe"
  },
  {
    id: 5,
    url: "http://secure-login-wellsfargo-alert.com",
    time: "5 hrs ago",
    note: "Brand Impersonation & Zero SSL",
    status: "Phishing",
    score: "94.1%",
    badgeBg: "bg-[#fef2f2]",
    badgeText: "text-[#991b1b]",
    dotColor: "bg-error",
    stateKey: "phishing"
  }
];
