<?php
/**
 * contact.php — server-side email handler for the portfolio contact form.
 *
 * Deploy this file to any PHP host (shared hosting, VPS, etc.).
 * Update $RECIPIENT below with your email address.
 * Set form_endpoint in portfolio_config.yaml / my_profile.yaml to the URL of this file.
 *
 * For GitHub Pages (static hosting):
 *   Either host this file separately and point form_endpoint to its full URL,
 *   or use Formspree (https://formspree.io) — free tier, no PHP needed.
 */

/* ── Config ─────────────────────────────────────────────── */
define('RECIPIENT', 'monislow@msu.edu');
define('SUBJECT_PREFIX', 'Portfolio message');
define('ALLOWED_ORIGIN', '*');   /* restrict to your domain in production, e.g. 'https://lowell-monis.github.io' */

/* ── CORS ────────────────────────────────────────────────── */
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

/* ── Input validation ────────────────────────────────────── */
$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(filter_var($_POST['email']   ?? '', FILTER_SANITIZE_EMAIL));
$message = trim(strip_tags($_POST['message'] ?? ''));

if (!$name || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and message are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

/* ── Send ────────────────────────────────────────────────── */
$subject = SUBJECT_PREFIX . ' from ' . $name;
$body    = "From: {$name} <{$email}>\n\n{$message}";
$headers = implode("\r\n", [
    'From: noreply@' . ($_SERVER['HTTP_HOST'] ?? 'portfolio'),
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
]);

if (@mail(RECIPIENT, $subject, $body, $headers)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Mail could not be sent. Check your server\'s mail configuration.']);
}
