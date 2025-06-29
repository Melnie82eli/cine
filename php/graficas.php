<?php
session_start();
header('Content-Type: application/json');

// Verificar si el usuario está logueado y es admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
    exit;
}

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'cine';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']));
}

$action = $_GET['action'] ?? '';

switch($action) {
    case 'getEarnings':
        $tipo = $_GET['tipo'] ?? 'diarias';
        
        try {
            $data = [];
            
            switch($tipo) {
                case 'diarias':
                    // Datos de ejemplo para ganancias diarias (últimos 7 días)
                    for ($i = 6; $i >= 0; $i--) {
                        $date = date('Y-m-d', strtotime("-$i days"));
                        $data[] = [
                            'label' => date('d/m', strtotime($date)),
                            'value' => rand(8000, 25000)
                        ];
                    }
                    break;
                    
                case 'semanales':
                    // Datos de ejemplo para ganancias semanales (últimas 8 semanas)
                    for ($i = 7; $i >= 0; $i--) {
                        $weekStart = date('Y-m-d', strtotime("-$i weeks"));
                        $data[] = [
                            'label' => 'Sem ' . date('W', strtotime($weekStart)),
                            'value' => rand(50000, 150000)
                        ];
                    }
                    break;
                    
                case 'mensuales':
                    // Datos de ejemplo para ganancias mensuales (últimos 12 meses)
                    for ($i = 11; $i >= 0; $i--) {
                        $month = date('Y-m', strtotime("-$i months"));
                        $data[] = [
                            'label' => date('M Y', strtotime($month . '-01')),
                            'value' => rand(200000, 600000)
                        ];
                    }
                    break;
                    
                case 'anuales':
                    // Datos de ejemplo para ganancias anuales (últimos 5 años)
                    for ($i = 4; $i >= 0; $i--) {
                        $year = date('Y') - $i;
                        $data[] = [
                            'label' => $year,
                            'value' => rand(2000000, 8000000)
                        ];
                    }
                    break;
            }
            
            echo json_encode(['success' => true, 'data' => $data]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener datos de ganancias']);
        }
        break;
        
    case 'getSummaryStats':
        try {
            // Estadísticas de ejemplo
            $stats = [
                'totalEarnings' => 425680,
                'totalTickets' => 15420,
                'totalFood' => 85640,
                'avgPerDay' => 15420,
                'categoryDistribution' => [
                    ['category' => 'Acción', 'value' => 35],
                    ['category' => 'Comedia', 'value' => 25],
                    ['category' => 'Drama', 'value' => 20],
                    ['category' => 'Terror', 'value' => 10],
                    ['category' => 'Otros', 'value' => 10]
                ],
                'typeDistribution' => [
                    ['type' => 'Entradas', 'value' => 70],
                    ['type' => 'Comida', 'value' => 20],
                    ['type' => 'Otros', 'value' => 10]
                ]
            ];
            
            echo json_encode(['success' => true, 'stats' => $stats]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener estadísticas']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}
?> 