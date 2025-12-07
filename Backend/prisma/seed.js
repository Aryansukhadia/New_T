import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { connectDB } from '../dbConnect/database.js';

const prisma = new PrismaClient();

async function main() {
    // Verify database connection using database.js
    console.log('Verifying database connection...');
    const isConnected = await connectDB();

    if (!isConnected) {
        throw new Error('Failed to connect to database. Please check your DATABASE_URL in .env file.');
    }

    const emailId = 'superadmin@gmail.com';

    // Check if superAdmin already exists
    console.log('Checking for existing SuperAdmin...');
    const existingUser = await prisma.user.findUnique({
        where: { emailId: emailId }
    });

    if (existingUser) {
        console.log('✅ SuperAdmin already exists with email:', emailId);
        console.log('📧 Email:', emailId);
        console.log('🔑 Password: SuperAdmin@123');
        return;
    }

    console.log('Creating SuperAdmin...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', saltRounds);

    const superAdmin = await prisma.user.create({
        data: {
            userId: randomUUID(),
            fullName: 'Super Admin',
            emailId: emailId,
            password: hashedPassword,
            role: 'superAdmin',
            needToResetPassword: true
        }
    });

    console.log('\n🎉 SuperAdmin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', superAdmin.emailId);
    console.log('🔑 Password: SuperAdmin@123');
    console.log('👤 Role:', superAdmin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');
}

main()
    .catch((error) => {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('\n✅ Database connection closed.');
    });