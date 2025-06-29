<?php
session_start();
header('Content-Type: application/json');
require 'conexion.php';

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
        echo json_encode(['success'=>false]);
    }
    exit;
}
echo json_encode(['success'=>false, 'message'=>'Acción no válida']); 