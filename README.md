# emprendeX mobile

Aplicacion mobile construida con Expo Router para gestionar clientes, cotizaciones,
operaciones, productos, contabilidad y modulos premium desde una sola app.

## Objetivo de esta documentacion

Este `README` cubre el arranque rapido y el mapa general del proyecto.

La documentacion detallada vive en `docs/`:

1. `docs/README.md`: indice documental.
2. `docs/architecture/overview.md`: arquitectura general del proyecto.
3. `docs/architecture/auth-onboarding-navigation.md`: flujo de autenticacion, onboarding y navegacion.
4. `docs/domain/modules.md`: modulos funcionales y reglas de negocio visibles en la app.
5. `docs/maintenance/documentation-guidelines.md`: convenciones para mantener la documentacion.

## Stack principal

1. Expo SDK 54
2. React 19
3. React Native 0.81
4. Expo Router 6
5. NativeWind
6. AsyncStorage para persistencia local simple

## Requisitos

```bash
npm install
```

## Scripts utiles

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run format
```

## Estructura del proyecto

```text
app/          Rutas, layouts y pantallas de Expo Router
lib/          Capa de dominio, auth, acceso a API y estado compartido
components/   Componentes UI reutilizables y utilidades visuales
hooks/        Hooks transversales
constants/    Constantes de tema y configuracion base
docs/         Documentacion externa del proyecto
scripts/      Scripts auxiliares del repo
assets/       Imagenes e iconos
```

## Flujo funcional principal

1. `app/index.tsx` muestra login.
2. `lib/auth.ts` autentica y decide la ruta posterior con `resolvePostAuthRoute`.
3. `lib/auth-session-context.tsx` hidrata sesion desde AsyncStorage.
4. `app/onboarding/setup.tsx` recoge datos basicos del negocio cuando faltan.
5. `app/onboarding/modules.tsx` presenta los modulos base y premium.
6. `app/(drawer)/_layout.tsx` arma el drawer segun los modulos visibles.
7. `app/(drawer)/(tabs)/_layout.tsx` protege tabs segun los modulos habilitados.

## Configuracion de API

La app resuelve la API desde variables `EXPO_PUBLIC_*` en `lib/api-config.ts`.

Prioridad de resolucion:

1. `EXPO_PUBLIC_API_BASE_URL`
2. `EXPO_PUBLIC_API_TARGET=railway`
3. `EXPO_PUBLIC_API_TARGET=local`
4. `EXPO_PUBLIC_API_TARGET=auto`

### Modo local

Usa el backend local con Docker o con `pnpm run dev:api` en el repo backend.

Ejemplo de `.env`:

```env
EXPO_PUBLIC_API_TARGET=local
EXPO_PUBLIC_API_SCHEME=http
EXPO_PUBLIC_API_HOST=192.168.18.9
EXPO_PUBLIC_API_PORT=3000
EXPO_PUBLIC_API_PATH=/api/v1
EXPO_PUBLIC_API_RAILWAY_BASE_URL=https://api-production-159f1.up.railway.app/api/v1
```

Notas:

1. `EXPO_PUBLIC_API_HOST` debe ser la IP de tu maquina en la red local si pruebas desde celular.
2. En emulador Android normalmente puedes usar `10.0.2.2` en lugar de la IP LAN.

### Modo Railway

Usa la API desplegada en Railway.

Ejemplo de `.env`:

```env
EXPO_PUBLIC_API_TARGET=railway
EXPO_PUBLIC_API_RAILWAY_BASE_URL=https://api-production-159f1.up.railway.app/api/v1
```

Tambien puedes usar una URL completa:

```env
EXPO_PUBLIC_API_BASE_URL=https://api-production-159f1.up.railway.app/api/v1
```

## Archivos de entorno

Archivos incluidos en el repo:

1. `.env.example`: plantilla para desarrollo local.
2. `.env.railway.example`: plantilla para apuntar a Railway.

Archivos no versionados:

1. `.env`
2. `.env*.local`

`.env.railway.example` debe permanecer en el repositorio porque es solo una plantilla y no contiene secretos.

## Convenciones de documentacion

1. La vision global vive en `docs/`.
2. El `README` debe responder como correr, como esta organizado y donde leer mas.
3. El codigo compartido y exportado debe usar `JSDoc` cuando su contrato no sea obvio.
4. Los comentarios inline deben reservarse para decisiones o flujos no evidentes.
5. Al agregar una funcionalidad nueva, se debe actualizar al menos un documento externo si cambia arquitectura, flujo o dominio.

## Verificacion rapida

Si la app no conecta con el backend:

1. Confirma que la API responde en `/api/v1/health`.
2. Revisa que `EXPO_PUBLIC_API_TARGET` sea el esperado.
3. Revisa que `EXPO_PUBLIC_API_HOST` apunte a una IP accesible desde el dispositivo.
4. Reinicia Expo despues de cambiar variables de entorno.
