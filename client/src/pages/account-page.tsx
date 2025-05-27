import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { user } = useAuth();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [originalProfilePic, setOriginalProfilePic] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // On mount, set profilePic from user.profilePhoto if available
  useEffect(() => {
    if (user?.profilePhoto) {
      setProfilePic(user.profilePhoto);
      setOriginalProfilePic(user.profilePhoto);
    }
  }, [user]);

  // Password change form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfilePhoto = async () => {
    setIsSavingPhoto(true);
    try {
      const res = await fetch('/api/user/profile-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhoto: profilePic }),
      });
      if (!res.ok) throw new Error('Failed to save profile photo');
      setIsSavingPhoto(false);
      setSaveSuccess(true);
      setOriginalProfilePic(profilePic);
    } catch (err) {
      setIsSavingPhoto(false);
      alert("Failed to save profile photo");
    }
  };

  const handlePasswordChange = (data: PasswordFormData) => {
    setIsChangingPassword(true);
    // TODO: Implement password change API call
    setTimeout(() => {
      setIsChangingPassword(false);
      passwordForm.reset();
      alert("Password changed successfully (mock)");
    }, 1200);
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    // TODO: Implement account deletion API call
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteModal(false);
      alert("Account deleted (mock)");
    }, 1500);
  };

  const isPhotoChanged = profilePic && profilePic !== originalProfilePic;

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-xl mx-auto p-0">
          <CardHeader>
            <CardTitle>My Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400 text-4xl">{user?.name?.[0] || user?.username?.[0]}</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleProfilePicChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {profilePic ? "Change Photo" : "Upload Photo"}
              </Button>
              <Button
                className="mt-2 w-32"
                onClick={handleSaveProfilePhoto}
                disabled={!isPhotoChanged || isSavingPhoto}
              >
                {isSavingPhoto ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : saveSuccess ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />Saved!</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>

            {/* User Info */}
            {user ? (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Username:</span> {user.username}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {user.email}
                </div>
                {user.name && (
                  <div>
                    <span className="font-semibold">Full Name:</span> {user.name}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Admin:</span> {user.isAdmin ? "Yes" : "No"}
                </div>
              </div>
            ) : (
              <p>Loading user information...</p>
            )}

            {/* Password Change Form */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Change Password</h2>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="New password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing...</>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Account Deletion */}
            <div className="pt-2">
              <Button
                variant="destructive"
                className="w-full flex items-center justify-center"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 