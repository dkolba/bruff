---
name: web-security
description: >
  Apply this skill whenever the task involves web security: writing or auditing HTTP security headers,
  configuring CSP, CORS, HSTS, or Permissions-Policy, sanitising untrusted HTML (Sanitizer API / DOMPurify),
  implementing Trusted Types to prevent DOM-XSS, setting up the Reporting API to capture CSP/COEP/deprecation
  violations, hardening cookies (SameSite, HttpOnly, Secure, Partitioned), implementing WebAuthn / Credential
  Management, using Web Crypto for client-side cryptography, or auditing code for XSS, CSRF, clickjacking,
  MIME-sniffing, mixed content, or cross-origin data leakage. Triggers on keywords: XSS, CSRF, CSP,
  CORS, HSTS, SameSite, innerHTML, eval, Trusted Types, Sanitizer, ReportingObserver, WebAuthn,
  cross-origin, clickjacking, Content-Security-Policy, Referrer-Policy, Permissions-Policy, subresource
  integrity, cookie security, secure context, same-origin, mixed content.
---

# Web Security Skill

You are an expert web security engineer. Your job is to write secure-by-default code, audit existing code for vulnerabilities, configure correct HTTP headers, and explain the browser security model precisely. Always reach for platform-native defenses first, then well-maintained libraries, then custom logic.

---

## 1. Mental Model: The Four Security Layers

Treat every web security task through four lenses, addressing all that are relevant:

```
┌─────────────────────────────────────────────┐
│  1. Browser Security Model                  │  Same-origin policy, secure contexts, cross-origin isolation
│  2. Transport Security                      │  HTTPS / TLS, HSTS, certificate transparency, mixed content
│  3. Application Security (HTTP headers)     │  CSP, CORS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options
│  4. Runtime / DOM Security                  │  Trusted Types, HTML Sanitizer API, Web Crypto, WebAuthn, cookie security
└─────────────────────────────────────────────┘
```

Never treat security features as isolated checkboxes — they compose. A tight CSP is weaker without HTTPS; Trusted Types is weaker without `require-trusted-types-for`.

---

## 2. Browser Security Model

### Same-Origin Policy (SOP)
- An **origin** = scheme + host + port. `https://a.com` ≠ `http://a.com` ≠ `https://a.com:8080`.
- Scripts can only read responses from the same origin by default.
- SOP is the foundation everything else protects.

### Secure Contexts
- Many powerful APIs (Web Crypto, WebAuthn, Service Workers, Geolocation) require a **secure context**: `https://` or `http://localhost`.
- Always develop and deploy on HTTPS. Never relax this for convenience.

