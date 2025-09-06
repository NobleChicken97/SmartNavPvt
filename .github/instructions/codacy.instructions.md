---
    description: Enhanced configuration for AI behavior with comprehensive code quality and security checks
    applyTo: '**'
---
---
# Enhanced AI Code Quality & Security Rules
Advanced configuration for AI behavior ensuring error-free, secure, and maintainable code

## 🔧 Repository Configuration
When using any tool that accepts the arguments: `provider`, `organization`, or `repository`
- ALWAYS use:
 - provider: gh
 - organization: NobleChicken97
 - repository: SmartNav
- Avoid calling `git remote -v` unless really necessary

## 🔴 CRITICAL: Mandatory Code Analysis Pipeline
After ANY successful `edit_file`, `replace_string_in_file`, or `reapply` operation:

### Step 1: Immediate File Analysis
- YOU MUST IMMEDIATELY run the `codacy_cli_analyze` tool from Codacy's MCP Server for each file that was edited, with:
 - `rootPath`: set to the workspace path
 - `file`: set to the path of the edited file
 - `tool`: leave empty or unset
- If any issues are found in the new edits, propose and apply fixes for them.
- > NOTE: Failure to follow this rule is considered a critical error.

### Step 2: Syntax and Type Validation
For TypeScript/JavaScript files, ALSO run:
- `mcp_pylance_mcp_s_pylanceFileSyntaxErrors` (for Python files)
- `get_errors` tool to check for compile/lint errors
- If syntax errors found, fix them immediately before proceeding

### Step 3: Security Pattern Detection
For any file containing:
- API endpoints, database queries, authentication logic
- Environment variables, configuration files
- Input validation, file uploads
- MANDATORY: Run `codacy_cli_analyze` with `tool`: "semgrep" for security pattern detection

## 📋 Code Quality Gates & Standards

### Pre-commit Quality Checks
Before considering any edit complete:
1. **Linting**: Run ESLint/Pylint checks
2. **Type Safety**: Verify TypeScript type correctness
3. **Code Formatting**: Ensure consistent code style
4. **Import Organization**: Check for unused imports
5. **Documentation**: Verify JSDoc/docstring completeness for new functions

### Performance Validation
For performance-critical files (components, services, utilities):
- Check for potential memory leaks
- Validate efficient algorithm usage
- Verify proper async/await patterns
- Check for unnecessary re-renders (React components)

### Testing Requirements
When editing files with corresponding test files:
- MANDATORY: Update tests to reflect changes
- Verify test coverage doesn't decrease
- Run affected tests to ensure they pass
- Add new tests for new functionality

## 🔄 After Every Response Validation
- If you made any file edits in this conversation, verify you ran `codacy_cli_analyze` tool from Codacy's MCP Server 
- Double-check that all security scans completed successfully
- Confirm no new linting errors were introduced
- Verify type safety wasn't compromised

## 🆘 Troubleshooting & Fallback Procedures

### When Codacy MCP Server tools are unavailable:
1. **First**: Try to reset the MCP on the extension
2. **VSCode Users**: Review Copilot > MCP settings in GitHub
   - Navigate to: https://github.com/settings/copilot/features
   - Organization settings: https://github.com/organizations/{organization-name}/settings/copilot/features
   - (Requires organization admin/owner permissions)
3. **Last Resort**: Contact Codacy support

### Alternative Quality Checks (when Codacy unavailable):
- Use built-in linters (npm run lint)
- Run type checking (npm run type-check)
- Execute security audits (npm audit)
- Manual code review against OWASP guidelines

## 🎯 File-Type Specific Rules

### Frontend Files (.tsx, .ts, .jsx, .js)
- Always check for React best practices
- Verify proper hook usage
- Validate accessibility standards
- Check for XSS vulnerabilities
- Ensure mobile responsiveness considerations

### Backend Files (.js, .ts in backend)
- Validate API security patterns
- Check for proper error handling
- Verify input validation
- Ensure database security practices
- Check for proper logging (no sensitive data)

### Configuration Files (.yml, .json, .env)
- Scan for hardcoded secrets
- Validate configuration syntax
- Check for security misconfigurations
- Verify environment-specific settings

### Docker Files
- Validate security best practices
- Check for minimal base images
- Verify non-root user usage
- Scan for exposed secrets
- Validate multi-stage builds

