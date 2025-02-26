const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session');

const app = express();

// Configuración de Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones (la cookie se elimina al cerrar el navegador)
app.use(session({
  secret: 'mi_secreto_super_seguro', // Cambia este valor por uno robusto
  resave: false,
  saveUninitialized: false,
}));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos usando un pool de conexiones
const conexion = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'rjoshot',
  database: 'bd_sistema_ventas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión a la base de datos
conexion.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
  connection.release();
});

// Middleware para proteger rutas (requiere que el usuario esté autenticado)
function isAuthenticated(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  res.redirect('/login');
}

// Rutas principales

// Mostrar página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Procesar el login
app.post('/login', (req, res) => {
  const { correo_usuario, contrasena_usuario } = req.body;

  const query = 'SELECT * FROM tb_usuarios WHERE correo_usuario = ?';
  conexion.execute(query, [correo_usuario], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al buscar el usuario' });
    }

    if (results.length > 0) {
      const usuario = results[0];

      // Comparar la contraseña ingresada con la contraseña cifrada en la BD
      bcrypt.compare(contrasena_usuario, usuario.contrasena_usuario, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al comparar contraseñas' });
        }

        if (result) {
          // Guardar información del usuario en la sesión
          req.session.usuario = {
            id: usuario.id_usuario,
            correo: usuario.correo_usuario,
            nombre: usuario.nombre_usuario,
            rango: usuario.rango_usuario
          };
          return res.json({ success: true, message: "Inicio de sesión exitoso" });
        } else {
          return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }
      });
    } else {
      return res.status(404).json({ success: false, message: "Correo no encontrado" });
    }
  });
});

// Ruta de logout para destruir la sesión
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
    res.redirect('/login');
  });
});

// Ruta protegida: menú (accesible solo si se ha iniciado sesión)
app.get('/menu', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});
// Importar rutas de productos (API)
const productosRoutes = require('./api/productos')(conexion);
app.use('/api/productos', productosRoutes);

// Importar rutas de usuarios (API)
const usuariosRoutes = require('./api/usuarios')(conexion);
app.use('/api/usuarios', usuariosRoutes);

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});
// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://3.17.156.14:${PORT}`);
});

