<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');
require 'conexion.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'calificar') {
        $id_usuario = $input['id_usuario'];
        $id_pelicula = $input['id_pelicula'];
        $estrellas = $input['estrellas'];
        $stmt = $pdo->prepare("INSERT INTO calificaciones (id_usuario, id_pelicula, estrellas) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE estrellas=?");
        if ($stmt->execute([$id_usuario, $id_pelicula, $estrellas, $estrellas])) {
            echo json_encode(['success'=>true]);
        } else {
            echo json_encode(['success'=>false, 'message'=>'No se pudo guardar la calificación.']);
        }
        exit;
    }
    echo json_encode(['success'=>false, 'message'=>'Acción no válida']);
} catch (PDOException $e) {
    echo json_encode(['success'=>false, 'message'=>'Error en la base de datos: ' . $e->getMessage()]);
    exit;
} catch (Throwable $e) {
    echo json_encode(['success'=>false, 'message'=>'Error inesperado: ' . $e->getMessage()]);
    exit;
} 