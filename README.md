# Goodspeed Bubble-to-Code Estimator

A Next.js 16 App Router microsurface for Goodspeed Studio's Bubble-to-code lead-generation flow.

The app owns one primary UI route, `/estimate`, plus one server route, `/api/classify-integrations`. In production, all other unmatched routes are expected to fall through to a Framer origin via a fallback rewrite.

## Current State

- The estimator is implemented as a single client wizard inside a server-rendered page.
- The UI matches the current live Goodspeed light-brand direction, not the earlier dark-theme brief.
- The calculator is deterministic except for integration classification, which is AI-assisted.
- The integration classifier uses the OpenAI Node SDK with `gpt-4o-mini`, simple in-memory rate limiting, and medium-complexity fallbacks when AI is unavailable.
- The starter `app/page.tsx` has been removed intentionally so the gateway pattern can work cleanly.
- The project currently verifies cleanly with `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

## Routes

- `/estimate`: the 10-step Goodspeed estimator experience.
- `/api/classify-integrations`: POST endpoint for AI-powered integration classification.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS v4
- shadcn primitives, wrapped in Goodspeed-specific UI components
- `motion` for transitions and micro-interactions
- `openai` for integration classification
- Vitest and Testing Library for unit and UI tests

## Brand Direction Implemented

- Font: `Bricolage Grotesque`
- Background: warm cream `#F9F2ED`
- Primary text: deep olive `#242F28`
- CTA accent: lime `#C6DD66`
- Supporting greens: `#36493C` and nearby tones

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and set your API key if you want live integration classification:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000/estimate](http://localhost:3000/estimate).

If `OPENAI_API_KEY` is missing, the estimator still works. The integration step will fall back to medium-complexity defaults instead of blocking the flow.

## Scripts

- `npm run dev`: start the local development server
- `npm run build`: create a production build
- `npm run start`: run the production server locally
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript without emitting files
- `npm test`: run the Vitest suite once
- `npm run test:watch`: run Vitest in watch mode

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

## Estimator Flow

The wizard collects:

1. App size
2. User roles
3. Rebuild type
4. Feature counts
5. Integrations
6. UI quality and device support
7. Existing designs
8. Admin dashboard scope
9. Migration, tech debt, and documentation
10. Delivery add-ons

The results screen shows:

- Estimated price range
- Estimated timeline range
- Recommended Goodspeed tier
- Expandable breakdown summary
- Primary CTA to [Goodspeed contact](https://goodspeed.studio/contact)

## Calculation Notes

The calculator logic lives in `lib/calculator.ts` and follows the finalized mapping-sheet-driven implementation, including hidden auto-mappings such as:

- roles -> permissions hours
- UI quality -> design system hours
- admin dashboard -> reporting hours
- no designs -> extra direct hours
- documentation -> multiplier
- project management and QA -> multipliers

The current tested canonical scenario is:

- Mid-sized app
- 2 to 3 roles
- Same logic, redesigned
- 3 simple, 2 medium, 1 complex features
- Stripe integration
- Polished responsive UI
- Desktop plus mobile
- Partial designs
- Basic admin
- No migration
- No tech debt fix
- Partial docs
- No extras

That currently resolves to:

- `362` direct hours internally
- `$34,752` mid estimate internally
- `$30,000 - $42,000` client-facing range (rounded up to nearest $1,000)
- `15.575` total weeks internally
- `3 - 4 months` client-facing timeline (adaptive: days under ~1 month, months above)
- `Growth` tier

Prices and timelines are stored in hours and dollars internally and converted to days/months and rounded-up currency at the display layer only.

## Testing

Current automated coverage includes:

- Calculator unit tests in `lib/calculator.test.ts`
- API route tests in `app/api/classify-integrations/route.test.ts` and `app/api/classify-features/route.test.ts`
- Wizard interaction tests in `components/estimator/EstimatorWizard.test.tsx`

Run the full verification pass with:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Production Notes

- `next.config.ts` contains a production-only fallback rewrite for the Framer origin.
- The current Framer origin is still a placeholder:

```ts
const FRAMER_FALLBACK_ORIGIN = "https://your-goodspeed-origin.framer.app";
```

- Replace that value before deployment.
- In development, the fallback rewrite is disabled.

## Project Structure

```text
app/
  api/classify-integrations/route.ts
  estimate/page.tsx
  globals.css
  layout.tsx
components/
  estimator/
  ui/
lib/
  calculator.ts
  constants.ts
  integrations.ts
  rate-limit.ts
  types.ts
```

## Important Implementation Details

- The estimator intentionally lives only at `/estimate`.
- There is no database, auth, payment flow, analytics pipeline, or email capture in this repo.
- Integration classification is the only server-assisted step.
- The rest of the estimate is pure client-side math derived from normalized answers.
