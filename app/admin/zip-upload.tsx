'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

export default function ZipUpload() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipBranch, setZipBranch] = useState('CSE');
  const [zipYear, setZipYear] = useState('2025');
  const [zipSemester, setZipSemester] = useState('3');
  const [zipType, setZipType] = useState('End Semester');
  const [zipIsCommon, setZipIsCommon] = useState(false);
  const [zipUploading, setZipUploading] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleZipUpload = async () => {
    if (!zipFile) return;

    setZipUploading(true);
    setMessage("Uploading ZIP...");
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);
      const pdfFiles = Object.keys(contents.files).filter(n => n.toLowerCase().endsWith('.pdf'));

      let success = 0;

      for (let i = 0; i < pdfFiles.length; i++) {
        const filename = pdfFiles[i];
        const file = contents.files[filename];
        const fileData = await file.async('blob');
        const storageName = `${Date.now()}-${i}-${filename.split('/').pop()}`;

        const { error: upErr } = await supabase.storage.from('papers').upload(storageName, fileData);
        if (upErr) continue;

        const { data: urlData } = supabase.storage.from('papers').getPublicUrl(storageName);

        await supabase.from('pyq_papers').insert({
          branch: zipBranch,
          year: parseInt(zipYear),
          semester: parseInt(zipSemester),
          subject: filename.replace('.pdf', '').replace(/[_-]/g, ' '),
          paperTitle: filename.replace('.pdf', ''),
          fileUrl: urlData.publicUrl,
          type: zipType,
          is_common: zipIsCommon
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

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader><CardTitle>Upload ZIP File</CardTitle></CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <select value={zipBranch} onChange={(e) => setZipBranch(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
            <option value="EE">EE</option>
            <option value="IT">IT</option>
            <option value="AIML">AIML</option>
          </select>
          <select value={zipYear} onChange={(e) => setZipYear(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value ="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>


          </select>
          <select value={zipSemester} onChange={(e) => setZipSemester(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>
            <option value="7">Sem 7</option>
            <option value="8">Sem 8</option>

          </select>
          <select value={zipType} onChange={(e) => setZipType(e.target.value)} className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="Sessional 1">Sessional 1</option>
            <option value="Sessional 2">Sessional 2</option>
            <option value="End Semester">End Semester</option>
            <option value="Important Questions">Important Questions</option>
            <option value="Syllabus">Syllabus</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={zipIsCommon} 
            onChange={(e) => setZipIsCommon(e.target.checked)} 
            className="w-5 h-5 accent-blue-600" 
          />
          <label className="text-white font-medium">Common for All Branches</label>
        </div>

        <Input type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />

        <Button onClick={handleZipUpload} disabled={zipUploading || !zipFile} className="w-full py-7 bg-blue-600 text-white">
          {zipUploading ? `Uploading... ${zipProgress}%` : "Upload ZIP"}
        </Button>
      </CardContent>
    </Card>
  );
}