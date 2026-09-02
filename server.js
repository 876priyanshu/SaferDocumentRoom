import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto'; // For generating unique IDs

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'document-room-poc-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.session.user = { id: 'user_broker_123', email: 'broker@agency.com', role: 'broker' };

    }
    next();
};


const db = {
    rooms: [],        // { id, brokerId, applicantEmail, status, expiresAt, createdAt }
    documents: [],    // { id, roomId, uploaderId, filename, requirementName, revokedAt, createdAt }
    auditLogs: []     // { id, roomId, actorId, action, targetId, timestamp }
};


const logAudit = (roomId, actorId, action, targetId = null) => {
    db.auditLogs.push({
        id: crypto.randomUUID(),
        roomId,
        actorId,
        action,
        targetId,
        timestamp: new Date().toISOString()
    });
    console.log(`[AUDIT] Room:${roomId} | Actor:${actorId} | Action:${action}`);
};


app.post('/api/rooms', requireAuth, (req, res) => {
    const { applicantEmail, daysUntilExpiry } = req.body;
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (daysUntilExpiry || 7));

    const newRoom = {
        id: crypto.randomUUID(),
        brokerId: req.session.user.id,
        applicantEmail,
        status: 'OPEN',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
    };

    db.rooms.push(newRoom);
    logAudit(newRoom.id, req.session.user.id, 'ROOM_CREATED');
    
    res.status(201).json(newRoom);
});


app.get('/api/rooms/:roomId', requireAuth, (req, res) => {
    const room = db.rooms.find(r => r.id === req.params.roomId);
    
    if (!room) return res.status(404).json({ error: "Room not found" });


    if (new Date() > new Date(room.expiresAt)) {
        logAudit(room.id, req.session.user.id, 'EXPIRED_ROOM_ACCESS_ATTEMPT');
        return res.status(403).json({ error: "Access to this room has expired." });
    }

  
    const roomDocs = db.documents.filter(d => d.roomId === room.id);
    const roomLogs = db.auditLogs.filter(l => l.roomId === room.id);

    logAudit(room.id, req.session.user.id, 'ROOM_VIEWED');

    res.json({
        room,
        documents: roomDocs,
        auditTrail: roomLogs
    });
});

// Current User Test Route
app.get('/api/me', requireAuth, (req, res) => {
    res.json(req.session.user);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Safer Document Room running on http://localhost:${PORT}`));