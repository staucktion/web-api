import express, { Router } from "express";
import Config from "src/config/Config";

class HealthEndpoint {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/health", (req, res) => {
      res.status(200).json({
        status: "UP",
      });
    });

    this.router.get("/health/info", (req, res) => {
      res.status(200).json({
        status: "UP",
        mode: Config.mode,
        description: "this API provides the core functionality of the St{au}cktion project.",
      });
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default HealthEndpoint;
