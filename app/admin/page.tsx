'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Lock, Trash2, Edit, FolderZip, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'single' | 'zip' | 'manage'>('single');

  // Single Upload States
  const [subject, setSubject] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('3');
  const [paperType, setPaperType] = useState('End Semester');
  const [singleFile, setSingleFile] = useState<File | null>(null);

  // ZIP States
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipBranch, setZipBranch] = useState('CSE');
  const [zipYear, setZipYear] = useState('2025');
  const [zipSemester, setZipSemester] = useState('3');
  const [zipType, setZipType] = useState('End Semester');
  const [zipUploading, setZipUploading] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Manage Papers
  const [papers, setPapers] = useState<any[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Edit Modal
  const [editingPaper, setEditingPaper] = useState<any>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editPaperTitle, setEditPaperTitle] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editType, setEditType] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  }, []);

  const handleLogin = () => {
    if (password === "admin123") {
      setIsLoggedIn(true);
      setShowLogin(false);
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      setError("Wrong Password! Hint: admin123");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    setShowLogin(true);
    setPassword('');
  };

  const loadPapers = async () => {
    setManageLoading(true);
    const { data } = await supabase
      .from('pyq_papers')
      .select('*')
      .order('uploadedAt', { ascending: false });
    setPapers(data || []);
    setSelectedIds([]);
    setManageLoading(false);
  };

  // Toggle single checkbox
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select All
  const toggleSelectAll = () => {
    if (selectedIds.length === papers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(papers.map(p => p.id));
    }
  };

  // Delete Selected Papers
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected papers?`)) return;

    const { error } = await supabase
      .from('pyq_papers')
      .delete()
      .in('id', selectedIds);

    if (!error) {
      setMessage(`✅ ${selectedIds.length} papers deleted successfully`);
      loadPapers();
    } else {
      setMessage("❌ Failed to delete selected papers");
    }
  };

  const openEditModal = (paper: any) => {
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
      setMessage("✅ Paper updated successfully");
      setEditingPaper(null);
      loadPapers();
    } else {
      setMessage("❌ Failed to update");
    }
  };

  // Single & ZIP upload functions (same as before)
  const handleSingleUpload = async () => { /* ... same as previous code ... */ };
  const handleZipUpload = async () => { /* ... same as previous code ... */ };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <CardTitle className="text-3xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-red-400 text-center">{error}</p>}
            <Button onClick={handleLogin} className="w-full py-6 bg-blue-600">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">👨‍💼 Admin Panel</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button onClick={() => setActiveTab('single')} className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Single PDF</button>
        <button onClick={() => setActiveTab('zip')} className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'zip' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>ZIP Upload</button>
        <button onClick={() => { setActiveTab('manage'); loadPapers(); }} className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'manage' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Manage Papers</button>
      </div>

      {/* Single & ZIP tabs same as before - I kept them short for space */}
      {/* ... (Single and ZIP upload code same as your previous working version) ... */}

      {/* MANAGE PAPERS TAB - WITH MULTI SELECT */}
      {activeTab === 'manage' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Manage Papers ({papers.length})</CardTitle>
            <div className="flex gap-3">
              <Button onClick={loadPapers} variant="outline">Refresh</Button>
              {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={deleteSelected}>
                  Delete Selected ({selectedIds.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {manageLoading ? (
              <p className="text-center py-10">Loading papers...</p>
            ) : papers.length === 0 ? (
              <p className="text-center py-10 text-gray-400">No papers found</p>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded-lg">
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedIds.length === papers.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    Select All
                  </Button>
                  <span className="text-sm text-gray-400">
                    {selectedIds.length} of {papers.length} selected
                  </span>
                </div>

                <div className="space-y-3">
                  {papers.map((paper) => (
                    <div key={paper.id} className="flex items-center gap-4 bg-gray-800 p-5 rounded-lg border border-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(paper.id)}
                        onChange={() => toggleSelect(paper.id)}
                        className="w-5 h-5 accent-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{paper.subject}</p>
                        <p className="text-sm text-gray-300">
                          {paper.branch} • {paper.year} • Sem {paper.semester} • {paper.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(paper)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deletePaper(paper.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {message && <p className="text-center mt-6 font-medium text-green-400">{message}</p>}

      {/* Edit Modal - same as before */}
      {editingPaper && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-lg">
            <CardHeader><CardTitle>Edit Paper</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Edit fields same as previous version */}
              <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="Subject" />
              <Input value={editPaperTitle} onChange={(e) => setEditPaperTitle(e.target.value)} placeholder="Paper Title" />
              {/* Branch, Year, Semester, Type selects */}
              <div className="flex gap-4">
                <Button onClick={() => setEditingPaper(null)} variant="outline" className="flex-1">Cancel</Button>
                <Button onClick={saveEdit} className="flex-1 bg-blue-600">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}