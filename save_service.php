<?php
/**
 * DEPRECATED - Citizen Charter Builder Service Handler
 * 
 * Notice: This script has been retired and replaced by the standalone hardened server
 * (server.js / server.py) to eliminate PHP runtime vulnerabilities (PHP2Shell / CVE-2024-4577).
 * Submissions to /ccmain/save_service.php are intercepted and saved securely in data/services.json.
 */

http_response_code(403);
header('Content-Type: text/plain; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
die("Access Forbidden: PHP execution is disabled. Handled by standalone server.");
?>