# 🍺 EscabiAPI Frontend

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/escabi-frontend)

Frontend moderno desarrollado con React, Vite y Bun para la API de gestión de bebidas.

## 🌐 Demo en Vivo

**URL de Producción:** [https://tu-proyecto.vercel.app](https://tu-proyecto.vercel.app)

> [!NOTE]
> Después del deploy en Vercel, actualiza esta URL con tu enlace real.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool ultrarrápido
- **Bun** - Runtime y package manager
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

## 📦 Instalación

```bash
# Instalar Bun (si no lo tienes)
curl -fsSL https://bun.sh/install | bash

# Clonar el repositorio
git clone <tu-repo>
cd escabi-frontend

# Instalar dependencias
bun install
```

## ⚙️ Configuración

Crear archivo `.env` en la raíz:

```env
VITE_API_URL=https://web-production-62840.up.railway.app
```

## 🏃‍♂️ Desarrollo

```bash
# Iniciar servidor de desarrollo
bun run dev

# Abrir en http://localhost:3000
```

## 🏗️ Build

```bash
# Construir para producción
bun run build

# Vista previa del build
bun run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Auth/          # Login y Register
│   ├── Products/      # Productos y filtros
│   ├── Cart/          # Carrito de compras
│   ├── Layout/        # Header y Footer
│   └── UI/            # Componentes base
├── context/
│   ├── AuthContext.jsx   # Estado de autenticación
│   └── CartContext.jsx   # Estado del carrito
├── pages/
│   ├── Home.jsx          # Landing page
│   ├── Products.jsx      # Catálogo
│   ├── MyOrders.jsx      # Historial de pedidos
│   └── VerifyAge.jsx     # Verificación de edad
├── services/
│   └── api.js            # Cliente API
├── App.jsx
├── main.jsx
└── index.css
```

## ✨ Características

### Autenticación
- ✅ Registro de usuarios
- ✅ Login con JWT
- ✅ Verificación de edad
- ✅ Logout

### Productos
- ✅ Catálogo completo
- ✅ Filtrado por categoría
- ✅ Búsqueda en tiempo real
- ✅ Información detallada

### Carrito
- ✅ Agregar productos
- ✅ Ver total
- ✅ Eliminar items
- ✅ Crear pedido

### Pedidos
- ✅ Historial de compras
- ✅ Estados de pedido
- ✅ Detalles completos

## 🎨 Componentes Reutilizables

### Button
```jsx
<Button variant="primary" size="md">
  Click me
</Button>
```

### Input
```jsx
<Input 
  label="Email" 
  type="email" 
  placeholder="tu@email.com"
/>
```

### Alert
```jsx
<Alert 
  type="success" 
  message="Operación exitosa"
/>
```

## 🔐 Context API

### AuthContext
```jsx
const { user, login, logout, verifyAge } = useAuth();
```

### CartContext
```jsx
const { cart, addToCart, removeFromCart } = useCart();
```

## 🚀 Deploy en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. **Conectar con GitHub:**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Add New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

2. **Configurar Variables de Entorno:**
   ```
   VITE_API_URL=https://web-production-62840.up.railway.app
   ```

3. **Deploy:**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente
   - Cada push a `main` desplegará automáticamente

### Opción 2: Deploy con CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Configuración Post-Deploy

1. **Dominio Personalizado** (Opcional):
   - Ve a Project Settings → Domains
   - Agrega tu dominio personalizado

2. **Variables de Entorno:**
   - Ve a Project Settings → Environment Variables
   - Agrega `VITE_API_URL` con la URL de tu API

3. **Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `bun run build`
   - Output Directory: `dist`
   - Install Command: `bun install`

### Netlify (Alternativa)

```bash
# Build
bun run build

# Arrastrar carpeta dist/ a netlify.com/drop
```

O usar Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 📝 Scripts

- `bun run dev` - Servidor de desarrollo
- `bun run build` - Build de producción
- `bun run preview` - Preview del build

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abrir Pull Request

## 📄 Licencia

MIT

---

Hecho con ❤️ y ☕ en Argentina 🇦🇷