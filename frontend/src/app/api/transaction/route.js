import db from '../../db/db';
import transactionDb from '../../db/transactionDb';

export  async function POST(req, res) {
    if (req.method === 'POST') {
        
        const { user, amount, type,remarks } = await req.json();
        const userId = user;

        if (!userId || !amount || !type) {
            return new Response(JSON.stringify("Missing Creds"), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            const user = db.prepare('SELECT * FROM users WHERE username = ?').get(userId);

            if (!user) {
                return new Response(JSON.stringify("User Not found"), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            let newBalance = user.balance;
            if (type === 'deposit') {
                newBalance += amount;
            } else if (type === 'withdraw' && user.balance >= amount) {
                newBalance -= amount;
            } else {
                return new Response(JSON.stringify("Broke"), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            newBalance = Math.round(newBalance * 100) / 100;
            db.prepare('UPDATE users SET balance = ? WHERE username = ?')
                .run(newBalance, userId);

            transactionDb.prepare('INSERT INTO transactions (userId, amount, type, date,remarks) VALUES (?, ?, ?, ?,?)')
                .run(userId, amount, type, new Date().toISOString(),remarks);

            return new Response(JSON.stringify({balance:newBalance}), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify("Something went wrong"), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } else {
        return new Response(JSON.stringify("Nope"), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function GET(request) {
    return new Response(JSON.stringify({ user: 'John Doe' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
  }