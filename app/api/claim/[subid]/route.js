import { NextResponse } from 'next/server'
import { getSubidData, saveSubidData, logClaimedIP, checkIPLimit } from '@/lib/db'

export async function POST(req, { params }) {
  const subid = params.subid
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown'

  const subidData = await getSubidData(subid)
  if (!subidData) {
    return NextResponse.json({ success: false, message: 'SubID không tồn tại' }, { status: 404 })
  }

  if (subidData.claimed) {
    return NextResponse.json({ success: false, message: 'SubID đã được sử dụng rồi' }, { status: 400 })
  }

  const limitCheck = await checkIPLimit(ip, subidData.service)
  if (!limitCheck.ok) {
    return NextResponse.json({ success: false, message: limitCheck.message }, { status: 403 })
  }

  // ✅ Gửi webhook về Discord
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🎉 IP ${ip} vừa nhận coin qua dịch vụ ${subidData.service}`,
    }),
  })

  // ✅ Lưu lại: đã nhận + IP
  subidData.claimed = true
  subidData.claimedAt = new Date().toISOString()
  subidData.ip = ip
  await saveSubidData(subidData)
  await logClaimedIP(ip, subidData.service)

  return NextResponse.json({ success: true, message: 'Nhận coin thành công!' })
}
