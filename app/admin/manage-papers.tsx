'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Search, CheckSquare, Square, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Paper = {
  id: string;
  subject: string;
  paperTitle: string;
  branch: string;
  year: number;
  semester: number;
  type: string;
  fileUrl: string;
};

export default function ManagePapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editPaperTitle, setEditPaperTitle] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editType, setEditType] = useState('');

  const loadPapers = async () => {
    setLoading(true);
    setMessage("Loading papers...");

    const { data, error } = await supabase
      .from('pyq_papers')
      .select('*')
      .order('uploadedAt', { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
      setMessage(`❌ ${error.message || "Failed to load papers"}`);
      setPapers([]);
    } else {
      setPapers(data || []);
      setMessage(`✅ ${data?.length || 0} papers loaded`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPapers();
  }, []);

  const filteredPapers = useMemo(() => {
    if (!searchTerm.trim()) return papers;
    const term = searchTerm.toLowerCase();
    return papers.filter(p => 
      p.subject.toLowerCase().includes(term) || 
      p.paperTitle.toLowerCase().includes(term)
    );
  }, [papers, searchTerm]);

  const papersByType = useMemo(() => {
    const groups: { [key: string]: Paper[] } = {
      'Sessional 1': [],
      'Sessional 2': [],
      'End Semester': []
    };
    filteredPapers.forEach(paper => {
      const type = paper.type || 'End Semester';
      groups[type] = groups[type] || [];
      groups[type].push(paper);
    });
    return groups;
  }, [filteredPapers]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allIds = filteredPapers.map(p => p.id);
    setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
  };

  const viewPaper = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const deletePaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;
    const { error } = await supabase.from('pyq_papers').delete().eq('id', id);
    if (!error) {
      setMessage("✅ Paper deleted");
      loadPapers();
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} papers?`)) return;

    const { error } = await supabase.from('pyq_papers').delete().in('id', selectedIds);
    if (!error) {
      setMessage(`${selectedIds.length} papers deleted`);
      loadPapers();
    }
  };

  const openEditModal = (paper: Paper) => {
    setEditingPaper(paper);
    setEditSubject(paper.subject);
    setEditPaperTitle(paper.paperTitle);
    setEditBranch(paper.branch);
    setEditYear(paper.year.toString());
    setEditSemester(paper.semester.toString());
    setEditType(paper.type);
  };

  const saveEdit = async () => {
    if (!editingPaper) return;
    const { error } = await supabase
      .from('pyq_papers')
      .update({
        subject: editSubject,
        paperTitle: editPaperTitle,
        branch: editBranch,
        year: parseInt(editYear),
        semester: parseInt(editSemester),
        type: editType,
      })
      .eq('id', editingPaper.id);

    if (!error) {
      setMessage("✅ Paper updated");
      setEditingPaper(null);
      loadPapers();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-white text-2xl">Manage All PYQ Papers ({filteredPapers.length})</CardTitle>
        <Button onClick={loadPapers} variant="outline">Refresh</Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by subject or paper title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-gray-800 border-gray-600 text-white py-3"
          />
        </div>

        <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl">
          <Button variant="outline" onClick={toggleSelectAll} className="border-gray-600 text-white">
            {selectedIds.length === filteredPapers.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
            Select All
          </Button>
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={deleteSelected}>
              Delete Selected ({selectedIds.length})
            </Button>
          )}
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
                  <div key={paper.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(paper.id)}
                        onChange={() => toggleSelect(paper.id)}
                        className="w-5 h-5 mt-1 accent-blue-600"
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white">{paper.subject}</h4>
                        <p className="text-gray-300 mt-1">{paper.paperTitle}</p>
                        <p className="text-blue-400 text-sm mt-2">
                          {paper.branch} • {paper.year} • Sem {paper.semester}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewPaper(paper.fileUrl)}>
                          <Eye className="w-4 h-4" /> View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditModal(paper)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deletePaper(paper.id)}>
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

        {filteredPapers.length === 0 && searchTerm && (
          <p className="text-center py-12 text-gray-400">No papers found for "{searchTerm}"</p>
        )}
      </CardContent>

      {/* Edit Modal */}
      {editingPaper && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
          <Card className="bg-gray-900 border-gray-600 w-full max-w-lg">
            <CardHeader><CardTitle className="text-white">Edit Paper</CardTitle></CardHeader>
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
                <Button onClick={saveEdit} className="flex-1 bg-blue-600">Save Changes</Button>
                <Button onClick={() => setEditingPaper(null)} variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}