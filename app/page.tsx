'use client';

import { useEffect } from 'react';
import { db } from '../lib/firebase';   // yeh path adjust ho sakta hai
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log("🔥 Firebase testing...");
        const querySnapshot = await getDocs(collection(db, "test"));
        console.log("✅ Firebase connected successfully!");
        console.log("Documents count:", querySnapshot.size);
      } catch (error) {
        console.error("❌ Firebase error:", error);
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">College PYQ Hub - Testing</h1>
      <p className="text-xl">Check karo browser ke Console mein (F12 daba ke Console tab kholo)</p>
      <p className="mt-4 text-green-400">Agar "Firebase connected successfully!" dikhe toh sab theek hai ✅</p>
    </div>
  );
}