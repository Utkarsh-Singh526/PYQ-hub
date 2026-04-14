'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VisitorCounter() {
  const [count, setCount] = useState(1247);

  useEffect(() => {
    const increment = async () => {
      try {
        await supabase
          .from('site_stats')
          .upsert({ name: 'visitors', count: count + 1 }, { onConflict: 'name' });
        
        const { data } = await supabase
          .from('site_stats')
          .select('count')
          .eq('name', 'visitors')
          .single();

        if (data) setCount(data.count);
      } catch (e) {
        console.log("Visitor count error");
      }
    };

    increment();
  }, []);

  return <span className="text-green-400 font-medium">{count.toLocaleString()}</span>;
}