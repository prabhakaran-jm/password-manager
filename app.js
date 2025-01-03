const fastify = require('fastify')({ logger: true });
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const crypto = require('crypto');
require('dotenv').config();

// Register static file serving
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/'
});

const db = new Database('passwords.db');

// Database initialization
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    );
    
    CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        website TEXT,
        username TEXT,
        password TEXT,
        iv TEXT,
        auth_tag TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
`);

// Authentication middleware
const authenticate = async (request, reply) => {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('No token provided');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded;
    } catch (err) {
        reply.code(401).send({ error: 'Authentication failed' });
    }
};

// Encryption functions
const getEncryptionKey = () => {
    return crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
};

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        encrypted: encrypted,
        authTag: authTag.toString('hex')
    };
};

const decrypt = (encrypted, iv, authTag) => {
    try {
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            getEncryptionKey(),
            Buffer.from(iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return null;
    }
};

// Routes
fastify.get('/', (request, reply) => {
    return reply.sendFile('index.html');
});

fastify.post('/register', async (request, reply) => {
    const { username, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
            .run(username, hashedPassword);
        reply.code(201).send({ message: 'User registered successfully' });
    } catch (err) {
        reply.code(400).send({ error: 'Username already exists' });
    }
});

fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
        return reply.code(404).send({ error: 'User does not exist, please sign up first' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
        return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    reply.send({ token });
});

fastify.post('/passwords', { preHandler: authenticate }, async (request, reply) => {
    const { website, username, password } = request.body;
    const encryptedData = encrypt(password);
    
    db.prepare(`
        INSERT INTO passwords (user_id, website, username, password, iv, auth_tag)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        request.user.id,
        website,
        username,
        encryptedData.encrypted,
        encryptedData.iv,
        encryptedData.authTag
    );
    
    reply.code(201).send({ message: 'Password saved successfully' });
});

fastify.get('/passwords', { preHandler: authenticate }, async (request, reply) => {
    const passwords = db.prepare(`
        SELECT id, website, username, password, iv, auth_tag, created_at
        FROM passwords
        WHERE user_id = ?
        ORDER BY website ASC
    `).all(request.user.id);
    
    const decryptedPasswords = passwords.map(p => ({
        id: p.id,
        website: p.website,
        username: p.username,
        password: '••••••••',
        created_at: p.created_at,
        hasPassword: true
    }));
    
    reply.send({ passwords: decryptedPasswords });
});

fastify.get('/passwords/:id/reveal', { preHandler: authenticate }, async (request, reply) => {
    const password = db.prepare(`
        SELECT password, iv, auth_tag
        FROM passwords
        WHERE id = ? AND user_id = ?
    `).get(request.params.id, request.user.id);
    
    if (!password) {
        return reply.code(404).send({ error: 'Password not found' });
    }
    
    const decrypted = decrypt(password.password, password.iv, password.auth_tag);
    reply.send({ password: decrypted });
});

fastify.delete('/passwords/:id', { preHandler: authenticate }, async (request, reply) => {
    const result = db.prepare(`
        DELETE FROM passwords 
        WHERE id = ? AND user_id = ?
    `).run(request.params.id, request.user.id);
    
    if (result.changes === 0) {
        reply.code(404).send({ error: 'Password not found' });
        return;
    }
    
    reply.send({ message: 'Password deleted successfully' });
});

// Start server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
