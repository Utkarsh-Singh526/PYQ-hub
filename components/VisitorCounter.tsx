'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VisitorCounter() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateVisitorCount = async () => {
      try {
        // Increment the count
        const { error: updateError } = await supabase
          .from('site_stats')
          .upsert(
            { name: 'visitors', count: supabase.rpc('increment') },
            { onConflict: 'name' }
          );

        if (updateError) throw updateError;

        // Get the latest count
        const { data, error: fetchError } = await supabase
          .from('site_stats')
          .select('count')
          .eq('name', 'visitors')
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setCount(data.count);
        }
      } catch (err) {
        console.error("Visitor counter error:", err);
        // No fallback number - just keep it as 0 if error
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    updateVisitorCount();
  }, []);

  return (
    <span className="text-green-400 font-medium">
      {loading ? "..." : count.toLocaleString()}
    </span>
  );
}