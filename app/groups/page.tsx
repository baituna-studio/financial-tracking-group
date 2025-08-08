"use client"

import { useState, useEffect } from "react"
import { Plus, Users, Settings, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Get user's groups with member count
      const { data: userGroups } = await supabase
        .from("user_groups")
        .select(`
          role,
          joined_at,
          groups(
            id,
            name,
            description,
            created_at,
            profiles!groups_created_by_fkey(full_name)
          )
        `)
        .eq("user_id", user.id)

      if (userGroups) {
        // Get member counts for each group
        const groupsWithCounts = await Promise.all(
          userGroups.map(async (ug) => {
            const { count } = await supabase
              .from("user_groups")
              .select("*", { count: "exact", head: true })
              .eq("group_id", ug.groups.id)

            return {
              ...ug.groups,
              role: ug.role,
              joined_at: ug.joined_at,
              member_count: count || 0,
              creator_name: ug.groups.profiles?.full_name,
            }
          }),
        )

        setGroups(groupsWithCounts)
      }
    } catch (error) {
      console.error("Error loading groups:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grup</h1>
            <p className="text-gray-600">Kelola grup keuangan Anda</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Grup Baru
          </Button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.member_count} anggota</CardDescription>
                    </div>
                  </div>
                  <Badge variant={group.role === "admin" ? "default" : "secondary"}>
                    {group.role === "admin" ? "Admin" : "Anggota"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.description && <p className="text-sm text-gray-600">{group.description}</p>}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dibuat oleh:</span>
                      <span className="font-medium">{group.creator_name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bergabung:</span>
                      <span className="font-medium">{formatDate(group.joined_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Undang
                    </Button>
                    {group.role === "admin" && (
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Belum ada grup</h3>
              <p className="text-gray-600 text-center mb-4">
                Buat grup pertama Anda untuk mulai berbagi keuangan dengan keluarga atau teman
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Grup Pertama
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
