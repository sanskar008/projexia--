
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import * as api from "@/services/api";
import { useState } from "react";

const avatarOptions = [
  // Dicebear Avataaars with different seeds
  `https://api.dicebear.com/7.x/avataaars/svg?seed=cat` ,
  `https://api.dicebear.com/7.x/avataaars/svg?seed=dog` ,
  `https://api.dicebear.com/7.x/avataaars/svg?seed=fox` ,
  `https://api.dicebear.com/7.x/avataaars/svg?seed=owl` ,
  `https://api.dicebear.com/7.x/avataaars/svg?seed=lion` ,
  `https://api.dicebear.com/7.x/avataaars/svg?seed=koala` ,
];

const Settings = () => {
  const { currentUser } = useProject();
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const handleAvatarChange = async (avatarUrl: string) => {
    setIsSaving(true);
    try {
      await api.updateUserAvatar(currentUser.id, avatarUrl);
      setSelectedAvatar(avatarUrl);
      toast({ title: "Avatar updated!" });
      window.location.reload();
    } catch {
      toast({ title: "Error", description: "Failed to update avatar.", variant: "destructive" });
    } finally {
      setIsSaving(false);
      setShowAvatarOptions(false);
    }
  };

  const handleNotificationToggle = (enabled: boolean) => {
    toast({
      title: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
      description: `You will ${enabled ? 'now' : 'no longer'} receive notifications.`
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your tasks and projects
                </p>
              </div>
              <Switch id="notifications" onCheckedChange={handleNotificationToggle} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={selectedAvatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">Your Avatar</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvatarOptions((v) => !v)}
                  disabled={isSaving}
                >
                  Change Avatar
                </Button>
                {showAvatarOptions && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {avatarOptions.map((url) => (
                      <button
                        key={url}
                        className={`border-2 rounded-full p-0.5 transition-colors ${selectedAvatar === url ? 'border-primary' : 'border-transparent'} hover:border-primary`}
                        onClick={() => handleAvatarChange(url)}
                        disabled={isSaving}
                        type="button"
                        title="Select avatar"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={url} alt="avatar option" />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {currentUser.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {currentUser.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive"
              onClick={() => {
                toast({
                  title: "Action required",
                  description: "Please contact support to delete your account.",
                  variant: "destructive"
                });
              }}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
