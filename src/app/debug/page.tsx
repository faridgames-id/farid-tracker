'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { KEYS } from '@/lib/store';

export default function DebugPage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    async function runTest() {
      addLog('Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addLog('Session Error: ' + sessionError.message);
        return;
      }
      
      if (!session) {
        addLog('No active session. Please log in first.');
        return;
      }
      
      addLog('Session found for user: ' + session.user.email + ' (ID: ' + session.user.id + ')');
      
      addLog('Attempting to insert dummy data into user_data...');
      const { data, error } = await supabase.from('user_data').upsert({
        user_id: session.user.id,
        data: { test: 'hello world' },
        updated_at: new Date().toISOString()
      }).select();
      
      if (error) {
        addLog('UPSERT ERROR: ' + JSON.stringify(error, null, 2));
      } else {
        addLog('UPSERT SUCCESS: ' + JSON.stringify(data, null, 2));
      }

      addLog('Attempting to read from user_data...');
      const { data: readData, error: readError } = await supabase.from('user_data').select('*');
      
      if (readError) {
        addLog('SELECT ERROR: ' + JSON.stringify(readError, null, 2));
      } else {
        addLog('SELECT SUCCESS: ' + JSON.stringify(readData, null, 2));
      }
    }
    
    runTest();
  }, []);

  return (
    <div className="p-8 text-white font-mono text-xs space-y-2">
      <h1 className="text-xl font-bold mb-4">Supabase Connection Debugger</h1>
      {log.map((l, i) => (
        <pre key={i} className="bg-black/50 p-2 rounded whitespace-pre-wrap">{l}</pre>
      ))}
    </div>
  );
}
