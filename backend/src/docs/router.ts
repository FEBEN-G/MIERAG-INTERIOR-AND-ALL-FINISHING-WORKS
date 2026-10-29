import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";

const router = Router();

router.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "MIERAG API",
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  }),
);

export default router;
