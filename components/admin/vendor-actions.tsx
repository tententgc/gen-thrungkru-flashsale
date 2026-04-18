"use client";

import { useState, useTransition } from "react";
import { approveVendor } from "@/lib/actions/vendor";
import { CheckIcon } from "@/components/icons";

export function VendorApproveButton({
  vendorId,
  isVerified,
}: {
  vendorId: string;
  isVerified: boolean;
}) {
  const [state, setState] = useState(isVerified);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await approveVendor(vendorId, !state);
      if (res.ok) setState(!state);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={`btn-primary text-xs disabled:opacity-50 ${state ? "opacity-60" : ""}`}
    >
      <CheckIcon className="h-3 w-3" />
      {isPending ? "กำลัง..." : state ? "verified" : "อนุมัติ"}
    </button>
  );
}
