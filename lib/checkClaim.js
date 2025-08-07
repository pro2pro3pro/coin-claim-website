import { prisma } from './db';
import { getClientIp } from 'request-ip';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

const resetHour = 0; // reset 0h hàng ngày

export async function checkClaim(ip, subid, service) {
  const today = dayjs().startOf('day').add(resetHour, 'hour').toDate();

  // Kiểm tra subid có tồn tại trong DB không
  const subidData = await prisma.subid.findFirst({
    where: {
      subid,
      service,
    },
  });

  if (!subidData) {
    return {
      allowed: false,
      message: 'Subid không hợp lệ hoặc không tồn tại.',
    };
  }

  // Kiểm tra IP đã từng claim chưa
  const existingClaim = await prisma.claim.findMany({
    where: {
      ip,
      service,
      createdAt: {
        gte: today,
      },
    },
  });

  const ipUsedByOtherAccount = await prisma.claim.findFirst({
    where: {
      ip,
      subid: {
        not: subid,
      },
    },
  });

  if (ipUsedByOtherAccount) {
    return {
      allowed: false,
      message: 'IP đã được sử dụng bởi tài khoản khác.',
    };
  }

  // Check số lượt claim theo dịch vụ
  const limitPerService = {
    yeumoney: 2,
    link4m: 1,
    bbmkts: 1,
  };

  const usedSubids = [...new Set(existingClaim.map(c => c.subid))];
  if (usedSubids.includes(subid)) {
    return {
      allowed: false,
      message: 'Bạn đã nhận coin với subid này rồi.',
    };
  }

  if (existingClaim.length >= limitPerService[service]) {
    return {
      allowed: false,
      message: `Bạn đã đạt giới hạn nhận coin với ${service} hôm nay.`,
    };
  }

  return {
    allowed: true,
    message: 'Hợp lệ, được nhận coin.',
  };
}
