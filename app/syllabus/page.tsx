'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const mockSyllabus = [
  { id: 1, branch: "CSE", year: 2025, sem: 3, subject: "Database Management System" },
  { id: 2, branch: "CSE", year: 2025, sem: 3, subject: "Operating Systems" },
  { id: 3, branch: "CSE", year: 2025, sem: 3, subject: "Computer Networks" },
  { id: 4, branch: "CSE", year: 2025, sem: 4, subject: "Theory of Computation" },
  { id: 5, branch: "ECE", year: 2025, sem: 3, subject: "Digital Electronics" },
];

export default function SyllabusPage() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSem, setSelectedSem] = useState("");

  const branches = ["CSE", "ECE", "Mechanical", "Civil", "Electrical"];
  const years = [2023, 2024, 2025, 2026];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const filteredSyllabus = useMemo(() => {
    return mockSyllabus.filter(s => 
      (!selectedBranch || s.branch === selectedBranch) &&
      (!selectedYear || s.year === parseInt(selectedYear)) &&
      (!selectedSem || s.sem === parseInt(selectedSem))
    );
  }, [selectedBranch, selectedYear, selectedSem]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-950 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Syllabus</h1>
        <p className="text-xl text-gray-400">Filter by Branch, Year and Semester</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-300 block mb-2">Branch</label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
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
          Showing {filteredSyllabus.length} Syllabus
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSyllabus.map((item) => (
          <Card key={item.id} className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all">
            <CardHeader>
              <CardTitle className="text-white">{item.subject}</CardTitle>
              <p className="text-gray-400">{item.branch} • {item.year} • Semester {item.sem}</p>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Download Syllabus PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSyllabus.length === 0 && (
        <p className="text-center text-gray-400 text-xl mt-20">
          No syllabus found for this selection.
        </p>
      )}
    </div>
  );
}