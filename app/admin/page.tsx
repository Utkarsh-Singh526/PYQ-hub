'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { supabase } from '@/lib/supabase';

import SingleUpload from './single-upload';
import ZipUpload from './zip-upload';
import ManagePapers from './manage-papers';
import CommonPapers from './common-papers';   // New

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'zip' | 'manage' | 'common'>('single');

  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  }, []);

  const handleLogin = () => {
    if (password === "526Utkarsh@") {
      setIsLoggedIn(true);
      setShowLogin(false);
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      setError("Wrong Password! Hint: 526Utkarsh@");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    setShowLogin(true);
    setPassword('');
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
            />
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

      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-700 pb-2">
        <button 
          onClick={() => setActiveTab('single')} 
          className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Single PDF
        </button>
        <button 
          onClick={() => setActiveTab('zip')} 
          className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'zip' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          ZIP Upload
        </button>
        <button 
          onClick={() => setActiveTab('manage')} 
          className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'manage' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Manage PYQ
        </button>
        <button 
          onClick={() => setActiveTab('common')} 
          className={`px-8 py-3 font-medium rounded-t-lg ${activeTab === 'common' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Common Papers
        </button>
      </div>

      {activeTab === 'single' && <SingleUpload />}
      {activeTab === 'zip' && <ZipUpload />}
      {activeTab === 'manage' && <ManagePapers />}
      {activeTab === 'common' && <CommonPapers />}
    </div>
  );
}