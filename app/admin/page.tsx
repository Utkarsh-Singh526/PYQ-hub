'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Plus, Loader2 } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  // Upload Form States
  const [subject, setSubject] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('3');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Fake Admin Login (Password: admin123)
  const handleLogin = () => {
    if (password === "admin123") {
      setIsLoggedIn(true);
      setShowLogin(false);
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      alert("Wrong Password! Hint: admin123");
    }
  };

  // Check if already logged in
  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  }, []);

  const handleUpload = async () => {
    if (!subject || !paperTitle || !file) {
      setMessage("❌ Please fill all fields and select a PDF file");
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const storageRef = ref(storage, `papers/${branch}/${year}/sem${semester}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "pyq_papers"), {
        branch,
        year: parseInt(year),
        semester: parseInt(semester),
        subject,
        paperTitle,
        fileUrl,
        type: "End Semester",
        uploadedAt: new Date().toISOString()
      });

      setMessage("✅ Paper uploaded successfully!");
      setSubject('');
      setPaperTitle('');
      setFile(null);
    } catch (error) {
      console.error("Upload Error:", error);
      setMessage("❌ Upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  // Login Screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-10 rounded-2xl border border-gray-700 w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Admin Login</h2>
          <Input 
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 bg-gray-800 border-gray-600 text-white"
          />
          <Button onClick={handleLogin} className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700">
            Login as Editor
          </Button>
          <p className="text-gray-500 text-sm mt-4">Default Password: <strong>admin123</strong></p>
        </div>
      </div>
    );
  }

  // Main Admin Dashboard (After Login)
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">👨‍💼 Admin / Editor Panel</h1>
        <Button 
          onClick={() => {
            localStorage.removeItem("adminLoggedIn");
            window.location.reload();
          }} 
          variant="outline"
        >
          Logout
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Upload New PYQ Paper</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-300 block mb-2">Subject Name</label>
              <Input 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Database Management System" 
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-2">Paper Title</label>
              <Input 
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder="e.g. End Semester Exam 2025" 
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">Branch</label>
              <select 
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Year</label>
                <select 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Semester</label>
                <select 
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                >
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">Select PDF File</label>
            <Input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <Button 
            onClick={handleUpload}
            disabled={uploading || !subject || !paperTitle || !file}
            className="w-full py-7 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-3 w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-3 w-5 h-5" />
                Upload PDF File
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