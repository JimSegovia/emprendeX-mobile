# Convenciones de documentacion

## Objetivo

Mantener la documentacion util, actualizada y alineada con el codigo real.

## Principios

1. Documentar decisiones, contratos y flujos.
2. Evitar comentarios que solo repiten el codigo.
3. Preferir documentacion cerca del dominio real del cambio.
4. Mantener una sola fuente de verdad por tema.

## Donde documentar cada cosa

### `README.md`

Usar para:

1. Como correr el proyecto.
2. Estructura general.
3. Enlaces a documentacion detallada.

No usar para:

1. Repetir todo el dominio.
2. Guardar decisiones historicas largas.

### `docs/architecture/*`

Usar para:

1. Flujo de navegacion.
2. Providers globales.
3. Capas del sistema.
4. Reglas de integracion entre carpetas.

### `docs/domain/*`

Usar para:

1. Modulos funcionales.
2. Reglas de negocio de alto nivel.
3. Dependencias entre entidades o flujos.

### `JSDoc` en codigo

Usar cuando:

1. Una funcion exportada tiene efectos o precondiciones no obvias.
2. Un tipo representa un contrato con backend.
3. Un contexto expone una API que otras pantallas deben entender.

No usar cuando:

1. El nombre y la firma ya explican suficientemente la funcion.
2. El comentario solo describe linea por linea lo evidente.

## Estilo recomendado

1. Frases cortas.
2. Enfasis en intencion, no en implementacion incidental.
3. Mencionar archivos y funciones concretas cuando el flujo cruza capas.
4. Actualizar ejemplos cuando cambie el comportamiento, no solo la firma.

## Checklist para PRs que cambian comportamiento

Actualizar documentacion si cambia cualquiera de estos puntos:

1. Rutas principales o layouts.
2. Flujo de auth o onboarding.
3. Catalogo de modulos.
4. Contratos de backend consumidos por la app.
5. Variables de entorno necesarias para ejecutar la app.

## Checklist para agregar un nuevo endpoint consumido por mobile

1. Nombrar claramente la funcion en `lib/`.
2. Tipar payload y respuesta.
3. Añadir `JSDoc` si el contrato no es evidente.
4. Actualizar un documento de dominio o arquitectura si ese endpoint introduce un flujo nuevo.

## Checklist para agregar un modulo nuevo

1. Actualizar `lib/modules.ts`.
2. Actualizar `docs/domain/modules.md`.
3. Revisar `docs/architecture/overview.md` si afecta navegacion o responsabilidades.
4. Confirmar si requiere proteccion premium, onboarding o ambos.

## Regla final

Si un desarrollador nuevo no puede responder en pocos minutos que hace una capa, como entra un usuario o donde agregar una feature nueva, entonces la documentacion todavia no es suficiente.
