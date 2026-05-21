# emprendeX mobile

Aplicacion mobile construida con Expo Router.

## Requisitos

```bash
npm install
```

## Configuracion de API

La app resuelve la API desde variables `EXPO_PUBLIC_*` en `lib/api-config.ts`.

Prioridad de resolucion:

1. `EXPO_PUBLIC_API_BASE_URL`
2. `EXPO_PUBLIC_API_TARGET=railway`
3. `EXPO_PUBLIC_API_TARGET=local`
4. `EXPO_PUBLIC_API_TARGET=auto`

## Modo local

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
2. Si pruebas en emulador Android, normalmente puedes usar `10.0.2.2` en lugar de la IP LAN.

## Modo Railway

Usa la API desplegada en Railway.

Ejemplo de `.env`:

```env
EXPO_PUBLIC_API_TARGET=railway
EXPO_PUBLIC_API_RAILWAY_BASE_URL=https://api-production-159f1.up.railway.app/api/v1
```

Tambien puedes usar una URL explicita completa:

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

`.env.railway.example` si debe ir al repositorio porque es solo una plantilla y no contiene secretos.

## Ejecutar la app

```bash
npm run start
```

Tambien puedes usar:

```bash
npm run android
npm run ios
npm run web
```

## Verificacion rapida

Si la app no conecta con el backend:

1. confirma que la API responde en `/api/v1/health`
2. revisa que `EXPO_PUBLIC_API_TARGET` sea el esperado
3. revisa que `EXPO_PUBLIC_API_HOST` apunte a una IP accesible desde el dispositivo
4. reinicia Expo despues de cambiar variables de entorno
