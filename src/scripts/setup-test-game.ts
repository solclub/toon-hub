// Setup script to create test enemy and game session
import enemyModel from "../server/database/models/enemy.model";
import gameConfigService from "../server/services/game-config-service";
import dbConnect from "../server/database/mongoose";

async function setupTestGame() {
  try {
    // Connect to database
    await dbConnect();
    console.log("Connected to database");

    // Create a test enemy
    const Enemy = enemyModel();
    
    // Check if enemy already exists
    let enemy = await Enemy.findOne({ name: "Test Goblin King" });
    
    if (!enemy) {
      enemy = new Enemy({
        name: "Test Goblin King",
        image: "https://res.cloudinary.com/demo/image/upload/v1234567890/goblin-king.png", // Placeholder image
        difficulty: "MEDIUM",
        type: "BOSS",
        maxHealth: 1000,
        currentHealth: 1000,
        isDefeated: false,
        totalDamageReceived: 0,
        totalPowerReceived: 0,
      });
      
      await enemy.save();
      console.log("Created test enemy:", enemy.name);
    } else {
      console.log("Test enemy already exists:", enemy.name);
    }

    // Check if there's already an active game session
    const activeSession = await gameConfigService.getCurrentActiveSession();
    
    if (!activeSession) {
      // Start a new game session (24 hours duration)
      const session = await gameConfigService.startGameSession({
        enemyId: enemy._id.toString(),
        durationMinutes: 1440, // 24 hours
      });
      
      console.log("Created test game session:", session._id);
      console.log("Game will run for 24 hours");
    } else {
      console.log("Active game session already exists:", activeSession._id);
    }

    console.log("✅ Test game setup complete!");
    
  } catch (error) {
    console.error("❌ Error setting up test game:", error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupTestGame().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default setupTestGame;