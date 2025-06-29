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

// Crear tabla de comida si no existe
$createTable = "CREATE TABLE IF NOT EXISTS comida (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo ENUM('comida', 'bebida', 'dulce', 'snack') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    descripcion TEXT,
    imagen VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($createTable);
    
    // Insertar productos por defecto si no existen
    $checkFood = $pdo->query("SELECT COUNT(*) FROM comida");
    if ($checkFood->fetchColumn() == 0) {
        $defaultFood = [
            ['Palomitas Grandes', 'snack', 8.50, 100, 'Palomitas de maíz grandes con mantequilla'],
            ['Palomitas Medianas', 'snack', 6.50, 100, 'Palomitas de maíz medianas con mantequilla'],
            ['Refresco Grande', 'bebida', 5.00, 150, 'Refresco de 32 oz'],
            ['Refresco Mediano', 'bebida', 4.00, 150, 'Refresco de 24 oz'],
            ['Nachos con Queso', 'comida', 12.00, 50, 'Nachos con queso fundido y jalapeños'],
            ['Hot Dog', 'comida', 10.00, 80, 'Hot dog con salchicha y condimentos'],
            ['Chocolate', 'dulce', 3.50, 200, 'Chocolate de diferentes sabores'],
            ['Caramelos', 'dulce', 2.50, 300, 'Caramelos surtidos']
        ];
        
        $insertFood = $pdo->prepare("INSERT INTO comida (nombre, tipo, precio, stock, descripcion) VALUES (?, ?, ?, ?, ?)");
        foreach ($defaultFood as $food) {
            $insertFood->execute($food);
        }
    }
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Error al crear tabla de comida']));
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'addFood':
        $name = $_POST['name'] ?? '';
        $type = $_POST['type'] ?? '';
        $price = $_POST['price'] ?? '';
        $stock = $_POST['stock'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if (empty($name) || empty($type) || empty($price) || empty($stock)) {
            echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
            exit;
        }
        
        // Procesar imagen
        $imagePath = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/comida/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid() . '.' . $fileExtension;
            $uploadPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                $imagePath = 'uploads/comida/' . $fileName;
            }
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO comida (nombre, tipo, precio, stock, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $type, $price, $stock, $description, $imagePath]);
            
            echo json_encode(['success' => true, 'message' => 'Producto agregado exitosamente']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al agregar el producto']);
        }
        break;
        
    case 'getFood':
        try {
            $stmt = $pdo->query("SELECT * FROM comida ORDER BY tipo, nombre");
            $food = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'food' => $food]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener los productos']);
        }
        break;
        
    case 'deleteFood':
        $id = $_POST['id'] ?? '';
        
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID de producto es requerido']);
            exit;
        }
        
        try {
            // Obtener información de la imagen para eliminarla
            $stmt = $pdo->prepare("SELECT imagen FROM comida WHERE id = ?");
            $stmt->execute([$id]);
            $food = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($food && $food['imagen']) {
                $imagePath = '../' . $food['imagen'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
            
            $stmt = $pdo->prepare("DELETE FROM comida WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Producto eliminado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar el producto']);
        }
        break;
        
    case 'getFoodById':
        $id = $_GET['id'] ?? $_POST['id'] ?? '';
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID de producto es requerido']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("SELECT * FROM comida WHERE id = ?");
            $stmt->execute([$id]);
            $food = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($food) {
                echo json_encode(['success' => true, 'food' => $food]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener el producto']);
        }
        break;
        
    case 'updateFood':
        $id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $type = $_POST['type'] ?? '';
        $price = $_POST['price'] ?? '';
        $stock = $_POST['stock'] ?? '';
        $description = $_POST['description'] ?? '';
        if (empty($id) || empty($name) || empty($type) || empty($price) || empty($stock)) {
            echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
            exit;
        }
        // Procesar nueva imagen si se subió
        $imagePath = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/comida/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid() . '.' . $fileExtension;
            $uploadPath = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                $imagePath = 'uploads/comida/' . $fileName;
            }
        }
        try {
            if ($imagePath) {
                // Eliminar imagen anterior
                $stmt = $pdo->prepare("SELECT imagen FROM comida WHERE id = ?");
                $stmt->execute([$id]);
                $food = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($food && $food['imagen']) {
                    $oldImagePath = '../' . $food['imagen'];
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
                $stmt = $pdo->prepare("UPDATE comida SET nombre = ?, tipo = ?, precio = ?, stock = ?, descripcion = ?, imagen = ? WHERE id = ?");
                $stmt->execute([$name, $type, $price, $stock, $description, $imagePath, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE comida SET nombre = ?, tipo = ?, precio = ?, stock = ?, descripcion = ? WHERE id = ?");
                $stmt->execute([$name, $type, $price, $stock, $description, $id]);
            }
            echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar el producto']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}
?> 