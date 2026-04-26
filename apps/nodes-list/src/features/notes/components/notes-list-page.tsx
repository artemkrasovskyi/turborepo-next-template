import { createNotesClient } from '@repo/api-client/features/notes';

const notesClient = createNotesClient();

export async function NotesListPage() {
  const notes = await notesClient.list();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-slate-950">Notes</h1>
      <div className="mt-6 grid gap-4">
        {notes.map((note) => (
          <article key={note.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{note.title}</h2>
            {note.content ? <p className="mt-2 text-slate-700">{note.content}</p> : null}
          </article>
        ))}
      </div>
    </main>
  );
}
