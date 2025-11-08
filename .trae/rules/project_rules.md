# Football Manager Project - Software Engineering Rules

## Project Overview
This is a **Tauri + React + TypeScript** desktop application that combines football management functionality with AI-powered screenshot analysis and key monitoring capabilities. The app uses **HeroUI v3** (see `c:\Users\User\WinWorkplace\football-manager\.trae\rules\heroui.md` for comprehensive UI guidelines) for the frontend and **Rust** for the backend.

## Core Architecture

### Frontend Stack
- **React 19** with TypeScript
- **HeroUI v3** (beta) - Modern UI component library built on React Aria
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Vite** - Build tool and development server
- **AI SDK** - OpenAI integration for screenshot analysis

### Backend Stack
- **Tauri v2** - Cross-platform desktop app framework
- **Rust** - Systems programming for native functionality
- **Global shortcuts** - System-wide hotkey support (Ctrl+Shift+S)
- **Cross-platform screenshot** - Platform-specific screenshot utilities

### Key Features
1. **Global Screenshot Capture** - System-wide shortcut (Ctrl+Shift+S)
2. **AI Image Analysis** - OpenAI-powered screenshot analysis
3. **Key Monitoring** - Tracks specific key presses (comma, period)
4. **Multi-tab Interface** - Screenshots and Key Monitor tabs

## Development Guidelines

### Code Organization
```
src/
├── components/          # Reusable React components
│   ├── ui/               # HeroUI-based UI components
│   ├── ImageAnalyzer.tsx # AI-powered image analysis
│   └── Navigation.tsx    # App navigation
├── pages/                # Route components
│   ├── Home.tsx         # Landing page
│   ├── ScreenshotAI.tsx # Main screenshot functionality
│   └── KeyMonitor.tsx   # Key monitoring interface
├── lib/                  # Utility libraries
│   ├── ai-config.ts     # OpenAI configuration
│   └── utils.ts         # Helper functions
├── router.tsx           # React Router configuration
└── main.tsx            # Application entry point

src-tauri/
├── src/
│   ├── main.rs          # Rust application entry
│   └── lib.rs           # Core Rust functionality
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json    # Tauri configuration
```

### TypeScript Guidelines
- **Strict mode enabled** - All new code must pass TypeScript strict checking
- **Interface over type** - Prefer interfaces for object shapes
- **Explicit return types** - Functions should have explicit return types
- **No any types** - Avoid `any`; use `unknown` or proper typing
- **Component props interfaces** - Always define props interfaces for React components

### React Best Practices
- **Functional components only** - No class components
- **React 19 features** - Utilize new features like native `ref` as props
- **Compound components** - Follow HeroUI's compound component pattern
- **Custom hooks** - Extract complex logic into custom hooks
- **Memo optimization** - Use `React.memo` for expensive components

### HeroUI v3 Implementation Rules
**CRITICAL: Refer to `c:\Users\User\WinWorkplace\football-manager\.trae\rules\heroui.md` for complete UI guidelines.**

Key principles:
- **Semantic variants**: Use `primary`, `secondary`, `tertiary`, `danger` (not visual descriptions)
- **Compound components**: Use dot notation or named exports consistently
- **Accessibility first**: All components must be accessible by default
- **Type safety**: All HeroUI components are fully typed
- **Customization**: Use CSS variables or Tailwind utilities, never override core styles

Example implementation:
```tsx
// ✅ Correct - Semantic variants
<Button variant="primary" size="lg" onPress={handleSave}>
  Save Changes
</Button>

// ✅ Correct - Compound components
<Card>
  <Card.Header>
    <Card.Title>Screenshot Analysis</Card.Title>
  </Card.Header>
  <Card.Body>
    <ImageAnalyzer imagePath={screenshotPath} />
  </Card.Body>
</Card>
```

### State Management
- **Local state first** - Use `useState` and `useReducer` for component state
- **Context for shared state** - Use React Context for cross-component state
- **No external state libraries** - Avoid Redux, Zustand, etc. unless absolutely necessary
- **Custom hooks for logic** - Extract stateful logic into reusable hooks

### Styling Guidelines
- **Tailwind CSS v4** - Primary styling method
- **HeroUI theme tokens** - Use design system tokens for colors, spacing, etc.
- **CSS Modules for complex styles** - Only when Tailwind is insufficient
- **No inline styles** - Avoid `style` prop except for dynamic values
- **Responsive design** - Mobile-first approach with Tailwind breakpoints

### Performance Optimization
- **Code splitting** - Use React.lazy for route-based splitting
- **Image optimization** - Compress images, use modern formats (WebP, AVIF)
- **Bundle analysis** - Regular bundle size checks
- **Virtual scrolling** - For long lists of screenshots
- **Memoization** - Use `useMemo` and `useCallback` appropriately

## Rust Backend Guidelines

### Code Quality
- **Rust 2021 edition** - Use modern Rust features
- **Error handling** - Use `Result<T, E>` and proper error propagation
- **Memory safety** - Leverage Rust's ownership system
- **Async/await** - Use for I/O operations
- **Logging** - Use `log` crate with appropriate levels

