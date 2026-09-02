import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// In ES modules, __dirname is not defined by default, so we recreate it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Session management for NamoID Auth
app.use(session({
    secret: 'document-room-poc-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// ---------------------------------------------------------
// 1. NAMOID AUTHENTICATION MIDDLEWARE
// ---------------------------------------------------------
const requireAuth = (req, res, next) => {
    // Mock user injection for testing purposes
    if (!req.session.user) {
        req.session.user = { 
            id: 'user_broker_123', 
            email: 'broker@agency.com', 
            role: 'broker' 
        };
    }
    
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized. Please sign in via NamoID." });
    }
    next();
};

// Test route to verify auth
app.get('/api/me', requireAuth, (req, res) => {
    res.json(req.session.user);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Safer Document Room running on http://localhost:${PORT}`);
});