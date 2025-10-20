# Commit Message Guidelines

Use a consistent format to make history readable.

Format:

```
<type>(<scope>): <short summary>

<body> (optional)
```

Types:

- feat: new feature
- fix: bug fix
- docs: documentation only changes
- style: formatting, missing semicolons, etc
- refactor: code change that neither fixes a bug nor adds a feature
- perf: a code change that improves performance
- test: adding missing tests or correcting existing tests
- chore: changes to the build process or auxiliary tools

Examples:

```
feat(workflow): add weighted scoring algorithm
fix(api): handle missing env var in DB client
docs(readme): update quick start instructions
```

Tips:

- Keep the summary <= 72 characters
- Use the body to explain "why" the change was made, not "what" (the code shows what)
- Reference issues and PRs using `#<number>`
