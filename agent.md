# Agent Configuration

## Stack Tecnológico
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Sin frameworks** (vanilla JS puro)
- **Estructura:** Carpeta `Pagina Web/` con archivos Index.html, Index.css, Index.JS

## Convenciones de Código

### Nombres de archivos
- Usar PascalCase para archivos JS: `Index.JS`, `MiComponente.JS`
- Usar kebab-case para assets y recursos: `mi-imagen.png`, `estilos-generales.css`

### Nomenclatura en código
- **Variables y funciones:** camelCase (`miVariable`, `obtenerDatos`)
- **Constantes:** UPPER_SNAKE_CASE para valores globales (`API_URL`, `MAX_INTENTOS`)
- **Clases:** PascalCase (`class MiComponente`)
- **IDs y clases CSS:** kebab-case (`.boton-principal`, `#menu-principal`)

### Estructura HTML
- Usar etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- Indentación: 2 espacios
- Atributos en orden: `id`, `class`, `data-*`, `src/href`, `alt/title`

### Estructura CSS
- Metodología: BEM para naming (`.bloque__elemento--modificador`)
- Orden de propiedades: posicionamiento → box-model → tipografía → visuales → misc
- Usar variables CSS para colores y espaciados
- Mobile-first en media queries

### Estructura JavaScript
- Funciones pequeñas y con propósito único
- Comentarios JSDoc para funciones públicas
- Manejar errores con try/catch
- Evitar variables globales excesivas

## Prohibiciones

### Seguridad
- ❌ NO generar URLs sin validar
- ❌ NO hardcodear credenciales, API keys o secretos
- ❌ NO hacer logging de información sensible

### Código
- ❌ NO usar `eval()` bajo ninguna circunstancia
- ❌ NO usar `innerHTML` con datos no sanitizados (usar textContent/createElement)
- ❌ NO comentar código obsoleto (eliminar, no dejar comentado)
- ❌ NO usar `var` (usar `const` o `let`)
- ❌ NO usar `==` (usar siempre `===`)

### Arquitectura
- ❌ NO agregar dependencias externas sin autorización expresa
- ❌ NO crear archivos fuera de `Pagina Web/` o `assets/`
- ❌ NO modificar archivos que no sean relevantes para la tarea

## Workflow de desarrollo
1. Entender el requerimiento antes de codificar
2. Verificar archivos existentes para seguir patrones
3. Implementar cambios pequeños y verificables
4. Si hay tests, ejecutarlos tras cambios
5. No hacer commit sin autorización explícita

## Comandos disponibles
- `npm run lint` - Validar código (si existe configuración)
- `npm run test` - Ejecutar tests (si existen)
