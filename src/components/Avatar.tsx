import type { User } from "@/lib/types";

const SIZES: Record<string, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-16 w-16 text-xl",
};

export default function Avatar({
  user,
  size = "md",
}: {
  user: User;
  size?: "sm" | "md" | "lg";
}) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${user.avatarColor} ${SIZES[size]}`}
      title={user.name}
    >
      {initials}
    </div>
  );
}
