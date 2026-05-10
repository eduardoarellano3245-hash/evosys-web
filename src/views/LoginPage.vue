 <template>
  <div class="login">
    <div class="card">
      <img src="/logo.png" class="logo" />
      <h1>EVOSYS</h1>
      <p>Iniciar sesión</p>

      <input v-model="usuario" placeholder="Usuario" />
      <input v-model="password" type="password" placeholder="Contraseña" />

      <button @click="login">ENTRAR</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const API_LOGIN = 'https://evosys-backend-production.up.railway.app/api/auth/login'

const usuario = ref('')
const password = ref('')

const login = async () => {
  try {
    const res = await fetch(API_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuario.value,
        password: password.value
      })
    })

    if (!res.ok) {
      alert('Usuario o contraseña incorrectos')
      return
    }

    const data = await res.json()

    if (!data || !data.usuario) {
      alert('Usuario o contraseña incorrectos')
      return
    }

    localStorage.setItem('usuario', JSON.stringify(data))
    localStorage.setItem('rol', data.rol)

    window.location.hash = '#/home'
  } catch (error) {
    console.error(error)
    alert('No se pudo conectar con el servidor')
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: #0f0f0f;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: Segoe UI, Arial, sans-serif;
}

.card {
  width: 360px;
  background: #181818;
  border: 1px solid #0066cc;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
}

.logo {
  width: 160px;
}

h1 {
  color: #0b8dff;
}

p {
  color: #aaa;
}

input {
  width: 100%;
  margin-top: 14px;
  padding: 13px;
  background: #2d2d2d;
  color: white;
  border: 1px solid #0066cc;
  border-radius: 6px;
}

button {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
}
</style>