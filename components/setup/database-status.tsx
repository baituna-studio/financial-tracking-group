"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Database, User } from "lucide-react"
import { checkDatabaseSetup } from "@/lib/database-setup"

export function DatabaseStatus() {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      setIsChecking(true)
      try {
        const setupStatus = await checkDatabaseSetup()
        setIsSetup(setupStatus)
      } catch (error) {
        console.error("Setup check failed:", error)
        setIsSetup(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSetup()
  }, [])

  if (isChecking) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  if (isSetup === false) {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Database Setup Required</CardTitle>
          </div>
          <CardDescription>The database tables need to be created before you can use the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Please run the following SQL scripts in your Supabase SQL editor:</p>
            <div className="bg-gray-100 p-3 rounded-md text-sm space-y-1">
              <div>
                1. <code>scripts/01-create-tables.sql</code>
              </div>
              <div>
                2. <code>scripts/02-seed-data.sql</code>
              </div>
              <div>
                3. <code>scripts/03-create-dummy-user.sql</code> (optional)
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Demo Account</span>
              </div>
              <div className="text-xs text-blue-800">
                After running the scripts, you can use:
                <br />
                <strong>Email:</strong> ricky@gmail.com
                <br />
                <strong>Password:</strong> ricky@gmail.com
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              <Database className="mr-2 h-4 w-4" />
              Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border-green-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <CardTitle className="text-green-900">Database Ready</CardTitle>
        </div>
        <CardDescription>Your database is properly configured and ready to use.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 p-3 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Demo Account Available</span>
          </div>
          <div className="text-xs text-green-800">
            <strong>Email:</strong> ricky@gmail.com
            <br />
            <strong>Password:</strong> ricky@gmail.com
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
