"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  gradeLevel: number;
  avatarUrl?: string;
  birthday?: string;
  favoriteSubject?: string;
  learningGoal?: string;
  parentEmail?: string;
  achievements: { id: string; name: string; icon: string; earnedAt: string }[];
  stats: {
    lessonsCompleted: number;
    hoursLearned: number;
    longestStreak: number;
    conceptsMastered: number;
  };
}

export default function LearnerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile>({
    id: "1",
    name: "Emma Johnson",
    email: "emma@example.com",
    gradeLevel: 3,
    birthday: "2016-05-15",
    favoriteSubject: "Math",
    learningGoal: "Learn multiplication tables",
    parentEmail: "sarah@example.com",
    achievements: [
      { id: "1", name: "First Lesson", icon: "🎉", earnedAt: "2024-11-15" },
      { id: "2", name: "Math Whiz", icon: "🔢", earnedAt: "2024-11-20" },
      { id: "3", name: "7-Day Streak", icon: "🔥", earnedAt: "2024-12-01" },
      { id: "4", name: "Science Explorer", icon: "🔬", earnedAt: "2024-12-10" },
      { id: "5", name: "Reading Champion", icon: "📚", earnedAt: "2024-12-20" },
    ],
    stats: {
      lessonsCompleted: 47,
      hoursLearned: 24,
      longestStreak: 14,
      conceptsMastered: 85,
    },
  });

  const handleSave = () => {
    // TODO: Save to API
    setIsEditing(false);
  };

  const grades = Array.from({ length: 13 }, (_, i) => ({
    value: i,
    label: i === 0 ? "Kindergarten" : `Grade ${i}`,
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-3xl">
                {profile.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left pb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">
                {grades.find((g) => g.value === profile.gradeLevel)?.label} • {profile.favoriteSubject} Enthusiast
              </p>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{profile.stats.lessonsCompleted}</div>
            <div className="text-blue-100 text-sm">Lessons Done</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{profile.stats.hoursLearned}h</div>
            <div className="text-green-100 text-sm">Hours Learned</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{profile.stats.longestStreak}</div>
            <div className="text-orange-100 text-sm">Day Best Streak</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{profile.stats.conceptsMastered}</div>
            <div className="text-purple-100 text-sm">Concepts Mastered</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <select
                id="grade"
                value={profile.gradeLevel}
                onChange={(e) => setProfile({ ...profile, gradeLevel: parseInt(e.target.value) })}
                disabled={!isEditing}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {grades.map((grade) => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
            <CardDescription>Customize your learning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="favoriteSubject">Favorite Subject</Label>
              <select
                id="favoriteSubject"
                value={profile.favoriteSubject}
                onChange={(e) => setProfile({ ...profile, favoriteSubject: e.target.value })}
                disabled={!isEditing}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {["Math", "Reading", "Science", "History", "Art", "Music", "Technology"].map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="learningGoal">Learning Goal</Label>
              <Input
                id="learningGoal"
                value={profile.learningGoal}
                onChange={(e) => setProfile({ ...profile, learningGoal: e.target.value })}
                placeholder="What do you want to learn?"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="parentEmail">Parent Email</Label>
              <Input
                id="parentEmail"
                type="email"
                value={profile.parentEmail}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact admin to update parent information
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Achievements
            <span className="text-sm font-normal text-gray-500">
              ({profile.achievements.length} earned)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {profile.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-medium text-sm text-center">{achievement.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {/* Locked achievements placeholder */}
            {Array.from({ length: 5 - profile.achievements.length }).map((_, i) => (
              <div
                key={`locked-${i}`}
                className="flex flex-col items-center p-4 bg-gray-100 rounded-xl border border-gray-200 opacity-50"
              >
                <div className="text-4xl mb-2">🔒</div>
                <div className="font-medium text-sm text-gray-400">Locked</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-md border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">Account Settings</CardTitle>
          <CardDescription>These actions require parent approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="text-gray-600">
              Request Password Reset
            </Button>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Request Account Deletion
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Account changes require parental consent as per COPPA regulations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
