
import React from "react";
import { useProject, ProjectMember } from "@/contexts/ProjectContext";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import * as api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Mail, 
  UserPlus, 
  MoreHorizontal, 
  Shield, 
  User, 
  Eye 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const TeamPage = () => {
  const navigate = useNavigate();
  const { projects, currentProject, updateProject } = useProject();
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("member");
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get members from the current project or all projects
  const members = currentProject 
    ? currentProject.members 
    : projects.flatMap(project => project.members)
      .filter((member, index, self) => 
        index === self.findIndex(m => m.id === member.id)
      );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-primary" />;
      case "member":
        return <User className="h-4 w-4 text-muted-foreground" />;
      case "viewer":
        return <Eye className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default">Admin</Badge>
        );
      case "member":
        return (
          <Badge variant="secondary">Member</Badge>
        );
      case "viewer":
        return (
          <Badge variant="outline">Viewer</Badge>
        );
      default:
        return null;
    }
  };

  // Count the number of tasks assigned to each member
  const getTaskCount = (memberId: string) => {
    return projects
      .flatMap(project => project.tasks)
      .filter(task => task.assigneeId === memberId)
      .length;
  };

  // Get member's role in a specific project
  const getMemberRole = (projectId: string, memberId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const member = project.members.find(m => m.id === memberId);
    return member ? member.role : null;
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    if (!currentProject) return;
    try {
      await api.updateProjectMemberRole(currentProject.id, memberId, newRole);
      await updateProject(currentProject.id, {});
      toast({ title: "Role updated", description: "Member role updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentProject) return;
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.removeProjectMember(currentProject.id, memberId);
      await updateProject(currentProject.id, {});
      toast({ title: "Member removed", description: "The member was removed from the project." });
      navigate("/team");
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!addEmail.trim()) {
                  toast({ title: "Missing fields", description: "Please provide an email.", variant: "destructive" });
                  return;
                }
                if (!currentProject) {
                  toast({ title: "No project selected", description: "Select a project to add members.", variant: "destructive" });
                  return;
                }
                setIsAdding(true);
                try {
                  await api.inviteProjectMember(currentProject.id, { email: addEmail.trim() });
                  await updateProject(currentProject.id, {});
                  setAddEmail("");
                  setDialogOpen(false);
                  toast({ title: "Member added", description: "The member was added to the project." });
                  navigate("/team");
                } catch (error) {
                  toast({ title: "Error", description: "Failed to add member.", variant: "destructive" });
                } finally {
                  setIsAdding(false);
                }
              }}
            >
              <input
                type="email"
                placeholder="Email"
                value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                disabled={isAdding}
                required
              />
              <Button type="submit" disabled={isAdding} size="sm">
                Add Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {members.filter(m => m.role === "admin").length} administrators
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.reduce((acc, project) => acc + project.tasks.length, 0)} tasks in total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {members.length > 0 
                ? Math.round(projects.reduce((acc, project) => 
                    acc + project.tasks.filter(t => t.assigneeId).length, 0) / members.length) 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks per team member
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Tasks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      {getRoleBadge(member.role)}
                    </div>
                  </TableCell>
                  <TableCell>{getTaskCount(member.id)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin")}>Admin</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member")}>Member</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "viewer")}>Viewer</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveMember(member.id)}>
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                {projects.map(project => (
                  <TableHead key={project.id}>{project.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium truncate max-w-[140px]">
                        {member.name}
                      </div>
                    </div>
                  </TableCell>
                  {projects.map(project => (
                    <TableCell key={project.id}>
                      {getMemberRole(project.id, member.id) ? (
                        <Badge 
                          variant={getMemberRole(project.id, member.id) === "admin" ? "default" : "outline"} 
                          className="truncate max-w-[120px]"
                        >
                          {getMemberRole(project.id, member.id)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPage;
