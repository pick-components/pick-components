---
name: pick-components-setup
description: "Setup Copilot for a Pick Components project. Use when: creating or maintaining Pick Components code; generating components (@PickRender, @Pick, definePick, defineComponent), tests, DI setup, and templates with real framework syntax. Covers InlineContext ctx.* API (ctx.state, ctx.on, ctx.listen, ctx.computed, ctx.intent, ctx.lifecycle, ctx.initializer), zero-dependency Services registry, optional external DI integration, Playwright test projects, and safe template expressions."
---

# Setup Pick Components Project

Configures your project to work seamlessly with Pick Components and GitHub Copilot. This skill provides reusable guidance files under `.github/skills/setup-pick-components/`.

## Component APIs — Choose the Right One

| API | When to use |
|-----|-------------|
| `@PickRender` | Full-featured with decorator: initializer, lifecycle, skeleton, errorTemplate |
| `defineComponent` | Decorator-free alternative to `@PickRender`; class uses `@Reactive`/`@Listen` |
| `@Pick` | Inline context (decorator, setup via `ctx.*`) |
| `definePick` | Fully decorator-free, functional — no class, no `@Reactive`, no `@Listen` |

**`<pick-action>` is a custom element, not an HTML attribute.** Always wrap: `<pick-action action="name"><button>…</button></pick-action>`

## What This Skill Does

1. ✅ Documents all four component APIs with real examples
2. ✅ Covers the full InlineContext (`ctx.*`) API for `@Pick` and `definePick`
3. ✅ Aligns generated code with Pick Components syntax and architecture
4. ✅ Keeps DI guidance centered on built-in `Services` first
5. ✅ Documents optional external DI integration when needed

## Quick Start

This skill will help you:

### For Component Creation
- See [01-create-components.md](./01-create-components.md) — all four APIs with examples
- See [05-inline-context-api.md](./05-inline-context-api.md) — full `ctx.*` reference for `@Pick`/`definePick` (ctx.state, ctx.on, ctx.listen, ctx.computed, ctx.intent, ctx.lifecycle, ctx.initializer, ctx.skeleton, ctx.errorTemplate, ctx.css, ctx.html, ctx.props, ctx.ref, ctx.rules)

### For Testing
- Follow AAA pattern (Arrange-Act-Assert)
- Write descriptive test names
- Create unit and integration tests correctly
- Handle error cases explicitly
- See [02-writing-tests.md](./02-writing-tests.md)

### For Architecture
- Use factory-first DI patterns
- Separate business logic from presentation
- Create proper service abstractions
- Follow composition root patterns
- See [03-dependency-injection.md](./03-dependency-injection.md)

### For Templates
- Write secure template expressions
- Use property bindings correctly
- Handle actions and signals properly
- Validate input in services, not templates
- See [04-template-safety.md](./04-template-safety.md)

## Files Created

This skill includes:

```
.github/
├── skills/
│   └── setup-pick-components/
│       ├── SKILL.md
│       ├── 01-create-components.md       ← All 4 APIs with examples
│       ├── 02-writing-tests.md
│       ├── 03-dependency-injection.md
│       ├── 04-template-safety.md
│       └── 05-inline-context-api.md      ← Full ctx.* API reference
```

## How to Use This Skill

1. **In VS Code**: Type `/setup-pick-components` in Copilot chat
2. **Reference files**: Copilot uses this skill folder as domain guidance
3. **Start developing**: Ask for components, tests, DI wiring, or template help

## Integration with Copilot

With this skill in the repository:
- When you ask "Create a Pick component that...", Copilot uses your project's conventions
- Tests are generated using unit/integration/browser project conventions
- DI code follows factory-first approach
- All JSDoc uses your project's English documentation style

## Project Files Reference

These templates align with [Pick Components framework](https://github.com/pick-components/pick-components):
- **Component patterns**: See [src/components/](../../../src/components/) examples
- **DI architecture**: See [docs/DEPENDENCY-INJECTION.md](../../../docs/DEPENDENCY-INJECTION.md)
- **Testing rules**: See [.github/instructions/testing.instructions.md](../../instructions/testing.instructions.md)
- **Rendering internals**: See [docs/RENDERING-ARCHITECTURE.md](../../../docs/RENDERING-ARCHITECTURE.md)

## Next Steps After Setup

1. Review these skill files with your team
2. Adapt examples to your project domain
3. Keep examples synced with framework changes
4. Test with: "Create a counter component using Pick Components"

## Customization

All skill files are editable. You can:
- Modify examples in `.github/skills/setup-pick-components/`
- Add or remove instruction files as needed
- Extend with project-specific patterns
- Share with team members for consistent development

---

**Questions?** Check the [Pick Components documentation](https://github.com/pick-components/pick-components) or contribute improvements back to the framework.
