<div align="center">

# 📖 Angular Signal Forms Cookbook

Practical Angular Signal Forms recipes: every flavor of validation, custom `FormValueControl` controls, Zod integration, and form submission. <br/><br/>
![Nx](https://img.shields.io/badge/-Nx-143055?style=flat-square&logo=nx&logoColor=white)
![Angular](https://img.shields.io/badge/-Angular-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zod](https://img.shields.io/badge/-Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)
![MIT](https://img.shields.io/badge/-MIT-3DA639?style=flat-square)
![ng-icons](https://img.shields.io/badge/-ng--icons-6366F1?style=flat-square&logoColor=white)
![Ng-brutalism](https://img.shields.io/badge/-ng--brutalism-000000?style=flat-square&logoColor=white)

![Angular Signal Forms Cookbook](./docs/assets/cover.png)

</div>

---

## 🧭 Contents

- [Recipes](#-recipes)
- [Signal Forms health-check skill](#-signal-forms-health-check-skill)
- [Tech stack](#-tech-stack)
- [Getting started](#-getting-started)
- [Scripts](#-scripts)
- [Nx commands reference](./docs/nx-commands.md)
- [License](#-license)

---

## 🍳 Recipes

Each recipe is a small, runnable example that solves one problem, with a folder-level `README.md` explaining the approach and the gotchas.

| #   | Recipe                                                     | Demo                                                                                              | What it covers                                                                                                                                                                                            |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🏠  | [Cookbook (landing)](./apps/cookbook)                      | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/)                           | The neo-brutalist landing page: a table of contents linking out to every recipe                                                                                                                           |
| 01  | [Basic form](./apps/01-basic-form)                         | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/01-basic-form/)             | `form()`, `[formField]` binding, live `touched`/`dirty`/`valid` state                                                                                                                                     |
| 02  | [Built-in Validations](./apps/02-built-in-validations)     | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/02-built-in-validations/)   | Built-in validators (`required`, `email`, `minLength`, `pattern`, `min`), inline error messages, touched/dirty gating                                                                                     |
| 03  | [Cross-field Validation](./apps/03-cross-field-validation) | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/03-cross-field-validation/) | Validate one field against another with `validate()` + `valueOf()`                                                                                                                                        |
| 04  | [Async Validation](./apps/04-async-validation)             | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/04-async-validation/)       | Debounced server checks with a pending state, verified with `validateHttp`                                                                                                                                |
| 05  | [Array Validation](./apps/05-array-validation)             | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/05-array-validation/)       | Validate every item in an array with `applyEach` and per-item rules                                                                                                                                       |
| 06  | [Custom Control](./apps/06-custom-control)                 | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/06-custom-control/)         | Build a custom `FormValueControl` the framework binds value and state to                                                                                                                                  |
| 07  | [Debounced Input](./apps/07-debounce-input)                | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/07-debounce-input/)         | Delay model updates until the user pauses typing with `debounce()`, then run a live `rxResource` search                                                                                                   |
| 08  | [Conditional Validation](./apps/08-conditional-validation) | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/08-conditional-validation/) | Rules that switch on based on other field values                                                                                                                                                          |
| 09  | [Form Submission](./apps/09-form-submission)               | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/09-form-submission/)        | Submit to a server with `[formRoot]` and a submission `action`, then route the server's errors back onto the fields                                                                                       |
| 10  | [Dynamic Forms](./apps/10-dynamic-forms)                   | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/10-dynamic-forms/)          | Swap the form shape with the role using `applyWhenValue`, then submit with `[formRoot]`                                                                                                                   |
| 11  | [Zod Schema Validation](./apps/11-zod-schema)              | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/11-zod-schema/)             | Drive validation from a Zod schema with `validateStandardSchema`, and swap that schema at runtime                                                                                                         |
| 12  | [Field Metadata](./apps/12-field-metadata)                 | [▶ Live](https://kshewengger.github.io/angular-signal-forms-cookbook/12-field-metadata/)         | Attach reactive metadata with `metadata()` / `createMetadataKey` / `applyWhen`, read the keys built-in validators publish (`maxLength`, `min`/`max`, `pattern`), and run a managed `httpResource` preview |

---

## 🧠 Signal Forms health-check skill

This repo ships a **custom Claude Code / Agent skill** - [`signal-forms-health-check`](./.claude/skills/signal-forms-health-check/) - hand-built from the recipes above and cross-checked against the official `angular.dev` docs. It is both a **reviewer** and a **playbook**. Run it from a Claude Code (or Agent) session:

| Use it as        | Invoke                                                                       | What you get                                                                                               |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Audit (branch)   | `/signal-forms-health-check`                                                 | Reviews the branch's changed signal-forms files vs `main`, ranked P0/P1/P2, each citing the rule it breaks |
| Audit (isolated) | `/signal-forms-health-check apps/12-field-metadata`                          | Audits just that file or folder, ignoring everything else                                                  |
| Reference        | Read [`references/`](./.claude/skills/signal-forms-health-check/references/) | 13 topic docs: the how-to for building signal forms                                                        |

- The **13 references** cover getting started, schemas, validation, async, arrays, conditional logic, custom controls, debounce, submission, **field metadata**, Zod / Standard Schema, testing, and production patterns.
- Every rule is **grounded in a real, tested recipe** in `apps/` (each reference cites its source), so the guidance ships code that compiles and passes.
- **Portable:** drop `.claude/skills/signal-forms-health-check/` into any Angular v21+ project and it travels with the code.

> A custom skill distilled from this cookbook, **not an official Angular skill**. Signal forms are Angular's forward-looking API; reactive forms remain the pick when you need framework-level stability guarantees.

---

## 🧰 Tech stack

Built on the latest Angular idioms and a signals-first toolchain. Versions are pinned exactly in [`package.json`](./package.json) (Angular is patch-pinned with `~` so majors don't drift):

| Layer      | Package              | Version |
| ---------- | -------------------- | ------- |
| Framework  | Angular              | ~22.0   |
| Monorepo   | Nx                   | 23.1    |
| Language   | TypeScript           | ~6.0    |
| Styling    | Tailwind CSS         | v4      |
| UI kit     | `@ng-brutalism/ui`   | 0.2     |
| Icons      | `@ng-icons` (tabler) | 34      |
| Validation | Zod                  | v4      |
| i18n       | `@angular/localize`  | 22      |
| Testing    | Vitest               | 4       |

---

## 🚀 Getting started

**Prerequisites**

| Requirement | Version              |
| ----------- | -------------------- |
| Node        | `>=22.12.0`          |
| pnpm        | `>=9` (via Corepack) |

This repo uses pnpm as its package manager. Enable it once via Corepack (bundled with Node):

```bash
corepack enable pnpm
```

**Install & run**

```bash
# 1. install dependencies
pnpm install

# 2. serve the app
pnpm start
```

The app serves at `http://localhost:4200`.

> **Live:** the cookbook is deployed on GitHub Pages at
> **<https://kshewengger.github.io/angular-signal-forms-cookbook/>**, with each recipe under
> its own sub-path (e.g. `/01-basic-form/`). See the **Demo** column above for direct links.

---

## ⚡ Scripts

| Command             | What it does                                               |
| ------------------- | ---------------------------------------------------------- |
| `pnpm start`        | Serves the app in development mode with HMR                |
| `pnpm serve:all`    | Serves every app at once, each on its own port (4200-4212) |
| `pnpm build`        | Production build                                           |
| `pnpm test`         | Runs the full unit test suite                              |
| `pnpm test:all`     | Runs the test suite across all apps                        |
| `pnpm lint`         | Lints the workspace                                        |
| `pnpm format`       | Formats with Prettier                                      |
| `pnpm format:check` | Checks formatting without writing (CI-friendly)            |
| `pnpm graph`        | Opens the Nx project dependency graph                      |

---

## 📄 License

[MIT](./LICENSE)
