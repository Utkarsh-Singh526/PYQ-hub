'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Lock, LogIn, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'single' | 'zip'>('single');

  // Single PDF States
  const [subject, setSubject] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('3');
  const [paperType, setPaperType] = useState('End Semester');
  const [singleFile, setSingleFile] = useState<File | null>(null);

  // ZIP States
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipUploading, setZipUploading] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
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

  // Single PDF Upload
  const handleSingleUpload = async () => {
    if (!subject || !paperTitle || !singleFile) {
      setMessage("❌ Please fill all fields and select PDF");
      return;
    }

    setLoading(true);
    setMessage("Uploading...");

    try {
      const fileName = `${Date.now()}-${singleFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from('papers')
        .upload(fileName, singleFile);

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

  // ZIP Upload with Auto Extract
  const handleZipUpload = async () => {
    if (!zipFile) {
      setMessage("❌ Please select a ZIP file");
      return;
    }

    setZipUploading(true);
    setMessage("Extracting ZIP and uploading files...");
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);

      const pdfFiles = Object.keys(contents.files).filter(name => 
        name.toLowerCase().endsWith('.pdf')
      );

      let successCount = 0;

      for (let i = 0; i < pdfFiles.length; i++) {
        const filename = pdfFiles[i];
        const file = contents.files[filename];

        const fileData = await file.async('blob');
        const storageName = `${Date.now()}-${filename.split('/').pop()}`;

        const { error: uploadError } = await supabase.storage
          .from('papers')
          .upload(storageName, fileData);

        if (uploadError) continue;

        const { data: urlData } = supabase.storage.from('papers').getPublicUrl(storageName);

        await supabase.from('pyq_papers').insert({
          branch: "CSE",
          year: 2025,
          semester: 3,
          subject: filename.replace('.pdf', '').replace(/[_-]/g, ' '),
          paperTitle: filename.replace('.pdf', ''),
          fileUrl: urlData.publicUrl,
          type: "End Semester",
        });

        successCount++;
        setZipProgress(Math.round(((i + 1) / pdfFiles.length) * 100));
      }

      setMessage(`✅ Successfully uploaded ${successCount} PDFs from ZIP!`);
      setZipFile(null);

    } catch (err: any) {
      setMessage("❌ ZIP processing failed: " + err.message);
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
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-red-400 text-center">{error}</p>}
            <Button onClick={handleLogin} className="w-full py-6 bg-blue-600">
              Login
            </Button>
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
        <button
          onClick={() => setActiveTab('single')}
          className={`px-8 py-3 font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <File className="w-5 h-5" />
          Single PDF
        </button>
        <button
          onClick={() => setActiveTab('zip')}
          className={`px-8 py-3 font-medium rounded-t-lg flex items-center gap-2 ${activeTab === 'zip' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          ZIP Upload (Auto Extract)
        </button>
      </div>

      {activeTab === 'single' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Upload Single PDF</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input placeholder="Subject Name" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Input placeholder="Paper Title" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} />

              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
              </select>

              <select value={year} onChange={(e) => setYear(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>

              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
              </select>

              <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="Sessional 1">Sessional 1</option>
                <option value="Sessional 2">Sessional 2</option>
                <option value="End Semester">End Semester</option>
              </select>
            </div>

            <Input type="file" accept=".pdf" onChange={(e) => setSingleFile(e.target.files?.[0] || null)} />

            <Button 
              onClick={handleSingleUpload}
              disabled={loading || !subject || !paperTitle || !singleFile}
              className="w-full py-7 bg-blue-600"
            >
              {loading ? "Uploading..." : "Upload Single PDF"}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'zip' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Upload ZIP File (Auto Extract)</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <Input 
              type="file" 
              accept=".zip" 
              onChange={(e) => setZipFile(e.target.files?.[0] || null)} 
              className="mb-8"
            />
            <Button 
              onClick={handleZipUpload}
              disabled={zipUploading || !zipFile}
              className="w-full py-7 bg-blue-600"
            >
              {zipUploading ? `Processing... ${zipProgress}%` : "Upload & Auto Extract ZIP"}
            </Button>
          </CardContent>
        </Card>
      )}

      {message && <p className="text-center mt-6 font-medium text-green-400">{message}</p>}
    </div>
  );
}