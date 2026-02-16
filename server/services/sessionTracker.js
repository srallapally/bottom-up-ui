const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const logger = require('../utils/logger');

const SESSION_CSV_PATH = path.join(__dirname, '../../data/user-sessions.csv');

class SessionTracker {
    constructor() {
        this.ensureCSVExists();
    }

    ensureCSVExists() {
        if (!fs.existsSync(SESSION_CSV_PATH)) {
            const csvWriter = createObjectCsvWriter({
                path: SESSION_CSV_PATH,
                header: [
                    { id: 'user_id', title: 'user_id' },
                    { id: 'session_id', title: 'session_id' },
                    { id: 'created_at', title: 'created_at' },
                    { id: 'last_updated', title: 'last_updated' },
                    { id: 'status', title: 'status' },
                    { id: 'email', title: 'email' }
                ]
            });
            csvWriter.writeRecords([]);
            logger.info('Created user-sessions.csv');
        }
    }

    async getUserSession(userId) {
        return new Promise((resolve, reject) => {
            const sessions = [];

            fs.createReadStream(SESSION_CSV_PATH)
                .pipe(csv())
                .on('data', (row) => {
                    if (row.user_id === userId) {
                        sessions.push(row);
                    }
                })
                .on('end', () => {
                    // Return most recent session
                    const sorted = sessions.sort((a, b) =>
                        new Date(b.last_updated) - new Date(a.last_updated)
                    );
                    resolve(sorted[0] || null);
                })
                .on('error', reject);
        });
    }

    async createSession(userId, sessionId, email) {
        // Delete old session first (enforce 1 user = 1 session)
        await this.deleteUserSessions(userId);

        const csvWriter = createObjectCsvWriter({
            path: SESSION_CSV_PATH,
            header: [
                { id: 'user_id', title: 'user_id' },
                { id: 'session_id', title: 'session_id' },
                { id: 'created_at', title: 'created_at' },
                { id: 'last_updated', title: 'last_updated' },
                { id: 'status', title: 'status' },
                { id: 'email', title: 'email' }
            ],
            append: true
        });

        const record = {
            user_id: userId,
            session_id: sessionId,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            status: 'created',
            email
        };

        await csvWriter.writeRecords([record]);
        logger.info(`Created session ${sessionId} for user ${userId}`);
        return record;
    }

    async updateSessionStatus(userId, status) {
        const rows = await this.getAllRows();
        const updated = rows.map(row => {
            if (row.user_id === userId) {
                return {
                    ...row,
                    status,
                    last_updated: new Date().toISOString()
                };
            }
            return row;
        });

        await this.writeAllRows(updated);
        logger.info(`Updated session status to ${status} for user ${userId}`);
    }

    async deleteUserSessions(userId) {
        const rows = await this.getAllRows();
        const filtered = rows.filter(row => row.user_id !== userId);
        await this.writeAllRows(filtered);
        logger.info(`Deleted sessions for user ${userId}`);
    }

    async getAllRows() {
        return new Promise((resolve, reject) => {
            const rows = [];
            fs.createReadStream(SESSION_CSV_PATH)
                .pipe(csv())
                .on('data', (row) => rows.push(row))
                .on('end', () => resolve(rows))
                .on('error', reject);
        });
    }

    async writeAllRows(rows) {
        const csvWriter = createObjectCsvWriter({
            path: SESSION_CSV_PATH,
            header: [
                { id: 'user_id', title: 'user_id' },
                { id: 'session_id', title: 'session_id' },
                { id: 'created_at', title: 'created_at' },
                { id: 'last_updated', title: 'last_updated' },
                { id: 'status', title: 'status' },
                { id: 'email', title: 'email' }
            ]
        });
        await csvWriter.writeRecords(rows);
    }
}

module.exports = new SessionTracker();