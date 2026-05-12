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

      <section v-if="vista === 'ventas'" @click="mostrarSugVenta = false">
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
  @click.stop
  ref="inputBuscarVenta"
  placeholder="Escribe: p, pe, pep..."
  @input.stop="mostrarSugVenta = true"
  @focus="mostrarSugVenta = true"
/>

              <div
  class="sugerencias"
  v-if="mostrarSugVenta && sugerenciasVenta.length"
  @click.stop
>                <div
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
                <td>********</td>
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

      <div class="yarbis-button" @click="toggleYarbis" title="YARBIS">
        <div class="core"></div>
      </div>

      <div v-if="yarbisOpen" class="yarbis-panel">
        <div class="yarbis-header">
          <div>
            <h2>YARBIS</h2>
            <span>STARK MODE v0.1</span>
          </div>
          <button class="yarbis-close" @click="yarbisOpen = false">×</button>
        </div>

        <div class="yarbis-message">
          <p>{{ yarbisMensaje }}</p>
          <small>Estado: {{ yarbisEstado }}</small>
<br />
<small>Escuché: {{ yarbisTranscripcion }}</small>
        </div>

        <div class="yarbis-stats">
          <div>
            <strong>{{ productos.length }}</strong>
            <span>Productos</span>
          </div>

          <div>
            <strong>{{ clientes.length }}</strong>
            <span>Clientes</span>
          </div>

          <div>
            <strong>{{ ventas.length }}</strong>
            <span>Ventas</span>
          </div>
        </div>

        <div class="yarbis-actions">
          <button @click="yarbisAbrir('ventas')">Abrir Ventas</button>
          <button @click="yarbisAbrir('inventario')">Abrir Inventario</button>
          <button @click="yarbisAbrir('clientes')">Abrir Clientes</button>
          <button v-if="rolSesion === 'ADMIN'" @click="yarbisAbrir('base')">Abrir Base de Datos</button>
          <button @click="yarbisResumen">Resumen del Sistema</button>
          <button @click="toggleEscuchaContinua">
            {{ escuchaContinua ? 'DESACTIVAR YARBIS' : 'ACTIVAR YARBIS' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const API_BASE = 'https://evosys-backend-production.up.railway.app'
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
const cargandoUsuario = ref(false)
const cargandoProducto = ref(false)
const cargandoCliente = ref(false)
const cargandoVenta = ref(false)
const carrito = ref([])

const form = ref({ id_producto: '', nombre: '', precio: 0, stock: 0, codigo_barras: '' })
const clienteForm = ref({ id_cliente: '', nombre: '', telefono: '' })
const usuarioForm = ref({ usuario: '', password: '', rol: 'EMPLEADO' })

const cantidadVenta = ref(1)
const clienteVenta = ref('PÚBLICO GENERAL')
const buscarVenta = ref('')
const yarbisMensaje = ref('Bienvenido. EVOSYS está en línea.')
const yarbisTranscripcion = ref('')
const yarbisEstado = ref('inactivo')
const yarbisUltimaOrden = ref('')
const yarbisModoWakeWord = ref(false)
const yarbisOpen = ref(false)
const escuchaContinua = ref(false)
const escuchando = ref(false)
const yarbisHablando = ref(false)
const recognitionRef = ref(null)
const yarbisFlujo = ref(null)

const mostrarSugInv = ref(false)
const mostrarSugVenta = ref(false)
const mostrarSugCli = ref(false)

const inputBuscarVenta = ref(null)
const codigoEscaner = ref('')
const tablaActual = ref('productos')

const memoriaYarbis = ref([])
const contextoActivo = ref({
  ultimaAccion: null,
  ultimoProducto: null,
  ultimaCantidad: 1
})
let reinicioTimer = null
let ultimoTextoProcesado = ''
let ultimoTiempoProcesado = 0

const normalizarTexto = (texto = '') =>
  String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const limpiarActivadores = (texto = '') =>
  normalizarTexto(texto)
    .replace(/\b(yarbis|jarvis|yarvis|iarbis|arvis|garbis|jervis|oye|ey|hey|asistente)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const contieneAlgo = (texto = '', palabras = []) => {
  const t = normalizarTexto(texto)
  return palabras.some(p => t.includes(normalizarTexto(p)))
}

const numeroPalabra = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11,
  doce: 12, trece: 13, catorce: 14, quince: 15, veinte: 20
}
const respuestasNaturales = {

  venta: [
    'Listo, agregué',
    'Perfecto, añadí',
    'Hecho, puse',
    'Ya quedó agregado',
    'Producto agregado'
  ],

  abrir: [
    'Abriendo',
    'Entrando a',
    'Mostrando',
    'Accediendo a'
  ]

}

const extraerCantidad = (texto = '') => {
  const t = normalizarTexto(texto)
  for (const palabra in numeroPalabra) {
    if (new RegExp(`\\b${palabra}\\b`).test(t)) return numeroPalabra[palabra]
  }
  const n = t.match(/\b\d+\b/)
  return n ? Number(n[0]) : 1
}

const extraerNumero = (texto = '') => {
  const n = normalizarTexto(texto).match(/\b\d+(\.\d+)?\b/)
  return n ? Number(n[0]) : null
}

const extraerPrecio = (texto = '') => {
  const t = normalizarTexto(texto)
  const m = t.match(/(?:precio|vale|cuesta|a)\s*(?:de)?\s*\$?\s*(\d+(?:\.\d+)?)/)
  return m ? Number(m[1]) : null
}

const extraerStock = (texto = '') => {
  const t = normalizarTexto(texto)
  const m = t.match(/(?:stock|existencia|existencias|cantidad|con)\s*(?:de)?\s*(\d+)/)
  return m ? Number(m[1]) : null
}

const limpiarTextoProducto = (texto = '') =>
  limpiarActivadores(texto)
    .replace(/\b(abre|abrir|agrega|agregar|registrar|registra|crear|nuevo|producto|productos|venta|ventas|vende|vender|precio|stock|existencia|existencias|cantidad|con|de|a|en|el|la|los|las|porfa|favor|caja|cuanto|cuantos|cuantas|vale|cuesta|hay|tienes|dame|quiero|cobra|cobrar|carrito|pon|añade|mete|sumale|súmale|compra|llevar|ocupo|necesito)\b/g, ' ')
    .replace(/\d+(\.\d+)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const distancia = (a = '', b = '') => {
  a = normalizarTexto(a)
  b = normalizarTexto(b)
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return dp[a.length][b.length]
}

const scoreTexto = (consulta = '', nombre = '') => {
  const q = normalizarTexto(consulta)
  const n = normalizarTexto(nombre)
  if (!q || !n) return 0
  if (q === n) return 100
  if (n.includes(q) || q.includes(n)) return 90
  let score = 0
  const qp = q.split(' ')
  const np = n.split(' ')
  for (const a of qp) {
    for (const b of np) {
      if (a.length >= 2 && b.includes(a)) score += 25
      const d = distancia(a, b)
      if (d <= 1) score += 18
      if (d === 2 && a.length >= 5) score += 10
    }
  }
  return score
}

const detectarProductoFlexible = (texto = '') => {
  const limpio = limpiarTextoProducto(texto)
  if (!limpio) return null
  let mejor = null
  let mejorScore = 0
  for (const p of productos.value) {
    const score = scoreTexto(limpio, p.nombre)
    if (score > mejorScore) {
      mejorScore = score
      mejor = p
    }
  }
  return mejorScore >= 18 ? mejor : null
}

const productosFiltrados = computed(() => {
  const q = normalizarTexto(form.value.nombre)
  if (!q) return productos.value
  return productos.value.filter(p => scoreTexto(q, p.nombre) >= 15)
})

const sugerenciasInventario = computed(() => productosFiltrados.value.slice(0, 8))

const sugerenciasVenta = computed(() => {
  const q = normalizarTexto(buscarVenta.value)
  if (!q) return productos.value.slice(0, 8)
  return productos.value.filter(p => scoreTexto(q, p.nombre) >= 15).slice(0, 8)
})

const sugerenciasClientes = computed(() => {
  const q = normalizarTexto(clienteForm.value.nombre)
  if (!q) return clientes.value.slice(0, 8)
  return clientes.value.filter(c => scoreTexto(q, c.nombre) >= 15 || String(c.telefono || '').includes(q)).slice(0, 8)
})

const totalVenta = computed(() =>
  carrito.value.reduce((s, p) => s + Number(p.precio || 0) * Number(p.cantidad || 0), 0).toFixed(2)
)

const totalArticulos = computed(() =>
  carrito.value.reduce((s, p) => s + Number(p.cantidad || 0), 0)
)

const apiJson = async (url, options = null) => {
  const res = await fetch(url, options || undefined)
  if (!res.ok) throw new Error('Error API')
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

const cargarProductos = async () => {
  try { productos.value = await apiJson(API_PRODUCTOS) || [] } catch { productos.value = [] }
}

const cargarClientes = async () => {
  try { clientes.value = await apiJson(API_CLIENTES) || [] } catch { clientes.value = [] }
}

const cargarVentas = async () => {
  try { ventas.value = await apiJson(API_VENTAS) || [] } catch { ventas.value = [] }
}

const cargarUsuarios = async () => {
  try { usuarios.value = await apiJson(`${API_USUARIOS}/usuarios`) || [] } catch { usuarios.value = [] }
}

const limpiarFormulario = () => {
  form.value = { id_producto: '', nombre: '', precio: 0, stock: 0, codigo_barras: '' }
}

const cargarEnFormulario = (p) => {
  form.value = {
    id_producto: p.id_producto,
    nombre: p.nombre,
    precio: Number(p.precio || 0),
    stock: Number(p.stock || 0),
    codigo_barras: p.codigo_barras || ''
  }
  mostrarSugInv.value = false
}

const seleccionarProductoInventario = (p) => cargarEnFormulario(p)

const registrarProducto = async (mostrarAlerta = true) => {
  if (cargandoProducto.value) return

  try {
    cargandoProducto.value = true

    const nombre = form.value.nombre?.trim()

    if (!nombre) {
      alert('Escribe el nombre del producto')
      return
    }

    const precio = Number(form.value.precio || 0)
    const stock = Number(form.value.stock || 0)

    if (precio <= 0) {
      alert('El precio debe ser mayor a 0')
      return
    }

    if (stock < 0) {
      alert('El stock no puede ser negativo')
      return
    }

    const existe = productos.value.some(
      p =>
        p.nombre?.toLowerCase() === nombre.toLowerCase() ||
        (
          form.value.codigo_barras &&
          p.codigo_barras === form.value.codigo_barras
        )
    )

    if (existe) {
      alert('Ya existe un producto con ese nombre o código')
      return
    }

    await apiJson(API_PRODUCTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.toUpperCase(),
        precio,
        stock,
        codigo_barras: form.value.codigo_barras || ''
      })
    })

    limpiarFormulario()
    await cargarProductos()

    if (mostrarAlerta) {
      alert('Producto registrado')
    }

  } catch (error) {
    console.error('Error registrarProducto:', error)
    alert('Error al registrar producto')
  } finally {
    cargandoProducto.value = false
  }
}

const modificarProducto = async (mostrarAlerta = true) => {
  if (cargandoProducto.value) return

  try {
    cargandoProducto.value = true

    if (!form.value.id_producto) {
      alert('Selecciona un producto')
      return
    }

    const nombre = form.value.nombre?.trim()

    if (!nombre) {
      alert('Escribe el nombre del producto')
      return
    }

    const precio = Number(form.value.precio || 0)
    const stock = Number(form.value.stock || 0)

    if (precio <= 0) {
      alert('El precio debe ser mayor a 0')
      return
    }

    if (stock < 0) {
      alert('El stock no puede ser negativo')
      return
    }

    await apiJson(`${API_PRODUCTOS}/${form.value.id_producto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.toUpperCase(),
        precio,
        stock,
        codigo_barras: form.value.codigo_barras || ''
      })
    })

    limpiarFormulario()
    await cargarProductos()

    if (mostrarAlerta) {
      alert('Producto modificado')
    }

  } catch (error) {
    console.error('Error modificarProducto:', error)
    alert('Error al modificar producto')
  } finally {
    cargandoProducto.value = false
  }
}

const guardarCliente = async () => {
  if (cargandoCliente.value) return

  try {
    cargandoCliente.value = true

    const nombre = clienteForm.value.nombre?.trim()

    if (!nombre) {
      alert('Escribe el nombre del cliente')
      return
    }

    const body = JSON.stringify({
      nombre: nombre.toUpperCase(),
      telefono: clienteForm.value.telefono || ''
    })

    if (clienteForm.value.id_cliente) {

      await apiJson(`${API_CLIENTES}/${clienteForm.value.id_cliente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
      })

      alert('Cliente actualizado')

    } else {

      await apiJson(API_CLIENTES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      })

      alert('Cliente registrado')
    }

    limpiarCliente()
    await cargarClientes()

  } catch (error) {
    console.error('Error guardarCliente:', error)
    alert('Error al guardar cliente')
  } finally {
    cargandoCliente.value = false
  }
}

