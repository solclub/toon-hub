# TASK.md - Toon of Ladder Feature Implementation

## Overview
Complete implementation of the "Toon of Ladder" battle game feature where users fight collaboratively against enemies using their NFT characters (Golems/Demons) with probability-based outcomes.

## Current Status
- ✅ Basic UI components exist in `src/pages/toon-of-ladder.tsx`
- ✅ Mock game interface with character selection
- ✅ Enemy model and basic conquest API (`src/server/api/conquest.ts`)
- ✅ Basic attack mechanics with probability calculation
- ❌ Real NFT integration missing
- ❌ Power-based damage system missing
- ❌ Battle result tracking missing
- ❌ Game timing/configuration missing
- ❌ Proper leaderboard integration missing

---

## BACKEND TASKS

### Database Models & Schema
- [ ] **Create Battle Result Model** (`src/server/database/models/battle-result.model.ts`)
  - [ ] Store individual character battle outcomes
  - [ ] Fields: characterMint, userWallet, enemyId, powerDealt, timestamp, success
  - [ ] Index on enemyId and timestamp for performance

- [ ] **Create Game Session Model** (`src/server/database/models/game-session.model.ts`)
  - [ ] Track overall game state and timing
  - [ ] Fields: enemyId, startTime, endTime, totalDamageDealt, isActive, winCondition
  - [ ] Single active session at a time constraint

- [ ] **Extend Enemy Model** (`src/server/database/models/enemy.model.ts`)
  - [ ] Add fields: gameSessionId, isDefeated, totalDamageReceived
  - [ ] Add created/updated timestamps

### API Endpoints & Business Logic

- [ ] **Game Configuration Service** (`src/server/services/game-config-service.ts`)
  - [ ] Admin functions to start/stop games
  - [ ] Set game duration and enemy configuration
  - [ ] Validate game state transitions

- [ ] **Enhanced Battle Service** (`src/server/api/conquest.ts`)
  - [ ] Replace mock character IDs with real NFT mints
  - [ ] Integrate user's NFT power values from database
  - [ ] Calculate damage based on character power (not fixed 1 damage)
  - [ ] Store battle results in database for winners only
  - [ ] Update enemy health with accumulated power damage
  - [ ] Check win conditions (health <= 0 OR time expired)

- [ ] **User NFT Integration** 
  - [ ] Modify `getUserNFTs` service to return character power
  - [ ] Ensure power values are accessible during battle
  - [ ] Handle multiple characters per user properly

- [ ] **Enhanced Leaderboard Service** (`src/server/services/leaderboard-service.ts`)
  - [ ] Add toon-of-ladder specific leaderboard queries
  - [ ] Aggregate battle results by user/character
  - [ ] Calculate total damage dealt per user
  - [ ] Calculate win rates and participation stats
  - [ ] Support real-time leaderboard updates

### tRPC Router Enhancements

- [ ] **Game Management Router** (`src/server/api/game-management.ts`)
  - [ ] `startGame` - Admin procedure to initiate new game session
  - [ ] `endGame` - Admin procedure to end current game
  - [ ] `getGameStatus` - Public procedure for current game state
  - [ ] `getGameConfig` - Public procedure for game settings

- [ ] **Enhanced Conquest Router** (`src/server/api/conquest.ts`)
  - [ ] Modify `attackEnemy` to accept NFT mints instead of mock IDs
  - [ ] Add user authentication requirement
  - [ ] Validate user owns the NFTs being used
  - [ ] Return detailed battle results with power calculations
  - [ ] Add rate limiting to prevent spam attacks

- [ ] **Leaderboard Router Updates** (`src/server/api/leaderboard.ts`)
  - [ ] Add `getToonOfLadderLeaderboard` procedure
  - [ ] Add `getUserBattleStats` procedure
  - [ ] Add `getGameParticipants` procedure for active players count

---

## FRONTEND TASKS

### Game Interface Improvements

- [ ] **Real NFT Integration** (`src/pages/toon-of-ladder.tsx`)
  - [ ] Replace mock characters with user's actual NFTs
  - [ ] Fetch user NFTs on component mount
  - [ ] Display character power values in UI
  - [ ] Show character images from NFT metadata
  - [ ] Handle empty NFT collection gracefully

