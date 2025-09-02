'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { toast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Edit3,
  Save,
  X,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      setUser(currentUser);

      // Load profile data
      const profileData = await getUserProfile(currentUser.id);
      setProfile(profileData);
      setFormData({
        full_name: profileData?.full_name || '',
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        bio: profileData?.bio || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: formData.full_name },
      });

      if (updateError) throw updateError;

      toast({
        title: t('profile_updated'),
        description: t('changes_saved'),
      });

      setIsEditing(false);
      await loadUserData(); // Reload data
    } catch (error: any) {
      toast({
        title: t('profile_update_error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('user_profile')}
          </DialogTitle>
          <DialogDescription>{t('profile_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                {(user?.user_metadata?.full_name || user?.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.user_metadata?.full_name || 'Nama Lengkap'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('joined_since')}{' '}
                {new Date(user?.created_at).toLocaleDateString(
                  language === 'id' ? 'id-ID' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <X className="h-4 w-4" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
              {isEditing ? t('cancel') : t('edit')}
            </Button>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  {t('full_name')}
                </Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange('full_name', e.target.value)
                    }
                    placeholder={t('enter_full_name')}
                    className="border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      {profile?.full_name || t('not_filled')}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t('phone')}
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('enter_phone')}
                    className="border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      {profile?.phone || t('not_filled')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                {t('address')}
              </Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('enter_address')}
                  rows={3}
                  className="border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">
                    {profile?.address || t('not_filled')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                {t('bio')}
              </Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={t('enter_bio')}
                  rows={4}
                  className="border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">
                    {profile?.bio || t('not_filled')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              {t('account_info')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">
                  {t('user_id')}:
                </span>
                <span className="text-blue-900 dark:text-blue-100 font-mono">
                  {user?.id?.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">
                  {t('verification_status')}:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.email_confirmed_at
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {user?.email_confirmed_at ? t('verified') : t('not_verified')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">
                  {t('last_login')}:
                </span>
                <span className="text-blue-900 dark:text-blue-100">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString(
                        language === 'id' ? 'id-ID' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )
                    : t('never_logged_in')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('saving')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {t('save_changes')}
                  </div>
                )}
              </Button>
            </>
          )}
          {!isEditing && (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {t('close')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