const agregarCarrito = (producto) => {
  if (cargandoVenta.value) return
  if (!producto) return

  const cant = Math.floor(Number(cantidadVenta.value || 1))

  if (cant <= 0) {
    alert('La cantidad debe ser mayor a 0')
    cantidadVenta.value = 1
    return
  }

  const stockDisponible = Number(producto.stock || 0)

  const existente = carrito.value.find(
    p => p.id_producto === producto.id_producto
  )

  const yaEnCarrito = existente
    ? Number(existente.cantidad || 0)
    : 0

  if (stockDisponible < yaEnCarrito + cant) {
    yarbisMensaje.value =
      `No hay suficiente stock de ${producto.nombre}. Disponible: ${stockDisponible}.`
    return
  }

  if (existente) {
    existente.cantidad += cant
  } else {
    carrito.value.push({
      ...producto,
      cantidad: cant
    })
  }

contextoActivo.value = {
  ultimaAccion: 'venta',
  ultimoProducto: producto,
  ultimaCantidad: cant
}

  buscarVenta.value = ''
  cantidadVenta.value = 1
  mostrarSugVenta.value = false
  vista.value = 'ventas'

  nextTick(() => {
    inputBuscarVenta.value?.focus?.()
  })
}
const quitarCarrito = (item) => {

  mostrarSugVenta.value = false

  carrito.value = carrito.value.filter(
    p => p.id_producto !== item.id_producto
  )

  yarbisMensaje.value = 'Producto eliminado del carrito.'
}

