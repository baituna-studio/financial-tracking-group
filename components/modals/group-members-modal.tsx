"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { User, Crown, Calendar, Mail } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface GroupMembersModalProps {
  isOpen: boolean
  onClose: () => void
  group: any | null
  members: any[]
}

export function GroupMembersModal({ isOpen, onClose, group, members }: GroupMembersModalProps) {
  if (!group) return null

  const adminMembers = members.filter((m) => m.role === "admin")
  const regularMembers = members.filter((m) => m.role === "member")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Anggota {group.name}
          </DialogTitle>
          <DialogDescription>Daftar semua anggota dalam grup ini ({members.length} orang)</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Admin Section */}
          {adminMembers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <h3 className="font-semibold text-sm">Administrator ({adminMembers.length})</h3>
              </div>
              <div className="space-y-2">
                {adminMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Crown className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.profiles?.full_name || "Unknown"}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{member.profiles?.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Bergabung {formatDate(member.joined_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Admin</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {regularMembers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-sm">Anggota ({regularMembers.length})</h3>
              </div>
              <div className="space-y-2">
                {regularMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.profiles?.full_name || "Unknown"}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{member.profiles?.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Bergabung {formatDate(member.joined_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {members.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada anggota dalam grup ini</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
