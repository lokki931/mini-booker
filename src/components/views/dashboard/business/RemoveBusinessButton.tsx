"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useBusinessStore } from "@/stores/business";
import { Trash2 } from "lucide-react";

export function RemoveBusinessButton({ businessId }: { businessId: string }) {
  const { businesses, setBusinesses, activeBusinessId, setActiveBusiness } =
    useBusinessStore();

  function handleDelete() {
    fetch("/api/business/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        const updated = (businesses ?? []).filter((b) => b.id !== businessId);
        setBusinesses(updated);

        if (activeBusinessId === businessId) {
          const next = updated[0].id || "";
          setActiveBusiness(next);
        }
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this business and its team. You cannot
            undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
