# Modulos funcionales

## Objetivo

Este documento resume los modulos funcionales visibles en la app, sus pantallas principales y las librerias de dominio que los soportan.

## Fuente de verdad

La definicion tecnica de modulos vive en `lib/modules.ts`.

Ese archivo define:

1. `ModuleId`
2. `DEFAULT_MODULES`
3. `ALWAYS_VISIBLE_MODULE_IDS`
4. helpers de visibilidad y resolucion por pathname

## Tabla de modulos

### Inicio

1. `ModuleId`: `index`
2. Pantalla principal: `app/(drawer)/(tabs)/index.tsx`
3. Responsabilidad: resumen del dia y accesos rapidos.
4. Dependencias: `useAuthSession()`, `useModulePreferences()`.

### Operaciones

1. `ModuleId`: `operaciones`
2. Pantallas principales:
   `app/(drawer)/(tabs)/operaciones/index.tsx`
   `app/(drawer)/(tabs)/operaciones/[id].tsx`
   `app/(drawer)/(tabs)/operaciones/nueva.tsx`
3. Libreria de dominio: `lib/ventas.ts`
4. Nota operativa: la pantalla `operaciones/nueva.tsx` crea una cotizacion nueva.

### Clientes

1. `ModuleId`: `clientes`
2. Pantallas principales:
   `app/(drawer)/(tabs)/clientes/index.tsx`
   `app/(drawer)/(tabs)/clientes/form.tsx`
   `app/(drawer)/(tabs)/clientes/[id].tsx`
3. Libreria de dominio: `lib/clientes.ts`
4. Responsabilidad: CRUD y consulta de fichas de cliente.

### Productos / Servicios

1. `ModuleId`: `productos`
2. Pantallas principales:
   `app/(drawer)/(tabs)/productos.tsx`
   `app/(drawer)/(tabs)/productos/nuevo.tsx`
   `app/(drawer)/(tabs)/productos/[id].tsx`
3. Libreria de dominio: `lib/productos-servicios.ts`
4. Responsabilidad: catalogo reutilizable para cotizaciones y operaciones.

### Cotizaciones

1. `ModuleId`: `cotizaciones`
2. Pantalla principal: `app/(drawer)/(tabs)/cotizaciones.tsx`
3. Libreria de dominio: `lib/ventas.ts`
4. Responsabilidad: listar cotizaciones y convertirlas a pedido cuando aplique.

### Contabilidad

1. `ModuleId`: `contabilidad`
2. Pantallas principales:
   `app/(drawer)/(tabs)/contabilidad/index.tsx`
   `app/(drawer)/(tabs)/contabilidad/nuevo.tsx`
3. Libreria de dominio: `lib/contabilidad.ts`
4. Responsabilidad: pagos, gastos, categorias y metodos de pago.

### Calendario

1. `ModuleId`: `calendario`
2. Pantalla principal: `app/(drawer)/(tabs)/calendario.tsx`
3. Libreria de dominio: `lib/calendario.ts`
4. Estado comercial actual: premium.

### Reportes

1. `ModuleId`: `reportes`
2. Pantalla principal: `app/(drawer)/(tabs)/reportes.tsx`
3. Libreria de dominio: `lib/reportes.ts`
4. Estado comercial actual: premium.

### Notificaciones avanzadas

1. `ModuleId`: `notificaciones`
2. Pantalla principal: `app/(drawer)/(tabs)/notificaciones.tsx`
3. Libreria de dominio relacionada: no centralizada aun en una sola libreria dedicada.
4. Estado comercial actual: premium.

### Configuracion

1. `ModuleId`: `configuracion`
2. Pantalla principal: `app/(drawer)/(tabs)/configuracion.tsx`
3. Dependencias: `useAuthSession()`, `useModulePreferences()`.
4. Responsabilidad: datos del negocio, orden del sidebar, cierre de sesion y upsell premium.

## Modulos premium y modulos siempre visibles

La implementacion actual separa dos ejes:

1. `premium`
   Indica caracter comercial del modulo.

2. `ALWAYS_VISIBLE_MODULE_IDS`
   Indica visibilidad estructural en la navegacion.

Consecuencia:

1. Un modulo premium puede seguir visible.
2. La UI puede bloquear su acceso y derivar a `plan-pro`.
3. No asumir que visible equivale a habilitado.

## Dependencias de dominio compartidas

1. `lib/ventas.ts`
   Se usa por operaciones y cotizaciones.

2. `lib/productos-servicios.ts`
   Alimenta formularios de cotizacion y catalogo base.

3. `lib/clientes.ts`
   Alimenta operaciones y fichas de cliente.

4. `lib/contabilidad.ts`
   Soporta formularios y listados contables.

## Reglas para agregar un nuevo modulo

1. Agregar `ModuleId` en `lib/modules.ts`.
2. Registrar su `ModuleDefinition` en `DEFAULT_MODULES`.
3. Definir si sera premium y si debe ser siempre visible.
4. Crear sus rutas en `app/(drawer)/(tabs)/`.
5. Ajustar drawer, tabs o redirecciones si aplica.
6. Actualizar este documento y `docs/architecture/overview.md`.