### Cross-Origin Isolation
Required to use `SharedArrayBuffer` and high-resolution timers (Spectre mitigations). Achieved with:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```
These headers together set `window.crossOriginIsolated = true`. Only add them when you need the APIs they unlock — they break some cross-origin resource loading.

### Cross-Origin Resource Policy (CORP)
Prevents other origins from loading your resources (images, scripts, fonts) without your consent:
```
Cross-Origin-Resource-Policy: same-origin   # most restrictive
Cross-Origin-Resource-Policy: same-site     # allow same-site subdomains
Cross-Origin-Resource-Policy: cross-origin  # allow all (use only for public CDN assets)
```

---

## 3. Transport Security

### HTTPS / TLS
- Serve all content over HTTPS. No exceptions.
- Use TLS 1.2+ (TLS 1.3 preferred). Disable older protocol versions server-side.
- Redirect HTTP → HTTPS with a 301 at the server or load balancer, then enforce with HSTS.

### HTTP Strict Transport Security (HSTS)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
- `max-age`: at minimum 1 year (31536000 seconds) for production; use 2 years (63072000) if preloading.
- `includeSubDomains`: essential if any subdomain handles sensitive data.
- `preload`: submit to hstspreload.org only after the above are stable.
- **Do not** set HSTS on HTTP responses or before redirects are working — it can lock users out.

### Mixed Content
- Never load HTTP sub-resources from HTTPS pages — browsers block them or warn.
- Use the `upgrade-insecure-requests` CSP directive during migrations to auto-upgrade requests.
- Use `block-all-mixed-content` for strict enforcement (deprecated in favour of browser defaults, but still communicates intent).

### Certificate Transparency
- All public CAs must submit certificates to CT logs (enforced by browsers).
- Monitor for unexpected certificates using services like crt.sh or Google's Transparency Report.

---

## 4. Content Security Policy (CSP)

CSP is the most powerful application-layer XSS defense. Understand the directive hierarchy before writing any policy.

### Core Directives

| Directive | Controls |
|---|---|
| `default-src` | Fallback for all fetch directives not explicitly set |
| `script-src` | JavaScript sources |
| `style-src` | CSS sources |
| `img-src` | Image sources |
| `connect-src` | fetch(), XHR, WebSocket destinations |
| `font-src` | Web fonts |
| `frame-src` | Allowed `<iframe>` sources |
| `frame-ancestors` | Who may embed *this* page (replaces `X-Frame-Options`) |
| `object-src` | `<object>`, `<embed>`, `<applet>` |
| `base-uri` | Restricts `<base href>` (prevents base-tag injection) |
| `form-action` | Where `<form>` may submit |
| `upgrade-insecure-requests` | Auto-upgrades HTTP sub-resource requests to HTTPS |
| `require-trusted-types-for 'script'` | Enforces Trusted Types on DOM sinks |
| `trusted-types` | Allowlist of valid Trusted Types policy names |
| `report-to` | Endpoint name for violation reports |

### Writing a Strict CSP

**Never** use `'unsafe-inline'` or `'unsafe-eval'` in `script-src` — they defeat XSS protection entirely.

**Preferred: nonce-based CSP** (works for SSR apps)
```
Content-Security-Policy:
  default-src 'none';
  script-src 'nonce-{RANDOM}' 'strict-dynamic';
  style-src 'nonce-{RANDOM}';
  img-src 'self' data:;
  connect-src 'self';
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  require-trusted-types-for 'script';
  trusted-types my-policy;
  report-to csp-endpoint;
```
- Generate a fresh, cryptographically random nonce per request (at least 128 bits, base64-encoded).
- `'strict-dynamic'` propagates trust to scripts loaded by a trusted script — removes the need to allowlist every CDN.
- `'none'` for `object-src` is non-negotiable; Flash and plugins are dead vectors.

**Hash-based CSP** (works for static inline scripts)
```
script-src 'sha256-{BASE64_HASH}';
```
Compute the SHA-256 hash of the exact script content (no trailing newline differences). Better for static sites; harder to maintain.

### Report-Only Mode (use before enforcing)
```
Content-Security-Policy-Report-Only: default-src 'self'; report-to csp-endpoint;
```
Violations are reported but not blocked. Always deploy in report-only first and monitor for at least a week before switching to enforcement.

### Violation Reporting
Connect CSP to the Reporting API (see Section 7):
```
Reporting-Endpoints: csp-endpoint="https://example.com/csp-reports"
Content-Security-Policy: ...; report-to csp-endpoint;
```

---

## 5. Other Critical HTTP Security Headers

Set all of these on every response unless there is a specific reason not to.

```
# Prevent MIME-type sniffing (required when serving user-uploaded files)
X-Content-Type-Options: nosniff

# Clickjacking protection (use CSP frame-ancestors for more control)
X-Frame-Options: DENY

# Referrer policy: send origin only on same-origin, nothing cross-origin
Referrer-Policy: strict-origin-when-cross-origin

# Permissions policy: disable what you don't use
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

# Cross-origin isolation (if needed for SharedArrayBuffer)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

**Never** emit `X-Powered-By`, `Server`, or other fingerprinting headers in production.

---

## 6. Trusted Types API

Trusted Types prevent DOM-based XSS by enforcing that data passes through a sanitisation function before reaching **injection sinks**.

### Injection Sinks to Guard

| Type | Sinks |
|---|---|
| HTML sinks | `element.innerHTML`, `element.outerHTML`, `element.insertAdjacentHTML()`, `document.write()`, `ShadowRoot.innerHTML`, `Range.createContextualFragment()` |
| Script sinks | `eval()`, `Function()`, `setTimeout(string)`, `setInterval(string)`, `HTMLScriptElement.text` |
| URL sinks | `HTMLScriptElement.src`, `Worker()` constructor URL, `ServiceWorkerContainer.register()` |

