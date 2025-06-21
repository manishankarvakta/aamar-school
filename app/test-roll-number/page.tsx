'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateRollNumber, getClassesByBranch } from '@/app/actions/admission';

export default function TestRollNumberPage() {
  const [classId, setClassId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testGeneration = async () => {
    if (!classId) return;
    
    setLoading(true);
    try {
      const result = await generateRollNumber(classId);
      setRollNumber(result);
      console.log('Generated roll number:', result);
    } catch (error) {
      console.error('Error:', error);
      setRollNumber('ERROR');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      // Use a sample branch ID - you can get this from your database
      const branchClasses = await getClassesByBranch('sample-branch-id');
      setClasses(branchClasses);
      console.log('Classes loaded:', branchClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Roll Number Generation Test</h1>
      
      <div className="space-y-4">
        <Button onClick={loadClasses}>Load Classes</Button>
        
        <div>
          <label>Class ID:</label>
          <Input 
            value={classId} 
            onChange={(e) => setClassId(e.target.value)}
            placeholder="Enter class ID"
          />
        </div>
        
        <Button onClick={testGeneration} disabled={!classId || loading}>
          {loading ? 'Generating...' : 'Generate Roll Number'}
        </Button>
        
        <div>
          <label>Generated Roll Number:</label>
          <Input value={rollNumber} readOnly />
        </div>
        
        <div>
          <h3 className="font-bold">Available Classes:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(classes, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 