# Despliegue en AWS Amplify Hosting

Runbook para desplegar este proyecto (Next.js 16, App Router, SSR + `proxy.ts`, pnpm, Supabase) en Amplify Hosting.

## ⚠️ Riesgo principal: Next.js 16 no está en la matriz de soporte de Amplify

Amplify soporta oficialmente Next.js **12–15** ([doc](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html)). Este proyecto usa **Next 16.2.4**. El `amplify.yml` arregla el build (pnpm), pero el **deploy/runtime SSR puede fallar** porque el parser de Amplify traduce el output de `.next` a su bundle Lambda y puede no reconocer el formato de Next 16.

Síntomas posibles tras un build exitoso:
- Deploy falla: *"unable to detect a supported version of Next.js"*.
- Deploy "ok" pero rutas SSR devuelven **500**.
- `proxy.ts` **ignorado silenciosamente** → los auth gates/redirects no se ejecutan (riesgo de seguridad).

**Plan:** desplegar primero como prueba y observar el runtime. Si falla la detección, opciones: bajar a Next 15, usar Vercel (soporte día-cero de Next 16), un [adapter open source de Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/advanced-open-source-adapters.html), o `output: 'standalone'` en contenedor (ECS/App Runner).

## Build spec

El `amplify.yml` (raíz del repo) ya incluye: Node 22, `npm install -g pnpm@10.33.2`, `pnpm install --frozen-lockfile`, volcado de env vars a `.env.production`, artifacts en `.next`, cache de `node_modules` y `.next/cache`.

## Variables de entorno (consola Amplify → App settings → Environment variables)

Deben existir **antes del primer build**.

| Variable | Disponibilidad | Sensible | Notas |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | build (horneada en cliente) + runtime | No | Pública por diseño |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | build (horneada en cliente) + runtime | No | Pública; RLS protege |
| `SUPABASE_SERVICE_ROLE_KEY` | runtime SSR (server action de usuarios) | **Sí — secreto** | Ver nota de seguridad |

**Por qué el volcado a `.env.production`:** Amplify **no** inyecta las env vars en el runtime SSR (Lambda) automáticamente; solo están en build time. El `build` phase del `amplify.yml` las escribe a `.env.production` para que server components y server actions las lean en runtime ([doc](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html)).

### Nota de seguridad sobre `SUPABASE_SERVICE_ROLE_KEY`

Esta key **bypassa RLS** y la usa `lib/actions/usuarios.ts` en runtime. Volcada a `.env.production` queda **legible en los artefactos de deployment**. AWS recomienda no guardar secretos como env vars planas. Endurecimiento posterior recomendado: guardarla en **AWS Secrets Manager** y leerla en runtime con el **IAM role** de la compute function ([doc](https://docs.aws.amazon.com/amplify/latest/userguide/using-service-roles-with-amplify-applications.html)), quitándola del volcado a `.env.production`.

## Checklist en la consola

1. Conectar repo GitHub → rama `main`.
2. Verificar que Amplify detecta **"Next.js - SSR"** en build settings. Si detecta estático o falla la detección → señal de incompatibilidad Next 16 (ver riesgo arriba).
3. Usar el `amplify.yml` del repo (no sobrescribir con el editor de la consola).
4. Configurar las 3 env vars (arriba), antes del build.
5. Lanzar deploy. Revisar logs: provision → build → deploy.
6. Validar runtime: ruta SSR = 200, `proxy.ts` ejecuta (redirect de auth), `next/image` con host Supabase carga, gestión de usuarios (service-role) funciona.

## `next.config.ts` — imágenes remotas

Ya configura `remotePatterns` para `*.supabase.co/storage/v1/object/public/**`. Si usas un host de Supabase específico y `next/image` falla en runtime, ajusta el `hostname` al proyecto concreto.
