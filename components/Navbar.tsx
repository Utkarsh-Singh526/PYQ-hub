'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-9 h-9 text-blue-500" />
          <span className="text-2xl font-bold tracking-tight">PYQ Hub</span>
        </div>

        <div className="flex items-center gap-8 text-lg">
          <Link href="/" className="hover:text-blue-400 transition">Home</Link>
          <Link href="/pyq" className="hover:text-blue-400 transition">PYQ</Link>
          <Link href="/important-questions" className="hover:text-blue-400 transition">Important Questions</Link>
          <Link href="/syllabus" className="hover:text-blue-400 transition">Syllabus</Link>
        </div>

        <Link href="/admin">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            👨‍💼 Admin / Editor
          </Button>
        </Link>
      </div>
    </nav>
  );
}