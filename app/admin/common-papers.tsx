'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Search, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CommonPapers() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const [editingPaper, setEditingPaper] = useState<any>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editPaperTitle, setEditPaperTitle] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editType, setEditType] = useState('');

  const loadCommonPapers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pyq_papers')
      .select('*')
      .eq('is_common', true)
      .order('uploadedAt', { ascending: false });
    setPapers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCommonPapers();
  }, []);

  const filteredPapers = useMemo(() => {
    if (!searchTerm) return papers;
    return papers.filter(paper =>
      paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.paperTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [papers, searchTerm]);

  const papersByType = useMemo(() => {
    const groups: { [key: string]: any[] } = { 'Sessional 1': [], 'Sessional 2': [], 'End Semester': [] };
    filteredPapers.forEach(paper => {
      const type = paper.type || 'End Semester';
      if (groups[type]) groups[type].push(paper);
      else groups['End Semester'].push(paper);
    });
    return groups;
  }, [filteredPapers]);

  const viewPaper = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const openEditModal = (paper: any) => { /* same as before */ 
    setEditingPaper(paper);
    setEditSubject(paper.subject);
    setEditPaperTitle(paper.paperTitle);
    setEditBranch(paper.branch);
    setEditYear(paper.year.toString());
    setEditSemester(paper.semester.toString());
    setEditType(paper.type);
  };

  const saveEdit = async () => { /* same as before */ 
    if (!editingPaper) return;
    const { error } = await supabase.from('pyq_papers').update({
      subject: editSubject, paperTitle: editPaperTitle, branch: editBranch,
      year: parseInt(editYear), semester: parseInt(editSemester), type: editType
    }).eq('id', editingPaper.id);

    if (!error) {
      setMessage("✅ Updated");
      setEditingPaper(null);
      loadCommonPapers();
    }
  };

  const deletePaper = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from('pyq_papers').delete().eq('id', id);
    setMessage("✅ Deleted");
    loadCommonPapers();
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-2xl">🌐 Common Papers ({filteredPapers.length})</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by subject or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-gray-800 border-gray-600 text-white py-3"
          />
        </div>

        {['Sessional 1', 'Sessional 2', 'End Semester'].map((type) => {
          const typePapers = papersByType[type] || [];
          if (typePapers.length === 0) return null;

          return (
            <div key={type} className="space-y-4">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">
                {type} ({typePapers.length})
              </h3>
              <div className="space-y-4">
                {typePapers.map((paper) => (
                  <div key={paper.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white">{paper.subject}</h4>
                        <p className="text-gray-300 mt-1">{paper.paperTitle}</p>
                        <p className="text-sm text-blue-400 mt-3">
                          {paper.branch} • {paper.year} • Sem {paper.semester}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewPaper(paper.fileUrl)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4" /> View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(paper)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deletePaper(paper.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Edit Modal same as before */}
      {editingPaper && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
          <Card className="bg-gray-900 border-gray-600 w-full max-w-lg">
            <CardHeader><CardTitle className="text-white">Edit Common Paper</CardTitle></CardHeader>
            <CardContent className="space-y-5 pt-2">
              <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="Subject" className="bg-gray-800 border-gray-600 text-white" />
              <Input value={editPaperTitle} onChange={(e) => setEditPaperTitle(e.target.value)} placeholder="Paper Title" className="bg-gray-800 border-gray-600 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <Input value={editBranch} onChange={(e) => setEditBranch(e.target.value)} placeholder="Branch" className="bg-gray-800 border-gray-600 text-white" />
                <Input value={editYear} onChange={(e) => setEditYear(e.target.value)} placeholder="Year" type="number" className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input value={editSemester} onChange={(e) => setEditSemester(e.target.value)} placeholder="Semester" type="number" className="bg-gray-800 border-gray-600 text-white" />
                <select value={editType} onChange={(e) => setEditType(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="Sessional 1">Sessional 1</option>
                  <option value="Sessional 2">Sessional 2</option>
                  <option value="End Semester">End Semester</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <Button onClick={saveEdit} className="flex-1 bg-blue-600">Save</Button>
                <Button onClick={() => setEditingPaper(null)} variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}