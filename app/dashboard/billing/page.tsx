import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import React from "react";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getStripeSession, stripe } from "@/app/lib/stripe";
import { redirect } from "next/navigation";
import {
  StripeSubscriptionButton,
  StripePortal,
} from "../../components/SubmitButtons";
import { unstable_noStore as noStore } from "next/cache";
const futures = [
  { name: "Unlimited notes storage" },
  { name: "Advanced search functionality" },
  { name: "Customizable note organization" },
  { name: "Sync across all devices" },
  { name: "Priority customer support" },
];
async function getData(userId: string) {
  noStore();
  const data = await prisma.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      status: true,
      user: {
        select: {
          stripeCustomeId: true,
        },
      },
    },
  });

  return data;
}

const BillingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);
  const createSubscription = async () => {
    "use server";
    const dbUser = await prisma.user.findUnique({
      where: { id: user?.id },
      select: {
        stripeCustomeId: true,
      },
    });
    if (!dbUser?.stripeCustomeId) {
      throw new Error("unable to get stripe customer Id");
    }
    const subscriptionUrl = await getStripeSession({
      customerId: dbUser.stripeCustomeId,
      domainUrl: "http://localhost:3000",
      priceId: process.env.STRIPE_PRICE_ID as string,
    });
    return redirect(subscriptionUrl);
  };
  const createCustomerPortal = async () => {
    "use server";
    const session = await stripe.billingPortal.sessions.create({
      customer: data?.user.stripeCustomeId as string,
      return_url:
        process.env.NODE_ENV === "production"
          ? (process.env.PRODUCTION_URL as string)
          : "http://localhost:3000/dashboard",
    });

    return redirect(session.url);
  };
  if (data?.status === "active") {
    return (
      <div className="grid items-start gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl md:text-4xl">Subscription</h1>
            <p className="text-lg text-muted-foreground">
              Settings reagding your subscription
            </p>
          </div>
        </div>
        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Edit Subscription</CardTitle>
            <CardDescription>Manage your subscription here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCustomerPortal}>
              <StripePortal />
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardContent className="py-8">
          <div>
            <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
              Monthly
            </h3>
          </div>
          <div className="mt-4 flex items-baseline text-6xl font-extrabold">
            $30{" "}
            <span className="ml-1 text-2xl font-medium text-muted-foreground">
              /mo
            </span>
          </div>
          <p className="mt-5 text-lg text-muted-foreground">
            Capture unlimited notes for just $30 per month!
          </p>
        </CardContent>
        <div className="flex flex-col flex-1 px-6 pt-6 pb-8 justify-between bg-secondary rounded-lg m-1 space-y-6 sm:p-10 sm:pt-6">
          <ul className="space-y-4">
            {futures.map((item, index) => (
              <li key={index} className="flex items-center">
                <div className="shrink-0 flex">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base">{item.name}</p>
              </li>
            ))}
          </ul>
          <form className="w-full" action={createSubscription}>
            <StripeSubscriptionButton />
          </form>
        </div>
      </Card>
    </div>
  );
};

export default BillingPage;