### Enabling Enforcement via CSP
```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types my-policy;
```
With this set, passing a plain string to any HTML sink throws a `TypeError`.

### Creating and Using a Policy

```js
// Create a named policy (name must appear in 'trusted-types' CSP directive)
const policy = trustedTypes.createPolicy('my-policy', {
  // For HTML sinks — sanitize input
  createHTML: (input) => {
    // Option A: native Sanitizer API (Chrome/Edge, check compat)
    const el = document.createElement('div');
    el.setHTML(input); // uses default XSS-safe sanitizer
    return el.innerHTML;
    
    // Option B: DOMPurify (cross-browser)
    // return DOMPurify.sanitize(input);
  },
  // For JS URL sinks — strict allowlist only; never sanitize JS
  createScriptURL: (url) => {
    const allowed = ['https://cdn.example.com/'];
    if (allowed.some(prefix => url.startsWith(prefix))) return url;
    throw new Error(`Disallowed script URL: ${url}`);
  },
  // For script sinks — avoid if at all possible
  createScript: (script) => {
    throw new Error('Dynamic script evaluation is not allowed');
  },
});

// Usage — pass TrustedHTML to the sink, never a raw string
const trustedHTML = policy.createHTML(userInput);
element.innerHTML = trustedHTML;       // ✅ safe
element.innerHTML = userInput;         // ❌ throws TypeError if CSP enforced
```

### Tinyfill for Non-Supporting Browsers

```js
// Add before any policy creation code
if (typeof trustedTypes === 'undefined') {
  trustedTypes = { createPolicy: (name, rules) => rules };
}
```
The transformation functions still run in non-supporting browsers — same code path, same protection, no enforcement overhead.

### Default Policy for Migration

During migration from legacy code, create a `"default"` policy that logs violations while still sanitizing:
```js
trustedTypes.createPolicy('default', {
  createHTML(value) {
    console.warn('Unsafe innerHTML assignment detected — refactor this!', new Error().stack);
    return DOMPurify.sanitize(value);
  },
});
```
This intercepts all raw string sink assignments and routes them through sanitization while you refactor.

---

## 7. HTML Sanitizer API

The native `Sanitizer` / `setHTML()` API (Baseline 2026, not yet fully cross-browser — use DOMPurify as fallback) provides browser-native HTML sanitization.

### Safe Methods (XSS-safe by default)
```js
// Drop-in replacement for innerHTML — always removes XSS-unsafe entities
element.setHTML(untrustedString);                 // uses default sanitizer
element.setHTML(untrustedString, { sanitizer });  // custom sanitizer; XSS-unsafe items still stripped
Document.parseHTML(untrustedString);              // parse into Document
```
These methods always enforce the **XSS-safe baseline**: removes `<script>`, `<iframe>`, `<object>`, `<embed>`, `<frame>`, `<use>`, and all event handler attributes (`onclick`, etc.).

### Custom Allow-List Sanitizer
```js
// Safest form: explicitly list what you allow
const sanitizer = new Sanitizer({
  elements: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br'],
  attributes: ['href', 'title'],
});
element.setHTML(untrustedString, { sanitizer });
```

### Custom Remove-List Sanitizer
```js
// Start from permissive defaults, remove specific things
const sanitizer = new Sanitizer({ removeElements: ['table', 'form'] });
element.setHTML(untrustedString, { sanitizer });
```

### Integration with Trusted Types
```js
const policy = trustedTypes.createPolicy('sanitizer-policy', {
  createHTML: (input) => {
    const div = document.createElement('div');
    div.setHTML(input); // native sanitization
    return div.innerHTML;
  },
});
element.innerHTML = policy.createHTML(untrustedInput); // TrustedHTML object
```

### Cross-Browser Strategy
Until the Sanitizer API has full cross-browser support, use:
```js
function safeSetHTML(element, untrustedString, sanitizer = null) {
  if (typeof element.setHTML === 'function') {
    element.setHTML(untrustedString, sanitizer ? { sanitizer } : undefined);
  } else {
    // DOMPurify fallback
    element.innerHTML = DOMPurify.sanitize(untrustedString);
  }
}
```

