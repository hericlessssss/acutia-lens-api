import { PrismaClient, Role, PhotographerStatus, EventStatus, Photographer, Event } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // ─── Admin User ──────────────────────────────────────────────
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@acutialens.com' },
        update: {},
        create: {
            name: 'Admin Acutia',
            email: 'admin@acutialens.com',
            passwordHash: adminPasswordHash,
            role: Role.ADMIN,
        },
    });
    console.log(`  ✅ Admin: ${admin.email}`);

    // ─── Client User ────────────────────────────────────────────
    const clientPasswordHash = await bcrypt.hash('cliente123', 10);
    const client = await prisma.user.upsert({
        where: { email: 'joao@email.com' },
        update: {},
        create: {
            name: 'João Silva',
            email: 'joao@email.com',
            passwordHash: clientPasswordHash,
            role: Role.CLIENT,
        },
    });
    console.log(`  ✅ Client: ${client.email}`);

    // ─── Photographers ──────────────────────────────────────────
    const photographerData = [
        { name: 'Ricardo Lemos', email: 'ricardo@foto.com', status: PhotographerStatus.APROVADO },
        { name: 'Ana Beatriz', email: 'ana@foto.com', status: PhotographerStatus.APROVADO },
        { name: 'Carlos Mendes', email: 'carlos@foto.com', status: PhotographerStatus.PENDENTE },
        { name: 'Juliana Rocha', email: 'juliana@foto.com', status: PhotographerStatus.APROVADO },
    ];

    const passwordHash = await bcrypt.hash('foto123', 10);
    const photographers: Photographer[] = [];

    for (const p of photographerData) {
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: {},
            create: {
                name: p.name,
                email: p.email,
                passwordHash,
                role: Role.PHOTOGRAPHER,
            },
        });

        const photographer = await prisma.photographer.upsert({
            where: { userId: user.id },
            update: { status: p.status },
            create: {
                userId: user.id,
                status: p.status,
            },
        });

        photographers.push(photographer);
        console.log(`  ✅ Photographer: ${p.name} (${p.status})`);
    }

    // ─── Events ──────────────────────────────────────────────────
    const eventsData = [
        {
            name: 'Gama x Rival FC — Campeonato Brasiliense',
            date: new Date('2025-03-15'),
            location: 'Estádio Bezerrão, Gama-DF',
            thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
            status: EventStatus.ATIVO,
        },
        {
            name: 'Noite no Bezerrão — Show de Luzes',
            date: new Date('2025-02-28'),
            location: 'Estádio Bezerrão, Gama-DF',
            thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400',
            status: EventStatus.ENCERRADO,
        },
        {
            name: 'Final da Copa — Gama FC x Brasília FC',
            date: new Date('2025-04-20'),
            location: 'Estádio Mané Garrincha, Brasília-DF',
            thumbnailUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400',
            status: EventStatus.ATIVO,
        },
        {
            name: 'Festival de Verão — Arena Capital',
            date: new Date('2025-01-10'),
            location: 'Arena Capital, Brasília-DF',
            thumbnailUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400',
            status: EventStatus.ENCERRADO,
        },
        {
            name: 'Clássico do Cerrado — Semifinal',
            date: new Date('2025-05-05'),
            location: 'Estádio Serejão, Taguatinga-DF',
            thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c643e78a2?w=400',
            status: EventStatus.ATIVO,
        },
    ];

    const events: Event[] = [];
    for (const e of eventsData) {
        const event = await prisma.event.create({ data: e });
        events.push(event);
        console.log(`  ✅ Event: ${event.name}`);
    }

    // ─── Photos ──────────────────────────────────────────────────
    const tags = ['torcida', 'arquibancada', 'familia', 'jogador', 'campo', 'gol', 'camarote', 'comemoração', 'festa', 'selfie'];
    const prices = [990, 1490, 1990, 2490, 2990];
    const approvedPhotographers = photographers.filter((_, idx) => photographerData[idx].status === PhotographerStatus.APROVADO);

    const photoUrls = [
        'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800',
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
        'https://images.unsplash.com/photo-1461896836934-bd45ba93247a?w=800',
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
        'https://images.unsplash.com/photo-1508098682722-e99c643e78a2?w=800',
        'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    ];

    let photoCount = 0;

    for (const event of events) {
        const numPhotos = 3 + Math.floor(Math.random() * 3); // 3-5 photos per event
        for (let i = 0; i < numPhotos; i++) {
            const photographer = approvedPhotographers[i % approvedPhotographers.length];
            const photoUrl = photoUrls[(photoCount + i) % photoUrls.length];
            const photoTags = [tags[i % tags.length], tags[(i + 3) % tags.length]];
            const price = prices[i % prices.length];

            await prisma.photo.create({
                data: {
                    url: photoUrl,
                    originalUrl: photoUrl,
                    eventId: event.id,
                    photographerId: photographer.id,
                    tags: photoTags,
                    priceCents: price,
                    width: 1920,
                    height: 1280,
                },
            });

            photoCount++;
        }

        // Update event photo count
        await prisma.event.update({
            where: { id: event.id },
            data: { photoCount: { increment: numPhotos } },
        });

        console.log(`  📷 ${numPhotos} photos added to "${event.name}"`);
    }

    // Update photographer photo counts
    for (const photographer of approvedPhotographers) {
        const count = await prisma.photo.count({
            where: { photographerId: photographer.id },
        });
        await prisma.photographer.update({
            where: { id: photographer.id },
            data: { photosCount: count },
        });
    }

    console.log(`\n✨ Seed completed! ${photoCount} photos across ${events.length} events.`);
    console.log('\n👤 Credentials:');
    console.log('   Admin:    admin@acutialens.com / admin123');
    console.log('   Client:   joao@email.com / cliente123');
    console.log('   Fotógrafo: ricardo@foto.com / foto123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
