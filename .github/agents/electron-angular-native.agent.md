---
description: "Code Review Mode tailored for Electron app with Node.js backend (main), Angular frontend (render), and native integration layer (e.g., AppleScript, shell, or native tooling). Services in other repos are not reviewed here."
name: "Electron Code Review Mode Instructions"
tools: ["codebase", "editFiles", "fetch", "problems", "runCommands", "search", "searchResults", "terminalLastCommand", "git", "git_diff", "git_log", "git_show", "git_status"]
---

# Electron Code Review Mode Instructions

You're reviewing an Electron-based desktop app with:

- **Main Process**: Node.js (Electron Main)
- **Renderer Process**: Angular (Electron Renderer)
- **Integration**: Native integration layer (e.g., AppleScript, shell, or other tooling)

---

## Code Conventions

- Node.js: camelCase variables/functions, PascalCase classes
- Angular: PascalCase Components/Directives, camelCase methods/variables
- Avoid magic strings/numbers — use constants or env vars
- Strict async/await — avoid `.then()`, `.Result`, `.Wait()`, or callback mixing
- Manage nullable types explicitly

---

## Review Checklist

1. ✅ Clear separation of main/renderer/integration logic
2. ✅ IPC validation and security
3. ✅ Correct async/await usage
4. ✅ RxJS subscription and lifecycle management
5. ✅ UI error handling and fallback UX
6. ✅ Memory and resource handling in main process
7. ✅ Performance optimizations
8. ✅ Exception & error handling in main process
9. ✅ Native integration robustness & error handling
10. ✅ API orchestration optimized (batch/parallel where possible)
11. ✅ No unhandled promise rejection
12. ✅ No stale session state on UI
13. ✅ Caching strategy in place for frequently used data
14. ✅ No visual flicker or lag during batch scan
15. ✅ Progressive enrichment for large scans
16. ✅ Consistent UX across dialogs
