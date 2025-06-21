'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testTeachers } from '@/app/actions/test-teachers';
import { seedTestTeachers } from '@/app/actions/seed-teachers';
import { getTeachers } from '@/app/actions/teachers';

export default function TestTeachersPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestTeachers = async () => {
    setLoading(true);
    try {
      const result = await testTeachers();
      setResults({ type: 'test', ...result });
    } catch (error) {
      setResults({ type: 'test', success: false, error: error?.toString() });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTeachers = async () => {
    setLoading(true);
    try {
      const result = await seedTestTeachers();
      setResults({ type: 'seed', ...result });
    } catch (error) {
      setResults({ type: 'seed', success: false, error: error?.toString() });
    } finally {
      setLoading(false);
    }
  };

  const handleGetTeachers = async () => {
    setLoading(true);
    try {
      const result = await getTeachers('234567');
      setResults({ type: 'get', ...result });
    } catch (error) {
      setResults({ type: 'get', success: false, error: error?.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Teachers Database</h1>
        <p className="text-muted-foreground">Debug teacher data issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={handleTestTeachers} disabled={loading}>
          Test Database Connection
        </Button>
        <Button onClick={handleSeedTeachers} disabled={loading}>
          Seed Test Teachers
        </Button>
        <Button onClick={handleGetTeachers} disabled={loading}>
          Get Teachers (Production Function)
        </Button>
      </div>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results - {results.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96 text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 