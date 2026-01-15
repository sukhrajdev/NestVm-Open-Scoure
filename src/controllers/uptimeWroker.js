import cron from "node-cron";
import request from "request-promise-native";
import {prisma} from "../config/prisma.js";


cron.schedule("*/30 * * * * *", async () => {
  console.log("[UptimeWorker] Running checks...");

  const monitors = await prisma.monitor.findMany();

  const now = Date.now();

  for (const monitor of monitors) {
    // First-time check OR interval reached
    const shouldCheck =
      !monitor.lastChecked ||
      now - monitor.lastChecked.getTime() >= monitor.interval * 1000;

    if (!shouldCheck) continue;

    try {
      const response = await request({
        uri: monitor.url,
        method: "GET",
        timeout: 10000,
        resolveWithFullResponse: true,
        simple: false // do NOT throw on 4xx/5xx
      });

      const status =
        response.statusCode >= 200 && response.statusCode < 400
          ? "UP"
          : "DOWN";

      await prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          status,
          lastChecked: new Date()
        }
      });

      console.log(
        `[UptimeWorker] ${monitor.monitorName} → ${status.toUpperCase()}`
      );

    } catch (error) {
      // Network error, timeout, DNS error
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          status: "DOWN",
          lastChecked: new Date()
        }
      });

      console.log(
        `[UptimeWorker] ${monitor.monitorName} → DOWN (request failed)`
      );
    }
  }
});
