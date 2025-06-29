<?php
session_start();
header('Content-Type: application/json');
require 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

if ($action === 'comprarComida') {
    $id_usuario = $input['id_usuario'];
    $productos = $input['productos'];
    $lleva_ninos = $input['lleva_ninos'];
    $descuento = $input['descuento'];
    $total = $input['total'];

    $stmt = $pdo->prepare("INSERT INTO compras_comida (id_usuario, productos, lleva_ninos, descuento, total) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$id_usuario, $productos, $lleva_ninos, $descuento, $total])) {
        echo json_encode(['success'=>true]);
    } else {
        echo json_encode(['success'=>false, 'message'=>'Error al guardar compra']);
    }
    exit;
}
echo json_encode(['success'=>false, 'message'=>'Acción no válida']); 