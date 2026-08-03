# Nx Commands Reference

A practical Nx cheat sheet for this workspace, plus the wider real-world Nx +
Angular toolbox. Run **everything from the repository root**. This is an Nx
**integrated monorepo**: a single root `package.json`, one dependency version
policy, and a `project.json` per project (apps in `apps/`, shared libs in
`libs/`).

Prefix commands with `pnpm exec nx ...`, or use the `pnpm` script aliases in
`package.json`.

---

## 1. The model in one line

A project is a set of **targets** (`build`, `serve`, `lint`, `test`). Each target
names an **executor** (the tool) and its **options**. Nx reads the project graph
so `affected` can run only what changed, and caches target outputs so repeated
runs are instant.

```
project:target:configuration
   │       │         └── e.g. production | development
   │       └── build | serve | lint | test | serve-static
   └── 01-basic-form | 02-built-in-validations | cookbook | <lib>
```

---

## 2. Everyday commands (this repo)

| Task                    | Command                                   | Script alias                         |
| ----------------------- | ----------------------------------------- | ------------------------------------ |
| Serve the landing app   | `nx serve cookbook`                       | `pnpm start`                         |
| Serve a recipe          | `nx serve 02-built-in-validations`        | `pnpm serve:02-built-in-validations` |
| Build a project         | `nx build 02-built-in-validations`        | -                                    |
| Test a project (Vitest) | `nx test 02-built-in-validations`         | `pnpm test:02-built-in-validations`  |
| Test in watch mode      | `nx test 02-built-in-validations --watch` | -                                    |
| Lint a project          | `nx lint 02-built-in-validations`         | -                                    |
| Lint and auto-fix       | `nx lint 02-built-in-validations --fix`   | -                                    |
| Format the workspace    | `nx format:write`                         | `pnpm format`                        |
| Check formatting (CI)   | `nx format:check`                         | `pnpm format:check`                  |

> Run specs with `nx test <app>`, never a bare `vitest` command. There is no
> standalone `vitest.config`; the Angular builder wires jsdom, the compiler, and
> `setupFiles`.

**Run many / scoped** (what CI uses):

```bash
# same target across named projects
pnpm exec nx run-many -t test -p 01-basic-form 02-built-in-validations

# only what changed vs the base branch
pnpm exec nx affected -t lint
pnpm exec nx affected -t test
pnpm exec nx affected -t build
```

---

## 3. Create a new recipe app

Recipe apps are named `NN-name` (for example `03-cross-field`). The **generator
rejects a name that starts with a digit**, but the **runtime accepts one**. So
generate with a temporary letter-name, then rename in `project.json`.

```bash
# 1. generate into the numbered directory with a valid temp name
pnpm exec nx g @nx/angular:application apps/03-cross-field \
    --name=cross-field --standalone --style=css \
    --unitTestRunner=vitest-angular --e2eTestRunner=none --no-interactive

# 2. in apps/03-cross-field/project.json:
#    - set "name" to "03-cross-field"
#    - update EVERY buildTarget reference (usually 3):
#        "cross-field:build:production"  -> "03-cross-field:build:production"
#        "cross-field:build:development" -> "03-cross-field:build:development"
#        "cross-field:build"             -> "03-cross-field:build"

# 3. verify Nx resolves it under the numbered name
pnpm exec nx build 03-cross-field
pnpm exec nx show project 03-cross-field --json   # inspect resolved config
```

> Gotcha: miss one `buildTarget` reference and `nx serve` fails with a
> "cannot find project" error, because the target still points at the dead temp
> name.

### Post-generate wiring checklist

The generator gives you a bare app. Make it match the cookbook:

1. **`package.json` serve script** (port = `4200 + NN`):
   ```json
   "serve:03-cross-field": "nx serve 03-cross-field --port 4203"
   ```
2. **`.claude/launch.json`** config for the preview tooling (port `4300 + NN`).
3. **i18n wiring** (four spots):
   - `project.json` build target: `"polyfills": ["@angular/localize/init"]`
   - `project.json` test target: `"setupFiles": ["apps/NN/src/test-setup.ts"]`
     (`polyfills` is **not** valid on the unit-test builder)
   - `tsconfig.app.json`: `"types": ["@angular/localize"]`
   - `tsconfig.spec.json`: `"types": ["vitest/globals", "@angular/localize"]`
4. **`src/styles.css`** with the Tailwind v4 + ng-brutalism setup:
   ```css
   @import 'tailwindcss';
   @import '@ng-brutalism/ui/styles.css';
   @source './**/*.{html,ts}';
   @theme inline {
     /* --color-nb-* references */
   }
   ```
5. **`src/test-setup.ts`**: `import '@angular/localize/init';` plus the jsdom
   `<dialog>` stub (jsdom does not implement `show` / `showModal` / `close`,
   which `NbDialog` calls).

---

## 4. Create a shared library

To reuse code across recipes (theme, form helpers), make an internal,
non-publishable library:

