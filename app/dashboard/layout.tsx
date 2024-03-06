import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import DashboardNav from "../components/DashboardNav";
import prisma from "../lib/db";
import { stripe } from "../lib/stripe";
import { unstable_noStore as noStore } from "next/cache";

async function getData({
  email,
  id,
  firstName,
  lastName,
  profileImage,
}: {
  email: string;
  id: string;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | undefined | null;
}) {
  noStore();
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      stripeCustomeId: true,
    },
  });
  if (!user) {
    const name = `${firstName ?? ""} ${lastName ?? ""}`;
    await prisma.user.create({
      data: {
        id: id,
        email: email,
        name: name,
      },
    });
  }
  if (!user?.stripeCustomeId) {
    const data = await stripe.customers.create({ email: email });
    await prisma.user.update({
      where: { id: id },
      data: {
        stripeCustomeId: data.id,
      },
    });
  }
}
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();
  await getData({
    email: user?.email as string,
    firstName: user?.given_name as string,
    lastName: user?.family_name as string,
    id: user?.id as string,
    profileImage: user?.picture as string,
  });
  return (await isAuthenticated()) ? (
    <div className="flex flex-col space-y-6 mt-10">
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  ) : (
    <div className="flex  w-full h-[90vh] m-auto items-center justify-center text-xl md:text-3xl font-bold tracking-wide ">
      <p className="text-secondary-foreground">
        oops! you should Sign in to view this page ⛔
      </p>
    </div>
  );
};

export default DashboardLayout;
