
export async function POST(req) {
  if (req.method === 'POST') {
    try {
      const { url } = await req.json();
      const response = await fetch(url);
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      return new Response(JSON.stringify({ error: 'Error fetching data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ user: 'John Doe' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}