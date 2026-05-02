
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SingleUpload() {
  const [subject, setSubject] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('3');
  const [paperType, setPaperType] = useState('End Semester');
  const [isCommon, setIsCommon] = useState(false);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSingleUpload = async () => {
    if (!subject || !paperTitle || !singleFile) {
      setMessage("❌ Sab fields bhardo");
      return;
    }

    setLoading(true);
    setMessage("Uploading...");

    try {
      const fileName = `${Date.now()}_${singleFile.name.replace(/ /g, '_')}`;

      const { error: uploadError } = await supabase.storage
        .from('papers')
        .upload(fileName, singleFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('papers').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('pyq_papers').insert({
        branch,
        year: parseInt(year),
        semester: parseInt(semester),
        subject,
        paperTitle,
        fileUrl: urlData.publicUrl,
        type: paperType,
        is_common: isCommon,
        uploadedAt: new Date().toISOString()
      });

      if (dbError) throw dbError;

      setMessage("✅ Paper successfully uploaded!");
      setSubject(''); setPaperTitle(''); setSingleFile(null);

    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message || "Upload failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle>Single PDF Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
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
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>

          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
           <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>  
            <option value="7">Sem 7</option>
            <option value="8">Sem 8</option>  
          </select>

          <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="Sessional 1">Sessional 1</option>
            <option value="Sessional 2">Sessional 2</option>
            <option value="End Semester">End Semester</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" checked={isCommon} onChange={(e) => setIsCommon(e.target.checked)} className="w-5 h-5 accent-blue-600" />
          <label className="text-white">Common for All Branches</label>
        </div>

        <Input type="file" accept=".pdf" onChange={(e) => setSingleFile(e.target.files?.[0] || null)} />

        <Button 
          onClick={handleSingleUpload} 
          disabled={loading || !subject || !paperTitle || !singleFile}
          className="w-full py-7 bg-blue-600"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Upload PDF"}
        </Button>

        {message && <p className="text-center font-medium">{message}</p>}
      </CardContent>
    </Card>
  );
}