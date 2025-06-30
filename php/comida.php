<?php
session_start();
header('Content-Type: application/json');

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

// Permitir getFood y getFoodById a cualquier usuario
if ($action === 'getFood' || $action === 'getFoodById') {
    switch($action) {
        case 'getFood':
            try {
                $stmt = $pdo->query("SELECT * FROM comida ORDER BY tipo, nombre");
                $food = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'food' => $food]);
            } catch(PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al obtener los productos']);
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
    }
    exit;
}

// Nueva acción para descontar stock desde el cliente
if ($action === 'descontarStock') {
    $productos = json_decode($_POST['productos'] ?? '[]', true);
    if (!is_array($productos) || empty($productos)) {
        echo json_encode(['success' => false, 'message' => 'No se recibieron productos para descontar']);
        exit;
    }
    try {
        $pdo->beginTransaction();
        foreach ($productos as $prod) {
            $id = $prod['id'] ?? 0;
            $cantidad = $prod['cantidad'] ?? 0;
            if ($id && $cantidad > 0) {
                // Verificar stock suficiente
                $stmt = $pdo->prepare('SELECT stock FROM comida WHERE id = ? FOR UPDATE');
                $stmt->execute([$id]);
                $stockActual = $stmt->fetchColumn();
                if ($stockActual === false || $stockActual < $cantidad) {
                    $pdo->rollBack();
                    echo json_encode(['success' => false, 'message' => 'Stock insuficiente para el producto ID ' . $id]);
                    exit;
                }
                $stmt = $pdo->prepare('UPDATE comida SET stock = stock - ? WHERE id = ?');
                $stmt->execute([$cantidad, $id]);
            }
        }
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error al descontar stock']);
    }
    exit;
}

// Para las demás acciones, solo admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
    exit;
}

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
        // Procesar imagen como base64
        $imageBase64 = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageData = file_get_contents($_FILES['image']['tmp_name']);
            $imageType = mime_content_type($_FILES['image']['tmp_name']);
            $imageBase64 = 'data:' . $imageType . ';base64,' . base64_encode($imageData);
        }
        try {
            $stmt = $pdo->prepare("INSERT INTO comida (nombre, tipo, precio, stock, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $type, $price, $stock, $description, $imageBase64]);
            echo json_encode(['success' => true, 'message' => 'Producto agregado exitosamente']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al agregar el producto']);
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
        // Procesar nueva imagen como base64
        $imageBase64 = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageData = file_get_contents($_FILES['image']['tmp_name']);
            $imageType = mime_content_type($_FILES['image']['tmp_name']);
            $imageBase64 = 'data:' . $imageType . ';base64,' . base64_encode($imageData);
        }
        try {
            if ($imageBase64) {
                $stmt = $pdo->prepare("UPDATE comida SET nombre = ?, tipo = ?, precio = ?, stock = ?, descripcion = ?, imagen = ? WHERE id = ?");
                $stmt->execute([$name, $type, $price, $stock, $description, $imageBase64, $id]);
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