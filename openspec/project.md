## Overview

**Flock** is a minimal Twitter-like microblogging platform. Users can post short messages, follow others, and browse a personalised feed. The focus is on simplicity and a fast, real-time feel over feature breadth.

## Goals

- Ship a working social feed with posts, follows, and likes as a v1 baseline
- Keep the codebase small and understandable — no premature abstractions
- Use the existing monorepo infrastructure (Prisma, shared packages, two Next.js apps) without adding new layers
- Deliver a consistent, fast UI across both apps with minimal client-side state

See [`openspec/specs/architecture/spec.md`](./specs/architecture/spec.md) for app responsibilities and architectural principles.
