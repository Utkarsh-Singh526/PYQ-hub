'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

const mockImportantQuestions = [
  { id: 1, branch: "CSE", year: 2025, sem: 3, subject: "Database Management System", title: "Most Repeated Questions - DBMS" },
  { id: 2, branch: "CSE", year: 2025, sem: 3, subject: "Operating Systems", title: "Top 30 Important Questions - OS" },
  { id: 3, branch: "CSE", year: 2025, sem: 3, subject: "Computer Networks", title: "Important Short & Long Questions - CN" },
  { id: 4, branch: "CSE", year: 2025, sem: 4, subject: "Theory of Computation", title: "Most Important Questions - TOC" },
  { id: 5, branch: "ECE", year: 2025, sem: 3, subject: "Digital Electronics", title: "Important Questions - DE" },
];

export default function ImportantQuestionsPage() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSem, setSelectedSem] = useState("");

  const branches = ["CSE", "ECE", "Mechanical", "Civil", "Electrical"];
  const years = [2023, 2024, 2025, 2026];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const filteredQuestions = useMemo(() => {
    return mockImportantQuestions.filter(q => 
      (!selectedBranch || q.branch === selectedBranch) &&
      (!selectedYear || q.year === parseInt(selectedYear)) &&
      (!selectedSem || q.sem === parseInt(selectedSem))
    );
  }, [selectedBranch, selectedYear, selectedSem]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-950 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Important Questions</h1>
        <p className="text-xl text-gray-400">Filter by Branch, Year and Semester</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-300 block mb-2">Branch</label>
          <Select 
                 value={selectedBranch} 
                  onValueChange={(value) => setSelectedBranch(value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 h-12 text-white">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-gray-800 border-gray-600 h-12 text-white">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">Semester</label>
            <Select value={selectedSem} onValueChange={setSelectedSem}>
              <SelectTrigger className="bg-gray-800 border-gray-600 h-12 text-white">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-white">
          Showing {filteredQuestions.length} Important Questions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuestions.map((q) => (
          <Card key={q.id} className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all">
            <CardHeader>
              <CardTitle className="text-white">{q.subject}</CardTitle>
              <p className="text-blue-400">{q.title}</p>
              <p className="text-sm text-gray-500">{q.branch} • {q.year} • Semester {q.sem}</p>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Eye className="mr-2 w-4 h-4" /> View Questions
              </Button>
              <Button variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-800">
                <Download className="mr-2 w-4 h-4" /> Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <p className="text-center text-gray-400 text-xl mt-20">
          No important questions found for this selection.
        </p>
      )}
    </div>
  );
}