<!-- Please fill out the following template when opening a PR -->

## Summary

<!-- Short description of the change and why it is needed -->

## Type of change

- [ ] 🐛 Bug fix (non-breaking change)
- [ ] ✨ New feature (non-breaking change)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📝 Documentation update
- [ ] ♻️ Code refactoring
- [ ] ✅ Test additions/updates
- [ ] 🚀 Performance improvements

## Proposed changes

- Bullet list of proposed changes

## Testing Checklist

### Local Testing
- [ ] `npm run build:tsc` passes without errors
- [ ] `npm test` - All tests pass locally
- [ ] `npm run test:coverage` - Coverage meets threshold
- [ ] `npm run lint` - No linting errors
- [ ] Manual testing performed

### CI/CD
- [ ] GitHub Actions CI pipeline passes
- [ ] Integration tests passing
- [ ] No new test failures

## Code Quality Checklist

### Architecture & Patterns
- [ ] Follows Clean Architecture (domain/application/infrastructure/presentation)
- [ ] Uses Result<T, E> pattern (no throws in use-cases)
- [ ] No direct `shared/logger` imports in repositories (use DI)
- [ ] Dependencies injected via constructor
- [ ] Value Objects used (Email, Password, etc.)

### TypeScript
- [ ] New code written in TypeScript
- [ ] `tsc --noEmit` passes
- [ ] No `any` types without justification
- [ ] Interfaces defined for DI

### Testing
- [ ] Unit tests added for business logic
- [ ] Integration tests for new endpoints
- [ ] Test fixtures use `userFactory` (with phoneNumber)
- [ ] Edge cases covered

### Documentation
- [ ] OpenAPI spec updated
- [ ] README updated if needed
- [ ] Comments added for complex logic

## Security Checklist

- [ ] No secrets/credentials in code
- [ ] Input validation implemented
- [ ] Authentication/authorization checks
- [ ] Rate limiting for sensitive endpoints
- [ ] Password handling secure (bcrypt, no logging)

## Deployment Checklist

- [ ] Health endpoint OK (`/health`, `/ready`, `/live`)
- [ ] Environment variables documented
- [ ] Rollback plan ready
- [ ] Monitoring/alerts configured

## Checklist

- [ ] My code follows the project guidelines (DEVELOPMENT_GUIDELINES.md)
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] I have added necessary documentation (if appropriate)
- [ ] Linter and formatter checks are passing
- [ ] No secrets or credentials are included

## Related issues

- Fixes # (issue)
- Related to # (issue)

Please add reviewers and request changes if anything looks off. Thanks!
