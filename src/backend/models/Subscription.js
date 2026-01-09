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
            // Scheduled plan change fields
            scheduledPlan: row.scheduled_plan,
            scheduledBillingCycle: row.scheduled_billing_cycle,
            scheduledChangeDate: row.scheduled_change_date,
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
                    scheduled_plan ENUM('free', 'premium', 'pro') NULL,
                    scheduled_billing_cycle ENUM('monthly', 'yearly') NULL,
                    scheduled_change_date DATETIME NULL,
                    stripe_subscription_id VARCHAR(255),
                    stripe_customer_id VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
                )
            `);
            
            // Add columns if they don't exist (for existing tables)
            // MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
            const columnsToAdd = [
                { name: 'scheduled_plan', definition: "scheduled_plan ENUM('free', 'premium', 'pro') NULL" },
                { name: 'scheduled_billing_cycle', definition: "scheduled_billing_cycle ENUM('monthly', 'yearly') NULL" },
                { name: 'scheduled_change_date', definition: 'scheduled_change_date DATETIME NULL' }
            ];

            for (const column of columnsToAdd) {
                try {
                    // Check if column exists first
                    const [columns] = await pool.query(`
                        SELECT COLUMN_NAME 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'Subscriptions' 
                        AND COLUMN_NAME = ?
                    `, [column.name]);

                    if (columns.length === 0) {
                        // Column doesn't exist, add it
                        await pool.query(`ALTER TABLE Subscriptions ADD COLUMN ${column.definition}`);
                        console.log(`✅ Added column ${column.name} to Subscriptions table`);
                    }
                } catch (err) {
                    // Ignore duplicate column error
                    if (err.code !== 'ER_DUP_FIELDNAME') {
                        console.error(`Error adding column ${column.name}:`, err.message);
                    }
                }
            }
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
            scheduled_plan: data.scheduledPlan,
            scheduled_billing_cycle: data.scheduledBillingCycle,
            scheduled_change_date: data.scheduledChangeDate,
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

    // Schedule a plan change for the end of current period
    static async schedulePlanChange(subscriptionId, newPlan, billingCycle, changeDate) {
        const [result] = await pool.query(
            `UPDATE Subscriptions 
             SET scheduled_plan = ?, scheduled_billing_cycle = ?, scheduled_change_date = ?, updated_at = NOW() 
             WHERE subscription_id = ?`,
            [newPlan, billingCycle, changeDate, subscriptionId]
        );
        return result.affectedRows > 0;
    }

    // Cancel scheduled plan change
    static async cancelScheduledChange(subscriptionId) {
        const [result] = await pool.query(
            `UPDATE Subscriptions 
             SET scheduled_plan = NULL, scheduled_billing_cycle = NULL, scheduled_change_date = NULL, updated_at = NOW() 
             WHERE subscription_id = ?`,
            [subscriptionId]
        );
        return result.affectedRows > 0;
    }

    // Apply scheduled changes (should be called by a cron job)
    static async applyScheduledChanges() {
        const now = new Date();
        const [subscriptions] = await pool.query(
            `SELECT * FROM Subscriptions 
             WHERE scheduled_plan IS NOT NULL 
             AND scheduled_change_date <= ?`,
            [now]
        );

        for (const sub of subscriptions) {
            const newPeriodStart = new Date();
            const newPeriodEnd = new Date();
            
            if (sub.scheduled_billing_cycle === 'yearly') {
                newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
            } else {
                newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
            }

            await pool.query(
                `UPDATE Subscriptions 
                 SET plan = ?, billing_cycle = ?, 
                     current_period_start = ?, current_period_end = ?,
                     scheduled_plan = NULL, scheduled_billing_cycle = NULL, scheduled_change_date = NULL,
                     cancel_at_period_end = false, status = 'active',
                     updated_at = NOW() 
                 WHERE subscription_id = ?`,
                [sub.scheduled_plan, sub.scheduled_billing_cycle, newPeriodStart, newPeriodEnd, sub.subscription_id]
            );
        }

        return subscriptions.length;
    }

    static async getActiveSubscriptions() {
        const [rows] = await pool.query('SELECT * FROM Subscriptions WHERE status = ?', ['active']);
        return rows.map(this._mapToModel);
    }
}

module.exports = Subscription;
