"use client";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import React from "react";
import { useFormStatus } from "react-dom";

const SubmitButtons = ({}) => {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Please Wait !
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          Save
        </Button>
      )}
    </>
  );
};

export const StripeSubscriptionButton = () => {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Please Wait !
        </Button>
      ) : (
        <Button type="submit" className="w-full ">
          Subscribe Now
        </Button>
      )}
    </>
  );
};

export const StripePortal = () => {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Please Wait !
        </Button>
      ) : (
        <Button className="w-fit" type="submit">
          View Subscription
        </Button>
      )}
    </>
  );
};
export const DleteButton = () => {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Deleting !
        </Button>
      ) : (
        <Button variant="destructive" size="icon" type="submit">
          <Trash className="size-4" />
        </Button>
      )}
    </>
  );
};
export default SubmitButtons;
