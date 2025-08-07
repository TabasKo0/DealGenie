import db from '../../db/db';
import transactionDb from '../../db/transactionDb';
import { verifyToken } from '../../utils/auth';
export  async function POST(req, res) {
    if (req.method === 'POST') {
        
        
       

        const token = req.cookies.getAll()[0].value;
                   console.log(token);
       
                   if (!token) return new Response(JSON.stringify({ error: 'Invalid token' }), {
                       status: 401,
                       headers: { 'Content-Type': 'application/json' },
                   });
       
                   try {
                       const userr = verifyToken(token);
                       console.log(userr.username);

        try {

            
           let trans= transactionDb.prepare('SELECT * FROM transactions WHERE userid=?').all(userr.username);
               

            return new Response(JSON.stringify({trans}), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify("Something went wrong"), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }} catch (error) {
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