
import { Router } from "express";
import {
  createWorkflow,
  getWorkflow,
  getAllworkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
} from "../controllers/workflow.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import {validate} from "../middlewares/validate.middleware"



import {
  createWorkflowValidator,
  updateWorkflowValidator,
  workflowIdValidator,
} from "../validators/workflow.validators";

const router = Router();

router.use(authMiddleware);

router.post(
  "/create-workflow",
  validate(createWorkflowValidator),
  createWorkflow
);

router.get("/get-allWorkflow", getAllworkflow);

router.get(
  "/get-singleWorkflow/:id",
  validate(workflowIdValidator),
  getWorkflow
);

router.patch(
  "/update-workflow/:id",
  validate(workflowIdValidator),
  validate(updateWorkflowValidator),
  updateWorkflow
);

router.delete(
  "/delete-workflow/:id",
  validate(workflowIdValidator),
  deleteWorkflow
);

router.post(
  "/execute-workflow/:id/execute",
  validate(workflowIdValidator),
  executeWorkflow
);

export default router;
