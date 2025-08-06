import { NextResponse } from 'next/server';

const SHORTEN_LINKS = {
  link4m: 'https://link4m.co/api-shorten/v2?api=6546120e63db5f22fe3895af&url=',
  yeumoney: 'https://yeumoney.com/QL_api.php?token=0dce414c23a83be658f673f1ca2a8f4cf9f4b0159a77982f7b24159485ba4d8c&url=',
  bbmkts: 'https://bbmakts.com/ql?token=9603c4d2b8ddcfaad8f592e9&longurl='
};

const BASE_CLAIM_URL = 'https://coin-claim-website.vercel.app/'; // 👈 đổi thành tên miền thật của bạn

async function generateShortLink(service, subid) {
  const url = `${SHORTEN_LINKS[service]}${BASE_CLAIM_URL}${subid}`;
  const res = await fetch(url);
  const text = await res.text();
  return text;
}

export async function POST(req) {
  const body = await req.json();

  if (body.type === 1) {
    // Ping check
    return NextResponse.json({ type: 1 });
  }

  if (body.type === 2 && body.data.name === 'getcoin') {
    const service = body.data.options[0].value;
    const subid = Math.random().toString(36).substring(2, 10); // random subid

    const shortLink = await generateShortLink(service, subid);

    return NextResponse.json({
      type: 4,
      data: {
        content: `🎉 Đây là link rút gọn của bạn (${service}):\n${shortLink}`
      }
    });
  }

  return NextResponse.json({ type: 4, data: { content: 'Có gì đó sai sai!' } });
}
