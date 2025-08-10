import React, { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import * as api from "@/services/api";

interface InviteMemberDialogProps {
  projectId: string;
}

const InviteMemberDialog = ({ projectId }: InviteMemberDialogProps) => {
  const { currentProject, updateProject } = useProject();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Missing email",
        description: "Please provide the member's email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newMember = await api.inviteProjectMember(projectId, {
        email: email.trim(),
      });

      // Update the project with the new member
      if (currentProject) {
        await updateProject(currentProject.id, {
          members: [...currentProject.members, newMember],
        });
      }

      setEmail("");
      setOpen(false);

      toast({
        title: "Member invited",
        description: "The invitation has been sent successfully",
      });
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a new member to collaborate on this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter member's email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inviting...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog; 