# Troubleshooting Guide: GitHub Copilot and RHDA Issues

## Issue 1: "147 tools are enabled. You may experience degraded tool calling above 128 tools."

### Problem
GitHub Copilot Workspace or MCP (Model Context Protocol) servers have too many tools enabled, which can cause performance degradation.

### Root Cause
This warning typically occurs when:
- Too many MCP servers are configured in your VSCode settings
- Multiple Copilot extensions are running simultaneously
- Workspace has excessive custom tools or agents configured

### Solutions

#### Solution 1: Use Workspace Settings (Recommended)
The repository now includes `.vscode/settings.json` with optimized settings:
- MCP servers are limited to prevent tool overload
- Excludes archived and backup directories
- Optimized file watchers to improve performance

These workspace settings should automatically resolve the issue. If you still see the warning, try:
1. Reload VSCode window (`Ctrl+Shift+P` → "Reload Window")
2. Check if user-level settings are overriding workspace settings
3. Temporarily disable user-level MCP servers in your User Settings

#### Solution 2: Reduce User-Level MCP Servers
If workspace settings don't resolve the issue:
1. Open VSCode Settings (JSON) via `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
2. Look for `"mcp.servers"` configuration in your user settings
3. Temporarily disable or reduce MCP servers in your user settings:
   ```json
   "mcp.servers": {
     // Keep only the essential servers you need
   }
   ```

#### Solution 3: Check GitHub Copilot Extensions
1. Go to Extensions (`Ctrl+Shift+X`)
2. Look for multiple Copilot-related extensions
3. Disable or uninstall redundant ones:
   - Keep only "GitHub Copilot" and "GitHub Copilot Chat"
   - Disable experimental or preview versions if stable versions are installed

#### Solution 4: Reset Copilot Settings
If the issue persists:
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "GitHub Copilot: Reset Copilot"
3. Reload window
4. Reconfigure with minimal settings

### Verification
After applying solutions, verify the fix by:
1. Reloading VSCode window (`Ctrl+Shift+P` → "Reload Window")
2. Opening a file in the project
3. Checking if the warning disappears in the Output panel

---

## Issue 2: "RHDA error while analyzing package.json: package.json requires a lock file"

### Problem
Red Hat Dependency Analytics (RHDA) cannot analyze dependencies without a lock file.

### Root Cause
The project is configured to use `pnpm` (specified in `package.json` as `"packageManager": "pnpm@8.15.0"`), but the lock file (`pnpm-lock.yaml`) was missing.

### Solution
This issue has been **RESOLVED** by:
1. ✅ Created `pnpm-workspace.yaml` to properly configure the monorepo
2. ✅ Generated `pnpm-lock.yaml` using `pnpm install --lockfile-only`
3. ✅ Both files have been committed to the repository

### RHDA Configuration
The repository includes `.rhda-config.yml` which:
- Excludes archived and backup directories from analysis
- Requires lock files for package analysis
- Skips analysis for archived paths

### Maintaining Lock Files
To keep lock files up to date:

```bash
# When adding dependencies
pnpm add <package-name>

# When updating dependencies
pnpm update

# To regenerate lock file without installing
pnpm install --lockfile-only
```

### Important Notes
- Always commit `pnpm-lock.yaml` when it changes
- The monorepo structure includes multiple workspaces:
  - `apps/*` - Application packages (backend, portals)
  - `packages/*` - Shared packages (types, utils, ui, config, constants)
- Use `pnpm` commands instead of `npm` for dependency management

---

## Additional Recommendations

### Performance Optimization
1. **Exclude Large Directories**: The `.vscode/settings.json` now excludes:
   - `node_modules`
   - `archive`
   - `backup-*`
   - `.next`, `dist`, `build`

2. **Use Workspace-Specific Settings**: Keep VSCode settings in `.vscode/settings.json` for consistency across team

3. **Regular Maintenance**:
   - Clean unused `node_modules`: `rm -rf node_modules && pnpm install`
   - Update dependencies regularly: `pnpm update`
   - Review and archive old files periodically

### Best Practices
- **Monorepo Management**: Use `pnpm` for all dependency operations
- **Git Workflow**: Always pull latest changes before generating lock files
- **Tool Configuration**: Keep tool configurations minimal and workspace-specific
- **Documentation**: Update this guide when adding new tools or configurations

---

## Need More Help?

If issues persist:
1. Check VSCode Output panel (`View` → `Output`) for detailed error messages
2. Review GitHub Copilot logs
3. Consult the official documentation:
   - [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
   - [PNPM Documentation](https://pnpm.io/)
   - [Red Hat Dependency Analytics](https://marketplace.visualstudio.com/items?itemName=redhat.fabric8-analytics)

For project-specific issues, refer to:
- `README.md` - Project overview and setup
- `docs/` - Comprehensive documentation
- `.github/` - CI/CD and workflow configurations
