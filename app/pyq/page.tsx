'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Eye, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Paper = {
  id: string;
  branch: string;
  year: number;
  semester: number;
  subject: string;
  paperTitle: string;
  fileUrl: string;
  type: string;
};

export default function PYQPage() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);

  const branches = ["CSE", "ECE", "AIML", "Mechanical", "Civil", "Electrical", "IT"];
  const years = [2023, 2024, 2025, 2026];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const fetchPapers = async () => {
    if (!selectedBranch || !selectedYear || !selectedSem) {
      setPapers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pyq_papers')
        .select('*')
        .eq('branch', selectedBranch)
        .eq('year', parseInt(selectedYear))
        .eq('semester', parseInt(selectedSem));

      if (error) throw error;

      setPapers(data || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [selectedBranch, selectedYear, selectedSem]);

  const filteredPapers = useMemo(() => papers, [papers]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-950 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Previous Year Question Papers</h1>
        <p className="text-xl text-gray-400">Using Supabase</p>
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

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      )}

      {!loading && (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-white">
              {filteredPapers.length} Papers Found
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <Card key={paper.id} className="bg-gray-900 border-gray-700 hover:border-blue-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-start gap-3">
                    <BookOpen className="w-6 h-6 text-blue-500 mt-1" />
                    {paper.subject}
                  </CardTitle>
                  <p className="text-blue-400">{paper.paperTitle}</p>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(paper.fileUrl, '_blank')}
                  >
                    <Eye className="mr-2 w-4 h-4" /> View
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = paper.fileUrl;
                      link.download = `${paper.subject}.pdf`;
                      link.click();
                    }}
                  >
                    <Download className="mr-2 w-4 h-4" /> Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPapers.length === 0 && !loading && (
            <p className="text-center text-gray-400 text-xl mt-20">
              No papers found. Upload some papers from Admin panel first.
            </p>
          )}
        </>
      )}
    </div>
  );
}