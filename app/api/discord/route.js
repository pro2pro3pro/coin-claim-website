export async function POST(req) {
  try {
    const body = await req.json();
    if (body && body.type === 1) return new Response(JSON.stringify({ type: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ error: 'Placeholder: implement full interaction logic here' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
