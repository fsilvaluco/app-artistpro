<?php
// webhook-deploy.php
// Coloca este archivo en tu servidor SiteGround

// Configuración
$secret = 'tu_webhook_secret_aqui'; // Cambiar por un secret seguro
$repo_path = '/home/tu_usuario/artistpro';
$web_path = '/home/tu_usuario/public_html';

// Verificar que la petición viene de GitHub
function verify_github_signature($payload, $signature, $secret) {
    $calculated_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($calculated_signature, $signature);
}

// Log function
function write_log($message) {
    $log_file = __DIR__ . '/deploy.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method not allowed');
}

// Obtener payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verificar signature (opcional pero recomendado)
if (!empty($secret) && !verify_github_signature($payload, $signature, $secret)) {
    write_log('ERROR: Invalid signature');
    http_response_code(403);
    die('Forbidden');
}

// Decodificar payload
$data = json_decode($payload, true);

// Verificar que es un push al branch main
if ($data['ref'] !== 'refs/heads/main') {
    write_log('INFO: Push no es al branch main, ignorando');
    die('Not main branch');
}

write_log('INFO: Webhook recibido, iniciando despliegue...');

// Cambiar al directorio del repositorio
chdir($repo_path);

// Comandos de despliegue
$commands = [
    'git pull origin main 2>&1',
    'npm install 2>&1',
    'npm run build 2>&1',
    "cp -r out/* $web_path/ 2>&1",
    "chmod -R 755 $web_path 2>&1"
];

$success = true;
foreach ($commands as $cmd) {
    write_log("EXEC: $cmd");
    $output = shell_exec($cmd);
    write_log("OUTPUT: $output");
    
    // Verificar si el comando falló
    if (strpos($output, 'error') !== false || strpos($output, 'Error') !== false) {
        $success = false;
        write_log("ERROR: Comando falló: $cmd");
        break;
    }
}

if ($success) {
    write_log('SUCCESS: Despliegue completado exitosamente');
    echo 'Deploy successful';
} else {
    write_log('ERROR: Despliegue falló');
    http_response_code(500);
    echo 'Deploy failed';
}
?>
