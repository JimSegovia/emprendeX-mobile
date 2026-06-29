# Arquitectura general

## Resumen

`emprendeX-mobile` es una aplicacion Expo Router orientada a negocio. La navegacion se compone de:

1. Una capa raiz con providers globales.
2. Una capa de autenticacion y onboarding.
3. Una capa interna con drawer, tabs y rutas secundarias.

La mayor parte de la logica de negocio y acceso a datos vive en `lib/`. La carpeta `app/` se encarga de presentar pantallas y orquestar interacciones con esa capa.

## Carpetas principales

### `app/`

Responsabilidad: rutas, layouts y pantallas definidas con Expo Router.

Archivos clave:

1. `app/_layout.tsx`
   Registra providers globales y el stack raiz.

2. `app/index.tsx`
   Pantalla de login.

3. `app/register.tsx`
   Registro de usuario.

4. `app/onboarding/*`
   Flujo para completar informacion base del negocio y presentar modulos.

5. `app/(drawer)/_layout.tsx`
   Shell interna con drawer personalizado.

6. `app/(drawer)/(tabs)/_layout.tsx`
   Tabs internas, proteccion de rutas por modulo y FAB de acciones rapidas.

### `lib/`

Responsabilidad: dominio, acceso a API, auth, resolucion de entorno y estado compartido.

Subgrupos relevantes:

1. Auth y sesion
   `lib/auth.ts`, `lib/auth-session-context.tsx`

2. API y entorno
   `lib/api-config.ts`, `lib/api-client.ts`

3. Modulos y preferencias
   `lib/modules.ts`, `lib/module-preferences.ts`, `lib/module-preferences-context.tsx`

4. Dominio de negocio
   `lib/clientes.ts`, `lib/ventas.ts`, `lib/productos-servicios.ts`, `lib/contabilidad.ts`, `lib/reportes.ts`, `lib/calendario.ts`, `lib/planes.ts`

### `components/`

Responsabilidad: piezas UI reutilizables.

Archivos clave:

1. `components/KeyboardAwareLayout.tsx`
   Wrapper para formularios afectados por teclado.

2. `components/ui/motion.tsx`
   Configuracion de animaciones reutilizadas por muchas pantallas.

3. `components/haptic-tab.tsx`
   Integracion de feedback haptico para tabs.

### `hooks/`

Responsabilidad: hooks transversales, sobre todo de tema y color scheme.

### `constants/`

Responsabilidad: constantes de tema y configuracion base.

### `docs/`

Responsabilidad: documentacion externa para mantenimiento, onboarding tecnico y decisiones operativas del proyecto.

## Providers globales

Los providers se registran en `app/_layout.tsx` en este orden:

1. `ThemeProvider`
2. `AuthSessionProvider`
3. `ModulePreferencesProvider`

Implicancias:

1. La sesion de usuario se hidrata antes de resolver pantallas internas.
2. Las preferencias visuales de modulos dependen del estado de autenticacion.
3. La app completa comparte el mismo arbol de sesion y modulos.

## Flujo de datos compartido

1. `lib/api-config.ts` resuelve la base URL.
2. Las librerias de dominio de `lib/` consumen endpoints del backend.
3. `lib/auth-session-context.tsx` conserva `accessToken` y `authState`.
4. `lib/module-preferences-context.tsx` resuelve orden visible y disponibilidad de modulos.
5. Las pantallas en `app/` leen esos contextos y ejecutan acciones de negocio.

## Reglas de navegacion

1. El stack raiz vive en `app/_layout.tsx`.
2. El drawer vive en `app/(drawer)/_layout.tsx`.
3. Las tabs visibles viven en `app/(drawer)/(tabs)/_layout.tsx`.
4. Rutas secundarias como `productos/[id]`, `productos/nuevo` o `plan-pro` existen dentro de la shell de tabs pero no aparecen como tabs publicas.

## Reglas de modulos

Los modulos se definen en `lib/modules.ts`.

Conceptos separados:

1. Visibilidad
   Se decide con `buildVisibleModuleOrder` y `ALWAYS_VISIBLE_MODULE_IDS`.

2. Disponibilidad
   Se decide con `isModuleAvailable` y los `enabledModuleIds` del usuario.

3. Proteccion de acceso
   `app/(drawer)/(tabs)/_layout.tsx` redirige si la ruta apunta a un modulo no habilitado.

Esto es importante porque un modulo puede estar visible en la navegacion pero seguir bloqueado por plan.

## Hotspots de mantenimiento

Estas zonas merecen especial cuidado cuando se agregan features:

1. `lib/auth.ts`
   Contratos de auth, onboarding y persistencia.

2. `lib/modules.ts`
   Catalogo de modulos y reglas de visibilidad.

3. `app/(drawer)/(tabs)/_layout.tsx`
   Proteccion de rutas, tabs y FAB.

4. `app/(drawer)/(tabs)/productos/nuevo.tsx`
   Pantalla grande con varias responsabilidades.

5. `app/(drawer)/(tabs)/contabilidad/nuevo.tsx`
   Formulario grande con variantes de flujo.

## Riesgos tecnicos actuales

1. Hay duplicacion de cliente HTTP entre `lib/api-client.ts`, `lib/auth.ts` y `lib/productos-servicios.ts`.
2. Existen pantallas grandes que mezclan UI, carga de datos y decisiones de dominio.
3. Hay semanticas que conviene vigilar, por ejemplo `operaciones/nueva.tsx` crea una cotizacion.

## Criterio para nuevas funcionalidades

Antes de agregar un nuevo modulo o flujo, confirmar:

1. Que capa de `lib/` sera la dueña del contrato con backend.
2. En que parte de la navegacion aparecera.
3. Si requiere proteccion por plan o por onboarding.
4. Que documento en `docs/` debe actualizarse junto con el cambio.