---

## 8. Reporting API

The Reporting API provides a consistent mechanism to receive security violation reports from browsers, without relying on in-page JavaScript (which can crash with the page).

### Server-Side Endpoints

```
# Define named endpoints
Reporting-Endpoints: csp-endpoint="https://reports.example.com/csp", default="https://reports.example.com/default"

# Direct CSP violations to the named endpoint
Content-Security-Policy: ...; report-to csp-endpoint;

# COEP violations
Cross-Origin-Embedder-Policy: require-corp; report-to default;
```

Reports are delivered as `POST` requests with `Content-Type: application/reports+json`. Your endpoint must handle JSON arrays of report objects.

### Report Types

| Report type | Source |
|---|---|
| `csp-violation` | CSP enforcement violations |
| `coep` | Cross-Origin-Embedder-Policy violations |
| `deprecation` | Use of deprecated browser APIs |
| `intervention` | Browser interventions (e.g., blocked autoplay) |
| `integrity-violation` | Subresource Integrity failures |

### In-Page ReportingObserver

Use `ReportingObserver` for runtime monitoring and developer tooling:
```js
const observer = new ReportingObserver((reports, observer) => {
  reports.forEach(report => {
    console.warn(`[${report.type}]`, report.body);
    // Send to your analytics / logging endpoint
    fetch('/internal/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
  });
}, {
  types: ['csp-violation', 'deprecation', 'intervention'],
  buffered: true, // capture reports generated before observer was created
});

observer.observe();
```

**Important**: `ReportingObserver` is less reliable than server endpoints for security violations — a page crash stops it. Use both: server endpoints for production security monitoring, observers for dev-mode diagnostics.

---

## 9. Cookie Security

Every `Set-Cookie` on a sensitive session or auth token must include all of:

```
Set-Cookie: sessionId=abc123;
  Secure;           # HTTPS only — non-negotiable
  HttpOnly;         # JavaScript cannot read it — prevents XSS token theft
  SameSite=Lax;     # Sent on top-level navigations; blocks CSRF on most forms
  Path=/;
  Max-Age=3600;
  __Host- prefix    # Forces Secure + Path=/ + no Domain attribute (strongest)
```

### SameSite Values

| Value | Cross-site GET | Cross-site POST | Same-site |
|---|---|---|---|
| `Strict` | ❌ | ❌ | ✅ |
| `Lax` (default) | ✅ (top-level nav) | ❌ | ✅ |
| `None` | ✅ | ✅ | ✅ (requires `Secure`) |

- Use `SameSite=Strict` for admin/sensitive cookies.
- Use `SameSite=Lax` for session cookies where you need cross-site link navigation to work.
- Use `SameSite=None; Secure` only for intentional third-party contexts (payment iframes, OAuth callbacks, embeds).

### Cookie Prefixes
- `__Host-name`: Forces `Secure`, `Path=/`, and no `Domain` attribute. Strongest binding.
- `__Secure-name`: Forces `Secure` only.

### Partitioned Cookies (CHIPS)
For third-party cookies that must survive privacy changes:
```
Set-Cookie: tracking=abc; Secure; SameSite=None; Partitioned;
```
Partitioned cookies are isolated per top-level site, preventing cross-site tracking.

---

## 10. Authentication Security

### WebAuthn / Passkeys
Prefer WebAuthn over passwords where possible — it is phishing-resistant, bound to the origin, and requires a secure context.

```js
// Registration
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: cryptoRandomBytes,           // server-generated, never reuse
    rp: { name: 'My App', id: 'example.com' },
    user: { id: userId, name: userEmail, displayName: userName },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },     // ES256
      { type: 'public-key', alg: -257 },   // RS256
    ],
    authenticatorSelection: {
      residentKey: 'required',             // passkeys
      userVerification: 'required',        // biometric / PIN
    },
    timeout: 60000,
    attestation: 'none',                   // 'direct' for enterprise use
  },
});
```

Always verify the WebAuthn response **server-side**: origin, rpIdHash, clientDataHash, signature, and counter.

