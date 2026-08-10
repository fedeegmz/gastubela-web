# gastubela

Aplicación web para dividir gastos entre amigos después de una juntada. Cada miembro registra sus gastos e indica entre quiénes se reparten; al finalizar, la aplicación calcula qué transferencias debe hacer cada persona para saldar la cuenta.

## Características

- Creación y administración de juntadas (`Gathering`) con miembros y gastos.
- Cada gasto tiene un pagador, un monto y un subconjunto de participantes (por defecto, todos los miembros).
- Vista de resultados: muestra las transferencias mínimas entre miembros para saldar la cuenta.

## Arquitectura

SPA de Vue 3 + Vite + Pinia. No hay backend ni base de datos: **todo el estado vive en memoria** y se pierde al recargar la página.

### Stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript**
- **Vite 8** como bundler y dev server
- **Pinia** para el estado global
- **Vitest** para tests unitarios
- **oxlint + ESLint** para linting y **oxfmt** para formateo

### Estructura

```
src/
  types.ts                    # Gathering, Member, Expense, Transfer
  utils/
    uuid.ts                   # wrapper de crypto.randomUUID
    currency.ts               # centavos → formato ARS
    settlements.ts            # balances + transferencias (funciones puras)
  stores/
    gatherings.ts             # CRUD + estado de navegación (Pinia)
  components/
    GatheringList.vue         # lista de juntadas
    GatheringForm.vue         # creación de juntada
    GatheringDetail.vue       # detalle: miembros + gastos + "Finalizar"
    MemberList.vue            # gestión de miembros
    ExpenseForm.vue           # alta de gasto (monto, pagador, participantes)
    SettlementList.vue        # transferencias por miembro
  App.vue                     # shell + conmutación de vistas
  main.ts
```

### Decisiones clave

- **Sin `vue-router`**: la navegación es por estado dentro del store (`view`: `list` → `detail` → `results`).
- **Montos en centavos (enteros)** para evitar errores de punto flotante. El formato ARS (`Intl.NumberFormat`) es solo de presentación.
- **Motor de reparto** (`src/utils/settlements.ts`): funciones puras y unit-tested. Por miembro, `balance = pagos − shares de gastos en los que participa`; el emparejamiento greedy deudor↔acreedor produce las transferencias. La división con resto asigna el remanente al pagador.
- **IDs** generados con `crypto.randomUUID()`.
- Convención de idiomas: **código, tipos e identificadores en inglés**; **strings de UI en español**.

## Requisitos

- Node.js `^22.18.0` o `>=24.12.0`
- pnpm

## Desarrollo

```sh
pnpm install       # instalar dependencias
pnpm dev           # dev server con hot-reload
```

### Comandos

```sh
pnpm test          # tests unitarios (vitest)
pnpm type-check    # vue-tsc --build
pnpm lint          # oxlint + eslint (ambos con --fix; modifica archivos)
pnpm format        # oxfmt sobre src/
pnpm build         # type-check + build de producción
pnpm preview       # previsualizar el build
```

## Testing

Los tests unitarios viven en `src/**/__tests__/*.spec.ts` y cubren el motor de settlements, el store y los utilitarios. No hay tests de componentes.

## Notas

- Sin flujo de login y sin persistencia: es una herramienta de uso puntual.
