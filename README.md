# CHAAC XANAB - Tienda de Zapatos Deportivos

Plataforma de comercio electrónico desarrollada con Angular para la venta de zapatos deportivos de alta calidad. CHAAC XANAB ofrece una experiencia de compra intuitiva con diferentes categorías de productos deportivos adaptados a las necesidades de atletas y entusiastas del deporte.

## Acerca del Proyecto

CHAAC XANAB es una tienda digital especializada en la venta de zapatos deportivos. La aplicación proporciona un catálogo organizado de productos, permitiendo a los usuarios explorar diferentes categorías, buscar productos específicos y acceder a información detallada de cada artículo.

### Características Principales

- Catálogo de productos organizados por categorías
- Sistema de búsqueda de productos
- Información detallada de cada producto incluyendo nombre, precio, imagen y descripción
- Interfaz responsiva y moderna
- Menú de enlaces externos para redes sociales y otros recursos

## Vistas y Componentes

### Vistas Principales

1. **Vista Principal (Home)**
   - Página de inicio que muestra las categorías de productos disponibles
   - Opciones de búsqueda para encontrar productos específicos
   - Catálogo de zapatos deportivos organizados por tipo

2. **Vista de Categorías**
   - Running: Zapatos diseñados para correr largas distancias con máximo confort y tecnología de amortiguación
   - Básquetbol: Zapatos para jugar básquetbol con soporte y estabilidad en la cancha
   - Lifestyle: Zapatos deportivos con estilo urbano para uso casual y diario

### Componentes

- **App Component**: Componente raíz que gestiona la lógica principal de la aplicación, incluyendo categorías de productos y funcionalidad de búsqueda
- **External Links Menu**: Componente que muestra enlaces externos a redes sociales y otros recursos relacionados con la marca

## Instrucciones de Desarrollo

### Servidor de Desarrollo

Para iniciar el servidor de desarrollo local, ejecuta:

```bash
ng serve
```

Una vez que el servidor esté corriendo, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cuando modificques los archivos fuente.

### Generación de Componentes

Para generar un nuevo componente, ejecuta:

```bash
ng generate component component-name
```

Para ver una lista completa de esquemas disponibles, ejecuta:

```bash
ng generate --help
```

## Compilación

Para compilar el proyecto, ejecuta:

```bash
ng build
```

Esto compilará el proyecto y almacenará los artefactos de compilación en el directorio `dist/`. Por defecto, la compilación de producción optimiza la aplicación para rendimiento y velocidad.

## Pruebas Unitarias

Para ejecutar pruebas unitarias con [Vitest](https://vitest.dev/), utiliza el siguiente comando:

```bash
ng test
```

## Pruebas End-to-End

Para pruebas end-to-end, ejecuta:

```bash
ng e2e
```

Angular CLI no incluye un framework de testing end-to-end por defecto. Puedes elegir uno que se adapte a tus necesidades.

## Recursos Adicionales

Para más información sobre Angular CLI, incluyendo referencias de comandos detalladas, visita la página de [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
