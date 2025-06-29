<?php
session_start();
header('Content-Type: application/json');
require 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

if ($action === 'comprarBoleto') {
    $id_usuario = $input['id_usuario'];
    $id_pelicula = $input['id_pelicula'];
    $fecha_funcion = $input['fecha_funcion'];
    $hora_funcion = $input['hora_funcion'];
    $asientos = $input['asientos'];
    $lleva_ninos = $input['lleva_ninos'];
    $descuento = $input['descuento'];
    $total = $input['total'];
    $sala = rand(1,5);

    $stmt = $pdo->prepare("INSERT INTO boletos (id_usuario, id_pelicula, fecha_funcion, hora_funcion, asientos, lleva_ninos, descuento, total, sala) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$id_usuario, $id_pelicula, $fecha_funcion, $hora_funcion, $asientos, $lleva_ninos, $descuento, $total, $sala])) {
        echo json_encode(['success'=>true, 'sala'=>$sala]);
    } else {
        echo json_encode(['success'=>false, 'message'=>'Error al guardar boleto']);
    }
    exit;
}
echo json_encode(['success'=>false, 'message'=>'Acción no válida']); 