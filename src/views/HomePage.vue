<template>
      <div class="app">

        <aside class="sidebar">
          <div class="logo-box">
            <img src="/logo.png" class="logo" />
            <h2>EVOSYS</h2>
            <p>Tecnología que evoluciona contigo</p>
          </div>

          <button :class="{ active: vista === 'inicio' }" @click="vista = 'inicio'">🏠 INICIO</button>
          <button :class="{ active: vista === 'inventario' }" @click="vista = 'inventario'">📦 INVENTARIO</button>
          <button :class="{ active: vista === 'clientes' }" @click="vista = 'clientes'">👥 CLIENTES</button>
          <button :class="{ active: vista === 'ventas' }" @click="vista = 'ventas'">🛒 VENTAS / ESCÁNER</button>

          <button
            v-if="rolSesion === 'ADMIN'"
            :class="{ active: vista === 'base' }"
            @click="vista = 'base'"
          >
            BASE DE DATOS
          </button>

          <div style="flex: 1;"></div>
          <button class="salir" @click="cerrarSesion">CERRAR SESIÓN</button>
        </aside>

        <main class="contenido">
          <header class="topbar">
            <h1>EVOSYS | SISTEMA DE GESTIÓN INTEGRAL v4.9.2</h1>
            <span>Usuario: {{ usuarioSesion?.usuario }} | Rol: {{ rolSesion }}</span>
          </header>

          <section v-if="vista === 'inicio'" class="inicio">
            <img src="/logo.png" class="logo-grande" />
            <h1>EVOSYS ENTERPRISE</h1>
            <p>Tecnología que evoluciona contigo</p>
          </section>

          <section v-if="vista === 'inventario'">
            <h2>MÓDULO DE INVENTARIO</h2>

            <div class="formulario">
              <label>Nombre del Producto (Buscador Inteligente)</label>

              <div class="buscador-box">
                <input
                  v-model="form.nombre"
                  placeholder="Escribe: p, pe, pep..."
                  @input="mostrarSugInv = true"
                  @focus="mostrarSugInv = true"
                />

                <div class="sugerencias" v-if="mostrarSugInv && sugerenciasInventario.length">
                  <div
                    v-for="p in sugerenciasInventario"
                    :key="p.id_producto"
                    @click="seleccionarProductoInventario(p)"
                  >
                    {{ p.nombre }} | ${{ p.precio }} | Stock: {{ p.stock }}
                  </div>
                </div>
              </div>

              <label>Precio Neto ($)</label>
              <input v-model.number="form.precio" type="number" placeholder="Precio" />

              <label>Stock Actual</label>
              <input v-model.number="form.stock" type="number" placeholder="Stock" />

              <label>Código de Barras</label>
              <input v-model="form.codigo_barras" placeholder="Código de barras" />

              <label>ID de Referencia</label>
              <input v-model="form.id_producto" disabled placeholder="Auto-llenado" />
            </div>

            <div class="acciones">
              <button class="azul" @click="registrarProducto">REGISTRAR</button>
              <button class="azul" @click="modificarProducto">MODIFICAR</button>
              <button class="rojo" @click="eliminarProducto">ELIMINAR</button>
              <button class="gris" @click="limpiarFormulario">LIMPIAR</button>
            </div>

            <div class="tabla">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>PRECIO</th>
                    <th>STOCK</th>
                    <th>CÓDIGO BARRAS</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="p in productosFiltrados" :key="p.id_producto">
                    <td>{{ p.id_producto }}</td>
                    <td>{{ p.nombre }}</td>
                    <td>${{ p.precio }}</td>
                    <td>{{ p.stock }}</td>
                    <td>{{ p.codigo_barras }}</td>
                    <td>
                      <button class="azul mini" @click="cargarEnFormulario(p)">EDITAR</button>
                      <button class="verde mini" @click="agregarCarrito(p)">VENDER</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="vista === 'clientes'">
            <h2>CONTROL DE CLIENTES</h2>

            <div class="formulario">
              <label>Nombre o Apellido (Buscador Inteligente)</label>

              <div class="buscador-box">
                <input
                  v-model="clienteForm.nombre"
                  placeholder="Buscar cliente"
                  @input="mostrarSugCli = true"
                  @focus="mostrarSugCli = true"
                />

                <div class="sugerencias" v-if="mostrarSugCli && sugerenciasClientes.length">
                  <div
                    v-for="c in sugerenciasClientes"
                    :key="c.id_cliente"
                    @click="seleccionarCliente(c)"
                  >
                    {{ c.nombre }} | Tel: {{ c.telefono }} | ID: {{ c.id_cliente }}
                  </div>
                </div>
              </div>

              <label>Teléfono</label>
              <input v-model="clienteForm.telefono" placeholder="Teléfono" />

              <label>ID Cliente</label>
              <input v-model="clienteForm.id_cliente" disabled placeholder="Auto-llenado" />
            </div>

            <div class="acciones">
              <button class="azul" @click="guardarCliente">AGREGAR / MODIFICAR</button>
              <button class="rojo" @click="eliminarCliente">ELIMINAR</button>
              <button class="gris" @click="limpiarCliente">LIMPIAR</button>
            </div>

            <div class="tabla">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>TELÉFONO</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="c in clientes" :key="c.id_cliente">
                    <td>{{ c.id_cliente }}</td>
                    <td>{{ c.nombre }}</td>
                    <td>{{ c.telefono }}</td>
                    <td>
                      <button class="azul mini" @click="seleccionarCliente(c)">EDITAR</button>
                      <button class="verde mini" @click="usarClienteVenta(c)">USAR EN VENTA</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="vista === 'ventas'">
            <h2>CAJA REGISTRADORA - VENTAS</h2>

            <div class="venta-grid">
              <div>
                <label>Nombre del Cliente</label>
                <input v-model="clienteVenta" placeholder="PÚBLICO GENERAL" />

                <label>Cantidad</label>
                <input v-model.number="cantidadVenta" type="number" min="1" />

                <label>Buscar Producto por Nombre</label>
                <div class="buscador-box">
                  <input
                    v-model="buscarVenta"
                    placeholder="Escribe: p, pe, pep..."
                    @input="mostrarSugVenta = true"
                    @focus="mostrarSugVenta = true"
                  />

                  <div class="sugerencias" v-if="mostrarSugVenta && sugerenciasVenta.length">
                    <div
                      v-for="p in sugerenciasVenta"
                      :key="p.id_producto"
                      @click="agregarCarrito(p)"
                    >
                      {{ p.nombre }} | ${{ p.precio }} | Stock: {{ p.stock }}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label>Escáner / Código de Barras</label>
                <input
                  v-model="codigoEscaner"
                  @keyup.enter="buscarPorCodigo"
                  placeholder="Escanea o escribe código"
                />
                <button class="verde full" @click="buscarPorCodigo">AGREGAR POR CÓDIGO</button>
              </div>
            </div>

            <div class="tabla">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>PRODUCTO</th>
                    <th>CANT.</th>
                    <th>PRECIO UNIT.</th>
                    <th>SUBTOTAL</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in carrito" :key="item.id_producto">
                    <td>{{ item.id_producto }}</td>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.cantidad }}</td>
                    <td>${{ item.precio }}</td>
                    <td>${{ (item.precio * item.cantidad).toFixed(2) }}</td>
                    <td>
                      <button class="rojo mini" @click="quitarCarrito(item)">QUITAR</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="resumen">
              <h3>ARTÍCULOS: {{ totalArticulos }}</h3>
              <h1>TOTAL: ${{ totalVenta }}</h1>

              <button class="verde" @click="cobrarVenta">COBRAR VENTA</button>
              <button class="rojo" @click="vaciarCarrito">VACIAR CUENTA</button>
            </div>
          </section>

          <section v-if="vista === 'base'">
            <h2>BASE DE DATOS</h2>

            <div class="tabs">
              <button class="azul" @click="tablaActual = 'productos'">PRODUCTOS</button>
              <button class="azul" @click="tablaActual = 'clientes'">CLIENTES</button>
              <button class="azul" @click="tablaActual = 'ventas'">HISTORIAL VENTAS</button>
              <button class="azul" @click="tablaActual = 'usuarios'">USUARIOS</button>
            </div>

            <div class="tabla" v-if="tablaActual === 'productos'">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>PRECIO</th>
                    <th>STOCK</th>
                    <th>CÓDIGO</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="p in productos" :key="p.id_producto">
                    <td>{{ p.id_producto }}</td>
                    <td>{{ p.nombre }}</td>
                    <td>${{ p.precio }}</td>
                    <td>{{ p.stock }}</td>
                    <td>{{ p.codigo_barras }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="tabla" v-if="tablaActual === 'clientes'">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>TELÉFONO</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="c in clientes" :key="c.id_cliente">
                    <td>{{ c.id_cliente }}</td>
                    <td>{{ c.nombre }}</td>
                    <td>{{ c.telefono }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="tabla" v-if="tablaActual === 'ventas'">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>CLIENTE</th>
                    <th>TOTAL</th>
                    <th>FECHA</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="v in ventas" :key="v.id_venta">
                    <td>{{ v.id_venta }}</td>
                    <td>{{ v.cliente }}</td>
                    <td>${{ v.total }}</td>
                    <td>{{ v.fecha }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="tabla" v-if="tablaActual === 'usuarios'">
              <h3 class="subtitulo-tabla">GESTIÓN DE USUARIOS</h3>

              <div class="formulario usuario-formulario">
                <label>Usuario</label>
                <input v-model="usuarioForm.usuario" placeholder="Nombre de usuario" />

                <label>Password</label>
                <input v-model="usuarioForm.password" type="password" placeholder="Contraseña" />

                <label>Rol</label>
                <select v-model="usuarioForm.rol">
                  <option value="ADMIN">ADMIN</option>
                  <option value="EMPLEADO">EMPLEADO</option>
                </select>
              </div>

              <div class="acciones">
                <button class="verde" @click="crearUsuario">CREAR USUARIO</button>
                <button class="gris" @click="limpiarUsuario">LIMPIAR</button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USUARIO</th>
                    <th>PASSWORD</th>
                    <th>ROL</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="u in usuarios" :key="u.id">
                    <td>{{ u.id }}</td>
                    <td>{{ u.usuario }}</td>
                    <td>{{ u.password }}</td>
                    <td>{{ u.rol }}</td>
                    <td>
                      <button class="rojo mini" @click="eliminarUsuario(u.id)">
                        ELIMINAR
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const API_BASE = 'https://evosys-backend-production.up.railway.app'
console.log('API_BASE:', API_BASE)

const API_PRODUCTOS = API_BASE + '/api/productos'
const API_CLIENTES = API_BASE + '/api/clientes'
const API_USUARIOS = API_BASE + '/api/auth'
const API_VENTAS = API_BASE + '/api/ventas'

const usuarioSesion = ref(null)
const rolSesion = ref('ADMIN')
const vista = ref('inicio')
const productos = ref([])
const clientes = ref([])
const ventas = ref([])
const usuarios = ref([])

const buscarVenta = ref('')
const codigoEscaner = ref('')
const cantidadVenta = ref(1)
const carrito = ref([])
const clienteVenta = ref('PÚBLICO GENERAL')
const tablaActual = ref('productos')

const mostrarSugInv = ref(false)
const mostrarSugVenta = ref(false)
const mostrarSugCli = ref(false)

const form = ref({
  id_producto: '',
  nombre: '',
  precio: 0,
  stock: 0,
  codigo_barras: ''
})

const clienteForm = ref({
  id_cliente: '',
  nombre: '',
  telefono: ''
})

const usuarioForm = ref({
  usuario: '',
  password: '',
  rol: 'EMPLEADO'
})

onMounted(() => {
  const user = localStorage.getItem('usuario')

  if (!user) {
    router.replace('/login')
    return
  }

  usuarioSesion.value = JSON.parse(user)
  rolSesion.value = localStorage.getItem('rol') || usuarioSesion.value?.rol || 'ADMIN'

  cargarProductos().catch(console.error)
cargarClientes().catch(console.error)
cargarVentas().catch(console.error)
cargarUsuarios().catch(console.error)
})

const cargarProductos = async () => {
  const res = await fetch(API_PRODUCTOS)
  productos.value = await res.json()
}

const cargarClientes = async () => {
  const res = await fetch(API_CLIENTES)
  clientes.value = await res.json()
}

const cargarUsuarios = async () => {
  const res = await fetch(`${API_USUARIOS}/usuarios`)
  usuarios.value = await res.json()
}

const cargarVentas = async () => {
  const res = await fetch(API_VENTAS)
  ventas.value = await res.json()
}

const crearUsuario = async () => {
  if (rolSesion.value !== 'ADMIN') {
    return alert('Solo ADMIN puede crear usuarios')
  }

  if (!usuarioForm.value.usuario || !usuarioForm.value.password) {
    return alert('Completa usuario y password')
  }

  await fetch(`${API_USUARIOS}/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario: usuarioForm.value.usuario,
      password: usuarioForm.value.password,
      rol: usuarioForm.value.rol
    })
  })

  limpiarUsuario()
  await cargarUsuarios()
  alert('Usuario creado')
}

const eliminarUsuario = async (id) => {
  try {
    const res = await fetch(`${API_USUARIOS}/${id}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      alert('Eliminado correctamente')
      await cargarUsuarios()
    } else {
      alert('Error: ' + res.status)
    }
  } catch (error) {
    console.error(error)
    alert('No conecta con backend')
  }
}

const limpiarUsuario = () => {
  usuarioForm.value = {
    usuario: '',
    password: '',
    rol: 'EMPLEADO'
  }
}

const sugerenciasInventario = computed(() => {
  const texto = form.value.nombre.trim().toLowerCase()
  if (!texto) return []
  return productos.value.filter(p => p.nombre.toLowerCase().startsWith(texto)).slice(0, 10)
})

const productosFiltrados = computed(() => {
  const texto = form.value.nombre.trim().toLowerCase()
  if (!texto) return productos.value
  return productos.value.filter(p => p.nombre.toLowerCase().startsWith(texto))
})

const sugerenciasVenta = computed(() => {
  const texto = buscarVenta.value.trim().toLowerCase()
  if (!texto) return []
  return productos.value.filter(p => p.nombre.toLowerCase().startsWith(texto)).slice(0, 10)
})

const sugerenciasClientes = computed(() => {
  const texto = clienteForm.value.nombre.trim().toLowerCase()
  if (!texto) return []
  return clientes.value.filter(c => c.nombre.toLowerCase().startsWith(texto)).slice(0, 10)
})

const seleccionarProductoInventario = (p) => {
  form.value = { ...p }
  mostrarSugInv.value = false
}

const seleccionarCliente = (c) => {
  clienteForm.value = { ...c }
  mostrarSugCli.value = false
}

const usarClienteVenta = (c) => {
  clienteVenta.value = c.nombre
  vista.value = 'ventas'
}

const cargarEnFormulario = (p) => {
  form.value = { ...p }
  vista.value = 'inventario'
}

const limpiarFormulario = () => {
  form.value = { id_producto: '', nombre: '', precio: 0, stock: 0, codigo_barras: '' }
  mostrarSugInv.value = false
}

const registrarProducto = async () => {
  await fetch(API_PRODUCTOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: form.value.nombre.toUpperCase(),
      precio: form.value.precio,
      stock: form.value.stock,
      codigo_barras: form.value.codigo_barras
    })
  })

  limpiarFormulario()
  await cargarProductos()
  alert('Producto registrado')
}