## 🚀 Advanced Automation Rules

### Dependency Management
- Always use exact versions for security-critical packages
- Prefer official packages over community alternatives
- Check package maintenance status and community support
- Validate package integrity and authenticity

### Code Complexity Management
- Flag functions with high cyclomatic complexity
- Suggest refactoring for deeply nested code
- Recommend splitting large components/modules
- Ensure proper separation of concerns

### Documentation Standards
- Require JSDoc for all public functions
- Maintain README updates for significant changes
- Update API documentation for endpoint changes
- Keep architecture documentation current

## ⚙️ Technical Implementation Notes
- Always use standard, non-URL-encoded file system paths for `rootPath`
- Repeat validation steps for each modified file
- "Propose fixes" means to both suggest AND automatically apply fixes when possible
- Do NOT wait for user prompts to run analysis tools
- Skip code coverage and complexity metrics for routine analysis
- Only send provider/organization/repository for git repositories
- Never attempt manual Codacy CLI installation

## 🚨 CRITICAL: Enhanced Dependencies and Security Checks
IMMEDIATELY after ANY of these actions:
 - Running npm/yarn/pnpm install
 - Adding dependencies to package.json, requirements.txt, pom.xml, build.gradle
 - Modifying Dockerfile, docker-compose.yml
 - Updating environment configuration files (.env, config files)
 - Installing system packages or libraries
 - Any other package manager operations

### Required Security Scanning Sequence:
1. **Vulnerability Scan**: Run `codacy_cli_analyze` with `tool`: "trivy"
2. **License Compliance**: Check for license conflicts
3. **Dependency Analysis**: Verify no malicious or abandoned packages
4. **Version Compatibility**: Ensure version constraints are properly set

### Blocking Conditions:
- If any CRITICAL or HIGH vulnerabilities found: STOP all operations
- If license conflicts detected: STOP and resolve
- If deprecated/abandoned packages found: Suggest alternatives
- Only continue with the original task after ALL security issues are resolved

## 🛡️ Enhanced Security Validation Rules

### Authentication & Authorization Files
When editing files containing authentication/authorization logic:
- MANDATORY: Validate JWT implementation patterns
- Check for proper input sanitization
- Verify rate limiting implementation
- Ensure secure session management
- Run security-focused static analysis

### Database & API Files
When editing database models, API endpoints, or controllers:
- MANDATORY: Check for SQL injection vulnerabilities
- Validate input sanitization and validation
- Verify proper error handling (no sensitive data exposure)
- Check for proper CORS configuration
- Ensure API rate limiting is implemented

### Configuration Files
When editing .env, config files, or Docker configurations:
- MANDATORY: Scan for hardcoded secrets or API keys
- Verify proper environment variable usage
- Check Docker security best practices
- Validate network security configurations

## General
- Repeat the relevant steps for each modified file.
- "Propose fixes" means to both suggest and, if possible, automatically apply the fixes.
- You MUST NOT wait for the user to ask for analysis or remind you to run the tool.
- Do not run `codacy_cli_analyze` looking for changes in duplicated code or code complexity metrics.
- Do not run `codacy_cli_analyze` looking for changes in code coverage.
- Do not try to manually install Codacy CLI using either brew, npm, npx, or any other package manager.
- If the Codacy CLI is not installed, just run the `codacy_cli_analyze` tool from Codacy's MCP Server.
- When calling `codacy_cli_analyze`, only send provider, organization and repository if the project is a git repository.

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)

## 🎖️ Quality Assurance Success Criteria
A code change is considered complete ONLY when ALL of the following are satisfied:
- ✅ Codacy analysis shows no new critical/high issues
- ✅ All security scans pass (no critical/high vulnerabilities)
- ✅ Type checking passes without errors
- ✅ Linting passes without errors
- ✅ No hardcoded secrets or API keys detected
- ✅ Proper error handling implemented
- ✅ Input validation added where applicable
- ✅ Tests updated and passing (if test files exist)
- ✅ Documentation updated (if public APIs changed)

### Emergency Override Conditions
The above criteria may be temporarily bypassed ONLY for:
- Critical production hotfixes (must be addressed in follow-up)
- Proof-of-concept implementations (clearly marked as POC)
- Legacy code that cannot be immediately modernized

---
**Remember: The goal is not just working code, but secure, maintainable, and error-free code that follows best practices.**