### Credential Management API
```js
// Store credentials after login
await navigator.credentials.store(new PasswordCredential({ id, password }));

// Retrieve stored credentials (auto-fill / one-tap)
const cred = await navigator.credentials.get({
  password: true,
  mediation: 'optional',  // 'required' forces picker, 'silent' no UI
});
```

---

## 11. Web Crypto API

Use `crypto.subtle` for all client-side cryptographic operations. It is only available in secure contexts.

```js
// Generate a symmetric key for AES-GCM (authenticated encryption)
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,           // extractable (set false if key should never leave JS context)
  ['encrypt', 'decrypt'],
);

// Encrypt
const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  plaintext,      // ArrayBuffer or TypedArray
);

// Decrypt
const plaintext = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  key,
  ciphertext,
);

// Derive key from password (PBKDF2)
const baseKey = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(password),
  'PBKDF2',
  false,
  ['deriveKey'],
);
const derivedKey = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
  baseKey,
  256,
);
```

**Never use `Math.random()` for anything security-related.** Always use `crypto.getRandomValues()`.

---

## 12. CORS Configuration

CORS is a server-side permission system, not a security boundary. Misconfiguring it lets other origins read your data.

### Response Headers

```
Access-Control-Allow-Origin: https://trusted.example.com   # NEVER use '*' for credentialed requests
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true                     # only when needed + origin is explicit
Access-Control-Max-Age: 86400                              # cache preflight for 1 day
```

### Common CORS Mistakes

```js
// ❌ Reflecting any Origin header back — equivalent to '*' but also allows credentials
const origin = req.headers.origin;
res.setHeader('Access-Control-Allow-Origin', origin); // vulnerable

// ✅ Validate against an allowlist
const ALLOWED_ORIGINS = new Set(['https://app.example.com', 'https://admin.example.com']);
if (ALLOWED_ORIGINS.has(req.headers.origin)) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Vary', 'Origin'); // critical — tells caches the response varies by origin
}
```

Always set `Vary: Origin` when the `Access-Control-Allow-Origin` value varies — without it, caches may serve the wrong origin's CORS response.

---

## 13. Subresource Integrity (SRI)

For any third-party script or stylesheet, add an `integrity` attribute:

```html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-{BASE64_HASH}"
  crossorigin="anonymous">
</script>
```

Generate hashes:
```bash
openssl dgst -sha384 -binary lib.js | openssl base64 -A
```
Or use `shasum -a 384 lib.js | awk '{print $1}' | xxd -r -p | base64`.

Pair with CSP's `require-sri-for` (experimental) or rely on the `integrity` attribute enforcement already built into browsers. For full enforcement, combine with an `Integrity-Policy` header and the Reporting API.

---

## 14. Attack Patterns & Defenses Reference

### XSS (Cross-Site Scripting)
- **Root cause**: Untrusted data reaching DOM sinks or reflected in HTML without encoding.
- **Defenses**: Strict CSP (nonce-based) + Trusted Types + HTML Sanitizer API. Output-encode all user data in templates (context-aware: HTML, attribute, JS, URL, CSS escaping).
- **Key rule**: Never pass user input to `innerHTML`, `eval()`, `document.write()`, or `setTimeout(string)` without going through a Trusted Types policy.

### CSRF (Cross-Site Request Forgery)
- **Root cause**: Browser automatically includes cookies on cross-origin requests.
- **Defenses**: `SameSite=Lax/Strict` cookies + server-side CSRF tokens for state-changing endpoints. Check `Origin` / `Referer` headers server-side as a secondary control.

### Clickjacking
- **Root cause**: Attacker embeds your page in an invisible `<iframe>` and tricks users into clicking.
- **Defenses**: `Content-Security-Policy: frame-ancestors 'none'` (or `'self'`). Legacy: `X-Frame-Options: DENY`.

### MIME Sniffing
- **Root cause**: Browser guesses content type and executes a text file as JS.
- **Defense**: `X-Content-Type-Options: nosniff` on every response. Set correct `Content-Type` for all served files.

### Open Redirect
- **Root cause**: Server or client redirects to an attacker-controlled URL from a parameter.
- **Defense**: Validate redirect targets against an allowlist of paths. Never redirect to a full URL from user input.

