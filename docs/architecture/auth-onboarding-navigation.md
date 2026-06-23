# Flujo de autenticacion, onboarding y navegacion

## Objetivo

Este documento explica como la app decide a donde llevar al usuario desde que abre la aplicacion hasta que entra a la experiencia principal.

## Archivos involucrados

1. `app/_layout.tsx`
2. `app/index.tsx`
3. `app/register.tsx`
4. `app/onboarding/_layout.tsx`
5. `app/onboarding/setup.tsx`
6. `app/onboarding/modules.tsx`
7. `app/(drawer)/_layout.tsx`
8. `app/(drawer)/(tabs)/_layout.tsx`
9. `lib/auth.ts`
10. `lib/auth-session-context.tsx`
11. `lib/modules.ts`
12. `lib/module-preferences-context.tsx`

## Flujo resumido

```text
App inicia
-> app/_layout.tsx monta providers
-> AuthSessionProvider intenta hidratar sesion desde AsyncStorage
-> si no hay sesion: login o registro
-> si hay sesion: resolvePostAuthRoute decide siguiente ruta
-> si falta perfil de negocio: /onboarding
-> si el perfil existe pero falta completar onboarding: /onboarding/modules
-> si onboarding ya esta completo: /(drawer)/(tabs)
```

## Paso 1: arranque de la app

`app/_layout.tsx` monta el stack raiz y registra:

1. `AuthSessionProvider`
2. `ModulePreferencesProvider`

Esto garantiza que el resto de pantallas pueda leer sesion y modulos desde contexto.

## Paso 2: hidratacion de sesion

`lib/auth-session-context.tsx` hace lo siguiente al montar:

1. Lee la sesion guardada con `loadAuthSession()`.
2. Si existe `accessToken`, consulta `/auth/me` con `fetchCurrentUser()`.
3. Si la consulta falla, limpia la sesion local con `clearAuthSession()`.
4. Marca `isHydrated=true` al terminar.

Resultado:

1. `accessToken` representa credencial vigente local.
2. `authState` representa el usuario actual y su estado de onboarding.
3. `isHydrated` evita decisiones de navegacion antes de terminar la carga inicial.

## Paso 3: login o registro

### Login

`app/index.tsx`:

1. Usa `loginUser()`.
2. Guarda la sesion con `setAuthenticatedSession()` del contexto.
3. Redirige con `resolvePostAuthRoute()`.

### Registro

`app/register.tsx` sigue el mismo patron general:

1. Llama a `registerUser()`.
2. Persiste sesion.
3. Redirige segun el estado devuelto por backend.

## Paso 4: decision de ruta post-auth

La regla vive en `lib/auth.ts` dentro de `resolvePostAuthRoute()`.

La funcion distingue tres destinos:

1. `/(drawer)/(tabs)`
   Cuando `requiresOnboarding` es falso.

2. `/onboarding`
   Cuando falta onboarding y todavia no existe perfil basico del negocio.

3. `/onboarding/modules`
   Cuando el perfil basico ya existe, pero el onboarding aun no termina.

## Paso 5: onboarding de negocio

`app/onboarding/setup.tsx` recopila:

1. `businessName`
2. `businessCategory`

Luego llama a `updateOnboardingSetup()` y actualiza `authState` con el resultado.

El backend sigue siendo la fuente de verdad sobre si el onboarding ya puede avanzar.

## Paso 6: onboarding de modulos

`app/onboarding/modules.tsx` muestra los modulos base y premium a nivel informativo.

La pantalla termina el flujo llamando a `completeOnboardingModules()`.

Despues:

1. Actualiza `authState`.
2. Recalcula la ruta con `resolvePostAuthRoute()`.
3. Redirige al destino final.

## Paso 7: navegacion interna

### Drawer

`app/(drawer)/_layout.tsx` construye el menu lateral a partir de `modules` expuestos por `useModulePreferences()`.

El drawer resuelve tres estados por item:

1. Activo
2. Premium visible pero bloqueado
3. Disponible para navegar

### Tabs

`app/(drawer)/(tabs)/_layout.tsx` muestra las tabs principales y tambien protege rutas.

La proteccion funciona asi:

1. Obtiene el `pathname` actual.
2. Usa `resolveModuleIdFromPathname()`.
3. Si el modulo existe pero no esta habilitado, redirige a `/(drawer)/(tabs)`.

## Flujo de modulos y permisos

`lib/module-preferences-context.tsx` combina dos cosas:

1. El orden personalizado guardado localmente.
2. Los `enabledModuleIds` recibidos desde la sesion del usuario.

Esto produce:

1. `modules`: modulos visibles en drawer.
2. `visibleOrder`: orden filtrado.
3. `isModuleEnabled()`: helper de disponibilidad.

## Diferencia importante: visible no significa habilitado

En la implementacion actual:

1. Algunos modulos forman parte de `ALWAYS_VISIBLE_MODULE_IDS`.
2. Esos modulos pueden aparecer en drawer aunque el plan no los habilite.
3. La UI usa ese comportamiento para mostrar modulos premium bloqueados y dirigir al plan Pro.

Cuando cambie la estrategia comercial o de onboarding, este documento debe actualizarse junto con `lib/modules.ts` y los layouts de navegacion.

## Checklist para cambios en este flujo

Si modificas auth, onboarding o navegacion, revisa estos puntos:

1. `resolvePostAuthRoute()` sigue cubriendo todos los estados posibles.
2. `AuthSessionProvider` mantiene la sesion consistente al fallar `/auth/me`.
3. Drawer y tabs reflejan correctamente modulos visibles e habilitados.
4. Los documentos `README.md`, `docs/architecture/overview.md` y este archivo siguen alineados.
