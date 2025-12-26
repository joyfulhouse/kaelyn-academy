"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  subjectId: string;
  gradeLevel: number;
  lessonsCount: number;
  isPublished: boolean;
}

export default function AdminCurriculumPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subjects" | "units" | "lessons">("subjects");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // TODO: Fetch from API
      setSubjects([
        { id: "1", name: "Mathematics", slug: "math", iconName: "calculator", color: "#3b82f6", unitsCount: 12, lessonsCount: 48, isPublished: true },
        { id: "2", name: "Reading & ELA", slug: "reading", iconName: "book-open", color: "#10b981", unitsCount: 10, lessonsCount: 42, isPublished: true },
        { id: "3", name: "Science", slug: "science", iconName: "flask", color: "#8b5cf6", unitsCount: 8, lessonsCount: 32, isPublished: true },
        { id: "4", name: "History", slug: "history", iconName: "landmark", color: "#f59e0b", unitsCount: 6, lessonsCount: 24, isPublished: false },
        { id: "5", name: "Technology", slug: "technology", iconName: "laptop", color: "#ec4899", unitsCount: 4, lessonsCount: 16, isPublished: false },
      ]);
      setUnits([
        { id: "u1", title: "Numbers & Counting", subjectId: "1", gradeLevel: 0, lessonsCount: 8, isPublished: true },
        { id: "u2", title: "Addition & Subtraction", subjectId: "1", gradeLevel: 1, lessonsCount: 10, isPublished: true },
        { id: "u3", title: "Multiplication Basics", subjectId: "1", gradeLevel: 2, lessonsCount: 8, isPublished: true },
        { id: "u4", title: "Fractions Introduction", subjectId: "1", gradeLevel: 3, lessonsCount: 6, isPublished: false },
      ]);
    } catch (error) {
      console.error("Failed to fetch curriculum:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnits = units.filter((u) =>
    (!selectedSubject || u.subjectId === selectedSubject) &&
    u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLessons = subjects.reduce((acc, s) => acc + s.lessonsCount, 0);
  const publishedSubjects = subjects.filter((s) => s.isPublished).length;

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
            <div className="text-2xl font-bold text-gray-900">{subjects.length}</div>
            <div className="text-sm text-gray-500">Subjects</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{units.length}</div>
            <div className="text-sm text-gray-500">Units</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{totalLessons}</div>
            <div className="text-sm text-gray-500">Total Lessons</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{publishedSubjects}/{subjects.length}</div>
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
                      style={{ backgroundColor: subject.color }}
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
                            style={{ backgroundColor: subject?.color }}
                          >
                            {subject?.name}
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
