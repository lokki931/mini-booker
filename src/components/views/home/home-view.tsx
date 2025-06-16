"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HomeView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center text-center">
          <Image
            src="/logo.svg"
            alt="MiniBooker Logo"
            width={64}
            height={64}
            className="mb-2"
          />
          <CardTitle className="text-2xl">Welcome to MiniBooker</CardTitle>
          <CardDescription>
            MiniBooker is a simple service for managing bookings for small
            businesses such as salons, coffee shops, and workshops.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/register">
            <Button className="w-full">Register</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
