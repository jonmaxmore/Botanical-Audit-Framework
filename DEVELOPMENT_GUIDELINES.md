# GACP Platform — Development Guidelines

This document captures a lightweight, practical coding guideline for the GACP Platform team (PM, SA, Frontend, Dev). Keep it short, readable, and actionable.

## 1. Core Principles

1. Keep It Simple (KIS)
   - Write code that's easy to read and understand. If you have to explain it for more than a minute, simplify.
   - Each function should do one thing only.

2. Separation of Concerns
   - UI (View) vs Business Logic vs Data (Model)
   - Validation, API calls, and data transforms live in their own modules.

3. Meaningful Naming
   - Function names describe the action: `calculateScore`, `fetchWorkflow`.
   - Variable names describe the content: `userCount`, `workflowStates`.
   - Avoid abbreviations unless they're standard and well-known.

---

## 2. Project Structure (recommended)

- Keep folders small and purpose-driven.

Example (frontend):

```
src/
 ├── components/         # Reusable UI components
 ├── pages/              # Route pages (Next.js / Router)
 ├── services/           # API calls, adapters
 ├── store/              # Global state (Redux / Zustand)
 ├── hooks/              # Reusable hooks
 ├── utils/              # Pure helpers and util functions
 └── styles/             # Styling and theme
```

Example (backend):

```
apps/backend/
 ├── routes/             # HTTP endpoints
 ├── controllers/        # Controller logic (thin)
 ├── services/           # Business logic and orchestration
 ├── models/             # DB schemas
 ├── utils/              # Helpers, validators
 ├── middlewares/        # Express middlewares
 └── tests/              # Unit and integration tests
```

Guidelines:

- Small files are easier to review. Prefer many small files to a few huge ones.
- Put reusable components in a shared `components/` or `packages/` area.
- Expose cross-cutting logic through `services/` or `utils/`.

---

## 3. Function Rules

- Keep functions short: aim for 30–50 lines max.
- Prefer <= 3 parameters. Use a single options object if more are needed.
- Return values explicitly; avoid silent mutations.
- No hidden side-effects. If a function writes to DB or global state, make it explicit in the name.
- Example:

```js
// Good
function calculateWeightedScore(scores, weights) {
  // pure function
  return scores.reduce((sum, s, i) => sum + s * (weights[i] || 1), 0);
}

// Avoid: multiple responsibilities
function handleRequestAndCalculate(req, res) {
  // too many things
}
```

---

## 4. State Management

- Keep state close to where it's used.
- Separate local state (component-level) and global state (store).
- Avoid duplicated sources of truth. Use selectors to derive values.
- For forms: validate locally, but keep canonical data in store or server.

---

## 5. MVP Pattern (Model-View-Presenter)

- **Model:** Data fetching and data-only structures. No UI logic.
- **View:** Renders UI, receives user input. No business logic.
- **Presenter:** Orchestrates between Model and View, contains business rules.

Example flow:

- View -> Presenter: `onSubmit(data)`
- Presenter -> Model: `api.saveApplication(data)`
- Presenter -> View: `showSuccess()` or `showErrors()`

---

## 6. Best Practices (Do / Don't)

Do:

- Write clear names
- Unit-test business logic
- Keep components small and focused
- Keep API contracts stable and versioned
- Log at appropriate level (info/warn/error)

Don't:

- Copy-paste code (refactor instead)
- Leave `console.log` in production
- Hardcode secrets or configuration
- Overuse patterns the team doesn't know

---

## 7. PR / Commit & Branching Guidelines

- Branch per feature: `feat/`, `fix/`, `chore/` prefixes.
- Commit messages: short summary + optional body (reference issue)
  - Example: `feat(workflow): add weighted score calculator`
- PR checklist:
  - Title and description
  - Linked issue
  - Unit tests added for new logic
  - Linter passes
  - No secrets in code

Optional `.github/PULL_REQUEST_TEMPLATE.md` and `COMMIT_MESSAGE_GUIDELINES.md` can be added.

---

## 8. Testing

- Unit test core business logic (happy path + edge cases).
- Integration tests for API endpoints (auth, DB interactions).
- E2E for critical flows (login, submit application, audit).
- Keep tests fast and isolated.

---

## 9. Examples & Snippets

Small, copy-paste ready examples to guide developers.

### Utility helper (pure):

```js
export function formatDateToISO(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}
```

### Service with single responsibility:

```js
// services/workflowService.js
export async function fetchWorkflows(apiClient) {
  const res = await apiClient.get('/gacp/workflow');
  return res.data;
}
```

### Presenter example:

```js
export function submitApplication(presenter, apiClient, data) {
  const validated = presenter.validate(data);
  if (!validated.valid) return { ok: false, errors: validated.errors };
  return apiClient.post('/applications', validated.payload);
}
```

---

## 10. Checklist Before Merge

- [ ] Code is easy to read and self-explanatory
- [ ] No duplicate code
- [ ] Error handling exists for all external calls
- [ ] Tests added and passing
- [ ] Linting and formatting OK
- [ ] No hardcoded secrets or configs
- [ ] Documentation updated if needed

---

## 11. Adoption Plan (fast win)

1. Add `DEVELOPMENT_GUIDELINES.md` to repo root (this file).
2. Add simple PR template and commit message guide.
3. Introduce linting and pre-commit hooks (ESLint + Prettier + husky).
4. Run two-week pilot: require new PR authors to follow the checklist.

---

## 12. Final Notes

Keep things pragmatic. The target is readable, maintainable code that new team members can pick up quickly. If something becomes too complex, break it down.

"Good code is code that anyone can fix."

---
