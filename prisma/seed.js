// JS seed using better-sqlite3 adapter (required by Prisma 7)
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
    // Create sample shelves
    const shelf1 = await prisma.shelf.create({
        data: { name: 'ความทรงจำปี 2024', order: 0 },
    })
    const shelf2 = await prisma.shelf.create({
        data: { name: 'ทริปท่องเที่ยว', order: 1 },
    })

    await prisma.book.createMany({
        data: [
            { title: 'วันวาเลนไทน์', coverColor: '#8B2252', spineColor: '#5C1A38', shelfId: shelf1.id, order: 0 },
            { title: 'วันเกิด', coverColor: '#1A5276', spineColor: '#0D2B3E', shelfId: shelf1.id, order: 1 },
            { title: 'ครบรอบ 1 ปี', coverColor: '#7D6608', spineColor: '#4D4000', shelfId: shelf1.id, order: 2 },
            { title: 'เชียงใหม่', coverColor: '#145A32', spineColor: '#0B3B22', shelfId: shelf2.id, order: 0 },
            { title: 'เกาหลี 2024', coverColor: '#4A235A', spineColor: '#2E1A38', shelfId: shelf2.id, order: 1 },
        ],
    })

    console.log('✅ Seed data created — 2 ชั้น, 5 หนังสือ')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
