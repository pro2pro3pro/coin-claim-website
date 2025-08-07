// app/api/discord/route.js

export async function POST(req) {
  try {
    const body = await req.json();

    // Discord gửi type: 1 để xác thực endpoint
    if (body.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: Xử lý các loại interaction khác (slash command /getcoin, v.v.)
    return new Response(JSON.stringify({ message: "Chưa xử lý interaction này" }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Lỗi xử lý request" }), {
      status: 400,
    });
  }
}
