'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Eye, Loader2 } from 'lucide-react';
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
  is_common: boolean;
};

export default function PYQPage() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedType, setSelectedType] = useState("");   // ← New
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);

  const branches = ["CSE", "ECE", "Mechanical", "Civil", "Electrical", "IT"];
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const paperTypes = ["Sessional 1", "Sessional 2", "End Semester"];

  const fetchPapers = async () => {
    if (!selectedBranch || !selectedYear || !selectedSem) {
      setPapers([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('pyq_papers')
        .select('*')
        .or(`branch.eq.${selectedBranch},is_common.eq.true`)
        .eq('year', parseInt(selectedYear))
        .eq('semester', parseInt(selectedSem));

      // Paper Type filter (agar select kiya ho)
      if (selectedType) {
        query = query.eq('type', selectedType);
      }

      const { data, error } = await query.order('subject', { ascending: true });

      if (error) console.error("Fetch error:", error);
      setPapers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBranch && selectedYear && selectedSem) {
      fetchPapers();
    }
  }, [selectedBranch, selectedYear, selectedSem, selectedType]);

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Previous Year Question Papers</h1>
          <p className="text-gray-400 text-lg">Choose your branch, year, semester and paper type</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Branch</label>
              <Select >
                <SelectTrigger className="h-12 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Year</label>
              <Select onValueChange={(value) => setSelectedYear(value || "")} value={selectedYear}>
                <SelectTrigger className="h-12 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Semester</label>
              <Select onValueChange={(value) => setSelectedSem(value || "")} value={selectedSem}>
                <SelectTrigger className="h-12 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* New Paper Type Filter */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Paper Type</label>
              <Select onValueChange={(value) => setSelectedType(value || "")} value={selectedType}>
                <SelectTrigger className="h-12 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {paperTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        )}

        {/* No Papers */}
        {!loading && papers.length === 0 && selectedBranch && selectedYear && selectedSem && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No papers found for this selection</p>
          </div>
        )}

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Card key={paper.id} className="bg-gray-900 border border-gray-700 hover:border-blue-600 transition-all group">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-xl text-white">{paper.subject}</CardTitle>
                  {paper.is_common && (
                    <span className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Common</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {paper.branch} • {paper.year} • Sem {paper.semester}
                </p>
              </CardHeader>

              <CardContent>
                <p className="text-gray-300 text-sm mb-6 line-clamp-2">{paper.paperTitle}</p>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(paper.fileUrl, '_blank')}
                  >
                    <Eye className="mr-2 w-4 h-4" /> View
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-gray-600 hover:bg-gray-800"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = paper.fileUrl;
                      link.download = `${paper.subject}.pdf`;
                      link.click();
                    }}
                  >
                    <Download className="mr-2 w-4 h-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}