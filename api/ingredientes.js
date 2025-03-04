const express = require('express');
const router = express.Router();

module.exports = (conexion) => {

  // Obtener todos los ingredientes
  router.get('/', (req, res) => {
    const query = 'SELECT id_ingrediente, nombre_ingrediente, stock, unidad_medida, precio, es_adicional FROM ingrediente';
    conexion.execute(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener los ingredientes' });
      }
      return res.json(results);
    });
  });

  // Obtener un ingrediente por ID
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT id_ingrediente, nombre_ingrediente, stock, unidad_medida, precio, es_adicional FROM ingrediente WHERE id_ingrediente = ?';
    conexion.execute(query, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener el ingrediente' });
      }
      if (results.length > 0) {
        return res.json(results[0]);
      } else {
        return res.status(404).json({ success: false, message: 'Ingrediente no encontrado' });
      }
    });
  });

  // Crear un nuevo ingrediente
  router.post('/', (req, res) => {
    const { nombre_ingrediente, stock, unidad_medida, precio, es_adicional } = req.body;
    
    if (!nombre_ingrediente || stock === undefined || !unidad_medida) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios excepto precio y es_adicional' });
    }

    const query = 'INSERT INTO ingrediente (nombre_ingrediente, stock, unidad_medida, precio, es_adicional) VALUES (?, ?, ?, ?, ?)';
    conexion.execute(query, [nombre_ingrediente, stock, unidad_medida, precio || null, es_adicional || 0], (err, results) => {
      if (err) {
        console.error("Error al insertar ingrediente:", err);
        return res.status(500).json({ success: false, message: 'Error al insertar ingrediente' });
      }
      return res.status(201).json({ success: true, message: 'Ingrediente creado exitosamente', id: results.insertId });
    });
  });

  // Actualizar un ingrediente existente
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { nombre_ingrediente, stock, unidad_medida, precio, es_adicional } = req.body;

    if (!nombre_ingrediente || stock === undefined || !unidad_medida) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios excepto precio y es_adicional' });
    }

    const query = 'UPDATE ingrediente SET nombre_ingrediente = ?, stock = ?, unidad_medida = ?, precio = ?, es_adicional = ? WHERE id_ingrediente = ?';
    conexion.execute(query, [nombre_ingrediente, stock, unidad_medida, precio || null, es_adicional || 0, id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar el ingrediente' });
      }
      return res.json({ success: true, message: 'Ingrediente actualizado correctamente' });
    });
  });

  // Eliminar un ingrediente
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM ingrediente WHERE id_ingrediente = ?';
    conexion.execute(query, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al eliminar el ingrediente' });
      }
      return res.json({ success: true, message: 'Ingrediente eliminado correctamente' });
    });
  });

  return router;
};
