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

// Crear tabla de clasificaciones si no existe
$createTable = "CREATE TABLE IF NOT EXISTS clasificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    rango_edad VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($createTable);
    
    // Insertar clasificaciones por defecto si no existen
    $checkClassifications = $pdo->query("SELECT COUNT(*) FROM clasificaciones");
    if ($checkClassifications->fetchColumn() == 0) {
        $defaultClassifications = [
            ['A', 'Todo público', 'Apta para todo público'],
            ['B', '12+', 'Apta para mayores de 12 años'],
            ['B-15', '15+', 'Apta para mayores de 15 años'],
            ['C', '18+', 'Apta para mayores de 18 años'],
            ['D', '18+', 'Películas para adultos']
        ];
        
        $insertClassification = $pdo->prepare("INSERT INTO clasificaciones (nombre, rango_edad, descripcion) VALUES (?, ?, ?)");
        foreach ($defaultClassifications as $classification) {
            $insertClassification->execute($classification);
        }
    }
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Error al crear tabla de clasificaciones']));
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'addClassification':
        $name = $_POST['name'] ?? '';
        $ageRange = $_POST['ageRange'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if (empty($name) || empty($ageRange)) {
            echo json_encode(['success' => false, 'message' => 'El nombre y rango de edad son requeridos']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO clasificaciones (nombre, rango_edad, descripcion) VALUES (?, ?, ?)");
            $stmt->execute([$name, $ageRange, $description]);
            
            echo json_encode(['success' => true, 'message' => 'Clasificación agregada exitosamente']);
        } catch(PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['success' => false, 'message' => 'Ya existe una clasificación con ese nombre']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al agregar la clasificación']);
            }
        }
        break;
        
    case 'getClassifications':
        try {
            $stmt = $pdo->query("SELECT * FROM clasificaciones ORDER BY nombre");
            $classifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'classifications' => $classifications]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener las clasificaciones']);
        }
        break;
        
    case 'updateClassification':
        $id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $ageRange = $_POST['ageRange'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if (empty($id) || empty($name) || empty($ageRange)) {
            echo json_encode(['success' => false, 'message' => 'ID, nombre y rango de edad son requeridos']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE clasificaciones SET nombre = ?, rango_edad = ?, descripcion = ? WHERE id = ?");
            $stmt->execute([$name, $ageRange, $description, $id]);
            
            echo json_encode(['success' => true, 'message' => 'Clasificación actualizada exitosamente']);
        } catch(PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['success' => false, 'message' => 'Ya existe una clasificación con ese nombre']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar la clasificación']);
            }
        }
        break;
        
    case 'deleteClassification':
        $id = $_POST['id'] ?? '';
        
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID de clasificación es requerido']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM clasificaciones WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Clasificación eliminada exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Clasificación no encontrada']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar la clasificación']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}
?> 