const vaciarCarrito = () => {

  mostrarSugVenta.value = false

  carrito.value = []

  yarbisMensaje.value = 'Carrito vaciado.'
}

const cobrarVenta = async (mostrarAlerta = true) => {

  if (cargandoVenta.value) return

  try {

    cargandoVenta.value = true

    if (!carrito.value.length) {
      yarbisMensaje.value = 'El carrito está vacío.'
      return
    }

    for (const item of carrito.value) {

      const productoActual =
        productos.value.find(
          p => p.id_producto === item.id_producto
        ) || item

      const stockFinal =
        Number(productoActual.stock || 0) -
        Number(item.cantidad || 0)

      if (stockFinal < 0) {
        yarbisMensaje.value =
          `No hay suficiente stock de ${item.nombre}.`
        return
      }
    }

    const totalAntes = Number(totalVenta.value)

    if (totalAntes <= 0 || isNaN(totalAntes)) {
      alert('Total inválido')
      return
    }

    for (const item of carrito.value) {

      const productoActual =
        productos.value.find(
          p => p.id_producto === item.id_producto
        ) || item

      await apiJson(`${API_PRODUCTOS}/${item.id_producto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: item.nombre,
          precio: Number(item.precio || 0),
          stock:
            Number(productoActual.stock || 0) -
            Number(item.cantidad || 0),
          codigo_barras: item.codigo_barras || ''
        })
      })
    }

    await apiJson(API_VENTAS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente: clienteVenta.value || 'PÚBLICO GENERAL',
        total: totalAntes
      })
    })

    yarbisMensaje.value =
      `Venta realizada por ${totalAntes.toFixed(2)} pesos.`

    carrito.value = []
    clienteVenta.value = 'PÚBLICO GENERAL'

    await cargarProductos()
    await cargarVentas()

    if (mostrarAlerta) {
      alert('Venta cobrada')
    }

  } catch (error) {
    console.error('Error cobrarVenta:', error)
    alert('Error al cobrar venta')
  } finally {
    cargandoVenta.value = false
  }
}

const limpiarUsuario = () => {
  usuarioForm.value = { usuario: '', password: '', rol: 'EMPLEADO' }
}

const crearUsuario = async () => {
  if (cargandoUsuario.value) return

  try {
    cargandoUsuario.value = true

    const usuario = usuarioForm.value.usuario?.trim()
    const password = usuarioForm.value.password?.trim()
    const rol = usuarioForm.value.rol || 'EMPLEADO'

    if (!usuario || !password) {
      alert('Escribe usuario y contraseña')
      return
    }

    if (password.length < 4) {
      alert('La contraseña debe tener mínimo 4 caracteres')
      return
    }

    const existe = usuarios.value.some(
      u => u.usuario?.toLowerCase() === usuario.toLowerCase()
    )

    if (existe) {
      alert('Ese usuario ya existe')
      return
    }

    await apiJson(`${API_USUARIOS}/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario,
        password,
        rol
      })
    })

    limpiarUsuario()
    await cargarUsuarios()

    alert('Usuario creado correctamente')

  } catch (error) {
    console.error('Error crearUsuario:', error)
    alert('Error al crear usuario')
  } finally {
    cargandoUsuario.value = false
  }
}

