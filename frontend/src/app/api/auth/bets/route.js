import db from '../../../db/db.js';
import crashBetsDb from '../../../db/crashBetsDb.js';
import { verifyToken } from '../../../utils/auth.js';

export async function POST(req, res) {
    if (req.method === 'POST') {
       const { gameid,token } = await req.json();
        try {
           
            console.log(token);

            if (!token) return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });

            try {
                const userr = verifyToken(token);
                console.log(userr.username);
                console.log(crashBetsDb.prepare('SELECT * FROM crashBets WHERE userId = ?').all(userr.username))
              

                const existingBet = crashBetsDb.prepare('SELECT * FROM crashBets WHERE userId = ? AND gameid = ?').get(userr.username, gameid);
                console.log(existingBet)
                if (existingBet) {
                    return new Response(JSON.stringify({ bet: existingBet.betAmount }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }


                
            } catch (error) {
                console.log(error);
                return new Response(JSON.stringify({ error: 'Invalid token' }), {
                    status: 402,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } catch (err) {
            console.log(err);
            return new Response(JSON.stringify({ error: 'Internal server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } else {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
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