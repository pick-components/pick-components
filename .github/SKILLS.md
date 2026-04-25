# Copilot Skills for Pick Components

Quick reference for the Copilot skill included in this repository.

## Available Skill

### /setup-pick-components

Purpose: Provide accurate, framework-aligned guidance for Pick Components.

Use when:
- Creating components with @Pick or @PickRender
- Writing unit/integration/browser tests
- Wiring dependencies in composition root
- Building safe templates with real binding syntax

Skill location:
- .github/skills/setup-pick-components/

## Files in the Skill

- .github/skills/setup-pick-components/SKILL.md
- .github/skills/setup-pick-components/01-create-components.md
- .github/skills/setup-pick-components/02-writing-tests.md
- .github/skills/setup-pick-components/03-dependency-injection.md
- .github/skills/setup-pick-components/04-template-safety.md

## Install Skill Into Another Repository

From this repository root:

```bash
npm run copilot:export-skill -- --target /path/to/target-project
```

This copies:
- .github/skills/setup-pick-components/

into the target repository.

## Troubleshooting

Copilot is not following the skill:
- Confirm .github/skills/setup-pick-components/SKILL.md exists
- Confirm the file has valid YAML frontmatter
- Ask explicitly: "Use /setup-pick-components"

## Team Workflow

1. Export the skill into the team repository.
2. Commit .github/skills/setup-pick-components/ in that repository.
3. Keep examples updated when framework APIs change.