const modificarProducto = async () => {
  if (!form.value.id_producto) return alert('Selecciona un producto primero')

  await fetch(`${API_PRODUCTOS}/${form.value.id_producto}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: form.value.nombre.toUpperCase(),
      precio: form.value.precio,
      stock: form.value.stock,
      codigo_barras: form.value.codigo_barras
    })
  })

  limpiarFormulario()
  await cargarProductos()
  alert('Producto modificado')
}

const eliminarProducto = async () => {
  if (!form.value.id_producto) return alert('Selecciona un producto primero')

  await fetch(`${API_PRODUCTOS}/${form.value.id_producto}`, {
    method: 'DELETE'
  })

  limpiarFormulario()
  await cargarProductos()
  alert('Producto eliminado')
}

const guardarCliente = async () => {
  if (!clienteForm.value.nombre) return alert('Escribe un nombre')

  if (clienteForm.value.id_cliente) {
    await fetch(`${API_CLIENTES}/${clienteForm.value.id_cliente}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: clienteForm.value.nombre.toUpperCase(),
        telefono: clienteForm.value.telefono
      })
    })
  } else {
    await fetch(API_CLIENTES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: clienteForm.value.nombre.toUpperCase(),
        telefono: clienteForm.value.telefono
      })
    })
  }

  limpiarCliente()
  await cargarClientes()
  alert('Cliente guardado')
}

