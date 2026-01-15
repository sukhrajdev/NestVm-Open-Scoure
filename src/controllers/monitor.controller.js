import { prisma } from "../config/prisma.js";

export async function createMonitor(req, res) {
    try {
        const { id } = req.user.id;
        const { name, url, interval } = req.body;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }
        if (!name || !url || !interval) {
            return res.status(400).json({ error: "Name, URL, and interval are required" });
        }
        if (name.length < 3 || name.length > 20) {
            return res.status(400).json({ error: "Name must be between 3 and 20 characters" });
        }
        if (!/^https?:\/\/.+$/.test(url)) {
            return res.status(400).json({ error: "Invalid URL format" });
        }
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.monitorCount >= user.maxMonitors) {
            return res.status(403).json({ error: "Monitor limit reached" });
        }

        const monitor = await prisma.monitor.create({
            data: {
                name,
                url,
                interval,
                userId: id
            }
        })
        await prisma.user.update({
            where: { id },
            data: {
                monitorCount: { increment: 1 }
            }
        })

        return res.status(201).json({ message: "Monitor created successfully", monitor });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateMonitor(req, res) {
    try {
        const { id } = req.user.id;
        const { monitorId } = req.params;
        const { name, url, interval } = req.body;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        if (!monitorId) {
            return res.status(400).json({ error: "Monitor ID is required" });
        }

        if (!name && !url && !interval) {
            return res.status(400).json({ error: "At least one field (name, url, interval) must be provided for update" });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
        if (!monitor || monitor.userId !== id) {
            return res.status(404).json({ error: "Monitor not found" });
        }

        const updatedMonitor = await prisma.monitor.update({
            where: { id: monitorId },
            data: {
                name: name || monitor.name,
                url: url || monitor.url,
                interval: interval || monitor.interval
            }
        });

        return res.status(200).json({ message: "Monitor updated successfully", monitor: updatedMonitor });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteMonitor(req, res) {
    try {
        const { id } = req.user.id;
        const { monitorId } = req.params;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        if (!monitorId) {
            return res.status(400).json({ error: "Monitor ID is required" });
        }
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
        if (!monitor || monitor.userId !== id) {
            return res.status(404).json({ error: "Monitor not found" });
        }

        await prisma.monitor.delete({ where: { id: monitorId } });
        await prisma.user.update({
            where: { id },
            data: {
                monitorCount: { decrement: 1 }
            }
        })
        return res.status(200).json({ message: "Monitor deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getMonitors(req, res) {
    try {
        const { id } = req.user.id;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const monitors = await prisma.monitor.findMany({ where: { userId: id } });
        return res.status(200).json({ monitors });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getMonitorById(req, res) {
    try {
        const { id } = req.user.id;
        const { monitorId } = req.params;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }
        if (!monitorId) {
            return res.status(400).json({ error: "Monitor ID is required" });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
        if (!monitor || monitor.userId !== id) {

            return res.status(404).json({ error: "Monitor not found" });
        }

        return res.status(200).json({ monitor });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
