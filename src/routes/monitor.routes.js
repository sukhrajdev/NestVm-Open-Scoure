import express from "express";
import {
    createMonitor,
    deleteMonitor,
    getMonitors,
    getMonitorById,
    updateMonitor
} from "../controllers/monitor.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const monitorRouter = express.Router();

// Create a new monitor
monitorRouter.post("/", verifyToken, createMonitor);

// Get all monitors for the authenticated user
monitorRouter.get("/", verifyToken, getMonitors);

// Get a specific monitor by ID
monitorRouter.get("/:monitorId", verifyToken, getMonitorById);

// Update a monitor by ID
monitorRouter.put("/:monitorId", verifyToken, updateMonitor);

// Delete a monitor by ID
monitorRouter.delete("/:monitorId", verifyToken, deleteMonitor);

export default monitorRouter;
