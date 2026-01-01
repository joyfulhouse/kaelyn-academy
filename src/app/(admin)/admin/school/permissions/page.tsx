"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Save,
  Loader2,
  Users,
  GraduationCap,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: {
    teacher: boolean;
    school_admin: boolean;
    parent: boolean;
  };
}

interface PermissionGroup {
  name: string;
  icon: LucideIcon;
  permissions: Permission[];
}

export default function PermissionsPage() {
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/admin/school/permissions");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      } else {
        // Mock data
        setGroups([
          {
            name: "Student Management",
            icon: Users,
            permissions: [
              { id: "view_students", name: "View Students", description: "View student list and profiles", roles: { teacher: true, school_admin: true, parent: false } },
              { id: "edit_students", name: "Edit Students", description: "Modify student information", roles: { teacher: false, school_admin: true, parent: false } },
              { id: "import_students", name: "Import Students", description: "Bulk import students", roles: { teacher: false, school_admin: true, parent: false } },
            ],
          },
          {
            name: "Progress & Reports",
            icon: GraduationCap,
            permissions: [
              { id: "view_progress", name: "View Progress", description: "View learning progress", roles: { teacher: true, school_admin: true, parent: true } },
              { id: "view_reports", name: "View Reports", description: "Access performance reports", roles: { teacher: true, school_admin: true, parent: true } },
              { id: "export_reports", name: "Export Reports", description: "Download reports", roles: { teacher: true, school_admin: true, parent: false } },
            ],
          },
          {
            name: "Curriculum",
            icon: GraduationCap,
            permissions: [
              { id: "view_curriculum", name: "View Curriculum", description: "View curriculum content", roles: { teacher: true, school_admin: true, parent: true } },
              { id: "assign_lessons", name: "Assign Lessons", description: "Assign lessons to students", roles: { teacher: true, school_admin: true, parent: false } },
              { id: "modify_curriculum", name: "Modify Curriculum", description: "Enable/disable curriculum", roles: { teacher: false, school_admin: true, parent: false } },
            ],
          },
          {
            name: "Administration",
            icon: UserCog,
            permissions: [
              { id: "manage_teachers", name: "Manage Teachers", description: "Add/edit teacher accounts", roles: { teacher: false, school_admin: true, parent: false } },
              { id: "manage_settings", name: "School Settings", description: "Configure school settings", roles: { teacher: false, school_admin: true, parent: false } },
              { id: "view_audit_logs", name: "View Audit Logs", description: "Access audit trail", roles: { teacher: false, school_admin: true, parent: false } },
            ],
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups }),
      });
    } catch (error) {
      console.error("Failed to save permissions:", error);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (
    groupIndex: number,
    permIndex: number,
    role: "teacher" | "school_admin" | "parent"
  ) => {
    const newGroups = [...groups];
    newGroups[groupIndex].permissions[permIndex].roles[role] =
      !newGroups[groupIndex].permissions[permIndex].roles[role];
    setGroups(newGroups);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permissions & Roles</h1>
          <p className="text-muted-foreground">
            Configure access permissions for different user roles.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Teacher</p>
                <p className="text-sm text-muted-foreground">
                  Class management, student progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <UserCog className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">School Admin</p>
                <p className="text-sm text-muted-foreground">
                  Full school administration access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Parent</p>
                <p className="text-sm text-muted-foreground">
                  View child's progress and reports
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Toggle permissions for each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {groups.map((group, groupIndex) => {
              const IconComponent = group.icon;
              return (
              <AccordionItem key={group.name} value={group.name}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {group.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Teacher</TableHead>
                        <TableHead className="text-center">School Admin</TableHead>
                        <TableHead className="text-center">Parent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.permissions.map((perm, permIndex) => (
                        <TableRow key={perm.id}>
                          <TableCell className="font-medium">{perm.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {perm.description}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={perm.roles.teacher}
                              onCheckedChange={() =>
                                togglePermission(groupIndex, permIndex, "teacher")
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={perm.roles.school_admin}
                              onCheckedChange={() =>
                                togglePermission(groupIndex, permIndex, "school_admin")
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={perm.roles.parent}
                              onCheckedChange={() =>
                                togglePermission(groupIndex, permIndex, "parent")
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