const eliminarUsuario = async (id) => {
  if (cargandoUsuario.value) return

  try {
    cargandoUsuario.value = true

    if (!id) {
      alert('No hay ID de usuario')
      return
    }

    const usuarioEliminar = usuarios.value.find(u => u.id === id)

    if (!usuarioEliminar) {
      alert('Usuario no encontrado')
      return
    }

    if (usuarioSesion.value?.usuario === usuarioEliminar.usuario) {
      alert('No puedes eliminar el usuario con el que tienes sesión iniciada')
      return
    }

    const admins = usuarios.value.filter(u => u.rol === 'ADMIN')

    if (usuarioEliminar.rol === 'ADMIN' && admins.length <= 1) {
      alert('No puedes eliminar el último ADMIN del sistema')
      return
    }

    const confirmar = confirm(`¿Seguro que quieres eliminar a ${usuarioEliminar.usuario}?`)
    if (!confirmar) return

    await apiJson(`${API_USUARIOS}/${id}`, {
      method: 'DELETE'
    })

    await cargarUsuarios()

    alert('Usuario eliminado correctamente')

  } catch (error) {
    console.error('Error eliminarUsuario:', error)
    alert('Error al eliminar usuario')
  } finally {
    cargandoUsuario.value = false
  }
}

const limpiarTimers = () => {
  if (reinicioTimer) clearTimeout(reinicioTimer)
  reinicioTimer = null
}

const pausarReconocimiento = () => {
  limpiarTimers()
  if (recognitionRef.value) {
    try { recognitionRef.value.onend = null; recognitionRef.value.onerror = null; recognitionRef.value.stop() } catch {}
    recognitionRef.value = null
  }
  escuchando.value = false
}

const reiniciarEscucha = (delay = 90) => {
  limpiarTimers()
  if (!escuchaContinua.value || yarbisHablando.value || escuchando.value || recognitionRef.value) return
  reinicioTimer = setTimeout(() => iniciarReconocimiento(), delay)
}

const hablarTexto = (texto = '') => {
  if (!texto) return
  yarbisMensaje.value = texto
  memoriaYarbis.value.push({ tipo: 'yarbis', texto, fecha: Date.now() })
  if (memoriaYarbis.value.length > 20) memoriaYarbis.value.shift()

  if (!('speechSynthesis' in window)) return
yarbisEstado.value = 'hablando'
  pausarReconocimiento()
  yarbisHablando.value = true

  const speech = new SpeechSynthesisUtterance(texto)
  speech.lang = 'es-MX'
  speech.rate = 1.08
  speech.pitch = 1

  speech.onend = () => {
    yarbisHablando.value = false
  yarbisEstado.value = escuchaContinua.value
    ? 'reconectando'
    : 'inactivo'
  reiniciarEscucha(180)
}

  speech.onerror = () => {
    yarbisHablando.value = false
    reiniciarEscucha(120)
  }

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(speech)
}

const yarbisHablar = () => hablarTexto(yarbisMensaje.value)

const iniciarReconocimiento = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    yarbisMensaje.value = 'Tu navegador no soporta reconocimiento de voz.'
    return
  }
  if (!escuchaContinua.value || escuchando.value || yarbisHablando.value || recognitionRef.value) return

  try {
    const recognition = new SpeechRecognition()
    recognitionRef.value = recognition
    recognition.lang = 'es-MX'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 5

    recognition.onstart = () => {
      escuchando.value = true
      yarbisEstado.value = 'escuchando'
      yarbisMensaje.value = 'YARBIS escuchando.'
    }

    recognition.onresult = (event) => {

  if (yarbisHablando.value) return

  let textoFinal = ''
  let textoIntermedio = ''

  for (let i = event.resultIndex; i < event.results.length; i++) {

    const transcript = event.results[i][0].transcript

    if (event.results[i].isFinal) {

      textoFinal += transcript + ' '

    } else {

      textoIntermedio += transcript + ' '
    }
  }

  if (textoIntermedio.trim()) {

    yarbisTranscripcion.value = textoIntermedio.trim()

    yarbisEstado.value = 'detectando voz'
  }

  const texto = textoFinal.trim()

  if (!texto) return

  yarbisTranscripcion.value = texto

  yarbisEstado.value = 'procesando'

  const ahora = Date.now()

  const limpio = normalizarTexto(texto)

  if (
    limpio === ultimoTextoProcesado &&
    ahora - ultimoTiempoProcesado < 1200
  ) return

  ultimoTextoProcesado = limpio
  ultimoTiempoProcesado = ahora

  procesarComandoYarbis(texto)
}
    recognition.onerror = (event) => {
  console.warn('Error reconocimiento:', event.error)
  escuchando.value = false
  yarbisEstado.value = 'reconectando'
  recognitionRef.value = null
  reiniciarEscucha(350)
}
    recognition.onend = () => {
  escuchando.value = false
  recognitionRef.value = null
  if (
    escuchaContinua.value &&
    !yarbisHablando.value
  ) {
    yarbisEstado.value = 'reconectando'
    reiniciarEscucha(250)
  } else {
    yarbisEstado.value = 'inactivo'
  }
}

    recognition.start()
  } catch {
    escuchando.value = false
    recognitionRef.value = null
    reiniciarEscucha(250)
  }
}

