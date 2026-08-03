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
| 03  | [Cross-field Validation](./apps/03-cross-field)            | Validating one field against another                                                                                  |
| 04  | [Async Validation](./apps/04-async-validation)             | Debounced server checks, pending state                                                                                |
| 05  | [Array Validation](./apps/05-array-validation)             | Per-item rules, add/remove rows, array-level errors                                                                   |
| 06  | [Custom Control](./apps/09-custom-control)                 | Implementing `FormValueControl` with its own validation                                                               |
| 07  | [Custom Validation](./apps/07-custom-validation)           | Writing your own validators, validating a subtree with `validateTree`                                                 |
| 08  | [Conditional Validation](./apps/06-conditional-validation) | Rules that switch on based on other values                                                                            |
| 09  | [Form submission](./apps/10-submission)                    | Submit lifecycle via form root, server error mapping                                                                  |
| 10  | [Zod schema Validation](./apps/08-zod)                     | Driving form validation from a Zod schema                                                                             |

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
