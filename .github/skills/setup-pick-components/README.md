# Pick Components Setup Skill

Complete guide for setting up a new Pick Components project with GitHub Copilot integration.

## Contents

This skill includes real patterns from **Kronometa** (production Pick Components app) and **PickComponents** framework:

1. **01-create-components.md** — Create components with `@PickRender`, lifecycle injection, `@Reactive` state, intents
2. **02-writing-tests.md** — Playwright unit/integration/browser patterns with AAA structure
3. **03-dependency-injection.md** — Built-in `Services` registry first, optional external DI integration
4. **04-template-safety.md** — Safe template binding syntax, validation separation, event handling

## How to Use

### Option 1: Use in this repository
1. Type `/setup-pick-components` in Copilot chat
2. Ask for component, test, DI, or template generation
3. Copilot will use this skill as guidance

### Option 2: Install into another repository
Use the export command from this repository root:

```bash
npm run copilot:export-skill -- --target /path/to/target-project
```

Or copy manually under `.github/skills/`:
```bash
cp -r .github/skills/setup-pick-components <target-project>/.github/skills/
```

### Option 3: Reference only
Use these as reference when asking Copilot for help:
- "Create a component" → refers to 01-create-components.md
- "Write tests for this" → refers to 02-writing-tests.md
- "Help with DI" → refers to 03-dependency-injection.md
- "Fix my template" → refers to 04-template-safety.md

## Integration with Your Project

Once integrated, Copilot will:
- ✅ Generate components with `@Pick`/`@PickRender`
- ✅ Create tests following AAA pattern
- ✅ Use factory-first DI
- ✅ Write proper JSDoc in English
- ✅ Follow template safety rules
- ✅ Avoid anti-patterns

## Quick Examples

### Create a Component
**You ask:** "Create a component that displays a user profile"  
**Copilot generates:**
```typescript
@PickRender({
  selector: "user-profile",
  initializer: () => Services.getNew(UserProfileInitializer),
  lifecycle: () => Services.getNew(UserProfileLifecycle),
  template,
  styles,
})
export class UserProfile extends PickComponent { /* ... */ }
```

### Write a Test
**You ask:** "Write tests for UserService"  
**Copilot generates:**
```typescript
describe('UserService', () => {
  it('should fetch user by ID', async () => {
    // Arrange, Act, Assert pattern
  });
});
```

### Setup DI
**You ask:** "Show me how to register services"  
**Copilot generates:**
```typescript
// In bootstrap.ts (composition root)
Services.register(HttpClient, () => new HttpClient());
Services.register(UserService, () => new UserService(Services.get(HttpClient)));
```

## Files Structure

After setup, your project will have:
```
.github/
└── skills/
  └── setup-pick-components/
    ├── SKILL.md
    ├── 01-create-components.md
    ├── 02-writing-tests.md
    ├── 03-dependency-injection.md
    └── 04-template-safety.md
```

## Customization

Each file can be customized for your team:
- Edit component examples to match your style
- Add project-specific anti-patterns to avoid
- Extend with team conventions
- Share with team members

## Team Workflow

1. **Share the setup** — Give team members the skill or the generated files
2. **Consistent development** — Everyone gets same Copilot guidance
3. **Easy onboarding** — New developers follow established patterns
4. **Reduced code review** — Less feedback on style/conventions

## Troubleshooting

**Copilot not following patterns?**
- Ensure `.github/skills/setup-pick-components/` exists in your repo
- Check that `SKILL.md` is present and has valid YAML frontmatter
- Verify Copilot loaded the instructions (check chat context)

**Want to add more guidance?**
Create new `.md` files in `.github/skills/setup-pick-components/`
- Add descriptive prefixes (e.g., `05-performance-tips.md`)
- Include examples and anti-patterns

**Need team-specific rules?**
- Create `.github/instructions/team-conventions.md`
- Link from main `copilot-instructions.md`
- Reference in relevant model files

## Resources

- [Pick Components GitHub](https://github.com/janmbaco/PickComponents)
- [Framework Documentation](../../../docs/)
- [Live Playground](https://janmbaco.github.io/PickComponents/)
- [npm Package](https://www.npmjs.com/package/pick-components)

---

**Questions?** Check the [Pick Components Issues](https://github.com/janmbaco/PickComponents/issues) or contribute improvements.
