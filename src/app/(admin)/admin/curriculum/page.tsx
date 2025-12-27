"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  color?: string;
  unitsCount: number;
  lessonsCount: number;
  isPublished: boolean;
}

interface Unit {
  id: string;
  title: string;
  slug: string;
  description?: string;
  subjectId: string;
  gradeLevel: number;
  lessonsCount: number;
  isPublished: boolean;
  estimatedMinutes?: number;
}

interface CurriculumData {
  subjects: Subject[];
  units: Unit[];
  stats: {
    totalSubjects: number;
    totalUnits: number;
    totalLessons: number;
    publishedUnits: number;
  };
}

export default function AdminCurriculumPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"subjects" | "units" | "lessons">("subjects");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<CurriculumData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedSubject) params.set("subjectId", selectedSubject);

      const response = await fetch(`/api/admin/curriculum?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch curriculum data");
      }

      const curriculumData = await response.json();
      setData(curriculumData);
    } catch (err) {
      console.error("Failed to fetch curriculum:", err);
      setError(err instanceof Error ? err.message : "Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data) {
        fetchData();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Curriculum Management</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjects = data?.subjects || [];
  const units = data?.units || [];
  const stats = data?.stats || { totalSubjects: 0, totalUnits: 0, totalLessons: 0, publishedUnits: 0 };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnits = units.filter((u) =>
    (!selectedSubject || u.subjectId === selectedSubject) &&
    u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedSubjects = subjects.filter((s) => s.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Curriculum Management</h1>
          <p className="text-gray-600 mt-1">Manage subjects, units, and lessons</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + Create Content
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</div>
            <div className="text-sm text-gray-500">Subjects</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUnits}</div>
            <div className="text-sm text-gray-500">Units</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalLessons}</div>
            <div className="text-sm text-gray-500">Total Lessons</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{publishedSubjects}/{stats.totalSubjects}</div>
            <div className="text-sm text-gray-500">Published</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              {(["subjects", "units", "lessons"] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex-1">
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === "subjects" && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Core subject areas in the curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No subjects found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="p-4 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedSubject(subject.id);
                      setActiveTab("units");
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: subject.color || "#6b7280" }}
                      >
                        {subject.name[0]}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subject.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {subject.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {subject.unitsCount} units • {subject.lessonsCount} lessons
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {/* Add New Subject Card */}
                <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 min-h-[180px]">
                  <div className="text-3xl mb-2">+</div>
                  <div className="font-medium">Add Subject</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "units" && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Units</CardTitle>
                <CardDescription>
                  {selectedSubject
                    ? `Showing units for ${subjects.find((s) => s.id === selectedSubject)?.name}`
                    : "All units across subjects"}
                </CardDescription>
              </div>
              {selectedSubject && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedSubject(null)}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredUnits.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No units found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500 text-sm">Unit</th>
                      <th className="pb-3 font-medium text-gray-500 text-sm">Subject</th>
                      <th className="pb-3 font-medium text-gray-500 text-sm">Grade</th>
                      <th className="pb-3 font-medium text-gray-500 text-sm">Lessons</th>
                      <th className="pb-3 font-medium text-gray-500 text-sm">Status</th>
                      <th className="pb-3 font-medium text-gray-500 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map((unit) => {
                      const subject = subjects.find((s) => s.id === unit.subjectId);
                      return (
                        <tr key={unit.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-4 font-medium">{unit.title}</td>
                          <td className="py-4">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: subject?.color || "#6b7280" }}
                            >
                              {subject?.name || "Unknown"}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600">
                            {unit.gradeLevel === 0 ? "K" : `Grade ${unit.gradeLevel}`}
                          </td>
                          <td className="py-4 text-gray-600">{unit.lessonsCount}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              unit.isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {unit.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="sm">View</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "lessons" && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>Individual lesson content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <p>Select a unit to view its lessons</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab("units")}>
                Browse Units
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
