"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  role: "learner" | "parent" | "teacher" | "admin";
  organizationId?: string;
  createdAt: string;
  lastActiveAt?: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      // TODO: Fetch from API
      // For now, use mock data
      setUsers([
        { id: "1", name: "Emma Johnson", email: "emma@example.com", role: "learner", createdAt: "2024-11-15", lastActiveAt: "2024-12-25", isActive: true },
        { id: "2", name: "Liam Smith", email: "liam@example.com", role: "learner", createdAt: "2024-10-20", lastActiveAt: "2024-12-24", isActive: true },
        { id: "3", name: "Sarah Johnson", email: "sarah@example.com", role: "parent", createdAt: "2024-11-15", lastActiveAt: "2024-12-25", isActive: true },
        { id: "4", name: "Michael Chen", email: "michael@example.com", role: "teacher", createdAt: "2024-09-01", lastActiveAt: "2024-12-25", isActive: true },
        { id: "5", name: "Admin User", email: "admin@kaelyns.academy", role: "admin", createdAt: "2024-01-01", lastActiveAt: "2024-12-25", isActive: true },
      ]);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    learner: "bg-blue-100 text-blue-700",
    parent: "bg-green-100 text-green-700",
    teacher: "bg-purple-100 text-purple-700",
    admin: "bg-red-100 text-red-700",
  };

  const roleStats = {
    total: users.length,
    learners: users.filter((u) => u.role === "learner").length,
    parents: users.filter((u) => u.role === "parent").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users across your organization</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{roleStats.total}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{roleStats.learners}</div>
            <div className="text-sm text-gray-500">Learners</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{roleStats.parents}</div>
            <div className="text-sm text-gray-500">Parents</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{roleStats.teachers}</div>
            <div className="text-sm text-gray-500">Teachers</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{roleStats.admins}</div>
            <div className="text-sm text-gray-500">Admins</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("")}
              >
                All
              </Button>
              {["learner", "parent", "teacher", "admin"].map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}s
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500 text-sm">User</th>
                  <th className="pb-3 font-medium text-gray-500 text-sm">Role</th>
                  <th className="pb-3 font-medium text-gray-500 text-sm">Joined</th>
                  <th className="pb-3 font-medium text-gray-500 text-sm">Last Active</th>
                  <th className="pb-3 font-medium text-gray-500 text-sm">Status</th>
                  <th className="pb-3 font-medium text-gray-500 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-gray-200">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
