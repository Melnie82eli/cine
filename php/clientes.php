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

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'getClients':
        try {
            $stmt = $pdo->query("SELECT * FROM usuarios WHERE role = 'cliente' ORDER BY fecha_registro DESC");
            $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'clients' => $clients]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener los clientes']);
        }
        break;
        
    case 'getStats':
        try {
            // Total de clientes
            $totalStmt = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE role = 'cliente'");
            $total = $totalStmt->fetchColumn();
            
            // Nuevos este mes
            $newStmt = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE role = 'cliente' AND MONTH(fecha_registro) = MONTH(CURRENT_DATE()) AND YEAR(fecha_registro) = YEAR(CURRENT_DATE())");
            $newThisMonth = $newStmt->fetchColumn();
            
            // Clientes activos (registrados en los últimos 30 días)
            $activeStmt = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE role = 'cliente' AND fecha_registro >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)");
            $active = $activeStmt->fetchColumn();
            
            echo json_encode([
                'success' => true, 
                'stats' => [
                    'total' => $total,
                    'newThisMonth' => $newThisMonth,
                    'active' => $active
                ]
            ]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener estadísticas']);
        }
        break;
        
    case 'searchClients':
        $search = $_GET['search'] ?? '';
        $date = $_GET['date'] ?? '';
        $sort = $_GET['sort'] ?? 'name';
        
        try {
            $whereConditions = ["role = 'cliente'"];
            $params = [];
            
            if (!empty($search)) {
                $whereConditions[] = "(nombre LIKE ? OR email LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            
            if (!empty($date)) {
                $whereConditions[] = "DATE(fecha_registro) = ?";
                $params[] = $date;
            }
            
            $whereClause = implode(' AND ', $whereConditions);
            
            $orderBy = match($sort) {
                'name' => 'nombre ASC',
                'date' => 'fecha_registro DESC',
                'email' => 'email ASC',
                default => 'nombre ASC'
            };
            
            $sql = "SELECT * FROM usuarios WHERE $whereClause ORDER BY $orderBy";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'clients' => $clients]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al buscar clientes']);
        }
        break;
        
    case 'deleteClient':
        $id = $_POST['id'] ?? '';
        
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID de cliente es requerido']);
            exit;
        }
        
        try {
            // Verificar que no sea el admin
            $checkStmt = $pdo->prepare("SELECT role FROM usuarios WHERE id = ?");
            $checkStmt->execute([$id]);
            $user = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && $user['role'] === 'admin') {
                echo json_encode(['success' => false, 'message' => 'No se puede eliminar un administrador']);
                exit;
            }
            
            // Obtener información de la imagen para eliminarla
            $stmt = $pdo->prepare("SELECT imagen_perfil FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($client && $client['imagen_perfil']) {
                $imagePath = '../' . $client['imagen_perfil'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
            
            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ? AND role = 'cliente'");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Cliente eliminado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Cliente no encontrado']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar el cliente']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}
?> 