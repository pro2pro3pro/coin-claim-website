import { NextResponse } from 'next/server'
import { getSubidData } from '@/lib/db'

export async function GET(req, { params }) {
  const subid = params.subid
  const ip = req.headers.get('x-forwarded-for') || req.ip

  const subidData = await getSubidData(subid)

  if (!subidData) {
    return NextResponse.json({ success: false, message: 'SubID không tồn tại' }, { status: 404 })
  }

  if (subidData.claimed) {
    return NextResponse.json({ success: false, message: 'SubID đã được sử dụng' }, { status: 400 })
  }

  // TODO: Kiểm tra IP đã nhận trong ngày với dịch vụ tương ứng
  // Ví dụ: nếu vượt 2 lần YeuMoney/ngày => return lỗi

  return NextResponse.json({ success: true, message: 'SubID hợp lệ' })
}
