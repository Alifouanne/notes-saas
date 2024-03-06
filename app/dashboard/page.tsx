/* eslint-disable react/no-unescaped-entities */
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import prisma from "../lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Edit, File, Trash } from "lucide-react";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { Card } from "@/components/ui/card";
import { DleteButton } from "../components/SubmitButtons";
const getData = async (userId: string) => {
  noStore();
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      notes: {
        select: {
          title: true,
          id: true,
          description: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },

      subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  return data;
};

const DashboardPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);
  const deleteNote = async (formData: FormData) => {
    "use server";
    const noteId = formData.get("noteId") as string;
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });
    revalidatePath("/dashboard");
  };
  return (
    <div className="grid items-start gap-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-3xl md:text-4xl">Your Notes</h1>
          <p className="text-lg text-muted-foreground">
            Your ideas, your space. Unleash your creativity here!
          </p>
        </div>
        {data?.subscription?.status === "active" ? (
          <Button asChild>
            <Link href="/dashboard/new">Time to create some magic!</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/dashboard/billing">
              Subscribe to start your journy
            </Link>
          </Button>
        )}
      </div>
      {data?.notes.length == 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <File className="text-primary size-10" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">
            You don't have any notes created
          </h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            No notes yet? Time to break the ice and create some!
          </p>
          {data?.subscription?.status === "active" ? (
            <Button asChild>
              <Link href="/dashboard/new">Time to create some magic!</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/billing">
                Subscribe to start your journy
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {data?.notes.map((item) => (
            <Card
              key={item.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  {item.title}
                </h2>
                <p>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "full",
                  }).format(new Date(item.createdAt))}
                </p>
              </div>
              <div className="flex gap-x-4">
                <Link href={`/dashboard/new/${item.id}`}>
                  <Button variant="outline" size="icon">
                    <Edit className="size-4" />
                  </Button>
                </Link>
                <form action={deleteNote}>
                  <input type="hidden" value={item.id} name="noteId" />
                  <DleteButton />
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
