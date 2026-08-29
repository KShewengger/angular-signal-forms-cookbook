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
- [Getting started](#-getting-started)
- [Scripts](#-scripts)
- [Nx commands reference](./docs/nx-commands.md)
- [License](#-license)

---

## 🍳 Recipes

Each recipe is a small, runnable example that solves one problem, with a folder-level `README.md` explaining the approach and the gotchas.

| #   | Recipe                                                     | What it covers                                                                                                        |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 01  | [Basic form](./apps/01-basic-form)                         | `form()`, `[formField]` binding, live `touched`/`dirty`/`valid` state                                                 |
| 02  | [Built-in Validations](./apps/02-built-in-validations)     | Built-in validators (`required`, `email`, `minLength`, `pattern`, `min`), inline error messages, touched/dirty gating |
| 03  | [Cross-field Validation](./apps/03-cross-field-validation) | Validate one field against another with `validate()` + `valueOf()`                                                    |
| 04  | [Async Validation](./apps/04-async-validation)             | Debounced server checks with a pending state, verified with `validateHttp`                                            |
| 05  | [Array Validation](./apps/05-array-validation)             | Validate every item in an array with `applyEach` and per-item rules                                                   |
| 06  | [Custom Control](./apps/06-custom-control)                 | Build a custom `FormValueControl` the framework binds value and state to                                              |
| 07  | [Debounced Input](./apps/07-debounce-input)                | Delay model updates until the user pauses typing with `debounce()`, then run a live `rxResource` search               |
| 08  | [Conditional Validation](./apps/08-conditional-validation) | Rules that switch on based on other field values                                                                      |
| 09  | [Form Submission](./apps/09-form-submission)               | Submit to a server with `[formRoot]` and a submission `action`, then route the server's errors back onto the fields   |
| 10  | [Dynamic Forms](./apps/10-dynamic-forms)                   | Swap the form shape with the role using `applyWhenValue`, then submit with `[formRoot]`                               |
| 11  | [Zod Schema Validation](./apps/11-zod-schema)              | Drive validation from a Zod schema with `validateStandardSchema`, and swap that schema at runtime                     |
| 12  | [Field Metadata](./apps/12-field-metadata)                 | Attach reactive data to a field with `metadata()`, and read the constraint keys `required`/`min`/`pattern` publish    |

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

---

## ⚡ Scripts

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `pnpm start`        | Serves the app in development mode with HMR     |
| `pnpm build`        | Production build                                |
| `pnpm test`         | Runs the full unit test suite                   |
| `pnpm lint`         | Lints the workspace                             |
| `pnpm format`       | Formats with Prettier                           |
| `pnpm format:check` | Checks formatting without writing (CI-friendly) |
| `pnpm graph`        | Opens the Nx project dependency graph           |

---

## 📄 License

[MIT](./LICENSE)
