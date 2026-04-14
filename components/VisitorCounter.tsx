'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VisitorCounter() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const incrementAndGetCount = async () => {
      try {
        // Step 1: Increment the count
        await supabase
          .from('site_stats')
          .update({ count: supabase.rpc('increment_count') })  // We'll create this function
          .eq('name', 'visitors');

        // Step 2: Get the updated count
        const { data, error } = await supabase
          .from('site_stats')
          .select('count')
          .eq('name', 'visitors')
          .single();

        if (error) throw error;
        if (data) setCount(data.count);

      } catch (err) {
        console.error("Visitor counter error:", err);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    incrementAndGetCount();
  }, []);

  return (
    <span className="text-green-400 font-medium">
      {loading ? "..." : count.toLocaleString()}
    </span>
  );
}