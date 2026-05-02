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
  common_branches?: string[];
  common_semesters?: number[];
};

export default function PYQPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSem, setSelectedSem] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT","AIML"];
  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const paperTypes = ["Sessional 1", "Sessional 2", "End Semester"];

  const fetchPapers = async () => {
    if (!selectedBranch || !selectedYear || !selectedSem) {
      setPapers([]);
      return;
    }

    setLoading(true);
    console.log("Fetching for:", { selectedBranch, selectedYear, selectedSem, selectedType });

    try {
      let query = supabase
        .from('pyq_papers')
        .select('*')
        .eq('year', parseInt(selectedYear))
        .eq('semester', parseInt(selectedSem));

      if (selectedType) {
        query = query.eq('type', selectedType);
      }

      // Advanced Common Logic
      const { data, error } = await query
        .or(`branch.eq.${selectedBranch},is_common.eq.true`)
        .order('subject', { ascending: true });

      if (error) {
        console.error("Supabase Fetch Error:", error);
      } else {
        // Additional client-side filter for selected branches/semesters
        const filtered = (data || []).filter( paper=> {
          if (paper.is_common) {
            // If common for all branches
            if (!paper.common_branches && !paper.common_semesters) return true;

            // If common for selected branches
            if (paper.common_branches && paper.common_branches.includes(selectedBranch)) return true;

            // If common for selected semesters
            if (paper.common_semesters && paper.common_semesters.includes(parseInt(selectedSem))) return true;
          }
          return paper.branch === selectedBranch;
        });

        console.log("Final filtered papers:", filtered.length);
        setPapers(filtered);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
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
          <p className="text-gray-400 text-lg">Select branch, year, semester & type</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Branch</label>
              <Select onValueChange={(v) => setSelectedBranch(v || "")} value={selectedBranch}>
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
              <Select onValueChange={(v) => setSelectedYear(v || "")} value={selectedYear}>
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
              <Select onValueChange={(v) => setSelectedSem(v || "")} value={selectedSem}>
                <SelectTrigger className="h-12 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Paper Type</label>
              <Select onValueChange={(v) => setSelectedType(v || "")} value={selectedType}>
                <SelectTrigger className="h-12 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {paperTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading && <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}

        {!loading && papers.length === 0 && selectedBranch && selectedYear && selectedSem && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No papers found for this selection</p>
            <p className="text-gray-500 mt-2 font-semibold">Comming Soon...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Card key={paper.id} className="bg-gray-900 border border-gray-700 hover:border-blue-600 transition-all group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-white">{paper.subject}</CardTitle>
                  {paper.is_common && <span className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Common</span>}
                </div>
                <p className="text-sm text-gray-400">
                  {paper.branch} • {paper.year} • Sem {paper.semester} • {paper.type}
                </p>
              </CardHeader>

              <CardContent>
                <p className="text-gray-300 text-sm mb-6 line-clamp-2">{paper.paperTitle}</p>

                <div className="flex gap-3">
                   <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(paper.fileUrl, '_blank')}
                  >
                    <Eye className="mr-2 w-4 h-4" /> View PDF
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-gray-600 hover:bg-gray-800 text-white"
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