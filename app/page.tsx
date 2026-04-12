import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-6 text-white">
          College PYQ Hub
        </h1>
        <p className="text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          AKTU Previous Year Questions, Important Questions aur Syllabus ek jagah
        </p>
        <Link href="/pyq">
          <Button size="lg" className="text-lg px-12 py-7 bg-blue-600 hover:bg-blue-700">
            Browse PYQ Papers →
          </Button>
        </Link>
      </div>

      {/* Quick Options */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/pyq">
            <Card className="bg-gray-900 border-gray-700 hover:border-blue-600 transition-all h-full">
              <CardContent className="p-10 text-center">
                <h3 className="text-3xl font-semibold text-white mb-4">PYQ Papers</h3>
                <p className="text-gray-400 text-lg">Sessional 1, Sessional 2, End Semester</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/important-questions">
            <Card className="bg-gray-900 border-gray-700 hover:border-blue-600 transition-all h-full">
              <CardContent className="p-10 text-center">
                <h3 className="text-3xl font-semibold text-white mb-4">Important Questions</h3>
                <p className="text-gray-400 text-lg">Most repeated & important questions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/syllabus">
            <Card className="bg-gray-900 border-gray-700 hover:border-blue-600 transition-all h-full">
              <CardContent className="p-10 text-center">
                <h3 className="text-3xl font-semibold text-white mb-4">Syllabus</h3>
                <p className="text-gray-400 text-lg">Complete subject wise syllabus</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}