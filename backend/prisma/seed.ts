import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

async function main() {

  // Create Roles
  const adminRole = await prisma.role.create({
    data: { name: "ADMIN" }
  })

  const customerRole = await prisma.role.create({
    data: { name: "CUSTOMER" }
  })

  // Create Admin User
  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@test.com",
      password: "hashedpassword",
      role_id: adminRole.id
    }
  })

  // Create 20 fake users
  for (let i = 0; i < 20; i++) {
    await prisma.user.create({
      data: {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: "test123",
        role_id: customerRole.id
      }
    })
  }

  console.log("Seeding completed")
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())