const detenerReconocimiento = () => {
  escuchaContinua.value = false
  pausarReconocimiento()
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  yarbisHablando.value = false
}

const toggleEscuchaContinua = () => {
  if (escuchaContinua.value) {
    detenerReconocimiento()
    yarbisMensaje.value = 'Escucha desactivada.'
    return
  }
  escuchaContinua.value = true
  yarbisOpen.value = true
  hablarTexto('YARBIS activado.')
}

const toggleYarbis = () => {
  yarbisOpen.value = !yarbisOpen.value
}

const yarbisAbrir = (modulo) => {
  yarbisFlujo.value = null
  vista.value = modulo
  contextoActivo.value.ultimaAccion = 'abrir'
  const respuesta =
    respuestasNaturales.abrir[
      Math.floor(
        Math.random() *
        respuestasNaturales.abrir.length
      )
    ]
  yarbisMensaje.value =
    `${respuesta} ${modulo}.`
}

const esComandoAbrirModulo = (texto = '') => {
  const t = limpiarActivadores(texto)

  const esPregunta = contieneAlgo(t, [
    'cuanto',
    'cuantos',
    'cuantas',
    'que producto',
    'cual producto',
    'hay',
    'tienes',
    'vale',
    'cuesta',
    'stock',
    'existencias'
  ])

  if (esPregunta) return null

  if (contieneAlgo(t, [
    'abrir ventas',
    'abre ventas',
    'ventas',
    'caja',
    'punto de venta',
    'quiero vender',
    'hacer venta',
    'hacer una venta',
    'modo ventas',
    'ir a ventas',
    'vamos a ventas',
    'pantalla ventas',
    'modulo ventas',
    'módulo ventas'
  ])) return 'ventas'

  if (contieneAlgo(t, [
    'abrir inventario',
    'abre inventario',
    'inventario',
    'productos',
    'almacen',
    'almacén',
    'ver productos',
    'ir a inventario',
    'modo inventario',
    'pantalla inventario',
    'modulo inventario',
    'módulo inventario'
  ])) return 'inventario'

  if (contieneAlgo(t, [
    'abrir clientes',
    'abre clientes',
    'clientes',
    'personas',
    'agenda',
    'contactos',
    'usuarios clientes',
    'ir a clientes',
    'modo clientes',
    'pantalla clientes',
    'modulo clientes',
    'módulo clientes'
  ])) return 'clientes'

  if (contieneAlgo(t, [
    'abrir base',
    'abre base',
    'base',
    'base de datos',
    'administracion',
    'administración',
    'panel admin',
    'usuarios',
    'datos',
    'modo admin',
    'configuracion',
    'configuración',
    'sistema',
    'panel'
  ])) return 'base'

  return null
}

const yarbisResumen = () => {
  const total = ventas.value.reduce((s, v) => s + Number(v.total || 0), 0)
  const bajo = productos.value.filter(p => Number(p.stock || 0) <= 5).length
  yarbisMensaje.value = `Resumen EVOSYS: ${productos.value.length} productos, ${clientes.value.length} clientes, ${ventas.value.length} ventas, total vendido ${total.toFixed(2)} pesos y ${bajo} productos con stock bajo.`
  yarbisHablar()
}

const responderPreguntaProducto = (texto = '') => {
  const producto = detectarProductoFlexible(texto)
  if (producto) {

  contextoActivo.value.ultimoProducto = producto

}
  if (!producto) return false
  const t = normalizarTexto(texto)

  if (contieneAlgo(t, ['cuanto vale', 'cuanto cuesta', 'precio', 'vale', 'cuesta'])) {
    yarbisMensaje.value = `${producto.nombre} cuesta ${Number(producto.precio || 0).toFixed(2)} pesos.`
    return true
  }

  if (contieneAlgo(t, ['cuantas hay', 'cuantos hay', 'cuantas quedan', 'stock', 'existencia', 'existencias', 'unidades', 'piezas'])) {
    yarbisMensaje.value = `Hay ${Number(producto.stock || 0)} unidades de ${producto.nombre}.`
    return true
  }

  if (contieneAlgo(t, ['hay', 'tienes', 'manejas'])) {
    yarbisMensaje.value = `Sí, tengo ${producto.nombre}. Hay ${Number(producto.stock || 0)} unidades y cuesta ${Number(producto.precio || 0).toFixed(2)} pesos.`
    return true
  }

  return false
}

const productoMenosStock = () =>
  productos.value.length ? [...productos.value].sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))[0] : null

