app.post('/login', (req, res) => {
  const { correo_usuario, contrasena_usuario } = req.body;

  const query = 'SELECT * FROM tb_usuarios WHERE correo_usuario = ?';
  conexion.execute(query, [correo_usuario], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al buscar el usuario' });
    }

    if (results.length > 0) {
      const usuario = results[0];

      // Comparar contraseña ingresada con la contraseña cifrada en la BD
      bcrypt.compare(contrasena_usuario, usuario.contrasena_usuario, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al comparar contraseñas' });
        }

        if (result) {
          res.json({ success: true, message: "Inicio de sesión exitoso" }); // ✅ Respuesta en JSON válido
        } else {
          res.status(401).json({ success: false, message: "Contraseña incorrecta" }); // ✅ JSON válido con código 401
        }
      });
    } else {
      res.status(404).json({ success: false, message: "Correo no encontrado" }); // ✅ JSON válido con código 404
    }
  });
});
