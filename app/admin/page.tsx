'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Lock, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Upload Form States
  const [subject, setSubject] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('3');
  const [paperType, setPaperType] = useState('End Semester');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if already logged in
  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setError('');

    if (password === "admin123") {
      setIsLoggedIn(true);
      setShowLogin(false);
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      setError("Wrong Password! Hint: admin123");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    setShowLogin(true);
    setPassword('');
  };

  const handleUpload = async () => {
    if (!subject || !paperTitle || !file) {
      setMessage("❌ Please fill all fields and select a PDF file");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");

    try {
      const fileName = `${Date.now()}-${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('papers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('papers')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      // Save to database
      const { error: insertError } = await supabase
        .from('pyq_papers')
        .insert({
          branch,
          year: parseInt(year),
          semester: parseInt(semester),
          subject,
          paperTitle,
          fileUrl,
          type: paperType,
        });

      if (insertError) throw insertError;

      setMessage("✅ Paper uploaded successfully!");
      
      // Clear form
      setSubject('');
      setPaperTitle('');
      setFile(null);

    } catch (error: any) {
      console.error("Upload Error:", error);
      setMessage("❌ Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  // ====================== LOGIN SCREEN ======================
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-500" />
            </div>
            <CardTitle className="text-3xl text-white">Admin Login</CardTitle>
            <p className="text-gray-400 mt-2">Only authorized persons can access</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <label className="text-sm text-gray-300 block mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {error && <p className="text-red-400 text-center text-sm">{error}</p>}

            <Button 
              onClick={handleLogin} 
              disabled={loading || !password}
              className="w-full py-7 text-lg bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Checking..." : (
                <>
                  <LogIn className="mr-2 w-5 h-5" />
                  Login to Dashboard
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-500">
              Default Password: <span className="font-mono">admin123</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ====================== MAIN ADMIN DASHBOARD ======================
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white">👨‍💼 Admin Panel</h1>
          <p className="text-gray-400">Upload and manage PYQ papers</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Upload New PYQ Paper</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-300 block mb-2">Subject Name</label>
              <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Database Management System" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-2">Paper Title</label>
              <Input 
                value={paperTitle} 
                onChange={(e) => setPaperTitle(e.target.value)} 
                placeholder="End Semester Examination 2025" 
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">Branch</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="EE">EE</option>
                <option value="IT">IT</option>
                <option value="AIML">AIML</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
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
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">Paper Type</label>
              <select 
                value={paperType} 
                onChange={(e) => setPaperType(e.target.value)} 
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="Sessional 1">Sessional 1</option>
                <option value="Sessional 2">Sessional 2</option>
                <option value="End Semester">End Semester</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">Select PDF File</label>
            <Input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
          </div>

          <Button 
            onClick={handleUpload}
            disabled={uploading || !subject || !paperTitle || !file}
            className="w-full py-7 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-3 w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-3 w-5 h-5" />
                Upload Paper
              </>
            )}
          </Button>

          {message && (
            <p className={`text-center font-medium ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}