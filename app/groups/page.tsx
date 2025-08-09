"use client"

import { useState, useEffect } from "react"
import { Plus, Users, UserPlus, User, Crown, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { InviteDialog } from "@/components/groups/invite-dialog"
import { GroupAddModal } from "@/components/modals/group-add-modal"
import { GroupEditModal } from "@/components/modals/group-edit-modal"
import { GroupMembersModal } from "@/components/modals/group-members-modal"

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [groupMembers, setGroupMembers] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteGroup, setInviteGroup] = useState<any | null>(null)
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<any | null>(null)
  const [viewMembersGroup, setViewMembersGroup] = useState<any | null>(null)
  const [viewMembers, setViewMembers] = useState<any[]>([])

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
        // Get member counts and member details for each group
        const groupsWithCounts = await Promise.all(
          userGroups.map(async (ug) => {
            const { count } = await supabase
              .from("user_groups")
              .select("*", { count: "exact", head: true })
              .eq("group_id", ug.groups.id)

            // Get all members for this group
            const { data: members } = await supabase
              .from("user_groups")
              .select(`
              role,
              joined_at,
              profiles(id, full_name, email)
            `)
              .eq("group_id", ug.groups.id)
              .order("role", { ascending: false }) // Admin first
              .order("joined_at", { ascending: true })

            // Store members in state
            setGroupMembers((prev) => ({
              ...prev,
              [ug.groups.id]: members || [],
            }))

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

  const handleViewMembers = (group: any) => {
    const members = groupMembers[group.id] || []
    setViewMembersGroup(group)
    setViewMembers(members)
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
          <Button onClick={() => setIsAddGroupModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Grup Baru
          </Button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const members = groupMembers[group.id] || []
            const adminCount = members.filter((m) => m.role === "admin").length
            const memberCount = members.filter((m) => m.role === "member").length

            return (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>
                          {adminCount} admin • {memberCount} member
                        </CardDescription>
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

                    {/* Quick Member Preview */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Anggota ({group.member_count})
                      </h4>
                      <div className="flex items-center gap-2">
                        {members.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium"
                            title={member.profiles?.full_name || "Unknown"}
                          >
                            {member.role === "admin" ? (
                              <Crown className="h-3 w-3 text-yellow-600" />
                            ) : (
                              <User className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                        ))}
                        {members.length > 3 && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                            +{members.length - 3}
                          </div>
                        )}
                        {members.length === 0 && <span className="text-sm text-gray-500">Belum ada anggota</span>}
                      </div>
                    </div>

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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setInviteGroup({ id: group.id, name: group.name })
                          setInviteOpen(true)
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Undang
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() => handleViewMembers(group)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {group.role === "admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => setEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {groups.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Belum ada grup</h3>
              <p className="text-gray-600 text-center mb-4">
                Buat grup pertama Anda untuk mulai berbagi keuangan dengan keluarga atau teman
              </p>
              <Button onClick={() => setIsAddGroupModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Grup Pertama
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} group={inviteGroup} />
      <GroupAddModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onSuccess={loadGroups}
      />
      <GroupEditModal
        isOpen={!!editGroup}
        onClose={() => setEditGroup(null)}
        onSuccess={loadGroups}
        group={editGroup}
      />
      <GroupMembersModal
        isOpen={!!viewMembersGroup}
        onClose={() => {
          setViewMembersGroup(null)
          setViewMembers([])
        }}
        group={viewMembersGroup}
        members={viewMembers}
      />
    </MainLayout>
  )
}
