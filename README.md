# Component Architecture - Atomic Design

This project follows the Atomic Design methodology for organizing React components.

## Structure

```
src/components/
├── atoms/          # Basic building blocks
├── molecules/      # Groups of atoms functioning together
├── organisms/      # Groups of molecules forming sections
├── templates/      # Page-level objects placing components
└── ui/            # Base UI components (shadcn/ui)
```

## Hierarchy

### Atoms (`/atoms`)

- **Logo**: Brand logo component
- **FormField**: Labeled input field combining Label + Input

### Molecules (`/molecules`)

- **SignUpForm**: Complete form with multiple FormFields and submit functionality

### Organisms (`/organisms`)

- **SignUpCard**: Complete signup card with logo, welcome message, and form

### UI Components (`/ui`)

- **Button**: Reusable button component with variants
- **Input**: Styled input component
- **Label**: Text label component

## Usage

```tsx
// Import from appropriate level
import { Logo } from "@/components/atoms";
import { SignUpForm } from "@/components/molecules";
import { SignUpCard } from "@/components/organisms";
import { Button, Input, Label } from "@/components/ui";
```

## Benefits

1. **Scalability**: Clear hierarchy makes it easy to add new components
2. **Reusability**: Atoms and molecules can be reused across different contexts
3. **Maintainability**: Changes to base components propagate upward
4. **Testing**: Each level can be tested independently
5. **Collaboration**: Designers and developers share common vocabulary
