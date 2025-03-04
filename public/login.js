document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!usuario || !password) {
    document.getElementById('message').innerText = "⚠️ Todos los campos son obligatorios.";
    return;
  }

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = '/menu.html';

    } else {
      document.getElementById('message').innerText = `❌ ${data.message}`;
    }
  } catch (error) {
    document.getElementById('message').innerText = "⚠️ Error al iniciar sesión.";
  }
});
