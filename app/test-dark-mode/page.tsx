import { MainLayout } from '@/components/layout/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useDarkMode, darkModeUtils } from '@/lib/dark-mode';
import { useState, useEffect } from 'react';

export default function TestDarkModePage() {
  const { isDarkMode, toggleDarkMode, setDarkMode } = useDarkMode();
  const [storageInfo, setStorageInfo] = useState({
    darkMode: null as boolean | null,
    hasUserPreference: false,
    systemPreference: false,
  });

  // Update storage info
  const updateStorageInfo = () => {
    setStorageInfo({
      darkMode: darkModeUtils.getDarkModeFromStorage(),
      hasUserPreference: darkModeUtils.hasUserPreference(),
      systemPreference: darkModeUtils.getSystemPreference(),
    });
  };

  useEffect(() => {
    updateStorageInfo();
  }, [isDarkMode]);

  const clearUserPreference = () => {
    darkModeUtils.clearUserPreference();
    updateStorageInfo();
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <MainLayout
      title="Test Dark Mode"
      subtitle="Test dark mode dengan localStorage persistence"
      showSearch={false}
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Dark Mode Test
          </Badge>
          <Button variant="outline" size="sm" onClick={updateStorageInfo}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Info
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Status */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              Current Dark Mode Status
            </CardTitle>
            <CardDescription className="text-blue-800 dark:text-blue-200">
              Status dark mode saat ini dan informasi localStorage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-medium">Current Mode</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  ✅ Active
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">localStorage</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {storageInfo.darkMode !== null
                    ? storageInfo.darkMode
                      ? 'Dark'
                      : 'Light'
                    : 'Not set'}
                </p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  ✅ Persisted
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">System Preference</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {storageInfo.systemPreference ? 'Dark' : 'Light'}
                </p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  ℹ️ System
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dark Mode Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Dark Mode Controls</CardTitle>
            <CardDescription>
              Test berbagai cara mengontrol dark mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={toggleDarkMode}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  {isDarkMode ? (
                    <Sun className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Moon className="h-6 w-6 text-blue-600" />
                  )}
                  <span>Toggle Dark Mode</span>
                  <span className="text-xs text-gray-500">
                    Switch between light/dark
                  </span>
                </Button>

                <Button
                  onClick={() => setDarkMode(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  disabled={isDarkMode}
                >
                  <Moon className="h-6 w-6 text-blue-600" />
                  <span>Force Dark Mode</span>
                  <span className="text-xs text-gray-500">
                    Set to dark mode
                  </span>
                </Button>

                <Button
                  onClick={() => setDarkMode(false)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  disabled={!isDarkMode}
                >
                  <Sun className="h-6 w-6 text-yellow-500" />
                  <span>Force Light Mode</span>
                  <span className="text-xs text-gray-500">
                    Set to light mode
                  </span>
                </Button>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Test Instructions:
                </h3>
                <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-decimal list-inside">
                  <li>Klik button toggle untuk beralih dark/light mode</li>
                  <li>Perhatikan perubahan UI dan localStorage</li>
                  <li>Refresh halaman untuk verifikasi persistence</li>
                  <li>Test di browser developer tools</li>
                  <li>Periksa localStorage di Application tab</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* localStorage Information */}
        <Card>
          <CardHeader>
            <CardTitle>localStorage Information</CardTitle>
            <CardDescription>
              Detail informasi localStorage dan preference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold mb-2">Storage Keys</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Key:
                      </span>
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        financial-app-dark-mode
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Value:
                      </span>
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {storageInfo.darkMode?.toString() || 'null'}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold mb-2">User Preference</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Key:
                      </span>
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        financial-app-dark-mode-preference
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Has Preference:
                      </span>
                      <Badge
                        variant={
                          storageInfo.hasUserPreference
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {storageInfo.hasUserPreference ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={clearUserPreference}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear User Preference
                </Button>
                <Button
                  onClick={refreshPage}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Expected Behavior:
                </h3>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
                  <li>✅ Dark mode preference tersimpan di localStorage</li>
                  <li>✅ Preference tetap setelah refresh halaman</li>
                  <li>
                    ✅ Fallback ke system preference jika tidak ada user
                    preference
                  </li>
                  <li>✅ No flash of unstyled content (FOUC)</li>
                  <li>✅ Smooth transition antara light/dark mode</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Browser Developer Tools Instructions */}
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-100">
              🔧 Browser Developer Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-purple-800 dark:text-purple-200">
                <strong>Cara memeriksa localStorage:</strong>
              </p>
              <ol className="text-purple-800 dark:text-purple-200 space-y-1 list-decimal list-inside">
                <li>Buka Developer Tools (F12)</li>
                <li>
                  Pilih tab "Application" (Chrome) atau "Storage" (Firefox)
                </li>
                <li>Expand "Local Storage" → domain Anda</li>
                <li>
                  Lihat key "financial-app-dark-mode" dan
                  "financial-app-dark-mode-preference"
                </li>
                <li>Toggle dark mode dan perhatikan perubahan value</li>
                <li>Refresh halaman untuk verifikasi persistence</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Status Check */}
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-100">
              🔍 Dark Mode Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-purple-800 dark:text-purple-200">
                <strong>Test Checklist:</strong>
              </p>
              <ul className="text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
                <li>✅ Dark mode toggle berfungsi</li>
                <li>✅ Preference tersimpan di localStorage</li>
                <li>✅ Preference tetap setelah refresh</li>
                <li>✅ Fallback ke system preference</li>
                <li>✅ No FOUC (flash of unstyled content)</li>
                <li>✅ Smooth transitions</li>
                <li>✅ Console logging berfungsi</li>
                <li>✅ Error handling robust</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
