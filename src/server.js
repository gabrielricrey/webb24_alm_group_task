const express = require("express");
const sequelize = require("./config/database");
const UserRouter = require("./routes/User");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Retry connection to database
async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection has been established successfully.");

      // Sync all models
      await sequelize.sync({ force: true }); // ⚠️ Obs! force: true rensar tabellerna
      console.log("✅ Database synchronized");
      return;
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("💥 Could not connect to the database after multiple attempts.");
        process.exit(1); // Avsluta appen om det inte går att ansluta
      }
    }
  }
}

// Kör databaskoppling med retry
connectWithRetry().then(() => {
  // Start server efter lyckad DB-anslutning
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
});

// Routes
app.use("/users", UserRouter);
