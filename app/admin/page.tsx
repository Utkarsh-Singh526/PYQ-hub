'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  const [subject, setSubject] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('3');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Fake Login
  const handleLogin = () => {
    if (password === "admin123") {
      setIsLoggedIn(true);
      setShowLogin(false);
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      alert("Wrong Password! Hint: admin123");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  }, []);

  const handleUpload = async () => {
    if (!subject || !paperTitle || !file) {
      setMessage("❌ Please fill all fields and select PDF");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${subject.replace(/\s+/g, '-')}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('papers')                    // Bucket name = 'papers'
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from('papers')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      // Save metadata to Database
      const { error: dbError } = await supabase
        .from('pyq_papers')
        .insert({
          branch,
          year: parseInt(year),
          semester: parseInt(semester),
          subject,
          paperTitle,
          fileUrl,
          type: "End Semester",
          uploadedAt: new Date().toISOString()
        });

      if (dbError) throw dbError;

      setMessage("✅ Paper uploaded successfully!");
      setSubject('');
      setPaperTitle('');
      setFile(null);

    } catch (error: any) {
      console.error("Upload Error:", error);
      setMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-10 rounded-2xl border border-gray-700 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Admin Login</h2>
          <Input 
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6"
          />
          <Button onClick={handleLogin} className="w-full py-6 bg-blue-600">
            Login
          </Button>
          <p className="text-center text-gray-500 text-sm mt-4">Password: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
        <Button variant="outline" onClick={() => {
          localStorage.removeItem("adminLoggedIn");
          window.location.reload();
        }}>
          Logout
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Upload New PYQ</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* Form fields same as before */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Subject Name</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Database Management System" />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Paper Title</label>
              <Input value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} placeholder="End Semester 2025" />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Branch</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Select PDF</label>
            <Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <Button 
            onClick={handleUpload}
            disabled={uploading || !subject || !paperTitle || !file}
            className="w-full py-7 bg-blue-600"
          >
            {uploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
            {uploading ? "Uploading..." : "Upload PDF"}
          </Button>

          {message && <p className="text-center font-medium">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}