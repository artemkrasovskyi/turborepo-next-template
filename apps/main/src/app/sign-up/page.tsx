import { SignUpForm } from '@/features/auth/components/sign-up-form';

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">Choose a handle and start using Flock.</p>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SignUpForm />
      </section>
    </main>
  );
}
