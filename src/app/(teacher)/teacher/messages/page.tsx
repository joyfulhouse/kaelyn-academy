"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessagingInterface } from "@/components/messaging/messaging-interface";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipient {
  id: string;
  name: string;
  role: string;
}

interface Student {
  id: string;
  name: string;
}

export default function TeacherMessagesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState<Recipient[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch students
      const studentsRes = await fetch("/api/teacher/students");
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        if (studentsData.students) {
          setStudents(
            studentsData.students.map((s: { id: string; name: string }) => ({
              id: s.id,
              name: s.name,
            }))
          );

          // Extract unique parents from students
          const parentMap = new Map<string, Recipient>();
          studentsData.students.forEach((s: { parents?: Array<{ id: string; name: string }> }) => {
            s.parents?.forEach((p: { id: string; name: string }) => {
              if (!parentMap.has(p.id)) {
                parentMap.set(p.id, {
                  id: p.id,
                  name: p.name,
                  role: "Parent",
                });
              }
            });
          });
          setParents(Array.from(parentMap.values()));
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 h-[calc(100vh-10rem)]">
          <Skeleton className="w-80 h-full" />
          <Skeleton className="flex-1 h-full" />
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with parents about their children&apos;s progress
        </p>
      </div>
      <MessagingInterface
        userRole="teacher"
        userId={session.user.id}
        recipientOptions={parents}
        learnerOptions={students}
      />
    </div>
  );
}
