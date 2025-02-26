const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (conexion) => {
  // Ruta para verificar si un usuario existe
  // (Se coloca primero para que no sea interpretada como un parámetro en la ruta de obtener por ID)
  router.get('/checkUsuario', (req, res) => {
    const { usuario } = req.query; // Obtener el parámetro 'usuario' de la URL

    if (!usuario) {
      return res.status(400).json({ success: false, message: 'Usuario es requerido' });
    }

    const query = 'SELECT COUNT(*) AS count FROM tb_usuario WHERE usuario = ?';
    conexion.execute(query, [usuario], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al verificar el usuario' });
      }

      if (results[0].count > 0) {
        return res.json(true); // Si el usuario existe
      } else {
        return res.json(false); // Si el usuario no existe
      }
    });
  });

  // Obtener todos los usuarios
  router.get('/', (req, res) => {
    const query = 'SELECT idUsuario, nombre, apellido, usuario, telefono, estado, admin FROM tb_usuario';
    conexion.execute(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener los usuarios' });
      }
      return res.json(results);
    });
  });
  
  // Obtener un usuario por ID
  // Nota: Esta ruta se define después de la ruta estática de checkUsuario para evitar conflictos.
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT id_usuario, nombre, apellido, usuario, telefono, estado, admin FROM tb_usuario WHERE id_usuario = ?';
    conexion.execute(query, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener el usuario' });
      }
      if (results.length > 0) {
        return res.json(results[0]);
      } else {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
    });
  });

  // Crear un nuevo usuario
  router.post('/', async (req, res) => {
    const { nombre, apellido, usuario, password, telefono, estado, admin } = req.body;

    // Verificar si todos los campos son obligatorios
    if (!nombre || !apellido || !usuario || !password || !telefono || !estado || admin === undefined) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    try {
      // Hashear la contraseña antes de guardarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insertar el nuevo usuario en la base de datos
      const query = 'INSERT INTO tb_usuario (nombre, apellido, usuario, password, telefono, estado, admin) VALUES (?, ?, ?, ?, ?, ?, ?)';
      conexion.execute(query, [nombre, apellido, usuario, hashedPassword, telefono, estado, admin], (err, results) => {
        if (err) {
          console.error("Error al insertar usuario:", err);
          return res.status(500).json({ success: false, message: 'Error al insertar usuario' });
        }
        return res.status(201).json({ success: true, message: 'Usuario creado exitosamente', id: results.insertId });
      });
    } catch (error) {
      console.error("Error al hashear la contraseña:", error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  // Actualizar un usuario existente
  router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, usuario, contrasena, telefono, estado, admin } = req.body;

    // Si se envía contraseña, la actualizamos
    if (contrasena) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);
        const query = 'UPDATE tb_usuario SET nombre = ?, apellido = ?, usuario = ?, password = ?, telefono = ?, estado = ?, admin = ? WHERE id_usuario = ?';
        conexion.execute(query, [nombre, apellido, usuario, hashedPassword, telefono, estado, admin, id], (err, results) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
          }
          return res.json({ success: true, message: 'Usuario actualizado correctamente' });
        });
      } catch (error) {
        console.error("Error al actualizar contraseña:", error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
      }
    } else {
      // Si no se envía contraseña, actualizamos sin modificarla
      const query = 'UPDATE tb_usuario SET nombre = ?, apellido = ?, usuario = ?, telefono = ?, estado = ?, admin = ? WHERE id_usuario = ?';
      conexion.execute(query, [nombre, apellido, usuario, telefono, estado, admin, id], (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
        }
        return res.json({ success: true, message: 'Usuario actualizado correctamente' });
      });
    }
  });

  // Eliminar un usuario
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM tb_usuario WHERE id_usuario = ?';
    conexion.execute(query, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
      }
      return res.json({ success: true, message: 'Usuario eliminado correctamente' });
    });
  });




router.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña son obligatorios' });
  }

  const query = 'SELECT * FROM tb_usuario WHERE usuario = ?';
  conexion.execute(query, [usuario], async (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario o clave incorrectos' });
    }

    const usuarioBD = results[0];

    // Comparar la contraseña enviada con el hash almacenado
    const match = await bcrypt.compare(password, usuarioBD.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Usuario o clave incorrectos' });
    }

    // Autenticación exitosa: devolver datos relevantes del usuario
    res.json({
      success: true,
      nombre: usuarioBD.nombre,
      apellido: usuarioBD.apellido,
      usuario: usuarioBD.usuario,
      admin: usuarioBD.admin // Agregar este campo a la respuesta
    });
  });
});

  return router;
};
