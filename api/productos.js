const express = require('express');
const router = express.Router();

module.exports = (conexion) => {
  // Obtener todos los productos
  router.get('/', (req, res) => {
    const query = 'SELECT idProducto, nombre, cantidad, precio, descripcion, idCategoria, estado FROM tb_producto';
    conexion.execute(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener los productos' });
      }
      return res.json(results);
    });
  });

  // Obtener un producto por ID
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT idProducto, nombre, cantidad, precio, descripcion, idCategoria, estado FROM tb_producto WHERE idProducto = ?';
    conexion.execute(query, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener el producto' });
      }
      if (results.length > 0) {
        return res.json(results[0]);
      } else {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
    });
  });
// Crear un nuevo producto
router.post('/', (req, res) => {
  const { nombre, cantidad, precio, descripcion, idCategoria, estado } = req.body;

  if (!nombre || !cantidad || !precio || !idCategoria || estado === undefined) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios excepto la descripción' });
  }

  const query = 'INSERT INTO tb_producto (nombre, cantidad, precio, descripcion, idCategoria, estado) VALUES (?, ?, ?, ?, ?, ?)';
  conexion.execute(query, [nombre, cantidad, precio, descripcion, idCategoria, estado], (err, results) => {
    if (err) {
      console.error("Error al insertar producto:", err);
      return res.status(500).json({ success: false, message: 'Error al insertar producto' });
    }
    return res.status(201).json({ success: true, message: 'Producto creado exitosamente', id: results.insertId });
  });
});


  // Actualizar un producto existente
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, cantidad, precio, descripcion, idCategoria, estado, img } = req.body;

    if (!nombre || !cantidad || !precio || !idCategoria || estado === undefined) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios excepto la descripción y la imagen' });
    }

    const query = 'UPDATE tb_producto SET nombre = ?, cantidad = ?, precio = ?, descripcion = ?, idCategoria = ?, estado = ?, img = ? WHERE idProducto = ?';
    conexion.execute(query, [nombre, cantidad, precio, descripcion, idCategoria, estado, img, id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar el producto' });
      }
      return res.json({ success: true, message: 'Producto actualizado correctamente' });
    });
  });

  // Eliminar un producto
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM tb_producto WHERE idProducto = ?';
    conexion.execute(query, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al eliminar el producto' });
      }
      return res.json({ success: true, message: 'Producto eliminado correctamente' });
    });
  });

  return router;
};