const responderPreguntaLibre = (texto = '') => {
  const t = normalizarTexto(texto)

  if (contieneAlgo(t, ['resumen', 'estado del sistema', 'como vamos'])) {
    yarbisResumen()
    return true
  }

  if (contieneAlgo(t, ['cuanto llevamos vendido', 'cuanto hemos vendido', 'total vendido', 'ganancias', 'vendido'])) {
    const total = ventas.value.reduce((s, v) => s + Number(v.total || 0), 0)
    yarbisMensaje.value = `Llevamos vendidos ${total.toFixed(2)} pesos.`
    return true
  }

  if (contieneAlgo(t, ['menos stock', 'stock mas bajo', 'producto bajo', 'producto tiene menos'])) {
    const p = productoMenosStock()
    yarbisMensaje.value = p ? `${p.nombre} es el producto con menos stock. Tiene ${p.stock} unidades.` : 'No hay productos registrados.'
    return true
  }

  if (contieneAlgo(t, ['stock bajo', 'productos bajos'])) {
    const bajos = productos.value.filter(p => Number(p.stock || 0) <= 5)
    yarbisMensaje.value = bajos.length
      ? `Hay ${bajos.length} productos con stock bajo: ${bajos.map(p => `${p.nombre} con ${p.stock}`).join(', ')}.`
      : 'No hay productos con stock bajo.'
    return true
  }

  if (contieneAlgo(t, ['clientes registrados', 'cuantos clientes'])) {
    yarbisMensaje.value = `Hay ${clientes.value.length} clientes registrados.`
    return true
  }

  if (contieneAlgo(t, ['productos registrados', 'cuantos productos'])) {
    yarbisMensaje.value = `Hay ${productos.value.length} productos registrados.`
    return true
  }

  if (contieneAlgo(t, ['ventas registradas', 'cuantas ventas'])) {
    yarbisMensaje.value = `Hay ${ventas.value.length} ventas registradas.`
    return true
  }

  return false
}

const iniciarFlujoCrearProducto = () => {
  yarbisFlujo.value = { tipo: 'producto', paso: 'nombre', datos: {} }
  vista.value = 'inventario'
  yarbisMensaje.value = '¿Cuál es el nombre del producto?'
}

const iniciarFlujoVenta = () => {
  yarbisFlujo.value = { tipo: 'venta', paso: 'producto', datos: {} }
  vista.value = 'ventas'
  yarbisMensaje.value = '¿Qué producto quieres vender?'
}

const iniciarFlujoCliente = () => {
  yarbisFlujo.value = { tipo: 'cliente', paso: 'nombre', datos: {} }
  vista.value = 'clientes'
  yarbisMensaje.value = '¿Cuál es el nombre del cliente?'
}

const responderFlujoYarbis = async (texto = '') => {
  if (!yarbisFlujo.value) return false
  const orden = limpiarActivadores(texto)
  const flujo = yarbisFlujo.value

  if (contieneAlgo(orden, ['cancelar', 'salir', 'detener'])) {
    yarbisFlujo.value = null
    yarbisMensaje.value = 'Proceso cancelado.'
    return true
  }

  if (flujo.tipo === 'cliente') {
    if (flujo.paso === 'nombre') {
      flujo.datos.nombre = orden.toUpperCase()
      flujo.paso = 'telefono'
      yarbisMensaje.value = 'Ahora dime el teléfono.'
      return true
    }

    if (flujo.paso === 'telefono') {
      clienteForm.value = {
        id_cliente: '',
        nombre: flujo.datos.nombre,
        telefono: orden.replace(/\D/g, '')
      }
      await guardarCliente()
      yarbisMensaje.value = `Cliente ${flujo.datos.nombre} registrado.`
      yarbisFlujo.value = null
      return true
    }
  }

  if (flujo.tipo === 'producto') {
    if (flujo.paso === 'nombre') {
      flujo.datos.nombre = orden.toUpperCase()
      flujo.paso = 'precio'
      yarbisMensaje.value = '¿Cuál es el precio?'
      return true
    }

    if (flujo.paso === 'precio') {
      const precio = extraerNumero(orden)
      if (precio === null) {
        yarbisMensaje.value = 'No detecté el precio.'
        return true
      }
      flujo.datos.precio = precio
      flujo.paso = 'stock'
      yarbisMensaje.value = '¿Cuál es el stock?'
      return true
    }

    if (flujo.paso === 'stock') {
      const stock = extraerNumero(orden)
      if (stock === null) {
        yarbisMensaje.value = 'No detecté el stock.'
        return true
      }
      form.value = {
        id_producto: '',
        nombre: flujo.datos.nombre,
        precio: flujo.datos.precio,
        stock,
        codigo_barras: ''
      }
      await registrarProducto(false)
      yarbisMensaje.value = `Producto ${flujo.datos.nombre} registrado.`
      yarbisFlujo.value = null
      return true
    }
  }

  if (flujo.tipo === 'venta') {
    if (flujo.paso === 'producto') {
      const producto = detectarProductoFlexible(orden)
      if (!producto) {
        yarbisMensaje.value = 'No encontré el producto.'
        return true
      }
      flujo.datos.producto = producto
      flujo.paso = 'cantidad'
      yarbisMensaje.value = `¿Cuántas unidades de ${producto.nombre}?`
      return true
    }

    if (flujo.paso === 'cantidad') {
      const cantidad = extraerCantidad(orden)
      const producto = flujo.datos.producto
      cantidadVenta.value = cantidad
      agregarCarrito(producto)
      flujo.paso = 'confirmar'
      yarbisMensaje.value = '¿Cobrar venta o agregar otro producto?'
      return true
    }

    if (flujo.paso === 'confirmar') {
      if (contieneAlgo(orden, ['cobrar', 'cobra', 'terminar', 'finalizar', 'pagar', 'paga'])) {
        await cobrarVenta(false)
        yarbisFlujo.value = null
        return true
      }
      if (contieneAlgo(orden, ['agregar otro', 'otro', 'mas', 'más', 'añade otro', 'mete otro'])) {
        flujo.paso = 'producto'
        yarbisMensaje.value = '¿Qué otro producto?'
        return true
      }
      flujo.paso = 'producto'
      yarbisMensaje.value = 'Dime el siguiente producto o di cobrar venta.'
      return true
    }
  }

  return false
}

