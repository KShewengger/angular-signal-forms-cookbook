# CLAUDE.md

Guidance for Claude Code (and any AI agent) working in this repository. Read this
before making changes. When a task involves Angular idioms not covered here, defer
to the local `angular-developer` skill (`.claude/skills/angular-developer/`, sourced
from [angular/skills](https://github.com/angular/skills)) and to https://angular.dev.

---

## 1. What this project is

**Angular Signal Forms Cookbook** - an Nx monorepo teaching Angular's modern
**signal-based forms** through small, runnable recipes, presented behind a
neo-brutalist landing page. It's a public learning project (MIT), solo-maintained.

**Architecture: multi-app monorepo.** Every project is an independent Nx
**application** under `apps/`. The landing page is one app; each recipe is its own
standalone, independently buildable and deployable app. This is a deliberate choice -
the whole point of a cookbook is small, self-contained, individually-runnable
examples, and it lets `nx affected` rebuild only the recipe you touched.

- **Landing app** (`apps/cookbook`) - a neo-brutalist "table of contents" grid that
  links out to each recipe app (opened in a new tab / at its own deployed URL). This
  is the only app that exists today.
- **Recipe apps** (planned) - each a standalone Nx app at `apps/NN-name/` (e.g.
  `apps/01-basic-form/`) with its own `project.json`, `public/` assets, and a
  folder-level `README.md` explaining the approach and gotchas. ~10 recipes covering:
  basic form, built-in / cross-field / async / array / custom / conditional
  validation, custom `FormValueControl` controls, Zod-schema validation, and form
  submission.

Scaffold a new recipe app with the Nx Angular generator (don't hand-roll the folder):

```bash
pnpm exec nx g @nx/angular:application apps/NN-name --standalone --style=css --unitTestRunner=vitest --e2eTestRunner=none
```

The landing grid is data-driven from `apps/cookbook/src/app/app.data.ts`
(`SIGNAL_EXAMPLES` + the tone class maps) - **edit the data, not the template**, to
add or change cards. Each entry's `link` is the deployed path of its recipe app.

---

## 2. Tech stack (exact)

| Area              | Choice                                                      | Notes                                               |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Monorepo          | **Nx 23.1**                                                 | `nx affected`, caching, `nx graph`                  |
| Framework         | **Angular ~22.0**                                           | standalone, signals, signal forms, new control flow |
| Language          | **TypeScript ~6.0**                                         | `moduleResolution: bundler`                         |
| Package manager   | **pnpm 11.17** (via corepack)                               | `pnpm-lock.yaml` is source of truth                 |
| Bundler           | **esbuild**                                                 | `@angular/build:application`                        |
| Styling           | **Tailwind CSS v4** + **ng-brutalism** (`@ng-brutalism/ui`) | v4 config-in-CSS                                    |
| Icons             | `@ng-icons/*` (tabler)                                      |                                                     |
| Schema validation | **Zod v4**                                                  | for the zod-schema recipe                           |
| i18n              | `@angular/localize`                                         | `$localize` + `i18n=` attributes                    |
| Tests             | **Vitest 4**                                                | via `@angular/build:unit-test`, jsdom               |
| Node              | **24**                                                      | matches CI                                          |

Angular deps are pinned with `~` (patch-only). Don't bump majors casually - a major
bump ripples through Nx, ng-brutalism peers, and the build.

---

## 3. Commands

Use the `package.json` scripts or `nx` directly. Prefer `affected` targets locally;
CI already uses them.

```bash
pnpm start                       # nx serve cookbook  (dev server, landing)
pnpm build                       # nx build cookbook
pnpm test                        # nx run-many -t test
pnpm lint                        # nx run-many -t lint
pnpm format                      # nx format:write   (Prettier, whole workspace)
pnpm format:check                # nx format:check   (what CI + pre-push run)
pnpm graph                       # nx graph          (dependency graph)

# Run a specific app (per-app serve scripts, see port scheme below):
pnpm serve:cookbook              # nx serve cookbook       --port 4200
pnpm serve:01-basic-form         # nx serve 01-basic-form  --port 4201

# Scoped to what changed (what CI runs):
pnpm exec nx affected -t lint
pnpm exec nx affected -t test
pnpm exec nx affected -t build

# Any project directly:
pnpm exec nx serve 01-basic-form
pnpm exec nx build 01-basic-form
pnpm exec nx test 01-basic-form
```

**Port scheme:** cookbook = `4200`, each recipe = `4200 + its number`
(`01-basic-form` → `4201`, `02-…` → `4202`). Distinct ports let you run the landing
and a recipe side by side. **When you scaffold a new recipe app, add its
`serve:NN-name` script** to `package.json` following this pattern.

> The cookbook dev server is also wired in `.claude/launch.json` (port `4300`) so the
> preview tooling can launch it. **Never** start a dev server with a raw shell command
> when the preview tooling is available - use it instead.

**Always** run `pnpm build` (or `nx build cookbook`) after non-trivial changes to
confirm it compiles before considering the work done. Don't skip it.

---

## 4. Repo structure

```
apps/
  cookbook/                     # the landing / table-of-contents app
    public/                     # landing assets, per-recipe cover subfolders
    src/
      app/
        app.ts                  # landing component (standalone)
        app.html                # landing template - Tailwind classes only, no inline styles
        app.scss                # component-scoped animations (keyframes + prefers-reduced-motion)
        app.data.ts             # SIGNAL_EXAMPLES + TONE_RAIL / TONE_TINT / TONE_WAVE maps
        app.data.spec.ts        # Vitest tests validating the data
        app.config.ts           # app providers (bootstrap config)
      styles.css                # GLOBAL styles only: Tailwind import, @theme, body base
      test-setup.ts             # loads @angular/localize/init for tests
    project.json                # Nx targets: build / serve / lint / test
    tsconfig.app.json           # includes "@angular/localize" in types
    tsconfig.spec.json          # includes "vitest/globals" + "@angular/localize"

  01-basic-form/                # first recipe app (exists) - standalone, same internal shape
    public/                     # its OWN assets, e.g. hero-cover.png (flattened, not nested)
    src/ ...                    # app.ts, app.config.ts, app.routes.ts, styles.css, ...
    project.json                # name: "01-basic-form" (see naming note below)
  02-validation/                # (planned) ...one per recipe, named NN-name
  ...                           #   each owns its own project.json, public/, README.md
```

Every app mirrors the same internal shape and the same conventions below (Tailwind
setup, signal forms, i18n, testing). Keep recipe apps consistent with `cookbook` so
there's one mental model across the repo.

**Dependencies & manifests - one root `package.json`, nothing per-project.** This is an
Nx **integrated** monorepo: all dependencies live in the single root `package.json`,
projects are configured by their `project.json` (not a manifest), and every app runs on
the **same** dependency versions (single-version policy - a feature for a cookbook).
**Do not add a `package.json` to an app or library.** To share code across recipes
(theme, tone maps, form helpers), create an **internal, non-publishable library**:

```bash
pnpm exec nx g @nx/angular:library libs/shared-ui
```

It gets a `project.json` but **no `package.json`** - import it via its TypeScript path
alias, and Nx tracks the dependency so `affected` rebuilds recipes when it changes. The
only time a project gets its own `package.json` is if you deliberately decide to
**publish** it to npm.

**Recipe app naming.** The Nx **generator** rejects a project name starting with a
digit, but the **runtime** accepts one. So scaffold with a temporary letter name at the
real directory, then rename in `project.json`:

```bash
# 1. generate into the numbered directory with a valid temp name
pnpm exec nx g @nx/angular:application apps/NN-name --name=temp-name --no-interactive
# 2. in apps/NN-name/project.json: set "name" to "NN-name" AND update every
#    "temp-name:build..." buildTarget reference to "NN-name:build..."
# 3. verify: pnpm exec nx build NN-name
```

This keeps the project name identical to the folder name (e.g. `01-basic-form`).

---

## 5. Angular conventions - modern, signals-first

This project deliberately uses the **latest** Angular idioms. New code must match.
When unsure, read the matching file under `.claude/skills/angular-developer/references/`.

**Components**

- **Standalone only** - no `NgModule`s. Components/directives/pipes declare their own
  `imports`.
- Use the **new control flow** in templates: `@if`, `@for` (always with `track`),
  `@switch`. Never `*ngIf` / `*ngFor` / `ngSwitch`.
- Prefer `ChangeDetectionStrategy.OnPush` (or zoneless-friendly patterns). Keep
  templates free of heavy method calls - bind to `computed()` signals instead.
- Inputs/outputs use the **signal APIs**: `input()`, `input.required()`, `output()`,
  and `model()` for two-way - **not** the `@Input()` / `@Output()` decorators.
- Inject dependencies with the **`inject()`** function, not constructor parameters.
- Use `NgOptimizedImage` (`ngSrc`) for raster images (already used on the landing hero).

**Reactivity**

- Reach for signals first: `signal()`, `computed()`, `linkedSignal()` for derived
  writable state, and `resource()` / `httpResource()` for async data.
- Use `effect()` sparingly - only for side effects (logging, third-party DOM), never
  to sync state you could derive with `computed()`. See `references/effects.md`.
- Avoid manual `subscribe()` where a signal or `resource()` fits; prefer the async
  pipe or signal interop when RxJS is genuinely needed.

**TypeScript**

- Write **strictly-typed** code even though `tsconfig.base.json` has `strict: false`
  today - no implicit `any`, no `any` escape hatches; prefer `unknown` + narrowing,
  discriminated unions, and `as const`. Type public APIs explicitly.
- Favor immutable data and pure helpers; keep component classes thin.
- Use `readonly` for injected services and signals that aren't reassigned.

---

## 6. Signal Forms conventions (the core subject)

Recipes use Angular's **signal forms** API (`@angular/forms/signals`), not the legacy
`ReactiveFormsModule` / `FormBuilder`. Baseline pattern:

- Model the form's data as a **signal**, build the form with **`form()`**, and bind
  fields in the template with the **`Field`** directive (`[field]="..."`).
- Validation lives in the schema passed to `form()` - built-in validators
  (`required`, `email`, `min`, …), custom validators, cross-field rules, and
  `validateTree` for subtrees. Async/debounced checks expose **pending** state.
- Read state off the field/form signals (`.value()`, `.errors()`, `.touched()`,
  `.dirty()`, `.valid()`, submit/pending state) - drive the UI from those.
- Custom controls implement **`FormValueControl`** with their own validation.
- Zod recipe: derive validation from a Zod v4 schema rather than hand-writing rules.

When writing or reviewing a recipe, read
`.claude/skills/angular-developer/references/signal-forms.md` first, and keep each
recipe focused on **one** concept with a clear `README.md`.

---

## 7. Styling conventions

- **Tailwind CSS v4**, configured in CSS (no `tailwind.config.js`):
  - `apps/cookbook/src/styles.css` holds `@import "tailwindcss"`, the ng-brutalism
    import, `@source`, `@theme`, and the `body` base - **global only**.
  - `@theme inline { --color-nb-*: var(--nb-*) }` **references** ng-brutalism's CSS
    vars without redeclaring them. Use `inline` to avoid emitting duplicate vars.
  - PostCSS is wired via **`.postcssrc.json`** (`@tailwindcss/postcss`). Angular does
    **not** pick up a `postcss.config.mjs` - don't reintroduce one.
- **No inline styles in templates.** Use Tailwind utility classes. For values Tailwind
  doesn't have, use arbitrary values (`text-[clamp(...)]`, `max-lg:hidden!`,
  `shadow-[2px_2px_0_#141414]`, `[--var:val]`).
- **Tone/color class maps** live in `app.data.ts` (`TONE_RAIL`, `TONE_TINT`,
  `TONE_WAVE`) and are applied via `[ngClass]` - don't scatter per-card color logic in
  the template.
- **Component-scoped animations** go in the component's `.scss` (e.g. `app.scss`).
  Keyframes are auto-scoped by Angular's emulated encapsulation. Wrap motion in
  `@media (prefers-reduced-motion: no-preference)` and provide a reduced fallback.
- ng-brutalism components (`nb-card`, `nbButton`, `nbTitle`, `nbHalftone`, …) carry
  their own display; to hide/override you often need `!` importance
  (e.g. `max-lg:hidden!`).

---

## 8. i18n

- Mark template text with `i18n="@@stable.id"`; mark TS strings with the `$localize`
  tagged template (`$localize\`:@@id:text\``), as done in `app.data.ts`.
- The build loads `@angular/localize/init` via `project.json` build `polyfills`; tests
  load it via `test-setup.ts` (`setupFiles`). Keep IDs stable - they're the contract.

---

## 9. Testing

- **Vitest** via `@angular/build:unit-test`. Spec files are `*.spec.ts`.
- Tests that touch `$localize`-wrapped data need `@angular/localize/init` - already
  wired through `test-setup.ts` (`setupFiles` in the test target) and the spec
  tsconfig `types`. Note: `polyfills` is **not** valid on the unit-test builder - use
  `setupFiles`.
- Every recipe should ship at least a smoke test (renders, core validation behaves).
  Keep data-driven config (like `SIGNAL_EXAMPLES`) covered as in `app.data.spec.ts`.
- Prefer testing behavior via the component's public surface / DOM over internals.

---

## 10. Gotchas we've already hit (don't re-learn these)

- **`.postcssrc.json`, not `postcss.config.mjs`** - Angular ignores the `.mjs` form,
  which silently breaks Tailwind utility generation.
- **`@theme inline`** to reference existing CSS vars; plain `@theme` would redeclare
  `--color-nb-*` and duplicate them.
- **ng-brutalism ↔ Angular 22 peer conflict** - resolved via top-level
  `peerDependencyRules.allowedVersions` in `pnpm-workspace.yaml` (ng-brutalism peers
  `^21`). Keep it there.
- **`nx affected` needs git history** - CI checks out with `fetch-depth: 0` and uses
  `nrwl/nx-set-shas`. Don't remove those.
- A card that won't shrink is usually the component host - `:host { display: block;
width: 100% }` fixes ng-brutalism cards, not `!w-full` hacks.

---

## 11. Git, hooks & CI

- **Branch off `main`**; never commit directly to `main`. Open a PR.
- **Conventional Commits** enforced by commitlint (`.husky/commit-msg`):
  `type(scope): summary` (e.g. `feat(recipes): add 03 cross-field validation`).
- **Hooks** (husky v9):
  - `pre-commit` → `lint-staged` (eslint --fix + prettier on staged files).
  - `pre-push` → `nx format:check` (whole-diff formatting; matches CI).
- **CI** (`.github/workflows/ci.yml`) runs on PRs to `main`: `format:check` → `lint`
  affected → `test` affected → `build` affected. **All must be green.**
- Two Claude workflows exist: `claude-review.yml` (auto PR review) and `claude.yml`
  (`@claude` on-demand), both using `CLAUDE_CODE_OAUTH_TOKEN`.
- Run `pnpm format` before committing if unsure - formatting is the most common CI red.

---

## 12. Working agreement for agents

- Match the **existing style** of nearby code; don't introduce new patterns without
  reason. This repo is a teaching tool - clarity beats cleverness.
- Keep recipes **minimal and focused**; one concept each, with a `README.md`.
- Don't add dependencies without need; prefer Angular/Nx built-ins.
- Confirm before outward/irreversible actions (pushing, publishing, deleting).
- After changes: `pnpm format` → relevant `nx affected` targets → `pnpm build`.
