import Link from "next/link";

export function StatCard({
  title,
  value,
  url,
}: {
  title: string;
  value: number;
  url: string;
}) {
  return (
    <Link
      href={url}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md hover:shadow"
    >
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Link>
  );
}