const crearProductoPorVoz = async (texto = '') => {
  const precio = extraerPrecio(texto)
  const stock = extraerStock(texto)
  const nombre = limpiarTextoProducto(texto)

  if (!nombre || precio === null || stock === null) {
    iniciarFlujoCrearProducto()
    return
  }

  form.value = {
    id_producto: '',
    nombre: nombre.toUpperCase(),
    precio,
    stock,
    codigo_barras: ''
  }

  await registrarProducto(false)
  yarbisMensaje.value = `${nombre} registrado correctamente.`
}

const crearClientePorVoz = async (texto = '') => {
  let t = limpiarActivadores(texto)
  t = t.replace(/\b(agrega|agregar|registra|registrar|cliente|nuevo|crear|guardar|alta|dar de alta)\b/g, '').trim()
  const tel = t.match(/\b\d{7,15}\b/)
  if (!tel) {
    iniciarFlujoCliente()
    return
  }
  const nombre = t.replace(tel[0], '').trim()
  if (!nombre) {
    iniciarFlujoCliente()
    return
  }
  clienteForm.value = { id_cliente: '', nombre: nombre.toUpperCase(), telefono: tel[0] }
  await guardarCliente()
  yarbisMensaje.value = `Cliente ${nombre} registrado.`
}

const venderProductoPorVoz = (texto = '') => {
  const orden = limpiarActivadores(texto)
  const partes = orden
    .split(/\by\b|,/gi)
    .map(x => x.trim())
    .filter(Boolean)
  let agregados = []
  for (const parte of partes) {
    let producto = detectarProductoFlexible(parte)
    const cantidad = extraerCantidad(parte)
    if (!producto) {
      if (
        contieneAlgo(parte, [
          'otra',
          'otro',
          'mas',
          'más',
          'igual'
        ])
      ) {
        producto = contextoActivo.value.ultimoProducto
      }
    }
    if (!producto) continue
    cantidadVenta.value = cantidad || 1
    agregarCarrito(producto)
    contextoActivo.value = {
      ultimaAccion: 'venta',
      ultimoProducto: producto,
      ultimaCantidad: cantidad || 1
    }
    agregados.push(
      `${cantidad || 1} ${producto.nombre}`
    )
  }
  if (!agregados.length) {
    iniciarFlujoVenta()
    return
  }
  const respuesta = respuestasNaturales.venta[
    Math.floor(
      Math.random() *
      respuestasNaturales.venta.length
    )
  ]
  yarbisMensaje.value =
    `${respuesta} ${agregados.join(', ')}`
  yarbisFlujo.value = {
    tipo: 'venta',
    paso: 'confirmar',
    datos: {}
  }
}

const detectarIntencionYarbis = (texto = '') => {
  const t = limpiarActivadores(texto)

  const modulo = esComandoAbrirModulo(t)
  if (modulo) return modulo

  if (contieneAlgo(t, [
    'cobrar venta',
    'cobra venta',
    'cobrar',
    'cobra',
    'finaliza venta',
    'termina venta',
    'cierra venta',
    'pagar',
    'paga'
  ])) return 'cobrar'

  if (contieneAlgo(t, [
    'vaciar carrito',
    'vaciar venta',
    'limpiar carrito',
    'cancelar carrito',
    'borrar carrito',
    'reinicia carrito'
  ])) return 'vaciar'

  if (contieneAlgo(t, [
    'registrar cliente',
    'agregar cliente',
    'nuevo cliente',
    'agrega cliente',
    'crear cliente',
    'dar de alta cliente',
    'guardar cliente'
  ])) return 'cliente'

  if (contieneAlgo(t, [
    'registrar producto',
    'agregar producto',
    'nuevo producto',
    'agrega producto',
    'crear producto',
    'dar de alta producto',
    'guardar producto'
  ])) return 'producto'

  if (contieneAlgo(t, [
    'hacer venta',
    'nueva venta',
    'iniciar venta',
    'empezar venta'
  ])) return 'venta'

  if (contieneAlgo(t, [
    'vende',
    'vender',
    'agrega',
    'quiero',
    'dame',
    'cobrame',
    'pon',
    'añade',
    'mete',
    'sumale',
    'súmale',
    'agrega al carrito',
    'compra',
    'llevar',
    'ocupo',
    'necesito'
  ])) return 'vender'

  return 'desconocido'
}

const procesarComandoYarbis = async (textoOriginal = '') => {
  const orden = limpiarActivadores(textoOriginal)
  if (!orden) return

  yarbisOpen.value = true
  memoriaYarbis.value.push({ tipo: 'usuario', texto: orden, fecha: Date.now() })
  if (memoriaYarbis.value.length > 20) memoriaYarbis.value.shift()

  try {
    if (await responderFlujoYarbis(orden)) {
      yarbisHablar()
      return
    }

    if (responderPreguntaProducto(orden)) {
      yarbisHablar()
      return
    }

    if (responderPreguntaLibre(orden)) {
      yarbisHablar()
      return
    }
const productoDirecto =
  detectarProductoFlexible(orden)

if (
  productoDirecto &&
  !contieneAlgo(orden, [
    'precio',
    'stock',
    'cuanto',
    'vale',
    'cuesta',
    'hay'
  ])
) {

  cantidadVenta.value =
    extraerCantidad(orden)

  agregarCarrito(productoDirecto)

  yarbisMensaje.value =
    `Agregué ${productoDirecto.nombre} al carrito.`

  yarbisHablar()

  return
}
    const intencion = detectarIntencionYarbis(orden)

    switch (intencion) {
      case 'ventas':
      case 'inventario':
      case 'clientes':
      case 'base':
        yarbisAbrir(intencion)
        break

      case 'cliente':
        await crearClientePorVoz(orden)
        break

      case 'producto':
        await crearProductoPorVoz(orden)
        break

      case 'venta':
        iniciarFlujoVenta()
        break

      case 'vender':
        venderProductoPorVoz(orden)
        break

      case 'cobrar':
        await cobrarVenta(false)
        break

      case 'vaciar':
        vaciarCarrito()
        yarbisMensaje.value = 'Carrito vaciado.'
        break

      default:
        yarbisMensaje.value = 'No entendí el comando. Puedes pedirme abrir módulos, vender productos, registrar clientes, registrar productos o consultar inventario.'
        break
    }
  } catch (e) {
    console.error(e)
    yarbisMensaje.value = 'Ocurrió un error procesando la orden.'
  }

  yarbisHablar()
}

