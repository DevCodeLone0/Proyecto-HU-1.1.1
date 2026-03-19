# Gestión de Equipos de Fútbol

Sistema web para gestionar equipos de fútbol y sus jugadores, con autenticación de usuarios y base de datos en la nube.

## 📋 Índice

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Base de Datos](#base-de-datos)
- [Configuración](#configuración)
- [Instalación](#instalación)
- [API de Supabase](#api-de-supabase)
- [Convenciones](#convenciones)

## 🎯 Descripción

Aplicación web para la gestión de equipos de fútbol de Dimayor. Permite a los usuarios:

- Crear una cuenta personal
- Registrar equipos de fútbol con logo opcional
- Registrar jugadores y asignarlos a equipos
- Editar y eliminar equipos y jugadores
- Buscar equipos por nombre
- Persistencia de datos en Supabase (PostgreSQL)

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| **HTML5** | Estructura de la página |
| **CSS3** | Estilos y diseño responsive |
| **JavaScript ES6+** | Lógica de la aplicación |
| **Supabase** | Base de datos PostgreSQL en la nube |
| **Git/GitHub** | Control de versiones |

## 📁 Estructura del Proyecto

```
Proyecto-HU-1.1.1/
├── Pagina Web/
│   ├── Index.Html      # Estructura HTML
│   ├── Index.Css       # Estilos CSS
│   └── Index.JS       # Lógica JavaScript
├── assets/
│   └── logo.png        # Logo default
├── agent.md            # Configuración del agente IA
└── README.md          # Este archivo
```

## ✨ Funcionalidades

### Autenticación
- Registro de usuarios con nombre, email y contraseña
- Inicio de sesión con email y contraseña
- Sesiones persistentes (localStorage)
- Cierre de sesión

### Gestión de Equipos
- Crear equipo (con o sin logo)
- Editar nombre y logo
- Eliminar equipo (con confirmación)
- Buscar equipos por nombre
- Ver todos los equipos

### Gestión de Jugadores
- Crear jugador (con o sin foto)
- Asignar a un equipo
- Editar datos del jugador
- Cambiar equipo del jugador
- Eliminar jugador

### Imágenes
- Subida de imágenes para equipos y jugadores
- Redimensionamiento automático (150x150px)
- Almacenamiento en base64 en Supabase

## 🗄️ Base de Datos

### Tabla: users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | TEXT | Nombre del usuario |
| email | TEXT | Email (único) |
| password | TEXT | Contraseña |
| created_at | TIMESTAMP | Fecha de creación |

### Tabla: teams
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| user_id | UUID | ID del propietario |
| name | TEXT | Nombre del equipo |
| logo | TEXT | Logo en base64 (opcional) |
| created_at | TIMESTAMP | Fecha de creación |

### Tabla: players
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| user_id | UUID | ID del propietario |
| team_id | UUID | ID del equipo |
| name | TEXT | Nombre del jugador |
| age | INTEGER | Edad |
| position | TEXT | Posición |
| team_name | TEXT | Nombre del equipo |
| image | TEXT | Foto en base64 (opcional) |
| created_at | TIMESTAMP | Fecha de creación |

## ⚙️ Configuración

### Variables de Supabase

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key';
```

Para obtener estas credenciales:
1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Ir a Settings → API
4. Copiar Project URL y anon/public key

### Habilitar tablas

En Supabase Dashboard:
1. Ir a **SQL Editor**
2. Ejecutar el schema SQL para crear las tablas

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/Proyecto-HU-1.1.1.git
cd Proyecto-HU-1.1.1
```

2. **Configurar Supabase**
- Crear cuenta en Supabase
- Crear las tablas con el schema SQL
- Copiar las credenciales

3. **Actualizar credenciales en Index.JS**
```javascript
const SUPABASE_URL = 'tu-url-de-supabase';
const SUPABASE_ANON_KEY = 'tu-anon-key';
```

4. **Abrir la aplicación**
- Abrir `Pagina Web/Index.Html` en un navegador
- O usar un servidor local (Live Server, http-server, etc.)

## 🔌 API de Supabase

El proyecto usa la API REST de Supabase directamente desde el frontend:

### Endpoints usados

```
GET    /rest/v1/users
POST   /rest/v1/users
GET    /rest/v1/users?email=eq.{email}&password=eq.{password}
GET    /rest/v1/teams?user_id=eq.{userId}
POST   /rest/v1/teams
PATCH  /rest/v1/teams?id=eq.{id}&user_id=eq.{userId}
DELETE /rest/v1/teams?id=eq.{id}
GET    /rest/v1/players?user_id=eq.{userId}
POST   /rest/v1/players
PATCH  /rest/v1/players?id=eq.{id}&user_id=eq.{userId}
DELETE /rest/v1/players?id=eq.{id}
```

### Headers requeridos
```
apikey: tu-anon-key
Authorization: Bearer tu-anon-key
Content-Type: application/json
Prefer: return=representation
```

## 📝 Convenciones

### Nombres de archivos
- JavaScript: PascalCase (`Index.JS`, `MiComponente.JS`)
- Assets: kebab-case (`mi-imagen.png`)

### Nomenclatura en código
- Variables y funciones: camelCase
- Constantes: UPPER_SNAKE_CASE
- IDs y clases CSS: kebab-case

### CSS
- Metodología BEM (`.bloque__elemento--modificador`)
- Mobile-first en media queries

### JavaScript
- Funciones con propósito único
- Manejo de errores con try/catch
- Usar `const` y `let` (no `var`)

## 🔒 Seguridad

- Row Level Security (RLS) en Supabase para proteger datos
- Contraseñas almacenadas (considerar usar hash en producción)
- Validación de inputs en frontend y backend

## 📜 Licencia

MIT License

## 👤 Autor

DevCodeLone0

## 🔗 Enlaces

- [Repositorio GitHub](https://github.com/DevCodeLone0/Proyecto-HU-1.1.1)
- [Supabase](https://supabase.com)
- [Documentación de Supabase](https://supabase.com/docs)
