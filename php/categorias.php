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
$dbname = 'cine_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']));
}

// Crear tabla de categorías si no existe
$createTable = "CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($createTable);
    
    // Insertar categorías por defecto si no existen
    $checkCategories = $pdo->query("SELECT COUNT(*) FROM categorias");
    if ($checkCategories->fetchColumn() == 0) {
        $defaultCategories = [
            ['Acción', 'Películas de acción y aventura'],
            ['Comedia', 'Películas cómicas y de humor'],
            ['Drama', 'Películas dramáticas'],
            ['Terror', 'Películas de terror y suspenso'],
            ['Romance', 'Películas románticas'],
            ['Ciencia Ficción', 'Películas de ciencia ficción'],
            ['Animación', 'Películas animadas'],
            ['Documental', 'Documentales']
        ];
        
        $insertCategory = $pdo->prepare("INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)");
        foreach ($defaultCategories as $category) {
            $insertCategory->execute($category);
        }
    }
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Error al crear tabla de categorías']));
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'addCategory':
        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if (empty($name)) {
            echo json_encode(['success' => false, 'message' => 'El nombre de la categoría es requerido']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)");
            $stmt->execute([$name, $description]);
            
            echo json_encode(['success' => true, 'message' => 'Categoría agregada exitosamente']);
        } catch(PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['success' => false, 'message' => 'Ya existe una categoría con ese nombre']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al agregar la categoría']);
            }
        }
        break;
        
    case 'getCategories':
        try {
            $stmt = $pdo->query("SELECT * FROM categorias ORDER BY nombre");
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'categories' => $categories]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener las categorías']);
        }
        break;
        
    case 'updateCategory':
        $id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if (empty($id) || empty($name)) {
            echo json_encode(['success' => false, 'message' => 'ID y nombre son requeridos']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?");
            $stmt->execute([$name, $description, $id]);
            
            echo json_encode(['success' => true, 'message' => 'Categoría actualizada exitosamente']);
        } catch(PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['success' => false, 'message' => 'Ya existe una categoría con ese nombre']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar la categoría']);
            }
        }
        break;
        
    case 'deleteCategory':
        $id = $_POST['id'] ?? '';
        
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID de categoría es requerido']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM categorias WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Categoría eliminada exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Categoría no encontrada']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar la categoría']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}
?> 