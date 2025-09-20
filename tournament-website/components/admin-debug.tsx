'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function AdminDebug() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runQuickTest = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const results: any[] = []
    
    try {
      // Test 1: Session check
      results.push({ test: 'Session Check', status: 'running', time: Date.now() })
      const { data: session } = await supabase.auth.getSession()
      results.push({ 
        test: 'Session Check', 
        status: session.session ? 'pass' : 'fail', 
        data: session.session ? 'User logged in' : 'No session',
        time: Date.now()
      })
      
      // Test 2: Quick DB connection
      results.push({ test: 'DB Connection', status: 'running', time: Date.now() })
      const startTime = Date.now()
      
      try {
        const dbPromise = supabase.from('tournaments').select('id').limit(1)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
        
        const result = await Promise.race([dbPromise, timeoutPromise]) as any
        
        const duration = Date.now() - startTime
        results.push({ 
          test: 'DB Connection', 
          status: result.error ? 'fail' : 'pass', 
          data: result.error ? result.error.message : `Connected in ${duration}ms`,
          time: Date.now()
        })
      } catch (err) {
        results.push({ 
          test: 'DB Connection', 
          status: 'fail', 
          data: err instanceof Error ? err.message : 'Unknown error',
          time: Date.now()
        })
      }
      
      // Test 3: Tournament count
      results.push({ test: 'Tournament Count', status: 'running', time: Date.now() })
      try {
        const { count, error } = await supabase
          .from('tournaments')
          .select('*', { count: 'exact', head: true })
        
        results.push({ 
          test: 'Tournament Count', 
          status: error ? 'fail' : 'pass', 
          data: error ? error.message : `${count} tournaments`,
          time: Date.now()
        })
      } catch (err) {
        results.push({ 
          test: 'Tournament Count', 
          status: 'fail', 
          data: err instanceof Error ? err.message : 'Unknown error',
          time: Date.now()
        })
      }
      
    } catch (err) {
      results.push({ 
        test: 'Overall Test', 
        status: 'fail', 
        data: err instanceof Error ? err.message : 'Unknown error',
        time: Date.now()
      })
    }
    
    setTestResults(results)
    setIsRunning(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Panel Debug Tool</CardTitle>
        <CardDescription>Quick diagnostic tests for admin panel issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runQuickTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Quick Diagnostic'}
        </Button>
        
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  result.status === 'pass' ? 'bg-green-50 border-green-200' :
                  result.status === 'fail' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.test}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.status === 'pass' ? 'bg-green-100 text-green-800' :
                    result.status === 'fail' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                {result.data && (
                  <div className="text-sm text-gray-600 mt-1">{result.data}</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Quick Tips:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>If Session Check fails: Try logging out and back in</li>
            <li>If DB Connection fails: Check your internet connection</li>
            <li>If Tournament Count fails: Database permissions issue</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}