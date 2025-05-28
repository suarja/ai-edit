# AI Edit Memory Bank

The Memory Bank is a collection of detailed implementation notes, decisions, and technical documentation for the AI Edit platform. It serves as the third tier in our documentation structure, providing in-depth technical information for core developers.

## Purpose

The Memory Bank serves several key purposes:

1. **Implementation Details**: Captures detailed implementation notes that are too specific for general documentation
2. **Decision Records**: Documents architectural and technical decisions made during development
3. **Technical Research**: Stores research findings and explorations
4. **Knowledge Persistence**: Ensures critical information is not lost between development sessions

## Relationship to Documentation Structure

The AI Edit project uses a three-tier documentation approach:

1. **[README.md](../README.md)**: High-level overview, designed for first-time visitors and stakeholders
2. **[Documentation](../docs/)**: Detailed technical information for developers working on the project
3. **Memory Bank (here)**: In-depth implementation details, decisions, and technical notes

While the general documentation in `/docs` provides a structured and maintainable overview of the system, the Memory Bank contains more granular implementation details that may be valuable for understanding specific components or decisions.

## Key Memory Bank Documents

### Onboarding Flow

- [Onboarding Component Architecture](./onboarding-component-architecture.md)
- [Onboarding Data Flow](./onboarding-data-flow.md)
- [Onboarding Survey DB Fix](./onboarding-survey-db-fix.md)
- [Onboarding Update Summary](./onboarding-update-summary.md)

### Project Context

- [Project Brief](./projectbrief.md)
- [Technical Context](./techContext.md)
- [Product Context](./productContext.md)
- [System Patterns](./systemPatterns.md)

### Implementation Documents

- [UploadThing Expo Setup](./uploadthing-expo-setup.md)
- [UploadThing File Routes](./uploadthing-file-routes.md)

### Progress Tracking

- [Progress](./progress.md)
- [Tasks](./tasks.md)
- [Active Context](./activeContext.md)

## Using the Memory Bank

When working on the AI Edit codebase:

1. **Before implementing**: Check the Memory Bank for existing research or decisions related to your task
2. **During implementation**: Reference relevant Memory Bank documents for details
3. **After implementation**: Update or create Memory Bank documents to capture important details

## Contributing to the Memory Bank

When adding to the Memory Bank:

1. Use clear, descriptive filenames with kebab-case format
2. Begin each document with a title and brief overview
3. Include relevant code snippets, diagrams, or links
4. Reference related Memory Bank documents where appropriate
5. Update existing documents when modifying related code

## Navigation

To find relevant Memory Bank documents:

1. Check this README for categorized links
2. Review related documentation in `/docs` that may reference Memory Bank documents
3. Search for keywords across the Memory Bank

## Integration with Documentation

For a more structured and streamlined view of the system, refer to the [documentation](../docs/). Memory Bank documents are referenced throughout the documentation to provide deeper insights when needed.
