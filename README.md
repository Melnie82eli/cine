# Sistema de Gestión de Cine

Un sistema completo de gestión para un cine con panel de administración, gestión de películas, clientes, menú y reportes de ganancias.

## Características

- **Sistema de Login/Registro**: Con autenticación de usuarios y roles (admin/cliente)
- **Dashboard Administrativo**: Panel completo para gestión del cine
- **Gestión de Perfil**: Edición de información personal y foto de perfil
- **Categorías**: Administración de categorías de películas
- **Clasificaciones**: Gestión de clasificaciones por edad
- **Películas**: Agregar, editar y eliminar películas del catálogo
- **Menú**: Gestión de productos de comida y bebidas
- **Clientes**: Visualización y gestión de clientes registrados
- **Gráficas**: Reportes de ganancias con gráficas interactivas
- **Diseño Responsivo**: Interfaz moderna con diseño azul

## Requisitos del Sistema

- PHP 7.4 o superior
- MySQL 5.7 o superior
- Servidor web (Apache/Nginx)
- XAMPP, WAMP, o similar

## Instalación

1. **Clonar o descargar el proyecto** en tu carpeta de servidor web:
   ```
   /xampp/htdocs/Proyecto/
   ```

2. **Crear la base de datos**:
   - Abre phpMyAdmin
   - Crea una nueva base de datos llamada `cine`
   - El sistema creará automáticamente las tablas necesarias

3. **Configurar la base de datos** (si es necesario):
   - Edita los archivos PHP en la carpeta `php/`
   - Modifica las credenciales de conexión si son diferentes:
     ```php
     $host = 'localhost';
     $dbname = 'cine';
     $username = 'root';
     $password = '';
     ```

4. **Configurar permisos**:
   - Asegúrate de que la carpeta `uploads/` tenga permisos de escritura
   - El sistema creará automáticamente las subcarpetas necesarias

5. **Acceder al sistema**:
   - Abre tu navegador
   - Ve a `http://localhost/Proyecto/`

## Credenciales por Defecto

### Administrador
- **Email**: admin@cine.com
- **Contraseña**: admin123

### Cliente
- Registrarse desde la página de login

## Estructura del Proyecto

```
Proyecto/
├── index.html              # Página principal de login
├── dashboard.html          # Dashboard administrativo
├── editarPerfil.html       # Edición de perfil
├── categorias.html         # Gestión de categorías
├── clasificaciones.html    # Gestión de clasificaciones
├── agregarPeliculas.html   # Gestión de películas
├── agregarComida.html      # Gestión de menú
├── clientes.html           # Gestión de clientes
├── graficas.html           # Gráficas de ganancias
├── css/
│   └── style.css           # Estilos CSS
├── js/
│   ├── login.js            # JavaScript del login
│   ├── dashboard.js        # JavaScript del dashboard
│   ├── editarPerfil.js     # JavaScript de editar perfil
│   ├── categorias.js       # JavaScript de categorías
│   ├── clasificaciones.js  # JavaScript de clasificaciones
│   ├── agregarPeliculas.js # JavaScript de películas
│   ├── agregarComida.js    # JavaScript de comida
│   ├── clientes.js         # JavaScript de clientes
│   └── graficas.js         # JavaScript de gráficas
├── php/
│   ├── auth.php            # Autenticación y registro
│   ├── categorias.php      # API de categorías
│   ├── clasificaciones.php # API de clasificaciones
│   ├── peliculas.php       # API de películas
│   ├── comida.php          # API de comida
│   ├── clientes.php        # API de clientes
│   └── graficas.php        # API de gráficas
└── uploads/                # Carpeta para archivos subidos
    ├── posters/            # Pósters de películas
    └── comida/             # Imágenes de productos
```

## Funcionalidades Principales

### Dashboard
- Vista general del sistema
- Acceso rápido a todos los módulos
- Gráficas de ganancias
- Estadísticas en tiempo real

### Gestión de Películas
- Agregar nuevas películas
- Subir pósters
- Asignar categorías y clasificaciones
- Gestionar precios y sinopsis

### Gestión de Menú
- Agregar productos de comida y bebidas
- Control de stock
- Categorización por tipo
- Gestión de precios

### Gestión de Clientes
- Lista de clientes registrados
- Búsqueda y filtros
- Estadísticas de clientes
- Gestión de perfiles

### Reportes y Gráficas
- Ganancias diarias, semanales, mensuales y anuales
- Distribución por categorías
- Análisis de ventas
- Gráficas interactivas con Chart.js

## Seguridad

- **Contraseñas sin encriptar**: Como solicitado, las contraseñas se almacenan en texto plano
- **Validación de sesiones**: Control de acceso por roles
- **Validación de archivos**: Verificación de tipos de archivo para imágenes
- **Sanitización de datos**: Prevención de inyección SQL

## Personalización

### Colores
Los colores principales se pueden modificar en `css/style.css`:
- Color principal: `#667eea`
- Color secundario: `#764ba2`
- Colores de estado: `#28a745`, `#dc3545`, `#ffc107`

### Base de Datos
El sistema crea automáticamente las siguientes tablas:
- `usuarios`: Usuarios del sistema
- `categorias`: Categorías de películas
- `clasificaciones`: Clasificaciones por edad
- `peliculas`: Catálogo de películas
- `comida`: Productos del menú

## Soporte

Para problemas o consultas:
1. Verifica que todos los archivos estén en la ubicación correcta
2. Confirma que la base de datos esté creada y accesible
3. Revisa los permisos de la carpeta `uploads/`
4. Verifica la configuración de PHP y MySQL

## Notas Importantes

- Las contraseñas se almacenan sin encriptar como se solicitó
- El sistema incluye datos de ejemplo para demostración
- Las gráficas muestran datos simulados
- Se recomienda cambiar las credenciales por defecto en producción 