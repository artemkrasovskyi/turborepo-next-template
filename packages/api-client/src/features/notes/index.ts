import { prisma } from '@repo/shared/features/database';
import type { NoteSummary } from '@repo/types/features/notes';

export function createNotesClient() {
  return {
    async list(): Promise<NoteSummary[]> {
      const notes = await prisma.note.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return notes.map((note) => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      }));
    },
  };
}
