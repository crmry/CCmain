/**
 * Citizen Charter Web Server (Hardened Standalone - No XAMPP Required)
 * Corazon Locsin Montelibano Memorial Regional Hospital (CLMMRH)
 * 
 * Security Hardening Features:
 *   - Zero Child Process / Zero Shell Execution (Immune to command injection & node2shell)
 *   - Strict Path Traversal Prevention (Rejects null bytes, Windows alternate data streams, dot-dot attacks)
 *   - Extension Whitelisting (Blocks access to server scripts, configs, .bat, .vbs, .php, .env)
 *   - Anti-DoS Body Size Capping (Max 512 KB payload)
 *   - Strict Input Sanitization & Type Coercion (Prevents prototype pollution & object injection)
 *   - Full OWASP Security Headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
 *   - Information Disclosure Protection (No server version/runtime leakage)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const os = require('os');

const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = path.resolve(__dirname);
const ROOT_DIR_WITH_SEP = ROOT_DIR.endsWith(path.sep) ? ROOT_DIR : ROOT_DIR + path.sep;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const MAX_BODY_SIZE = 512 * 1024; // 512 KB limit (Citizen Charter forms are < 50KB)

// Initialize data storage directory safely
try {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SERVICES_FILE)) {
        fs.writeFileSync(SERVICES_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
} catch (e) {
    console.error('[SECURITY WARNING] Error initializing data directory:', e.message);
}

// Strict whitelist of allowable static file extensions
const ALLOWED_MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8'
};

// Files and extensions explicitly forbidden from public access
const BLOCKED_EXTENSIONS = new Set([
    '.bat', '.cmd', '.vbs', '.ps1', '.sh',
    '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
    '.py', '.pyc',
    '.exe', '.dll', '.msi',
    '.json', '.jsonl', '.log',
    '.env', '.ini', '.config', '.bak', '.swp', '.git'
]);

function applySecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.ckeditor.com; " +
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://cdnjs.cloudflare.com data:; " +
        "img-src 'self' data: blob:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'self';"
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sanitizeString(input, maxLength = 100000) {
    if (typeof input !== 'string') {
        if (input === null || input === undefined) return '';
        input = String(input);
    }
    // Strip dangerous control chars (except tab, newline, carriage return)
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLength);
}

function getLocalIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses;
}

function handleSaveService(req, res, postBody) {
    try {
        let payload = {};
        const contentType = req.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
            payload = JSON.parse(postBody);
        } else {
            payload = querystring.parse(postBody);
        }

        // Prototype pollution defense & strict parameter plucking
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
            payload = {};
        }

        const newRecord = {
            id: Date.now(),
            savedAt: new Date().toISOString(),
            serviceName: sanitizeString(payload.serviceName, 255),
            description: sanitizeString(payload.description, 50000),
            office: sanitizeString(payload.office, 500),
            classification: sanitizeString(payload.classification, 100),
            transactionTypes: sanitizeString(payload.transactionTypes || payload.transaction_type, 255),
            whoMayAvail: sanitizeString(payload.whoMayAvail || payload.who_may_avail, 2000),
            requirements: sanitizeString(payload.requirements, 50000),
            processOverview: sanitizeString(payload.processOverview, 50000),
            feesToBePaid: sanitizeString(payload.feesToBePaid, 500),
            processingTime: sanitizeString(payload.processingTime, 500)
        };

        let currentRecords = [];
        try {
            if (fs.existsSync(SERVICES_FILE)) {
                const raw = fs.readFileSync(SERVICES_FILE, 'utf-8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    currentRecords = parsed;
                }
            }
        } catch (e) {
            currentRecords = [];
        }

        currentRecords.push(newRecord);
        // Atomic write to prevent file corruption
        const tempFile = SERVICES_FILE + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(currentRecords, null, 2), 'utf-8');
        fs.renameSync(tempFile, SERVICES_FILE);

        applySecurityHeaders(res);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('New record created successfully');
    } catch (err) {
        console.error('[SECURITY LOG] Error in handleSaveService:', err.message);
        applySecurityHeaders(res);
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Error: Invalid request payload');
    }
}

function handleRequest(req, res) {
    // Immediate preflight response
    if (req.method === 'OPTIONS') {
        applySecurityHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }

    // Only allow GET and POST
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'POST') {
        applySecurityHeaders(res);
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('405 Method Not Allowed');
        return;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(req.url, 'http://localhost');
    } catch (e) {
        applySecurityHeaders(res);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('400 Bad Request');
        return;
    }

    let rawPath = parsedUrl.pathname || '/';

    // Decode URI path safely
    let decodedPath = '';
    try {
        decodedPath = decodeURIComponent(rawPath);
    } catch (e) {
        applySecurityHeaders(res);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('400 Bad Request');
        return;
    }

    // 1. Path Traversal & Shell Exploit Probes Inspection:
    // Reject null bytes, Windows Alternate Data Streams, or encoded backslash tricks
    if (decodedPath.includes('\0') || decodedPath.includes(':') || decodedPath.includes('\\')) {
        applySecurityHeaders(res);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('400 Bad Request: Invalid Characters');
        return;
    }

    // Normalize slashes
    let pathname = decodedPath.replace(/\/+/g, '/');
    const lowerPath = pathname.toLowerCase();

    // 2. Route shortcuts and friendly redirects (case-insensitive)
    if (lowerPath === '/' || lowerPath === '/ccmain' || lowerPath === '/ccmain/' || lowerPath === '/main.html') {
        applySecurityHeaders(res);
        res.writeHead(302, { 'Location': '/ccmain/main.html' });
        res.end();
        return;
    }

    // 3. Safe in-memory replacement for save_service.php
    // (Never invokes any PHP runtime or shell; writes to data/services.json)
    if (lowerPath === '/ccmain/save_service.php' || lowerPath === '/save_service.php') {
        if (req.method === 'POST') {
            const contentLength = parseInt(req.headers['content-length'], 10);
            if (contentLength && contentLength > MAX_BODY_SIZE) {
                applySecurityHeaders(res);
                res.writeHead(413, { 'Content-Type': 'text/plain', 'Connection': 'close' });
                res.end('413 Payload Too Large');
                return;
            }

            let body = '';
            let exceeded = false;
            req.on('data', chunk => {
                if (exceeded) return;
                body += chunk.toString();
                if (body.length > MAX_BODY_SIZE) {
                    exceeded = true;
                    applySecurityHeaders(res);
                    res.writeHead(413, { 'Content-Type': 'text/plain', 'Connection': 'close' });
                    res.end('413 Payload Too Large');
                    req.pause();
                }
            });
            req.on('end', () => {
                if (exceeded) return;
                handleSaveService(req, res, body);
            });
            return;
        } else {
            applySecurityHeaders(res);
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Invalid request method');
            return;
        }
    }

    // Only GET and HEAD allowed for static assets
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        applySecurityHeaders(res);
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('405 Method Not Allowed');
        return;
    }

    // 4. Map path to local filesystem
    let relativePath = pathname;
    if (lowerPath.startsWith('/ccmain/')) {
        relativePath = relativePath.slice('/ccmain/'.length);
    } else if (relativePath.startsWith('/')) {
        relativePath = relativePath.slice(1);
    }

    if (!relativePath || relativePath === '') {
        relativePath = 'main.html';
    }

    // 5. Strict Path Traversal verification
    const safePath = path.normalize(path.join(ROOT_DIR, relativePath));
    if (safePath !== ROOT_DIR && !safePath.startsWith(ROOT_DIR_WITH_SEP)) {
        applySecurityHeaders(res);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // 6. Block internal data directory and server scripts from direct access
    if (safePath.startsWith(DATA_DIR) || safePath.toLowerCase().endsWith('services.json')) {
        applySecurityHeaders(res);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    const filename = path.basename(safePath).toLowerCase();
    if (filename === 'server.js' || filename === 'server.py' || filename === 'package.json') {
        applySecurityHeaders(res);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
    }

    const ext = path.extname(safePath).toLowerCase();

    // Check extension whitelist & blocklist
    if (BLOCKED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES[ext]) {
        applySecurityHeaders(res);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
    }

    fs.stat(safePath, (err, stats) => {
        if (err || !stats.isFile()) {
            applySecurityHeaders(res);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>404 - File Not Found</h2><p><a href="/ccmain/main.html">Go to Citizen Charter Builder</a></p></body></html>`);
            return;
        }

        serveFile(safePath, ext, res, req.method === 'HEAD');
    });
}

function serveFile(filePath, ext, res, isHeadOnly) {
    const contentType = ALLOWED_MIME_TYPES[ext] || 'application/octet-stream';
    applySecurityHeaders(res);

    const headers = { 'Content-Type': contentType };
    if (ext === '.html') {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else {
        headers['Cache-Control'] = 'public, max-age=3600';
    }

    if (isHeadOnly) {
        res.writeHead(200, headers);
        res.end();
        return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', (readErr) => {
        console.error('[SECURITY LOG] File stream error:', readErr.message);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
        }
    });

    res.writeHead(200, headers);
    stream.pipe(res);
}

// Dedicated Port: 6767 (ASCII 'CC' for Citizen Charter)
// Port 80 is left 100% FREE for XAMPP / Apache / IIS.
const PORT = parseInt(process.env.PORT, 10) || 6767;
const FALLBACK_PORTS = [8899, 6768];
const ips = getLocalIpAddresses();

function startServer(portToTry, fallbackIndex = 0) {
    const server = http.createServer(handleRequest);

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && !process.env.PORT && fallbackIndex < FALLBACK_PORTS.length) {
            const nextPort = FALLBACK_PORTS[fallbackIndex];
            console.warn(`[NOTICE] Port ${portToTry} is in use. Falling back to Port ${nextPort}...`);
            startServer(nextPort, fallbackIndex + 1);
            return;
        }
        if (err.code === 'EADDRINUSE') {
            console.error(`\n[ERROR] Port ${portToTry} is already in use by another application!`);
            console.error(`Please stop the service using Port ${portToTry} or run stop-server.bat`);
        } else if (err.code === 'EACCES') {
            console.error(`\n[ERROR] Permission denied on Port ${portToTry}.`);
        } else {
            console.error(`\n[ERROR] Server error:`, err.message);
        }
        process.exit(1);
    });

    server.listen(portToTry, HOST, () => {
        console.log('================================================================');
        console.log('   Citizen Charter Builder Server (Hardened - Standalone)');
        console.log('   Protected against: PHP2Shell, Node2Shell, Path Traversal');
        console.log('   Port 80 Status: Completely FREE for XAMPP / Apache');
        console.log('================================================================');
        console.log(` Status: RUNNING on Dedicated Port ${portToTry}`);
        console.log(` Web Root: ${ROOT_DIR}\n`);
        console.log(' Access URLs:');
        console.log(`   - Local:    http://localhost:${portToTry}/CCmain/main.html`);
        ips.forEach(ip => {
            console.log(`   - Network:  http://${ip}:${portToTry}/CCmain/main.html`);
        });
        console.log(`   - Target:   http://172.16.254.100:${portToTry}/CCmain/main.html`);
        console.log('================================================================\n');
    });
}

startServer(PORT);
