# emprendeX mobile

Aplicación mobile construida con Expo Router.

## Requisitos

```bash
npm install
```

## Arranque rápido

La forma más fácil es levantar todo desde el monorepo `emprendeX-web`:

```bash
cd C:\Proyectos\emprendeX-web
pnpm dev              # Stack local completo
pnpm dev:railway      # Contra API de Railway
```

El script del monorepo copia automáticamente el `.env` correcto y arranca Expo. Si prefieres arrancar manualmente:

```bash
npm run start
```

## Configuración de API

La app resuelve la API desde variables `EXPO_PUBLIC_*` en `lib/api-config.ts`.

Prioridad de resolución:

1. `EXPO_PUBLIC_API_BASE_URL` — URL completa (atajo, omite toda resolución)
2. `EXPO_PUBLIC_API_TARGET=railway` — usa `EXPO_PUBLIC_API_RAILWAY_BASE_URL`
3. `EXPO_PUBLIC_API_TARGET=local` — construye desde `HOST` + `PORT` + `SCHEME` + `PATH`
4. `EXPO_PUBLIC_API_TARGET=auto` — prueba local primero, luego railway

## Modo local

Usa el backend local levantado desde el monorepo con `pnpm dev`.

Archivo `C:\Proyectos\emprendeX-mobile\.env.local`:

```env
EXPO_PUBLIC_API_TARGET=local
EXPO_PUBLIC_API_HOST=192.168.18.9
EXPO_PUBLIC_API_PORT=3000
EXPO_PUBLIC_API_SCHEME=http
EXPO_PUBLIC_API_PATH=/api/v1
EXPO_PUBLIC_DEFAULT_CURRENCY_SYMBOL=S/
EXPO_PUBLIC_PASSWORD_MIN_LENGTH=8
```

> La IP `192.168.18.9` es un ejemplo. Cambia `EXPO_PUBLIC_API_HOST` por la IP de tu máquina si es diferente.
> Si usas emulador, usa `localhost` (o `10.0.2.2` en Android).

## Modo Railway

Usa la API desplegada en Railway.

Archivo `C:\Proyectos\emprendeX-mobile\.env.railway.example`:

```env
EXPO_PUBLIC_API_TARGET=railway
EXPO_PUBLIC_API_RAILWAY_BASE_URL=https://api-production-xxxx.up.railway.app/api/v1
EXPO_PUBLIC_DEFAULT_CURRENCY_SYMBOL=S/
EXPO_PUBLIC_PASSWORD_MIN_LENGTH=8
```

Edita la URL con la de tu servicio Railway, luego ejecuta desde el monorepo:

```bash
pnpm dev:railway
```

Esto copia automáticamente `.env.railway.example` → `.env.local` y arranca Expo.

También puedes usar una URL explícita completa:

```env
EXPO_PUBLIC_API_BASE_URL=https://api-production-xxxx.up.railway.app/api/v1
EXPO_PUBLIC_DEFAULT_CURRENCY_SYMBOL=S/
EXPO_PUBLIC_PASSWORD_MIN_LENGTH=8
```

## Archivos de entorno

Archivos incluidos en el repo:

| Archivo | Propósito |
|---------|-----------|
| `.env.example` | Plantilla para desarrollo local (con `TARGET=local`) |
| `.env.railway.example` | Plantilla para apuntar a Railway (con `TARGET=railway`) |

Archivos no versionados (gitignored):

| Archivo | Cómo se genera |
|---------|---------------|
| `.env.local` | `pnpm dev:local` lo copia desde `.env.example` |
| `.env` | No usar |
| `.env*.local` | Ignorados por git |

## Flujo entre local y Railway

```
pnpm dev (= dev:local)
  → Copia .env.example → .env.local
  → TARGET=local, HOST=192.168.x.x

pnpm dev:railway
  → Copia .env.railway.example → .env.local
  → TARGET=railway, URL de Railway
```

Al alternar entre modos, el `.env.local` se actualiza automáticamente. No necesitas editar archivos manualmente cada vez.

## Ejecutar la app

```bash
npm run start
```

También puedes usar:

```bash
npm run android
npm run ios
npm run web
```

## Verificación rápida

Si la app no conecta con el backend:

1. Confirma que la API responde en `/api/v1/health`
2. Revisa que `EXPO_PUBLIC_API_TARGET` sea el esperado
3. Revisa que `EXPO_PUBLIC_API_HOST` apunte a una IP accesible desde el dispositivo
4. Reinicia Expo después de cambiar variables de entorno
5. Si usas `pnpm dev:local` y tu IP cambió, edita `.env.example` con la nueva IP
