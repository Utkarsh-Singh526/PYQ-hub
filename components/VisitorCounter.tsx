"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cpmyyeottwnhyiwayjqm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbXl5ZW90dHduaHlpd2F5anFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTYwMzgsImV4cCI6MjA5MTQ5MjAzOH0.dBAHBLlJSSvkHnN_ORQJ6O6LSWILExO39pY1pADjKPA"
);

export default function Home() {
  const [count, setCount] = useState(0);

  // 🔹 Add visitor
  useEffect(() => {
    const addVisitor = async () => {
      await supabase.from("visitors").insert([
        { ip_address: "anonymous" }
      ]);
    };

    addVisitor();
  }, []);

  // 🔹 Get count
  useEffect(() => {
    const getCount = async () => {
      const { count } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true });

      setCount( count || 0 );
    };

    getCount();
  }, []);

  return (
    
      // <h1>My Website</h1>
      <div>{count}</div>
     
  );
}