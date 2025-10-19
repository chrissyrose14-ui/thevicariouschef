import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold">The Vicarious Chef</h1>
        <p className="text-slate-600 mt-2">
          Play the prototype: chefs guide contestants in real time. Includes timer→points, judge voting, and Shamony Mode.
        </p>
        <Link href="/vicarious-chef" className="inline-block mt-6 px-4 py-2 rounded-lg bg-black text-white">
          Enter Prototype
        </Link>
      </div>
    </main>
  );
}
