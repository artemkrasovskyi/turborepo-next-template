import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  const ada = await prisma.user.create({
    data: {
      username: 'ada',
      displayName: 'Ada Lovelace',
      bio: 'Mathematician and writer.',
      createdAt: hoursAgo(40),
    },
  });

  const grace = await prisma.user.create({
    data: {
      username: 'grace',
      displayName: 'Grace Hopper',
      bio: 'Compiler pioneer.',
      createdAt: hoursAgo(39),
    },
  });

  const alan = await prisma.user.create({
    data: {
      username: 'alan',
      displayName: 'Alan Turing',
      bio: 'Mathematician and computer scientist.',
      createdAt: hoursAgo(38),
    },
  });

  const margaret = await prisma.user.create({
    data: {
      username: 'margaret',
      displayName: 'Margaret Hamilton',
      bio: 'Software engineering pioneer.',
      createdAt: hoursAgo(37),
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: ada.id, followingId: grace.id },
      { followerId: ada.id, followingId: alan.id },
    ],
  });

  const gracePost = await prisma.post.create({
    data: {
      authorId: grace.id,
      body: 'Just shipped a new compiler optimization. Builds are 20% faster now!',
      createdAt: hoursAgo(1),
    },
  });

  await prisma.post.create({
    data: {
      authorId: alan.id,
      body: 'Thinking about machines that think. What does it mean for a machine to "understand"?',
      createdAt: hoursAgo(2),
    },
  });

  await prisma.post.create({
    data: {
      authorId: ada.id,
      body: 'Working on a new set of notes about the Analytical Engine. More soon.',
      createdAt: hoursAgo(3),
    },
  });

  await prisma.post.create({
    data: {
      authorId: margaret.id,
      body: 'Margins of error matter. Always plan for the unexpected case.',
      createdAt: hoursAgo(4),
    },
  });

  await prisma.post.create({
    data: {
      authorId: alan.id,
      parentId: gracePost.id,
      body: 'Congrats! Compiler performance work is so underrated.',
      createdAt: hoursAgo(0.5),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