const eliminarCliente = async () => {
  if (!clienteForm.value.id_cliente) return alert('Selecciona un cliente primero')

  await fetch(`${API_CLIENTES}/${clienteForm.value.id_cliente}`, {
    method: 'DELETE'
  })

  limpiarCliente()
  await cargarClientes()
  alert('Cliente eliminado')
}

const limpiarCliente = () => {
  clienteForm.value = { id_cliente: '', nombre: '', telefono: '' }
  mostrarSugCli.value = false
}

const agregarCarrito = (producto) => {
  const cant = cantidadVenta.value || 1
  const existe = carrito.value.find(p => p.id_producto === producto.id_producto)

  if (existe) {
    existe.cantidad += cant
  } else {
    carrito.value.push({ ...producto, cantidad: cant })
  }

  buscarVenta.value = ''
  codigoEscaner.value = ''
  cantidadVenta.value = 1
  mostrarSugVenta.value = false
  vista.value = 'ventas'
}

const buscarPorCodigo = () => {
  const producto = productos.value.find(p => p.codigo_barras === codigoEscaner.value)

  if (!producto) return alert('No existe producto con ese código')

  agregarCarrito(producto)
}

const quitarCarrito = (producto) => {
  carrito.value = carrito.value.filter(p => p.id_producto !== producto.id_producto)
}

