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

// Crear tabla de películas si no existe
$createTable = "CREATE TABLE IF NOT EXISTS peliculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    anio INT NOT NULL,
    duracion INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    director VARCHAR(255) NOT NULL,
    reparto TEXT,
    sinopsis TEXT,
    poster VARCHAR(255),
    categoria_id INT,
    clasificacion_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (clasificacion_id) REFERENCES clasificaciones(id)
)";

try {
    $pdo->exec($createTable);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Error al crear tabla de películas']));
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Solo restringe las acciones de administración
$acciones_admin = ['addMovie', 'updateMovie', 'deleteMovie'];
if (in_array($action, $acciones_admin)) {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
        exit;
    }
}

switch($action) {
    case 'addMovie':
        $title = $_POST['title'] ?? '';
        $year = $_POST['year'] ?? '';
        $duration = $_POST['duration'] ?? '';
        $price = $_POST['price'] ?? '';
        $director = $_POST['director'] ?? '';
        $cast = $_POST['cast'] ?? '';
        $synopsis = $_POST['synopsis'] ?? '';
        $category = $_POST['category'] ?? '';
        $classification = $_POST['classification'] ?? '';
        
        if (empty($title) || empty($year) || empty($duration) || empty($price) || empty($director) || empty($category) || empty($classification)) {
            echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
            exit;
        }
        
        // Procesar póster
        $posterBase64 = '';
        if (isset($_FILES['poster']) && $_FILES['poster']['error'] === UPLOAD_ERR_OK) {
            $posterData = file_get_contents($_FILES['poster']['tmp_name']);
            $posterType = mime_content_type($_FILES['poster']['tmp_name']);
            $posterBase64 = 'data:' . $posterType . ';base64,' . base64_encode($posterData);
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO peliculas (titulo, anio, duracion, precio, categoria_id, clasificacion_id, director, reparto, sinopsis, poster) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $year, $duration, $price, $category, $classification, $director, $cast, $synopsis, $posterBase64]);
            
            echo json_encode(['success' => true, 'message' => 'Película agregada exitosamente']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al agregar la película']);
        }
        break;
        
    case 'getMovies':
        try {
            $stmt = $pdo->query("
                SELECT p.*, c.nombre as categoria, cl.nombre as clasificacion, cl.rango_edad
                FROM peliculas p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                LEFT JOIN clasificaciones cl ON p.clasificacion_id = cl.id
                ORDER BY p.fecha_creacion DESC
            ");
            $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'movies' => $movies]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener las películas']);
        }
        break;
        
    case 'deleteMovie':
        $id = $_POST['id'] ?? '';
        
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID de película es requerido']);
            exit;
        }
        
        try {
            // Obtener información del póster para eliminarlo
            $stmt = $pdo->prepare("SELECT poster FROM peliculas WHERE id = ?");
            $stmt->execute([$id]);
            $movie = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($movie && $movie['poster']) {
                $posterPath = '../' . $movie['poster'];
                if (file_exists($posterPath)) {
                    unlink($posterPath);
                }
            }
            
            $stmt = $pdo->prepare("DELETE FROM peliculas WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Película eliminada exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Película no encontrada']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar la película']);
        }
        break;
        
    case 'getMovieById':
        $id = $_GET['id'] ?? $_POST['id'] ?? '';
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID de película es requerido']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("SELECT * FROM peliculas WHERE id = ?");
            $stmt->execute([$id]);
            $movie = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($movie) {
                echo json_encode(['success' => true, 'movie' => $movie]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Película no encontrada']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener la película']);
        }
        break;
        
    case 'updateMovie':
        $id = $_POST['id'] ?? '';
        $title = $_POST['title'] ?? '';
        $year = $_POST['year'] ?? '';
        $duration = $_POST['duration'] ?? '';
        $price = $_POST['price'] ?? '';
        $director = $_POST['director'] ?? '';
        $cast = $_POST['cast'] ?? '';
        $synopsis = $_POST['synopsis'] ?? '';
        $category = $_POST['category'] ?? '';
        $classification = $_POST['classification'] ?? '';

        if (empty($id) || empty($title) || empty($year) || empty($duration) || empty($price) || empty($director) || empty($category) || empty($classification)) {
            echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
            exit;
        }

        // Procesar póster como base64
        $posterBase64 = '';
        if (isset($_FILES['poster']) && $_FILES['poster']['error'] === UPLOAD_ERR_OK) {
            $posterData = file_get_contents($_FILES['poster']['tmp_name']);
            $posterType = mime_content_type($_FILES['poster']['tmp_name']);
            $posterBase64 = 'data:' . $posterType . ';base64,' . base64_encode($posterData);
        }

        try {
            if ($posterBase64) {
                $stmt = $pdo->prepare("UPDATE peliculas SET titulo = ?, anio = ?, duracion = ?, precio = ?, categoria_id = ?, clasificacion_id = ?, director = ?, reparto = ?, sinopsis = ?, poster = ? WHERE id = ?");
                $stmt->execute([$title, $year, $duration, $price, $category, $classification, $director, $cast, $synopsis, $posterBase64, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE peliculas SET titulo = ?, anio = ?, duracion = ?, precio = ?, categoria_id = ?, clasificacion_id = ?, director = ?, reparto = ?, sinopsis = ? WHERE id = ?");
                $stmt->execute([$title, $year, $duration, $price, $category, $classification, $director, $cast, $synopsis, $id]);
            }
            echo json_encode(['success' => true, 'message' => 'Película actualizada exitosamente']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar la película']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}
?> 