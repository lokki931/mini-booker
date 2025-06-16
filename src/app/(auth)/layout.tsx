import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | MiniBooker",
  description:
    "MiniBooker Auth is a simple service for managing bookings for small businesses",
};
export default function LayoutAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {children}
    </div>
  );
}
