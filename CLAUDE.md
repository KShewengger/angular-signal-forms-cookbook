# CLAUDE.md

Guidance for Claude Code (and any AI agent) working in this repository. Read it before
making changes. Three local skills carry the depth; this file is the always-on layer that
routes to them:

- **Signal forms** (the core subject): the `signal-forms-health-check` skill
  (`.claude/skills/signal-forms-health-check/`, distilled from these recipes and
  cross-checked against angular.dev) is the primary reference _and_ an auditor: no argument
  audits the branch diff, a path argument audits that file or folder in isolation.
- **Other Angular idioms:** the `angular-developer` skill
  (`.claude/skills/angular-developer/`, from [angular/skills](https://github.com/angular/skills))
  and https://angular.dev.
- **Finishing or refreshing a recipe:** the `finalize-recipe` skill (gap-based: fix drift,
  don't rewrite already-green suites).

---

## 1. What this project is

**Angular Signal Forms Cookbook** - an Nx monorepo teaching Angular's modern signal-based
forms through small, runnable recipes, presented behind a neo-brutalist landing page. A
public learning project (MIT), solo-maintained.

**Multi-app monorepo.** Every project is an independent Nx application under `apps/`. The
landing page is one app; each recipe is its own standalone, independently buildable and
deployable app. This is deliberate: a cookbook is small, self-contained, individually-runnable
examples, and it lets `nx affected` rebuild only the recipe you touched.

- **Landing** (`apps/cookbook`) - a "table of contents" grid linking out to each recipe app.
  Data-driven from `apps/cookbook/src/app/app.data.ts` (`SIGNAL_EXAMPLES` + the tone class
  maps): edit the data, not the template, to add or change cards. Each entry's `link` is the
  deployed path of its recipe app.
- **Recipes** (`apps/01-basic-form` … `apps/12-field-metadata`) - each a standalone Nx app
  with its own `project.json`, `public/` assets, and folder-level `README.md`. A recipe may
  be listed on the landing as planned before its `apps/NN-*` folder exists.

Scaffold a new recipe with the Nx generator (don't hand-roll the folder); see §4 for the
digit-name rename it needs:

```bash
pnpm exec nx g @nx/angular:application apps/NN-name --standalone --style=css --unitTestRunner=vitest-angular --e2eTestRunner=none
```

---

## 2. Tech stack (exact)

| Area              | Choice                                              | Notes                                               |
| ----------------- | --------------------------------------------------- | --------------------------------------------------- |
| Monorepo          | Nx 23.1                                             | `nx affected`, caching, `nx graph`                  |
| Framework         | Angular ~22.0                                       | standalone, signals, signal forms, new control flow |
| Language          | TypeScript ~6.0                                     | `moduleResolution: bundler`                         |
| Package manager   | pnpm 11.17 (via corepack)                           | `pnpm-lock.yaml` is source of truth                 |
| Bundler           | esbuild                                             | `@angular/build:application`                        |
| Styling           | Tailwind CSS v4 + ng-brutalism (`@ng-brutalism/ui`) | v4 config-in-CSS                                    |
| Icons             | `@ng-icons/*` (tabler)                              |                                                     |
| Schema validation | Zod v4                                              | for the zod-schema recipe                           |
| i18n              | `@angular/localize`                                 | `$localize` + `i18n=` attributes                    |
| Tests             | Vitest 4                                            | via `@angular/build:unit-test`, jsdom               |
| Node              | 24                                                  | matches CI                                          |

- Angular deps are pinned with `~` (patch-only). Don't bump majors casually: a major bump
  ripples through Nx, ng-brutalism peers, and the build.
- **ng-brutalism ↔ Angular 22 peer conflict** is resolved via top-level
  `peerDependencyRules.allowedVersions` in `pnpm-workspace.yaml` (ng-brutalism peers `^21`).
  Keep it there.

---

## 3. Commands

Use the `package.json` scripts or `nx` directly. Prefer `affected` targets locally; CI uses
them.

```bash
pnpm start                       # nx serve cookbook  (dev server, landing)
pnpm build                       # nx build cookbook
pnpm test                        # nx run-many -t test
pnpm lint                        # nx run-many -t lint
pnpm format                      # nx format:write   (Prettier, whole workspace)
pnpm format:check                # nx format:check   (what CI + pre-push run)
pnpm graph                       # nx graph

# A specific app (per-app scripts, see port scheme below):
pnpm serve:01-basic-form         # nx serve 01-basic-form --port 4201

# Scoped to what changed (what CI runs):
pnpm exec nx affected -t lint
pnpm exec nx affected -t test
pnpm exec nx affected -t build
```

**Port scheme:** cookbook = `4200`, each recipe = `4200 + its number` (`01-basic-form` →
`4201`). Distinct ports let you run the landing and a recipe side by side. When you scaffold
a recipe, add its `serve:NN-name` script to `package.json` following this pattern.

The cookbook dev server is also wired in `.claude/launch.json` (port `4300`) for the preview
tooling. Never start a dev server with a raw shell command when the preview tooling is
available - use it.

Always run `pnpm build` after non-trivial changes to confirm it compiles before considering
the work done.

---

## 4. Repo structure

Every app mirrors the same internal shape; keep recipe apps consistent with `cookbook` so
there's one mental model. The non-obvious part is which file owns which convention:

```
apps/cookbook/src/
  app/
    app.ts / app.html      # standalone component; template is Tailwind classes only
    app.scss               # component-scoped animations (keyframes + reduced-motion)
    app.data.ts            # SIGNAL_EXAMPLES + TONE_RAIL / TONE_TINT / TONE_WAVE maps
    app.config.ts          # app providers
  styles.css               # GLOBAL styles only: Tailwind import, @theme, body base
  test-setup.ts            # loads @angular/localize/init for tests
```

A recipe adds `app.model.ts` (types, `INITIAL_*` constants, union type guards),
`app.schema.ts` (non-trivial `SchemaFn`s), `app.utils.ts` (non-schema helpers), and a
`validation-errors/` component. The `app.data.ts → app.model.ts` edge stays `import type`
so it erases at runtime, giving a clean `app.schema → app.data → app.model` DAG.

**One root `package.json`, nothing per-project.** This is an Nx integrated monorepo: all
dependencies live in the single root `package.json`, projects are configured by their
`project.json`, and every app runs on the same versions (single-version policy). Do not add
a `package.json` to an app. To share code across recipes, create an internal,
non-publishable library (`pnpm exec nx g @nx/angular:library libs/shared-ui`): it gets a
`project.json` but no `package.json`, imported via its TS path alias so `affected` tracks
it. A project gets its own `package.json` only if you deliberately publish it to npm.

**Recipe app naming.** The Nx generator rejects a project name starting with a digit, but
the runtime accepts one. Scaffold with a temporary letter name at the real directory, then
rename in `project.json`:

```bash
pnpm exec nx g @nx/angular:application apps/NN-name --name=temp-name --no-interactive
# then in apps/NN-name/project.json: set "name" to "NN-name" AND update every
# "temp-name:build..." buildTarget reference to "NN-name:build...". Verify: nx build NN-name
```

If `serve`/`build` reports `Project "name" does not exist`, a `buildTarget` still points at
the temp letter-name (check `serve` and `serve-static`).

---

## 5. Angular conventions - modern, signals-first

New code uses the latest Angular idioms. When unsure, read the matching file under
`.claude/skills/angular-developer/references/`.

**Components**

- Standalone only, no `NgModule`s. Components/directives/pipes declare their own `imports`.
- New control flow in templates: `@if`, `@for` (always with `track`), `@switch`, `@let`.
  Never `*ngIf` / `*ngFor` / `ngSwitch`.
- **No `ChangeDetectionStrategy.OnPush`.** These apps ship no `zone.js` polyfill
  (`project.json` build `polyfills` is `["@angular/localize/init"]` only), so they already
  run zoneless. There is not a single `OnPush` in the repo; adding one is noise.
- Keep templates free of method calls: bind to a `computed()` signal or a `Map` lookup. A
  condition reading two or more signals belongs in a named `computed()`.
- Inputs/outputs use the signal APIs (`input()`, `input.required()`, `output()`, `model()`),
  not the `@Input()` / `@Output()` decorators. Mark them `readonly`.
- Inject dependencies with `inject()`, not constructor parameters.
- `NgOptimizedImage` (`ngSrc` + `width`/`height`, or `fill`) for raster images (jpg/png/webp)
  only - not SVG, and not a tiny dynamic remote logo of unknown size (a fixed-size container
  already prevents layout shift). Give non-LCP images no `priority` so they lazy-load.

**Reactivity**

- Reach for signals first: `signal()`, `computed()`, `linkedSignal()`, and `resource()` /
  `httpResource()` for async data.
- `effect()` only for genuine side effects (logging, third-party DOM), never to sync state
  that `computed()` could derive. See `references/effects.md`.
- No `.subscribe()` in a component; prefer a `resource()` or signal interop.

**TypeScript**

- Write strictly-typed code even though `tsconfig.base.json` has `strict: false`: no implicit
  or escape-hatch `any`; prefer `unknown` + narrowing, discriminated unions, `as const`.
- Favor immutable data and pure helpers; keep component classes thin. `readonly` on injected
  services and signals that aren't reassigned.

**Configuration**

- A value that varies per build target (a swappable endpoint, mock vs real API, a flag) lives
  in `src/environments/environment.ts` + `environment.development.ts` with a `fileReplacements`
  block in the `development` build config (recipe 12's Microlink endpoint is the model). A
  value that is the same everywhere stays a plain constant in `app.data.ts` - don't reach for
  `environments/` for a static value.

---

## 6. Signal Forms conventions (the core subject)

Recipes use Angular's signal forms API (`@angular/forms/signals`), never `ReactiveFormsModule`
/ `FormBuilder`. The **`signal-forms-health-check` skill is the full playbook** (schema
shapes, every validator, async, arrays, conditional logic, metadata, custom controls, testing);
read it before writing or reviewing a recipe. The always-on rules:

- Model the data as a `signal()`, build with `form()`, bind with `[formField]="userForm.name"`.
- **Fields are functions.** `form.name` (a `FieldTree`) is for binding; `form.name()` (a
  `FieldState`) is for reading its signals: `.value()`, `.errors()`, `.touched()`, `.dirty()`,
  `.valid()`, submit/pending. Never treat a field like a plain object.
- Validation lives in the schema function passed to `form()`, not the template. Use `schema()`
  only when the same `Schema` object is applied to more than one path or form (`apply`,
  `applyEach`, a second `form()`); a single-use wrap on the outer `form()` is noise. A
  non-trivial `SchemaFn` lives in `app.schema.ts` (so isolated tests import it); a 1-5 line
  one is inlined into `form(model, (path) => { ... })` and the spec repeats that callback.
- **Show-invalid gate:** `@let` on field state inline in a form template; a named `showErrors`
  computed inside a `ValidationErrors` component. Never an impure `| isFieldInvalid` pipe
  (`Field` identity doesn't change when dirty/touched/invalid flip, so it needs `pure: false`).
- Leaf `ValidationErrors` bind `errors()`; group / array-item bindings use `errorSummary()`.
  A presentational VE (`errors` + `visible` inputs) leaves the gate to its parent.
- Keep each recipe focused on **one** concept, with a clear `README.md`.

---

## 7. Styling conventions

- **Tailwind CSS v4**, configured in CSS (no `tailwind.config.js`):
  - `apps/cookbook/src/styles.css` holds `@import "tailwindcss"`, the ng-brutalism import,
    `@source`, `@theme`, and the `body` base - global only.
  - `@theme inline { --color-nb-*: var(--nb-*) }` references ng-brutalism's CSS vars without
    redeclaring them; plain `@theme` would duplicate `--color-nb-*`. Use `inline`.
  - PostCSS is wired via `.postcssrc.json` (`@tailwindcss/postcss`). Angular does **not** pick
    up a `postcss.config.mjs` - reintroducing one silently breaks Tailwind utility generation.
- No inline `style` in templates (one exception: a runtime-computed value Tailwind can't
  express, like recipe 05's `[style.left.%]`). For values Tailwind lacks, use arbitrary values
  (`text-[clamp(...)]`, `max-lg:hidden!`).
- Tone/color class maps live in `app.data.ts` (`TONE_RAIL`, `TONE_TINT`, `TONE_WAVE`), applied
  via `[ngClass]` - don't scatter per-card color logic in the template.
- Component-scoped animations go in the component's `.scss`; keyframes auto-scope under
  emulated encapsulation. Wrap motion in `@media (prefers-reduced-motion: no-preference)` with
  a reduced fallback.
- ng-brutalism components (`nb-card`, `nbButton`, …) carry their own display; overriding often
  needs `!` importance (`max-lg:hidden!`). A card that won't shrink is usually the component
  host: `:host { display: block; width: 100% }` fixes it, not `!w-full` hacks.

---

## 8. i18n

- Mark template text with `i18n="@@stable.id"`; mark TS strings with the `$localize` tagged
  template (`` $localize`:@@id:text` ``), as in `app.data.ts`. Keep IDs stable - they're the
  contract. Copy-paste drift in `@@id`s and ARIA labels is the most common defect on a fresh
  recipe branch (scaffolds clone the previous recipe); check each id against the recipe it now
  lives in.
- The build loads `@angular/localize/init` via `project.json` build `polyfills`; tests load it
  via `test-setup.ts` (`setupFiles` - `polyfills` is not valid on the unit-test builder).

---

## 9. Testing

Full spec structure lives in the `finalize-recipe` skill. The rules that always apply:

- **Vitest** via `@angular/build:unit-test`; spec files are `*.spec.ts`. Run with
  `nx test <app>` (or `--watch`), never a bare `vitest` - there is no standalone
  `vitest.config`; the builder wires jsdom, the compiler, and `setupFiles`. One file:
  `pnpm exec nx test NN-name --include='**/foo.spec.ts'`.
- Zoneless pattern: **Act, then `await fixture.whenStable()`, then Assert.** Never
  `fixture.detectChanges()`.
- Follow the [Signal Forms testing guide](https://angular.dev/guide/forms/signals/testing)
  split: `validation schema (isolated)` via
  `form(model, schemaFn, { injector: TestBed.inject(Injector) })`, plus `component (DOM)` for
  bindings / typing / a11y.
- Assert `errors()` kind **and** message when the schema defines a message; kind alone only
  when production has no custom message (e.g. bare `required()` in 01).
- `$localize`-wrapped data needs `@angular/localize/init` - wired through `test-setup.ts` and
  the spec tsconfig `types`. Also put `"types": ["@angular/localize"]` in each app's
  `tsconfig.app.json` (an empty `types: []` drops localize for the app compile).
- **`NbDialog` under jsdom:** jsdom doesn't implement the `<dialog>` methods (`show` /
  `showModal` / `close`) that `NbDialog` calls, so dialog tests throw. `test-setup.ts` stubs
  them; reuse that for any dialog-driven recipe.
- Every recipe ships at least a smoke test (renders, core validation behaves). Prefer testing
  behavior via the DOM / public surface; signal-form state with no DOM readout may be read
  through a narrow typed accessor on the component instance (fields are `protected`).

---

## 10. Template & formatting gotchas (don't re-learn these)

- **Component templates need Prettier's `angular` parser, not `html`.** Prettier infers `html`
  from the extension, and that parser mangles control-flow blocks (unindents `@if`/`@for`/
  `@switch` bodies, collapses `}` and `@case`). The `overrides` block in `.prettierrc` maps
  `apps/*/src/app/**/*.html` to `parser: "angular"`; keep the glob scoped to `src/app` so each
  app's plain `src/index.html` stays on the `html` parser.
- **A literal `@` in template text must be `&#64;`.** Angular reads `@` as the control-flow
  sigil. The compiler tolerates a stray one (so `nx build` stays green and the bug hides), but
  Prettier's `angular` parser rejects it (`SyntaxError: Incomplete block ""`). Only text is
  affected; `@` inside an attribute value (`placeholder="user@example.com"`) is fine.
- **Debounce timer drift:** the README, the fake-timer advances, and `debounce(path, ms)` must
  agree. `debounce` only delays typed (View→model) input; a drift like 500 vs 300 breaks DOM
  debounce tests.
- **Prev/Next / footer links are GitHub tree URLs**, never StackBlitz. Point at the correct
  `apps/NN-name`; a Next link to a not-yet-built recipe may use `…/tree/main/apps` until that
  folder exists.

---

## 11. Git, hooks & CI

- Branch off `main`; never commit directly to `main`. Open a PR.
- **Conventional Commits** enforced by commitlint (`.husky/commit-msg`):
  `type(scope): summary`. A commit needs an issue reference (e.g. `#30`).
- **Hooks** (husky v9): `pre-commit` → `lint-staged` (eslint --fix + prettier on staged
  files); `pre-push` → `nx format:check` (whole-diff formatting, matches CI).
- **CI** (`.github/workflows/ci.yml`) on PRs to `main`: `format:check` → `lint` affected →
  `test` affected → `build` affected. All must be green. Run `pnpm format` before committing:
  formatting is the most common CI red.
- `nx affected` needs git history - CI checks out with `fetch-depth: 0` and `nrwl/nx-set-shas`.
  Don't remove those.
- Two Claude workflows: `claude-review.yml` (auto PR review) and `claude.yml` (`@claude`
  on-demand), both using `CLAUDE_CODE_OAUTH_TOKEN`.

---

## 12. Working agreement for agents

- Match the existing style of nearby code; don't introduce new patterns without reason. This
  repo is a teaching tool - clarity beats cleverness.
- Keep recipes minimal and focused; one concept each, with a `README.md`.
- Don't add dependencies without need; prefer Angular/Nx built-ins.
- No em dashes in any output (`—`): restructure with a colon, comma, parentheses, or hyphen.
- Confirm before outward/irreversible actions (pushing, publishing, deleting).
- After changes: `pnpm format` → relevant `nx affected` targets → `pnpm build`.
- When finishing or auditing a recipe, use `finalize-recipe` gap-based: fix real drift (links,
  docs, specs vs code). Don't mass-rewrite green suites or reintroduce removed patterns.
