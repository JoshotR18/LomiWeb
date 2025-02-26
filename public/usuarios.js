// api/usuarios.js
const express = require('express');
const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', (req, res) => {
  const query = 'SELECT * FROM tb_usuario';
  conexion.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
    res.json({ success: true, usuarios: results });
  });
});

// Ruta para agregar un usuario
router.post('/', (req, res) => {
  const { nombre, apellido, usuario, password, telefono, estado, admin } = req.body;
  if (!nombre || !apellido || !usuario || !password || !telefono || !estado) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  }

  const query = 'INSERT INTO tb_usuario (nombre, apellido, usuario, password, telefono, estado, admin) VALUES (?, ?, ?, ?, ?, ?, ?)';
  conexion.execute(query, [nombre, apellido, usuario, password, telefono, estado, admin || 0], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al agregar usuario' });
    }
    res.json({ success: true, message: 'Usuario agregado exitosamente' });
  });
});

// Ruta para actualizar un usuario
router.put('/:idUsuario', (req, res) => {
  const { idUsuario } = req.params;
  const { nombre, apellido, usuario, password, telefono, estado, admin } = req.body;

  const query = 'UPDATE tb_usuario SET nombre = ?, apellido = ?, usuario = ?, password = ?, telefono = ?, estado = ?, admin = ? WHERE idUsuario = ?';
  conexion.execute(query, [nombre, apellido, usuario, password, telefono, estado, admin, idUsuario], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
    res.json({ success: true, message: 'Usuario actualizado exitosamente' });
  });
});

// Ruta para eliminar un usuario
router.delete('/:idUsuario', (req, res) => {
  const { idUsuario } = req.params;

  const query = 'DELETE FROM tb_usuario WHERE idUsuario = ?';
  conexion.execute(query, [idUsuario], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  });
});

module.exports = router;
