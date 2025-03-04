document.addEventListener('DOMContentLoaded', async () => {
  // Base URL de la API. Como tu servidor está en la misma máquina:
  const apiUrl = '/api';

  // 1. Función para obtener la lista de productos
  async function fetchProductos() {
    try {
      const response = await fetch(`${apiUrl}/productos`);
      if (!response.ok) throw new Error('Error al obtener productos');
      return await response.json();
    } catch (error) {
      console.error("Error en fetchProductos:", error);
      return [];
    }
  }

  // 2. Función para renderizar la tabla de productos con inputs editables de nombre, cantidad y precio
  function renderTableProductos(productos) {
    const tbody = document.querySelector('#tablaProductos tbody');
    tbody.innerHTML = '';
    productos.forEach(producto => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${producto.idProducto}</td>
        <!-- Input para editar el nombre -->
        <td>
          <input 
            type="text" 
            value="${producto.nombre}" 
            id="producto-nombre-${producto.idProducto}" 
          />
        </td>
        <!-- Input para editar la cantidad (stock) -->
        <td>
          <input 
            type="number" 
            value="${producto.cantidad}" 
            id="producto-cantidad-${producto.idProducto}" 
          />
        </td>
        <!-- Input para editar el precio -->
        <td>
          <input 
            type="number" 
            step="0.01" 
            value="${producto.precio}" 
            id="producto-precio-${producto.idProducto}" 
          />
        </td>
        <td>
          <button onclick="actualizarProducto(${producto.idProducto})">Actualizar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 3. Función global para actualizar un producto (la usa el botón "Actualizar")
  window.actualizarProducto = async function(idProducto) {
    try {
      // Tomamos los valores editados en los inputs
      const inputNombre = document.getElementById(`producto-nombre-${idProducto}`);
      const inputCantidad = document.getElementById(`producto-cantidad-${idProducto}`);
      const inputPrecio = document.getElementById(`producto-precio-${idProducto}`);

      const nuevoNombre = inputNombre.value.trim();
      const nuevaCantidad = parseInt(inputCantidad.value.trim(), 10);
      const nuevoPrecio = parseFloat(inputPrecio.value.trim());

      // Validación básica
      if (!nuevoNombre || isNaN(nuevaCantidad) || isNaN(nuevoPrecio)) {
        alert("Por favor, introduce valores válidos para el nombre, la cantidad y el precio.");
        return;
      }

      // Obtenemos el producto actual de la base de datos (para conservar descripcion, idCategoria, estado, etc.)
      const resGet = await fetch(`${apiUrl}/productos/${idProducto}`);
      if (!resGet.ok) throw new Error('No se pudo obtener el producto de la BD');
      const productoDB = await resGet.json();

      // Actualizamos solo lo que queremos modificar
      productoDB.nombre = nuevoNombre;
      productoDB.cantidad = nuevaCantidad;
      productoDB.precio = nuevoPrecio;

      // Enviamos la actualización vía PUT con el objeto completo
      const resPut = await fetch(`${apiUrl}/productos/${idProducto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoDB)
      });
      const dataPut = await resPut.json();

      if (dataPut.success) {
        alert(`Producto "${nuevoNombre}" actualizado con éxito.`);
        // Volvemos a cargar y renderizar la tabla para mostrar los cambios
        const productos = await fetchProductos();
        renderTableProductos(productos);
      } else {
        alert("Error al actualizar el producto: " + dataPut.message);
      }

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto");
    }
  };

  // 4. Al cargar la página, obtenemos los productos y los mostramos
  const productos = await fetchProductos();
  renderTableProductos(productos);


  




});




document.addEventListener('DOMContentLoaded', async () => {
  // Base URL de la API (ruta relativa si tu HTML se sirve desde el mismo servidor)
  const apiUrl = '/api';

  /**
   * 1. Función para obtener la lista de ingredientes desde la API
   */
  async function fetchIngredientes() {
    try {
      const response = await fetch(`${apiUrl}/ingredientes`);
      if (!response.ok) throw new Error('Error al obtener los ingredientes');
      return await response.json();
    } catch (error) {
      console.error("Error en fetchIngredientes:", error);
      return [];
    }
  }

  /**
   * 2. Función para renderizar la tabla de ingredientes
   *    Mostramos inputs para poder editar nombre, stock, unidad de medida y precio.
   */
  function renderTableIngredientes(ingredientes) {
    const tbody = document.querySelector('#tablaIngredientes tbody');
    tbody.innerHTML = '';

    ingredientes.forEach(ingrediente => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <!-- ID solo lectura -->
        <td>${ingrediente.id_ingrediente}</td>

        <!-- Input editable para el nombre -->
        <td>
          <input 
            type="text"
            value="${ingrediente.nombre_ingrediente}" 
            id="ingrediente-nombre-${ingrediente.id_ingrediente}" 
          />
        </td>

        <!-- Input editable para el stock -->
        <td>
          <input 
            type="number"
            step="0.01"
            value="${ingrediente.stock}" 
            id="ingrediente-stock-${ingrediente.id_ingrediente}" 
          />
        </td>

        <!-- Input editable para la unidad de medida -->
        <td>
          <input 
            type="text"
            value="${ingrediente.unidad_medida}" 
            id="ingrediente-medida-${ingrediente.id_ingrediente}" 
          />
        </td>

        <!-- Input editable para el precio -->
        <td>
          <input 
            type="number"
            step="0.01"
            value="${ingrediente.precio}" 
            id="ingrediente-precio-${ingrediente.id_ingrediente}" 
          />
        </td>

        <!-- Botón para actualizar -->
        <td>
          <button onclick="actualizarIngrediente(${ingrediente.id_ingrediente})">
            Actualizar
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /**
   * 3. Función global para actualizar un ingrediente
   *    Se llama desde el botón "Actualizar" de cada fila.
   */
  window.actualizarIngrediente = async function(idIngrediente) {
    try {
      // Tomamos los valores editados de los inputs
      const inputNombre  = document.getElementById(`ingrediente-nombre-${idIngrediente}`);
      const inputStock   = document.getElementById(`ingrediente-stock-${idIngrediente}`);
      const inputMedida  = document.getElementById(`ingrediente-medida-${idIngrediente}`);
      const inputPrecio  = document.getElementById(`ingrediente-precio-${idIngrediente}`);

      const nuevoNombre  = inputNombre.value.trim();
      const nuevoStock   = parseFloat(inputStock.value.trim());
      const nuevaMedida  = inputMedida.value.trim();
      const nuevoPrecio  = parseFloat(inputPrecio.value.trim());

      // Validación básica
      if (!nuevoNombre || isNaN(nuevoStock) || !nuevaMedida || isNaN(nuevoPrecio)) {
        alert("Por favor, ingresa valores válidos en todos los campos editables.");
        return;
      }

      // Obtenemos el objeto completo del ingrediente para no perder campos no mostrados
      const resGet = await fetch(`${apiUrl}/ingredientes/${idIngrediente}`);
      if (!resGet.ok) throw new Error('No se pudo obtener el ingrediente de la BD');
      const ingredienteDB = await resGet.json();

      // Actualizamos solo lo que queremos modificar
      ingredienteDB.nombre_ingrediente = nuevoNombre;
      ingredienteDB.stock = nuevoStock;
      ingredienteDB.unidad_medida = nuevaMedida;
      ingredienteDB.precio = nuevoPrecio;

      // Enviamos la actualización vía PUT
      const resPut = await fetch(`${apiUrl}/ingredientes/${idIngrediente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredienteDB)
      });

      const dataPut = await resPut.json();
      if (dataPut.success) {
        alert(`Ingrediente "${nuevoNombre}" actualizado con éxito.`);
        // Volvemos a cargar la lista y renderizar la tabla
        const ingredientesActualizados = await fetchIngredientes();
        renderTableIngredientes(ingredientesActualizados);
      } else {
        alert("Error al actualizar el ingrediente: " + dataPut.message);
      }
    } catch (error) {
      console.error("Error al actualizar el ingrediente:", error);
      alert("Error al actualizar el ingrediente");
    }
  };

  /**
   * 4. Al cargar la página, obtenemos y renderizamos la información inicial
   */
  const ingredientes = await fetchIngredientes();
  renderTableIngredientes(ingredientes);
});




