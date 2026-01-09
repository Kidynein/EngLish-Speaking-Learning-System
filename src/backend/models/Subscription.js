const pool = require('../config/database');

class Subscription {
    static _mapToModel(row) {
        if (!row) return null;
        return {
            id: row.subscription_id,
            userId: row.user_id,
            plan: row.plan,
            status: row.status,
            billingCycle: row.billing_cycle,
            currentPeriodStart: row.current_period_start,
            currentPeriodEnd: row.current_period_end,
            cancelAtPeriodEnd: row.cancel_at_period_end,
            stripeSubscriptionId: row.stripe_subscription_id,
            stripeCustomerId: row.stripe_customer_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async ensureTable() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS Subscriptions (
                    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    plan ENUM('free', 'premium', 'pro') DEFAULT 'free',
                    status ENUM('active', 'cancelled', 'expired', 'past_due') DEFAULT 'active',
                    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
                    current_period_start DATETIME,
                    current_period_end DATETIME,
                    cancel_at_period_end BOOLEAN DEFAULT FALSE,
                    stripe_subscription_id VARCHAR(255),
                    stripe_customer_id VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
                )
            `);
        } catch (error) {
            console.error('Error ensuring Subscriptions table:', error.message);
        }
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM Subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            return this._mapToModel(rows[0]);
        } catch (error) {
            // Table might not exist, try to create it
            if (error.code === 'ER_NO_SUCH_TABLE') {
                await this.ensureTable();
                return null;
            }
            throw error;
        }
    }

    static async findById(subscriptionId) {
        const [rows] = await pool.query(
            'SELECT * FROM Subscriptions WHERE subscription_id = ?',
            [subscriptionId]
        );
        return this._mapToModel(rows[0]);
    }

    static async create({ userId, plan, billingCycle = 'monthly', stripeSubscriptionId = null, stripeCustomerId = null }) {
        await this.ensureTable();
        
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        
        if (billingCycle === 'yearly') {
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        } else {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        }

        const [result] = await pool.query(
            `INSERT INTO Subscriptions 
            (user_id, plan, status, billing_cycle, current_period_start, current_period_end, stripe_subscription_id, stripe_customer_id, created_at) 
            VALUES (?, ?, 'active', ?, ?, ?, ?, ?, NOW())`,
            [userId, plan, billingCycle, currentPeriodStart, currentPeriodEnd, stripeSubscriptionId, stripeCustomerId]
        );
        return result.insertId;
    }

    static async update(subscriptionId, data) {
        const allowedFields = {
            plan: data.plan,
            status: data.status,
            billing_cycle: data.billingCycle,
            current_period_start: data.currentPeriodStart,
            current_period_end: data.currentPeriodEnd,
            cancel_at_period_end: data.cancelAtPeriodEnd,
            stripe_subscription_id: data.stripeSubscriptionId
        };

        const updates = [];
        const values = [];

        for (const [column, value] of Object.entries(allowedFields)) {
            if (value !== undefined) {
                updates.push(`${column} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return true;

        values.push(subscriptionId);
        const query = `UPDATE Subscriptions SET ${updates.join(', ')}, updated_at = NOW() WHERE subscription_id = ?`;

        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async cancel(subscriptionId) {
        const [result] = await pool.query(
            'UPDATE Subscriptions SET status = ?, cancel_at_period_end = true, updated_at = NOW() WHERE subscription_id = ?',
            ['cancelled', subscriptionId]
        );
        return result.affectedRows > 0;
    }

    static async getActiveSubscriptions() {
        const [rows] = await pool.query('SELECT * FROM Subscriptions WHERE status = ?', ['active']);
        return rows.map(this._mapToModel);
    }
}

module.exports = Subscription;
