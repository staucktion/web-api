import healthRouter from "../endpoint/health/healthRouter";
import photoRouter from "../endpoint/photo/photoRouter";

const setupRoutes = (app) => {
  app.use(healthRouter);
  app.use(photoRouter);
};

export default setupRoutes;
