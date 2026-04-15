<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

- This repository powers the Goodspeed Bubble-to-code estimator microsurface.
- The app intentionally owns only `/estimate` and `/api/classify-integrations`.
- In production, unmatched routes fall through to a Framer origin via the fallback rewrite in `next.config.ts`.
- Do not recreate `app/page.tsx` unless the product direction changes; its removal is intentional so the gateway pattern works.
- The current product direction follows the live Goodspeed light brand, not the earlier dark-theme brief.

## Setup Commands

- Install dependencies: `npm install`
- Copy env file: `cp .env.example .env.local`
- Start dev server: `npm run dev`
- Open the product at `http://localhost:3000/estimate`

## Verification Commands

- Run unit and UI tests: `npm test`
- Run linting: `npm run lint`
- Run type checking: `npm run typecheck`
- Build for production: `npm run build`

If you change application code, run the relevant checks while iterating and run the full verification pass before finishing.

## Architecture Notes

- `app/estimate/page.tsx` is the server-rendered page shell and metadata entrypoint.
- `components/estimator/EstimatorWizard.tsx` is the main client island and owns wizard state, navigation, and transitions.
- `lib/calculator.ts` contains pure estimator math.
- `lib/constants.ts` contains tunable hours, multipliers, thresholds, and step metadata.
- `app/api/classify-integrations/route.ts` is the only server endpoint and the only place OpenAI is used.
- `lib/integrations.ts` contains the integration prompt context, parsing helpers, fallback behavior, and normalization helpers.
- There is no auth, database, analytics pipeline, or payment flow in this repo.

## Product Constraints

- Keep the wizard at 10 client-facing steps unless the product brief changes.
- Integration classification is the only AI-assisted part of the estimator. All other pricing logic should stay deterministic.
- Do not expose the internal hourly rate in the client UI. Users should only see ranges, tiering, and explanatory breakdowns.
- Keep the primary results CTA pointing to `https://goodspeed.studio/contact`.
- Preserve the recalculation flow and expandable breakdown on the results screen.
- If calculator behavior changes, update both automated tests and the README's documented canonical scenario.

## Design And Brand Rules

- Use the current Goodspeed light palette and typography:
- Font: `Geist`
- Background: `#F9F2ED`
- Primary text: `#242F28`
- CTA accent: `#C6DD66`
- Supporting greens around `#36493C`
- Do not revert to dark mode unless specifically asked.
- Avoid Inter, Roboto, Arial, purple gradients, and generic SaaS-template styling.
- Prefer the existing branded components in `components/ui` over introducing raw primitive styling in feature files.
- Keep motion subtle and purposeful. The current estimator uses `motion` for short directional step transitions and reveal moments.
- Maintain strong mobile usability: touch-friendly controls, no cramped layouts, no hover-only affordances.

## Code Style And Implementation Preferences

- TypeScript strict mode is expected.
- Prefer Server Components by default; use Client Components only where state, effects, browser APIs, or animation libraries require them.
- Keep serialization across the RSC boundary minimal.
- Keep calculation utilities pure and easy to test.
- Reuse existing typed option unions from `lib/types.ts` instead of introducing parallel string enums.
- When adding or changing UI controls, extend the wrappers in `components/ui` rather than scattering design logic across steps.

## API And Security Notes

- `OPENAI_API_KEY` must stay server-only. Never call OpenAI directly from the client.
- The integration classifier must continue to fail gracefully:
- empty input returns an empty list
- rate-limited requests return fallback classifications
- missing API key returns fallback classifications
- model failures return fallback classifications
- Keep the current simple in-memory rate limiting unless the deployment model changes.

## Testing Notes

- Calculator tests live in `lib/calculator.test.ts`.
- API route tests live in `app/api/classify-integrations/route.test.ts`.
- Wizard interaction tests live in `components/estimator/EstimatorWizard.test.tsx`.
- If you change step flow, estimator copy that affects assertions, or calculator rules, update the corresponding tests in the same change.

## Production Notes

- The Framer fallback origin in `next.config.ts` is still a placeholder and must be replaced before deployment.
- The rewrite is intentionally disabled in development.
