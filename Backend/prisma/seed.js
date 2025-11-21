import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const emailId = 'superadmin@gmail.com';

    // Check if superAdmin already exists
    const existingUser = await prisma.user.findUnique({
        where: { emailId: emailId }
    });

    if (existingUser) {
        console.log('SuperAdmin already exists with email:', emailId);
        return;
    }

    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

    const superAdmin = await prisma.user.create({
        data: {
            userId: randomUUID(),
            fullName: 'Super Admin',
            emailId: emailId,
            password: hashedPassword,
            role: 'superAdmin',
            resetPassword: true
        }
    });

    console.log('SuperAdmin created successfully!');
    console.log('Email:', superAdmin.emailId);
    console.log('Password: SuperAdmin@123');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());