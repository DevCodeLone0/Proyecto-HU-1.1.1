# Servidor API - Gestión de Equipos de Fútbol

## Requisitos
- Node.js 18+ instalado

## Instalación

```bash
cd server
npm install
```

## Ejecutar

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Equipos
- `GET /api/teams` - Obtener equipos del usuario
- `POST /api/teams` - Crear equipo
- `PUT /api/teams/:id` - Actualizar equipo
- `DELETE /api/teams/:id` - Eliminar equipo

### Jugadores
- `GET /api/players` - Obtener jugadores del usuario
- `POST /api/players` - Crear jugador
- `PUT /api/players/:id` - Actualizar jugador
- `DELETE /api/players/:id` - Eliminar jugador

## Base de datos
Se usa SQLite. La base de datos `football.db` se crea automáticamente.
