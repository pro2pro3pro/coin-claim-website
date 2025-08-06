// lib/db.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;
export async function saveSubidData(updatedSubid) {
  const data = await fs.readFile(filePath, 'utf8')
  const subids = JSON.parse(data)

  const index = subids.findIndex(item => item.subid === updatedSubid.subid)
  if (index !== -1) {
    subids[index] = updatedSubid
    await fs.writeFile(filePath, JSON.stringify(subids, null, 2))
  }
}