- [ ] **Enhanced Game State Management**
  - [ ] Add game session status display (active/inactive)
  - [ ] Show game timer countdown
  - [ ] Display total participants and damage dealt
  - [ ] Real-time updates using tRPC subscriptions or polling

- [ ] **Improved Battle Mechanics**
  - [ ] Show power-based damage calculations
  - [ ] Display individual character success/failure with power dealt
  - [ ] Update combat log with meaningful battle information
  - [ ] Animate damage numbers based on actual power values

- [ ] **User Experience Enhancements**
  - [ ] Add character power sorting/filtering options
  - [ ] Show character cooldowns or usage limits if needed
  - [ ] Improved error handling and user feedback
  - [ ] Loading states for all async operations

### Leaderboard Integration

- [ ] **Real Leaderboard Data** (`src/pages/toon-of-ladder.tsx`)
  - [ ] Replace mock leaderboard with real API data
  - [ ] Show actual user stats (damage dealt, wins, participation)
  - [ ] Real-time leaderboard updates during active games
  - [ ] User highlighting in leaderboard

- [ ] **Statistics Display**
  - [ ] Replace mock participant counts with real data
  - [ ] Show current game progress percentage
  - [ ] Display time remaining in current game
  - [ ] Winner announcements and rewards display

### Authentication & Authorization

- [ ] **Wallet Connection Requirements**
  - [ ] Require wallet connection to participate
  - [ ] Show connect wallet prompt for non-connected users
  - [ ] Validate user session before allowing battles

- [ ] **Admin Interface** (Optional)
  - [ ] Admin panel for game management
  - [ ] Start/stop game controls
  - [ ] Enemy configuration interface
  - [ ] Game statistics dashboard

---

## SYSTEM INTEGRATION TASKS

### Real-time Updates
- [ ] **Implement Polling/Subscriptions**
  - [ ] Enemy health updates in real-time
  - [ ] Leaderboard updates during battles
  - [ ] Game state changes (start/end)
  - [ ] Participant count updates

### Performance & Scalability
- [ ] **Database Optimization**
  - [ ] Add proper indexes for battle queries
  - [ ] Optimize leaderboard aggregation queries
  - [ ] Consider caching for frequently accessed data

- [ ] **Rate Limiting**
  - [ ] Prevent battle spam from individual users
  - [ ] Limit API calls per user per time period
  - [ ] Consider character-specific cooldowns

### Testing & Validation
- [ ] **Battle Logic Testing**
  - [ ] Test probability calculations
  - [ ] Validate power-based damage systems
  - [ ] Test edge cases (0 health, time expiry)

- [ ] **Integration Testing**
  - [ ] Test full battle flow with real NFTs
  - [ ] Validate leaderboard calculations
  - [ ] Test concurrent user battles

---

## DEPLOYMENT TASKS

### Environment Configuration
- [ ] **Game Settings Configuration**
  - [ ] Environment variables for game timing
  - [ ] Difficulty probability settings
  - [ ] Admin authentication setup

### Monitoring & Analytics
- [ ] **Game Analytics**
  - [ ] Track participation rates
  - [ ] Monitor battle outcomes
  - [ ] Game performance metrics

---

## PRIORITY LEVELS

**HIGH PRIORITY (Core Functionality)**
- Real NFT integration
- Power-based damage calculation
- Battle result storage
- Basic leaderboard integration

**MEDIUM PRIORITY (Enhanced Experience)**
- Real-time updates
- Game session management
- Admin interface
- Advanced statistics

**LOW PRIORITY (Polish & Optimization)**
- Rate limiting
- Performance optimization
- Advanced analytics
- UI enhancements

---

## DEFINITION OF DONE

Each task is considered complete when:
- [ ] Code is implemented and tested
- [ ] Integration with existing system verified
- [ ] UI updates are responsive and accessible
- [ ] Error handling is implemented
- [ ] Performance impact is acceptable
- [ ] Documentation is updated if needed

---

**Next Steps**: Start with HIGH PRIORITY backend tasks to establish core functionality, then move to frontend integration.