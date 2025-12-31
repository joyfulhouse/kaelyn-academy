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

interface Child {
  id: string;
  name: string;
}

export default function ParentMessagesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Recipient[]>([]);
  const [children, setChildren] = useState<Child[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch children
      const childrenRes = await fetch("/api/parent/children");
      if (childrenRes.ok) {
        const childrenData = await childrenRes.json();
        if (childrenData.children) {
          setChildren(
            childrenData.children.map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }
      }

      // Fetch teachers (teachers connected to the parent's children)
      const teachersRes = await fetch("/api/teacher/students");
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        if (teachersData.teachers) {
          setTeachers(
            teachersData.teachers.map((t: { id: string; name: string }) => ({
              id: t.id,
              name: t.name,
              role: "Teacher",
            }))
          );
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
          Communicate with your children&apos;s teachers
        </p>
      </div>
      <MessagingInterface
        userRole="parent"
        userId={session.user.id}
        recipientOptions={teachers}
        learnerOptions={children}
      />
    </div>
  );
}