```bash
pnpm exec nx g @nx/angular:library libs/shared-ui \
    --standalone --style=css --unitTestRunner=vitest-angular
```

- It gets a `project.json` but **no `package.json`** (single-version policy).
- Import it via its **TypeScript path alias** in `tsconfig.base.json`.
- Nx tracks the dependency, so `affected` rebuilds recipes when the lib changes.

> For this repo, prefer keeping recipes self-contained (each is individually
> runnable and readable). Extract to `libs/` only when duplication genuinely
> hurts.

---

## 5. Real-world @nx/angular generators

Beyond apps and libs, when a recipe grows up:

```bash
# components / services / directives / pipes (standalone by default)
nx g @nx/angular:component button --project=02-built-in-validations
nx g @nx/angular:service data --project=02-built-in-validations
nx g @nx/angular:directive highlight --project=...
nx g @nx/angular:pipe truncate --project=...

# routing helpers
nx g @nx/angular:guard auth --project=...
nx g @nx/angular:resolver user --project=...
nx g @nx/angular:interceptor logging --project=...

# server-side rendering + hydration on an existing app
nx g @nx/angular:setup-ssr 02-built-in-validations

# tailwind wiring (we did this by hand as config-in-CSS)
nx g @nx/angular:setup-tailwind <project>

# module federation (micro-frontends)
nx g @nx/angular:host shell
nx g @nx/angular:remote mfe1 --host=shell

# preview any generator without writing files
nx g @nx/angular:component x --project=... --dry-run
```

> `nx` generators are the same schematics `ng generate` uses, just namespaced as
> `@nx/angular:<name>`. `nx list @nx/angular` prints the full list.

---

## 6. Build and serve configurations

```bash
# named configuration (production is the default configuration here)
nx build 02-built-in-validations --configuration=production   # or -c production
nx build 02-built-in-validations -c development

# the explicit project:target:configuration form
nx run 02-built-in-validations:build:development

# common serve flags
nx serve 02-built-in-validations --port 4202 --open --host 0.0.0.0

# after setup-ssr: prerender routes / emit the server bundle
nx build 02-built-in-validations --prerender --ssr

# build everything, N in parallel
nx run-many -t build --all --parallel=3

# re-run a command whenever a project changes
nx watch --all -- nx test \$NX_PROJECT_NAME
```

Pass tool flags straight through after the target: `nx test app --coverage`,
`nx lint app --fix`, `nx test app --watch`.

---

## 7. Maintain and migrate

```bash
# write an updated package.json + migrations.json for the whole toolchain
nx migrate latest

# after `pnpm install`, apply the queued code migrations (safe Angular bumps)
nx migrate --run-migrations

# fix project.json / nx.json config drift after upgrades
nx repair

# clear the Nx cache + daemon (heavier than --skip-nx-cache)
nx reset

# version + changelog + publish, for publishable libs only
nx release
```

> Do not bump Angular majors by hand. `nx migrate` ripples the change through Nx,
> the ng-brutalism peers, and the build for you.

---

## 8. Inspect and debug

```bash
nx graph                                   # interactive dependency graph
nx graph --focus=02-built-in-validations   # graph centered on one project
nx show projects                           # list all project names
nx show projects --affected                # only changed ones (scriptable)
nx show project 02-built-in-validations --json
nx list                                    # installed plugins
nx list @nx/angular                        # a plugin's generators + executors
nx report                                  # versions to paste into bug reports
nx <target> <app> --verbose                # full underlying command + stack
```

---

## 9. Caching and troubleshooting

Most "my change didn't show up" moments trace to one of these, in order:

1. **Edited `project.json`?** `nx serve` does not hot-reload it. **Restart** the
   dev server.
2. **Stale Vite prebundle** (same `?v=hash`, old error keeps appearing)? Clear it
   and restart:
   ```bash
   rm -rf .angular/cache/*/02-built-in-validations
   ```
3. **Nx cache** replayed old output ("target did nothing")? Re-run with
   `--skip-nx-cache`, or `nx reset` to clear everything.

**The classic `$localize is not defined`:** either the `polyfills` line is
missing from the build target (add it), or it was added after the server started
/ Vite cached the old bundle (restart, then clear `.angular/cache`). The console
may also just be showing stale errors from a previous load.

---

## 10. Port scheme

Distinct ports let the landing page and a recipe run side by side. Dev serve uses
`4200 + NN`; the preview tooling uses `4300 + NN`.

| Project                 | NN  | serve | preview | script                          |
| ----------------------- | --- | ----- | ------- | ------------------------------- |
| cookbook                | -   | 4200  | 4300    | `serve:cookbook`                |
| 01-basic-form           | 01  | 4201  | 4301    | `serve:01-basic-form`           |
| 02-built-in-validations | 02  | 4202  | 4302    | `serve:02-built-in-validations` |
| 03-cross-field (next)   | 03  | 4203  | 4303    | `serve:03-cross-field`          |
