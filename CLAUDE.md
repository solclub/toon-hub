# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Architecture Overview

This is a Next.js application for the "Toon Hub" - a platform for managing NFT characters (Golems and Demons) in various games including a conquest/battle system and "Toon of Ladder" competitions.

### Core Technology Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Styled Components
- **API**: tRPC for type-safe API calls
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Solana wallet integration
- **Blockchain**: Solana Web3.js with Metaplex for NFT operations

### Key Architecture Components

**API Structure (tRPC Routers)**:
- Located in `src/server/api/`
- Main router at `src/server/api/router/_app.ts` combines all sub-routers
- Individual routers: `auth`, `nfts`, `users`, `catalog`, `upgrade`, `feature`, `leaderboard`, `weapons`, `conquest`
- All procedures defined in router files use either `publicProcedure` or `protectedProcedure`

**Database Models**:
- All models in `src/server/database/models/`
- Key models: `user.model.ts`, `nft.model.ts`, `enemy.model.ts`, `weapon.model.ts`
- Connection handled by `src/server/database/mongoose.ts`

**NFT System**:
- Two main NFT types: `GOLEM` and `DEMON` (defined in `NFTType` enum)
- NFTs have upgrades: Golems (ORIGINAL, REWORK, CARTOON), Demons (ORIGINAL, CARTOON)
- NFT service handles on-chain fetching and database syncing in `src/server/services/nfts-service.ts`

**Wallet Integration**:
- Solana wallet adapter with multiple wallet providers (Phantom, Solflare, Backpack, Glow)
- Client-side wallet provider at `src/contexts/ClientWalletProvider.tsx`
- Authentication through signed messages

**Game Features**:
- **Conquest System**: Battle mechanics where characters fight enemies with probability-based outcomes
- **Toon of Ladder**: Competition/leaderboard system
- **Equipment/Weapons**: Tiered weapon system (COMMON, RARE, EPIC, LEGENDARY, MYTHIC, SECRET)

### File Organization Patterns

**Pages**: 
- Main game pages: `index.tsx`, `toon-of-ladder.tsx`, `conquest.tsx`
- Profile system: `profile/[mint].tsx` for individual NFT pages

**Components**:
- Common reusable components in `src/components/common/`
- Feature-specific components in `src/components/[feature-name]/`
- Layout wrapper in `src/components/Layout.tsx`

**Services**:
- Business logic in `src/server/services/`
- Each service handles specific domain: `nfts-service.ts`, `war-service.ts`, `weapon-service.ts`, etc.

### Important Development Notes

**Environment Setup**:
- Environment variables validated at build time via `src/env/server.mjs`
- MongoDB connection required: `MONGODB_URI` and `MONGODB_DB_NAME`
- Solana RPC endpoint: `NEXT_PUBLIC_RPC_NODE`

**TypeScript Configuration**:
- Base URL set to `src/` for cleaner imports
- Strict mode enabled with `noUncheckedIndexedAccess`

**Image Handling**:
- Static assets in `src/assets/images/` and `src/assets/weapons/`
- SVG imports handled by custom webpack config
- Remote image patterns configured for Arweave, Cloudinary, Discord CDN

**Database Patterns**:
- All models use factory functions that check `mongoose.models` first to prevent re-compilation
- ObjectId from MongoDB used for `_id` fields
- Enum types defined alongside models for consistency

**Battle System Logic**:
- Win probabilities: EASY (70%), MEDIUM (50%), HARD (30%)
- Damage calculation based on character power and RNG
- Battle results stored for leaderboard tracking

When working on new features, follow the established patterns:
1. Create tRPC router procedures in appropriate router file
2. Add database models if needed in `models/` directory
3. Implement business logic in corresponding service file
4. Create React components following the component organization
5. Use TypeScript throughout with proper type definitions