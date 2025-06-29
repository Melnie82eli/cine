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

// Crear tabla de usuarios si no existe
$createTable = "CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    imagen_perfil VARCHAR(255),
    role ENUM('admin', 'cliente') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($createTable);
    
    // Insertar admin por defecto si no existe
    $checkAdmin = $pdo->prepare("SELECT id FROM usuarios WHERE email = 'admin@cine.com'");
    $checkAdmin->execute();
    
    if ($checkAdmin->rowCount() == 0) {
        $insertAdmin = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)");
        $insertAdmin->execute(['Administrador', 'admin@cine.com', 'admin123', 'admin']);
    }
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Error al crear tabla']));
}

$action = $_POST['action'] ?? '';

if ($action === 'login') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && $password === $user['password']) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['nombre'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_image'] = $user['imagen_perfil'];
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['nombre'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'image' => $user['imagen_perfil']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email o contraseña incorrectos']);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos']);
    }
    
} elseif ($action === 'register') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }
    
    // Verificar si el email ya existe
    try {
        $checkEmail = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $checkEmail->execute([$email]);
        
        if ($checkEmail->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'El email ya está registrado']);
            exit;
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error al verificar email']);
        exit;
    }
    
    // Procesar imagen de perfil
    $imagePath = '';
    if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExtension = pathinfo($_FILES['profileImage']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['profileImage']['tmp_name'], $uploadPath)) {
            $imagePath = 'uploads/' . $fileName;
        }
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, imagen_perfil) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $password, $imagePath]);
        
        echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error al registrar usuario']);
    }
    
} elseif ($action === 'updateProfile') {
    // Permitir actualizar perfil si viene el id por POST o por sesión
    $userId = $_SESSION['user_id'] ?? ($_POST['id'] ?? null);
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
        exit;
    }
    
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($name) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Nombre y email son requeridos']);
        exit;
    }
    
    // Verificar si el email ya existe (excluyendo el usuario actual)
    try {
        $checkEmail = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
        $checkEmail->execute([$email, $userId]);
        
        if ($checkEmail->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'El email ya está en uso por otro usuario']);
            exit;
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error al verificar email']);
        exit;
    }
    
    // Procesar nueva imagen de perfil
    $imagePath = '';
    if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExtension = pathinfo($_FILES['profileImage']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['profileImage']['tmp_name'], $uploadPath)) {
            $imagePath = 'uploads/' . $fileName;
        }
    }
    
    try {
        if (!empty($password)) {
            // Actualizar con nueva contraseña
            $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id = ?");
            $stmt->execute([$name, $email, $password, $userId]);
        } else {
            // Actualizar sin cambiar contraseña
            $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?");
            $stmt->execute([$name, $email, $userId]);
        }
        
        // Si se subió una nueva imagen, actualizar la ruta
        if (!empty($imagePath)) {
            $stmt = $pdo->prepare("UPDATE usuarios SET imagen_perfil = ? WHERE id = ?");
            $stmt->execute([$imagePath, $userId]);
        }
        
        // Obtener datos actualizados del usuario
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Actualizar sesión
        $_SESSION['user_name'] = $user['nombre'];
        $_SESSION['user_image'] = $user['imagen_perfil'];
        
        echo json_encode([
            'success' => true, 
            'message' => 'Perfil actualizado exitosamente',
            'user' => [
                'id' => $user['id'],
                'name' => $user['nombre'],
                'email' => $user['email'],
                'role' => $user['role'],
                'image' => $user['imagen_perfil']
            ]
        ]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el perfil']);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}
?> 