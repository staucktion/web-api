import express from "express";
import setupRoutes from "./src/route/route";
import envVariables from "src/env/envVariables";

const app = express();

// Setup routes
setupRoutes(app);

app.listen(envVariables.PORT, () => {
  console.log(`API running at: http://localhost:${envVariables.PORT}`);
});
