const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session');

const app = express();

// Configuración de Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones (se elimina al cerrar el navegador)
app.use(session({
  secret: 'mi_secreto_super_seguro', // Cambia este valor por uno robusto
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true } // Cookie no persistente, se borra al cerrar el navegador
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
    console.error('❌ Error conectando a la base de datos:', err);
    return;
  }
  console.log('✅ Conexión a la base de datos establecida');
  connection.release();
});

// Middleware para proteger rutas
function isAuthenticated(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  res.redirect('/login'); // Si no está autenticado, redirige al login
}

// Ruta para mostrar el login
app.get('/login', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/menu'); // Si ya está logueado, lo manda al menú
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Procesar el login
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  const query = 'SELECT * FROM tb_usuario WHERE usuario = ?';
  conexion.execute(query, [usuario], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al buscar el usuario' });
    }

    if (results.length > 0) {
      const usuarioBD = results[0];

      // Comparar la contraseña ingresada con la de la BD
      bcrypt.compare(password, usuarioBD.password, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al comparar contraseñas' });
        }

        if (result) {
          // Guardar información en la sesión
          req.session.usuario = {
            id: usuarioBD.idUsuario,
            usuario: usuarioBD.usuario,
            nombre: usuarioBD.nombre,
            apellido: usuarioBD.apellido,
            admin: usuarioBD.admin
          };
          return res.json({ success: true, redirect: '/menu' });
        } else {
          return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }
      });
    } else {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
  });
});

// Ruta protegida: menú (accesible solo si está autenticado)
app.get('/menu', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu.html'));
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

// Importar rutas de la API
const productosRoutes = require('./api/productos')(conexion);
app.use('/api/productos', productosRoutes);
const ingredientesRoutes = require('./api/ingredientes')(conexion);
app.use('/api/ingredientes', ingredientesRoutes);
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
  console.log(`🚀 Servidor corriendo en http://3.17.156.14:${PORT}`);
});