### Cross-Platform Compatibility
- **Platform-specific code** - Use conditional compilation (`#[cfg(target_os = "...")]`)
- **Screenshot utilities** - Support macOS (`screencapture`), Windows (PowerShell), Linux (multiple tools)
- **Path handling** - Use `std::path::PathBuf` for cross-platform paths
- **File system operations** - Handle permissions and errors gracefully

### Security Considerations
- **Input validation** - Validate all user inputs and API parameters
- **File system access** - Restrict file operations to safe directories
- **API keys** - Never hardcode API keys; use environment variables
- **CSP headers** - Configure Content Security Policy in Tauri

## AI Integration Guidelines

### OpenAI API Usage
- **API key management** - Use environment variables (`VITE_OPENAI_API_KEY`)
- **Error handling** - Graceful degradation when API is unavailable
- **Rate limiting** - Implement client-side rate limiting
- **Cost optimization** - Use appropriate models (`gpt-4o-mini` for analysis)
- **Prompt engineering** - Clear, specific prompts for better results

### Image Analysis Features
- **Text-based analysis** - Current implementation analyzes filename/path context
- **Base64 encoding** - Future: Convert images to base64 for direct analysis
- **Caching** - Cache analysis results to reduce API calls
- **Progressive enhancement** - Start simple, add features incrementally

## Testing Guidelines

### Frontend Testing
- **Unit tests** - Test utility functions and hooks
- **Component tests** - Test React components with React Testing Library
- **Integration tests** - Test user flows and API interactions
- **Type checking** - Run TypeScript compiler in CI/CD

### Backend Testing
- **Unit tests** - Test individual Rust functions
- **Integration tests** - Test Tauri commands and event handling
- **Cross-platform testing** - Test on Windows, macOS, and Linux

## Deployment & Distribution

### Build Process
- **Development**: `npm run dev` (starts Vite dev server)
- **Production**: `npm run build` (creates optimized build)
- **Tauri build**: `npm run tauri build` (creates native installers)

### Platform-Specific Builds
- **Windows**: `.exe` installer with code signing
- **macOS**: `.dmg` or `.app` bundle with notarization
- **Linux**: `.deb`, `.rpm`, or AppImage packages

## Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature branches
- **hotfix/***: Critical bug fixes

### Commit Conventions
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Descriptive messages**: Clear, concise descriptions of changes
- **Reference issues**: Include issue numbers in commit messages

## Code Review Checklist

### Before Submitting PR
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Code follows project conventions
- [ ] Components are accessible
- [ ] Performance impact considered
- [ ] Cross-platform compatibility verified

### Review Criteria
- **Code quality**: Clean, readable, maintainable code
- **Performance**: No unnecessary re-renders or memory leaks
- **Security**: No exposed secrets or vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliance
- **Documentation**: Clear comments and documentation
- **Testing**: Adequate test coverage

## Common Pitfalls to Avoid

### React/React 19
- Don't use deprecated lifecycle methods
- Don't forget to cleanup event listeners and subscriptions
- Don't use `forwardRef` (React 19 has native ref support)
- Don't ignore TypeScript errors

### HeroUI v3
- Don't override core HeroUI styles directly
- Don't use visual variant names (solid, bordered, flat)
- Don't skip accessibility attributes
- Don't mix HeroUI v2 and v3 patterns

### Tauri/Rust
- Don't block the main thread with long operations
- Don't ignore error handling in Rust code
- Don't hardcode file paths
- Don't forget platform-specific testing

### AI Integration
- Don't expose API keys in frontend code
- Don't make synchronous API calls
- Don't ignore rate limits
- Don't cache sensitive data improperly

## Monitoring & Analytics

### Application Monitoring
- **Error tracking** - Implement error boundaries and logging
- **Performance monitoring** - Track app startup time and responsiveness
- **Usage analytics** - Track feature usage (with user consent)
- **Crash reporting** - Collect and analyze crash reports

### Health Checks
- **API connectivity** - Monitor OpenAI API availability
- **File system access** - Verify screenshot directory permissions
- **Global shortcuts** - Ensure system-wide hotkeys work
- **Memory usage** - Monitor for memory leaks

## Future Enhancements

### Planned Features
- **Direct image analysis** - Convert screenshots to base64 for AI analysis
- **Football database** - Player statistics and match data
- **Tactical analysis** - AI-powered football strategy suggestions
- **Multi-language support** - Internationalization
- **Advanced screenshot tools** - Region selection, annotations

### Technical Debt
- **Image analysis optimization** - Move from text-based to image-based analysis
- **Database integration** - Add persistent data storage
- **Advanced error handling** - Improve error recovery and user feedback
- **Performance optimization** - Optimize for large screenshot collections

---

**Remember**: This is a living document. Update these rules as the project evolves and new patterns emerge. Always refer to `c:\Users\User\WinWorkplace\football-manager\.trae\rules\heroui.md` for the most current HeroUI v3 guidelines and best practices.**