### Prototype Pollution
- **Root cause**: Attacker writes to `__proto__` or `Object.prototype` via object merge / spread patterns.
- **Defense**: Use `Object.create(null)` for data dictionaries. Freeze `Object.prototype` in sensitive contexts. Validate and sanitize any data used in object merge operations.

---

## 15. Security Headers Audit Checklist

When reviewing or generating server configuration, verify every response includes:

```
✅ Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
✅ Content-Security-Policy: [strict nonce/hash policy]; report-to csp-endpoint
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY  (or use CSP frame-ancestors)
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
✅ Cross-Origin-Resource-Policy: same-origin  (or appropriate value)
✅ Reporting-Endpoints: [endpoint definitions]

❌ Remove: X-Powered-By, Server, X-AspNet-Version, X-AspNetMvc-Version
```

Use MDN's HTTP Observatory (https://developer.mozilla.org/en-US/observatory) or securityheaders.com to grade any production site.

---

## 16. Code Patterns: Do and Don't

```js
// ──────────────────────────────────────────────
// XSS — innerHTML
// ──────────────────────────────────────────────
// ❌ Never
element.innerHTML = userInput;
element.innerHTML = `<span>${data}</span>`;

// ✅ Preferred (native, XSS-safe by default)
element.setHTML(userInput);

// ✅ With Trusted Types
element.innerHTML = policy.createHTML(userInput);

// ✅ Structural DOM (no HTML parsing at all — safest)
const span = document.createElement('span');
span.textContent = userInput;   // textContent never executes HTML
element.appendChild(span);


// ──────────────────────────────────────────────
// XSS — eval and dynamic code
// ──────────────────────────────────────────────
// ❌ Never
eval(userCode);
setTimeout(userString, 1000);
new Function(userString)();

// ✅ Use data instead of code; if code is unavoidable, use Trusted Types
const fn = policy.createScript(sanitizedScript);


// ──────────────────────────────────────────────
// URL handling
// ──────────────────────────────────────────────
// ❌ Never
location.href = userInput;
element.src = userInput;

// ✅ Validate scheme and origin
function safeURL(input) {
  try {
    const url = new URL(input, location.origin);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Bad scheme');
    return url.href;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Storage of sensitive data
// ──────────────────────────────────────────────
// ❌ Never store auth tokens, session IDs, or PII in localStorage/sessionStorage
// (accessible to any same-origin JS — XSS steals them instantly)
localStorage.setItem('token', jwt);

// ✅ Use HttpOnly cookies for session tokens (JS cannot read them)
// ✅ For client-side state that must be stored, encrypt with Web Crypto before writing

// ──────────────────────────────────────────────
// Random values
// ──────────────────────────────────────────────
// ❌ Never for security
const token = Math.random().toString(36);

// ✅ Always
const token = crypto.randomUUID();
const bytes = crypto.getRandomValues(new Uint8Array(32));
```

---

## 17. Implementation Order for a New Application

Follow this sequence when hardening a new or existing web application:

1. **HTTPS everywhere** — enforce at infrastructure level; add HSTS header.
2. **Secure cookies** — add `Secure; HttpOnly; SameSite=Lax` to all session cookies; use `__Host-` prefix.
3. **Strict CSP in report-only** — deploy `Content-Security-Policy-Report-Only` with a nonce-based policy; set up a reporting endpoint; monitor for 1–2 weeks.
4. **Other security headers** — `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`.
5. **Enforce CSP** — switch from Report-Only to enforcement once violations are resolved.
6. **Add Trusted Types** — add `require-trusted-types-for 'script'` to CSP; create policies; use default policy with logging during migration.
7. **Adopt native Sanitizer API** (with DOMPurify fallback) — replace all `innerHTML` assignments with `setHTML()` or Trusted Types–wrapped sanitization.
8. **SRI for third-party resources** — add `integrity` hashes to all `<script>` and `<link>` tags loading from CDNs.
9. **Reporting API** — configure `Reporting-Endpoints`; connect to a log aggregator; alert on sustained CSP violations.
10. **WebAuthn** — replace password-only auth with passkeys or MFA; use Credential Management API.