const cerrarSesion = () => {
  detenerReconocimiento()
  localStorage.clear()
  window.location.hash = '#/login'
}

onMounted(async () => {
  const user = localStorage.getItem('usuario')
  if (!user) {
    router.replace('/login')
    return
  }

  usuarioSesion.value = JSON.parse(user)
  rolSesion.value = localStorage.getItem('rol') || usuarioSesion.value?.rol || 'ADMIN'

  await Promise.all([
    cargarProductos(),
    cargarClientes(),
    cargarVentas(),
    cargarUsuarios()
  ])

  setTimeout(() => hablarTexto('Bienvenido. EVOSYS está en línea.'), 500)
})

onBeforeUnmount(() => detenerReconocimiento())
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background:#0f0f0f;
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
  margin-bottom: 90px;
}


.resumen h1 {
  color: #00c853;
  font-size: 42px;
  margin: 10px 0 15px;
}

.yarbis-button {
  position: fixed;
  bottom: 25px;
  right: 25px;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: radial-gradient(circle, #00e5ff 0%, #0066cc 45%, #00111f 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow:
    0 0 18px #00e5ff,
    0 0 35px rgba(0, 229, 255, 0.55),
    inset 0 0 16px rgba(255, 255, 255, 0.25);
  z-index: 9999;
  animation: pulse 2s infinite;
  border: 1px solid rgba(0, 229, 255, 0.8);
}

.yarbis-button::before {
  content: "";
  position: absolute;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 1px solid rgba(0, 229, 255, 0.35);
  animation: rotateRing 5s linear infinite;
}

.yarbis-button::after {
  content: "";
  position: absolute;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border-top: 2px solid rgba(0, 229, 255, 0.9);
  border-bottom: 2px solid rgba(0, 102, 204, 0.4);
  animation: rotateRing 3s linear infinite reverse;
}

.core {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  background: #e8fbff;
  box-shadow:
    0 0 12px #ffffff,
    0 0 25px #00e5ff,
    0 0 45px #00bfff;
  z-index: 2;
}

.yarbis-panel {
  position: fixed;
  bottom: 125px;
  right: 25px;
  width: 360px;
  padding: 18px;
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(5, 12, 24, 0.97), rgba(0, 25, 45, 0.92)),
    radial-gradient(circle at top left, rgba(0, 229, 255, 0.22), transparent 45%);
  color: white;
  z-index: 9999;
  box-shadow:
    0 0 30px rgba(0, 229, 255, 0.75),
    inset 0 0 22px rgba(0, 102, 204, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 229, 255, 0.65);
}

.yarbis-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(0, 229, 255, 0.35);
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.yarbis-header h2 {
  margin: 0;
  color: #00e5ff;
  letter-spacing: 3px;
  font-size: 25px;
}

.yarbis-header span {
  color: #8eeeff;
  font-size: 11px;
  letter-spacing: 2px;
}

.yarbis-close {
  background: transparent !important;
  color: #00e5ff !important;
  border: 1px solid rgba(0, 229, 255, 0.45) !important;
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  font-size: 22px;
  cursor: pointer;
}

.yarbis-message {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 14px;
  padding: 12px;
  color: #d9fbff;
  margin-bottom: 14px;
}

.yarbis-message p {
  margin: 0;
  line-height: 1.4;
}

.yarbis-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-bottom: 14px;
}

.yarbis-stats div {
  background: rgba(0, 102, 204, 0.22);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 14px;
  padding: 10px;
  text-align: center;
}

.yarbis-stats strong {
  display: block;
  color: #00e5ff;
  font-size: 24px;
}

.yarbis-stats span {
  display: block;
  color: #aaa;
  font-size: 11px;
  margin-top: 3px;
}

.yarbis-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.yarbis-actions button {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(0, 229, 255, 0.45);
  border-radius: 12px;
  background: linear-gradient(90deg, #003b73, #0077cc);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.25s;
}

.yarbis-actions button:hover {
  background: linear-gradient(90deg, #0066cc, #00aaff);
  transform: scale(1.02);
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.45);
}

@keyframes pulse {
  0% {
    box-shadow:
      0 0 16px #00e5ff,
      0 0 28px rgba(0, 229, 255, 0.45),
      inset 0 0 16px rgba(255, 255, 255, 0.25);
  }

  50% {
    box-shadow:
      0 0 28px #00e5ff,
      0 0 55px rgba(0, 229, 255, 0.8),
      inset 0 0 22px rgba(255, 255, 255, 0.38);
  }

  100% {
    box-shadow:
      0 0 16px #00e5ff,
      0 0 28px rgba(0, 229, 255, 0.45),
      inset 0 0 16px rgba(255, 255, 255, 0.25);
  }
}

@keyframes rotateRing {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
