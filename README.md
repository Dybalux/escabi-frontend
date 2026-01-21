# 🍺 EscabiAPI Frontend

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/escabi-frontend)

Frontend moderno desarrollado con React, Vite y Bun para la API de gestión de bebidas.

## 🌐 Demo en Vivo

**URL de Producción:** [https://escabi-frontend.vercel.app](https://escabi-frontend.vercel.app)

> [!NOTE]
> El proyecto está configurado en Vercel. Cada push a `main` desplegará automáticamente.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool ultrarrápido
- **Bun** - Runtime y package manager
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones

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
VITE_API_URL=
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
│   ├── Admin/         # Panel de administración
│   │   ├── AdminNav.jsx
│   │   ├── AdminRoute.jsx
│   │   └── ProductForm.jsx
│   ├── Auth/          # Login y Register
│   ├── Products/      # Productos y filtros
│   ├── Cart/          # Carrito de compras
│   ├── Layout/        # Header y Footer
│   ├── UI/            # Componentes base
│   └── MaintenanceScreen.jsx  # Pantalla de mantenimiento
├── context/
│   ├── AuthContext.jsx   # Estado de autenticación
│   └── CartContext.jsx   # Estado del carrito
├── pages/
│   ├── Admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── ProductManagement.jsx
│   │   ├── ComboManagement.jsx
│   │   ├── OrderManagement.jsx
│   │   ├── UserManagement.jsx
│   │   ├── PaymentSettings.jsx
│   │   ├── ShippingSettings.jsx
│   │   ├── PricingSettings.jsx
│   │   └── SystemSettings.jsx  # Modo mantenimiento
│   ├── Home.jsx          # Landing page
│   ├── Products.jsx      # Catálogo
│   ├── MyOrders.jsx      # Historial de pedidos
│   ├── PaymentSuccess.jsx
│   ├── PaymentFailure.jsx
│   └── PaymentPending.jsx
├── services/
│   └── api.js            # Cliente API con interceptores
├── App.jsx
├── main.jsx
└── index.css
```

## ✨ Características

### Autenticación
- ✅ Registro de usuarios
- ✅ Login con JWT
- ✅ Verificación de edad automática (18+)
- ✅ Refresh token automático
- ✅ Logout

### Productos
- ✅ Catálogo completo
- ✅ Filtrado por categoría
- ✅ Búsqueda en tiempo real
- ✅ Información detallada
- ✅ Gestión de stock
- ✅ Precios dinámicos por zona

### Combos
- ✅ Creación de combos de productos
- ✅ Descuentos especiales
- ✅ Gestión de stock automática
- ✅ Carrusel de combos en home
- ✅ Agregar combos al carrito

### Carrito
- ✅ Agregar productos y combos
- ✅ Animaciones de cantidad con Framer Motion
- ✅ Input manual de cantidades
- ✅ Ver total con envío
- ✅ Eliminar items
- ✅ Crear pedido

### Pedidos
- ✅ Historial de compras
- ✅ Estados de pedido en tiempo real
- ✅ Detalles completos
- ✅ Integración con Mercado Pago
- ✅ Notificaciones por email
- ✅ Números de orden únicos

### Panel de Administración
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos
- ✅ Gestión de combos
- ✅ Gestión de pedidos
- ✅ Gestión de usuarios y roles
- ✅ Configuración de pagos (Mercado Pago)
- ✅ Configuración de envíos (zonas y precios)
- ✅ Configuración de precios dinámicos
- ✅ **Modo mantenimiento** 🚧
- ✅ Configuración de redes sociales

### Modo Mantenimiento 🚧
- ✅ Activación/desactivación desde el panel admin
- ✅ Mensaje personalizable para usuarios
- ✅ Detección automática en tiempo real (polling cada 30s)
- ✅ Bypass automático para administradores
- ✅ Pantalla de mantenimiento profesional
- ✅ Manejo de errores 503

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

## 🚧 Modo Mantenimiento

El sistema incluye un modo mantenimiento completo que permite bloquear el acceso al sitio para realizar actualizaciones.

### Activar Modo Mantenimiento

1. **Acceder al Panel Admin:**
   ```
   /admin/system-settings
   ```

2. **Activar el Toggle:**
   - Activar "Modo Mantenimiento"
   - Escribir un mensaje personalizado para los usuarios
   - Guardar cambios

3. **Verificar:**
   - Los usuarios verán la pantalla de mantenimiento en máximo 30 segundos
   - Los administradores mantienen acceso completo

### Características Técnicas

- **Polling automático:** Verifica el estado cada 30 segundos
- **Detección de errores 503:** Activa automáticamente la pantalla de mantenimiento
- **Bypass para admins:** Los administradores siempre tienen acceso
- **Mensaje personalizable:** Configura el mensaje que verán los usuarios
- **Pantalla profesional:** Diseño moderno con opción de recargar

### Probar el Modo Mantenimiento

Como administrador, no verás la pantalla de mantenimiento. Para probarla:

1. Activa el modo mantenimiento
2. Abre una **ventana de incógnito** o **cierra sesión**
3. Intenta acceder a la página principal
4. Deberías ver la pantalla de mantenimiento 🚧

### Desactivar Modo Mantenimiento

1. Ve a `/admin/system-settings`
2. Desactiva el toggle
3. Guarda cambios
4. El sitio estará disponible para todos en 30 segundos

## 🚀 Deploy en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. **Conectar con GitHub:**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Add New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

2. **Configurar Variables de Entorno:**
   ```
   VITE_API_URL=
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