const vaciarCarrito = () => {
  carrito.value = []
}

const totalArticulos = computed(() => {
  return carrito.value.reduce((sum, p) => sum + p.cantidad, 0)
})

const totalVenta = computed(() => {
  return carrito.value.reduce((sum, p) => sum + p.precio * p.cantidad, 0).toFixed(2)
})

const cobrarVenta = async () => {
  if (carrito.value.length === 0) return alert('Carrito vacío')

  for (const item of carrito.value) {
    await fetch(`${API_PRODUCTOS}/${item.id_producto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: item.nombre,
        precio: item.precio,
        stock: item.stock - item.cantidad,
        codigo_barras: item.codigo_barras,
        imagen: item.imagen
      })
    })
  }

  await fetch(API_VENTAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente: clienteVenta.value,
      total: Number(totalVenta.value)
    })
  })

  alert(`Venta exitosa\nCliente: ${clienteVenta.value}\nTotal: $${totalVenta.value}`)

  carrito.value = []
  clienteVenta.value = 'PÚBLICO GENERAL'

  await cargarProductos()
  await cargarVentas()
}

const cerrarSesion = () => {
  localStorage.clear()
  window.location.hash = '#/login'
}

</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: #0f0f0f;
  color: white;
  font-family: Segoe UI, Arial, sans-serif;
}

.sidebar {
  width: 250px;
  background: #1e1e1e;
  padding: 18px;
  border-right: 2px solid #0066cc;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.logo-box {
  text-align: center;
  margin-bottom: 18px;
}

.logo {
  width: 150px;
  max-width: 90%;
}

.logo-box h2 {
  color: #0b8dff;
  margin: 5px 0;
}

.logo-box p {
  color: #aaa;
  font-size: 12px;
}

.sidebar button {
  background: #303030;
  color: white;
  border: none;
  border-left: 5px solid #0066cc;
  padding: 15px;
  font-weight: bold;
  cursor: pointer;
  text-align: left;
}

.sidebar button.active {
  background: #0066cc;
}

.sidebar .salir {
  margin-top: auto;
  background: #b00000;
  border-left-color: red;
  text-align: center;
}

.contenido {
  flex: 1;
  padding: 22px;
  overflow-y: auto;
}

.topbar {
  background: #000;
  padding: 18px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.topbar h1 {
  margin: 0;
  font-size: 22px;
}

.topbar span {
  color: #aaa;
}

.inicio {
  height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #aaa;
}

.logo-grande {
  width: 480px;
  max-width: 90%;
}

.inicio h1 {
  color: #0b8dff;
  font-size: 50px;
}

section h2 {
  font-size: 30px;
}

.formulario {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
  background: #181818;
  border: 1px solid #0066cc;
  border-radius: 8px;
  padding: 20px;
}

.usuario-formulario {
  margin: 15px;
}

.buscador-box {
  position: relative;
}

label {
  color: #aaa;
  font-weight: bold;
}

input,
select {
  width: 100%;
  background: #2d2d2d;
  color: white;
  border: 1px solid #0066cc;
  padding: 12px;
  border-radius: 5px;
}

.acciones,
.tabs {
  display: flex;
  gap: 15px;
  margin: 20px 0;
}

button {
  border-radius: 5px;
}

.azul,
.verde,
.rojo,
.gris {
  color: white;
  border: none;
  padding: 12px 22px;
  font-weight: bold;
  cursor: pointer;
}

.azul {
  background: #0066cc;
}

.verde {
  background: #009933;
}

.rojo {
  background: #b00000;
}

.gris {
  background: #303030;
}

.mini {
  padding: 7px 10px;
  margin-right: 5px;
}

.full {
  width: 100%;
  margin-top: 12px;
}

.tabla {
  background: #181818;
  border: 1px solid #0066cc;
  border-radius: 8px;
  overflow: auto;
  margin-top: 15px;
}

.subtitulo-tabla {
  padding: 15px;
  margin: 0;
  color: #0b8dff;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #0066cc;
  padding: 12px;
  text-align: left;
}

td {
  padding: 12px;
  border-bottom: 1px solid #333;
}

.venta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.venta-grid div {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sugerencias {
  position: absolute;
  z-index: 999;
  background: #f1f1f1;
  color: #111;
  border: 1px solid #0066cc;
  width: 100%;
  max-height: 220px;
  overflow: auto;
  border-radius: 5px;
}

.sugerencias div {
  padding: 12px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
  font-weight: bold;
}

.sugerencias div:hover {
  background: #0066cc;
  color: white;
}

.resumen {
  background: #181818;
  border: 1px solid #0066cc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 25px;
}

.resumen h1 {
  color: #00c853;
  font-size: 42px;
}
</style>
