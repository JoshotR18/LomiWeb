document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  let correo = document.getElementById('correo_usuario').value;
  let contrasena = document.getElementById('contrasena_usuario').value;

  try {
    let response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo_usuario: correo, contrasena_usuario: contrasena })
    });

    let data = await response.json();

    if (response.ok) {
      window.location.href = 'menu.html'; // Redirigir si el login es exitoso
    } else {
      alert(data.error); // Mostrar mensaje de error
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    alert('Error al conectar con el servidor');
  }
});
