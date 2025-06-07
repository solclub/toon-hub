// Simple Node.js script to setup test game data
const { MongoClient } = require('mongodb');

async function setupTestGame() {
  const uri = "mongodb://mongo:EG2HEe3EdA6eDaCebbh24aG2gC6CggG6@viaduct.proxy.rlwy.net:18509";
  const dbName = "rudegolems-dev";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db(dbName);
    
    // Create test enemy
    const enemiesCollection = db.collection('enemies');
    
    // Check if test enemy exists
    let enemy = await enemiesCollection.findOne({ name: "Test Goblin King" });
    
    if (!enemy) {
      const enemyDoc = {
        name: "Test Goblin King",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop", // Free test image
        difficulty: "MEDIUM",
        type: "BOSS",
        maxHealth: 1000,
        currentHealth: 1000,
        isDefeated: false,
        totalDamageReceived: 0,
        totalPowerReceived: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await enemiesCollection.insertOne(enemyDoc);
      enemy = { _id: result.insertedId, ...enemyDoc };
      console.log("✅ Created test enemy:", enemy.name);
    } else {
      console.log("ℹ️  Test enemy already exists:", enemy.name);
    }
    
    // Create test game session
    const gameSessionsCollection = db.collection('game_sessions');
    
    // Check if there's an active session
    const activeSession = await gameSessionsCollection.findOne({ isActive: true });
    
    if (!activeSession) {
      const startTime = new Date();
      const scheduledEndTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      
      const sessionDoc = {
        enemyId: enemy._id,
        status: "ACTIVE",
        startTime: startTime,
        endTime: null,
        scheduledEndTime: scheduledEndTime,
        totalDamageDealt: 0,
        totalPowerDealt: 0,
        participantCount: 0,
        battleCount: 0,
        winCondition: null,
        isActive: true,
        createdAt: startTime,
        updatedAt: startTime
      };
      
      const result = await gameSessionsCollection.insertOne(sessionDoc);
      console.log("✅ Created test game session:", result.insertedId);
      console.log("🎮 Game will run for 24 hours");
      
      // Update enemy with game session reference
      await enemiesCollection.updateOne(
        { _id: enemy._id },
        { 
          $set: { 
            gameSessionId: result.insertedId,
            updatedAt: new Date()
          } 
        }
      );
      console.log("✅ Updated enemy with game session reference");
      
    } else {
      console.log("ℹ️  Active game session already exists:", activeSession._id);
    }
    
    console.log("\n🎉 Test game setup complete!");
    console.log("📝 You can now test the toon-of-ladder page");
    
  } catch (error) {
    console.error("❌ Error setting up test game:", error);
  } finally {
    await client.close();
  }
}

setupTestGame();