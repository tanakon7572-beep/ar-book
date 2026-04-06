const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // 1. Initialize Site Settings with Vibrant Pink
    await prisma.siteSettings.upsert({
        where: { id: 1 },
        update: {
            backgroundColor: '#ff0080',
            siteTitle: 'AR Photo Book | สื่อรักผ่านภาพถ่าย',
        },
        create: {
            id: 1,
            siteTitle: 'AR Photo Book | สื่อรักผ่านภาพถ่าย',
            backgroundType: 'gradient',
            backgroundColor: '#ff0080',
        }
    })

    // 2. Create sample shelves
    const shelf1 = await prisma.shelf.upsert({
        where: { id: 1 },
        update: { name: 'ความทรงจำปี 2024' },
        create: { id: 1, name: 'ความทรงจำปี 2024', order: 0 },
    })
    const shelf2 = await prisma.shelf.upsert({
        where: { id: 2 },
        update: { name: 'ทริปท่องเที่ยว' },
        create: { id: 2, name: 'ทริปท่องเที่ยว', order: 1 },
    })

    // 3. Create sample books with vibrant colors
    await prisma.book.upsert({
        where: { id: 1 },
        update: { title: 'วันวาเลนไทน์', coverColor: '#ff0080' },
        create: { id: 1, title: 'วันวาเลนไทน์', coverColor: '#ff0080', spineColor: '#300010', shelfId: shelf1.id, order: 0 },
    })
    await prisma.book.upsert({
        where: { id: 2 },
        update: { title: 'วันเกิด', coverColor: '#bf40ff' },
        create: { id: 2, title: 'วันเกิด', coverColor: '#bf40ff', spineColor: '#100030', shelfId: shelf1.id, order: 1 },
    })
    await prisma.book.upsert({
        where: { id: 3 },
        update: { title: 'ทริปญี่ปุ่น', coverColor: '#ff4d94' },
        create: { id: 3, title: 'ทริปญี่ปุ่น', coverColor: '#ff4d94', spineColor: '#300020', shelfId: shelf2.id, order: 0 },
    })

    console.log('✅ Seed data updated with Vibrant Pink theme')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
