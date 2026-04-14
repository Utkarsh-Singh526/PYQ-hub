'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Lock, LogIn, File, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'single' | 'zip' | 'manage'>('single');

  // Single PDF States
  const [subject, setSubject] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('3');
  const [paperType, setPaperType] = useState('End Semester');
  const [singleFile, setSingleFile] = useState<File | null>(null);

  // ZIP Upload States
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
    setManageLoading(false);
  };

  const deletePaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;

    const { error } = await supabase.from('pyq_papers').delete().eq('id', id);
    if (!error) {
      setMessage("✅ Paper deleted successfully");
      loadPapers();
    } else {
      setMessage("❌ Failed to delete");
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

  const handleSingleUpload = async () => {
    if (!subject || !paperTitle || !singleFile) {
      setMessage("❌ Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("Uploading...");

    try {
      const fileName = `${Date.now()}-${singleFile.name}`;

      const { error: uploadError } = await supabase.storage.from('papers').upload(fileName, singleFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('papers').getPublicUrl(fileName);

      await supabase.from('pyq_papers').insert({
        branch,
        year: parseInt(year),
        semester: parseInt(semester),
        subject,
        paperTitle,
        fileUrl: urlData.publicUrl,
        type: paperType,
      });

      setMessage("✅ Single PDF uploaded successfully!");
      setSingleFile(null);
      setSubject('');
      setPaperTitle('');
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleZipUpload = async () => {
    if (!zipFile) return;

    setZipUploading(true);
    setMessage("Extracting ZIP...");
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);

      const pdfFiles = Object.keys(contents.files).filter(name => name.toLowerCase().endsWith('.pdf'));
      let success = 0;

      for (let i = 0; i < pdfFiles.length; i++) {
        const filename = pdfFiles[i];
        const file = contents.files[filename];
        const fileData = await file.async('blob');
        const storageName = `${Date.now()}-${filename.split('/').pop()}`;

        const { error: uploadError } = await supabase.storage.from('papers').upload(storageName, fileData);
        if (uploadError) continue;

        const { data: urlData } = supabase.storage.from('papers').getPublicUrl(storageName);

        await supabase.from('pyq_papers').insert({
          branch: zipBranch,
          year: parseInt(zipYear),
          semester: parseInt(zipSemester),
          subject: filename.replace('.pdf', '').replace(/[_-]/g, ' '),
          paperTitle: filename.replace('.pdf', ''),
          fileUrl: urlData.publicUrl,
          type: zipType,
        });

        success++;
        setZipProgress(Math.round(((i + 1) / pdfFiles.length) * 100));
      }

      setMessage(`✅ ${success} PDFs uploaded successfully!`);
      setZipFile(null);
    } catch (err: any) {
      setMessage("❌ ZIP failed: " + err.message);
    } finally {
      setZipUploading(false);
    }
  };

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
        <button onClick={() => setActiveTab('single')} className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          Single PDF
        </button>
        <button onClick={() => setActiveTab('zip')} className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'zip' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          ZIP Upload
        </button>
        <button onClick={() => { setActiveTab('manage'); loadPapers(); }} className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'manage' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          Manage Papers
        </button>
      </div>

      {/* Single PDF Tab */}
      {activeTab === 'single' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle>Upload Single PDF</CardTitle></CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input placeholder="Subject Name" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Input placeholder="Paper Title" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} />

              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="EE">EE</option>
                <option value="IT">IT</option>
                <option value="AIML">AIML</option>
              </select>

              <select value={year} onChange={(e) => setYear(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>

              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>

              <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="Sessional 1">Sessional 1</option>
                <option value="Sessional 2">Sessional 2</option>
                <option value="End Semester">End Semester</option>
              </select>
            </div>

            <Input type="file" accept=".pdf" onChange={(e) => setSingleFile(e.target.files?.[0] || null)} />

            <Button onClick={handleSingleUpload} disabled={loading || !subject || !paperTitle || !singleFile} className="w-full py-7 bg-blue-600">
              {loading ? "Uploading..." : "Upload Single PDF"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ZIP Upload Tab - Smart Common Values */}
      {activeTab === 'zip' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle>Upload ZIP (All files will have same Branch, Year, Semester)</CardTitle></CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Branch</label>
                <select value={zipBranch} onChange={(e) => setZipBranch(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="EE">EE</option>
                  <option value="IT">IT</option>
                  <option value="AIML">AIML</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Year</label>
                <select value={zipYear} onChange={(e) => setZipYear(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Semester</label>
                <select value={zipSemester} onChange={(e) => setZipSemester(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Paper Type</label>
                <select value={zipType} onChange={(e) => setZipType(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="Sessional 1">Sessional 1</option>
                  <option value="Sessional 2">Sessional 2</option>
                  <option value="End Semester">End Semester</option>
                </select>
              </div>
            </div>

            <Input type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />

            <Button onClick={handleZipUpload} disabled={zipUploading || !zipFile} className="w-full py-7 bg-blue-600">
              {zipUploading ? `Processing... ${zipProgress}%` : "Upload ZIP & Auto Save"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manage Papers Tab */}
      {activeTab === 'manage' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Manage Papers</CardTitle>
            <Button onClick={loadPapers} variant="outline">Refresh</Button>
          </CardHeader>
          <CardContent>
            {manageLoading ? (
              <p className="text-center py-10">Loading papers...</p>
            ) : papers.length === 0 ? (
              <p className="text-center py-10 text-gray-400">No papers found</p>
            ) : (
              <div className="space-y-4">
                {papers.map((paper) => (
                  <div key={paper.id} className="flex justify-between items-center bg-gray-800 p-5 rounded-lg border border-gray-700">
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
            )}
          </CardContent>
        </Card>
      )}

      {message && <p className="text-center mt-6 font-medium text-green-400">{message}</p>}

      {/* Edit Modal */}
      {editingPaper && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Edit Paper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="Subject" />
              <Input value={editPaperTitle} onChange={(e) => setEditPaperTitle(e.target.value)} placeholder="Paper Title" />

              <div className="grid grid-cols-2 gap-4">
                <select value={editBranch} onChange={(e) => setEditBranch(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="EE">EE</option>
                  <option value="IT">IT</option>
                  <option value="AIML">AIML</option>
                </select>
                <select value={editYear} onChange={(e) => setEditYear(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select value={editSemester} onChange={(e) => setEditSemester(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
                <select value={editType} onChange={(e) => setEditType(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="Sessional 1">Sessional 1</option>
                  <option value="Sessional 2">Sessional 2</option>
                  <option value="End Semester">End Semester</option>
                </select>
              </div>

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