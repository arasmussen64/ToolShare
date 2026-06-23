import { categoryOf } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";

interface ToolImageProps {
  image: string;
  category: CategoryId;
  className?: string;
  emojiSize?: string;
}

/**
 * Renders an uploaded photo (data URL) when present, otherwise a colorful
 * gradient tile with the tool's emoji. Keeps the app fully self-contained.
 */
export default function ToolImage({
  image,
  category,
  className = "",
  emojiSize = "text-6xl",
}: ToolImageProps) {
  const cat = categoryOf(category);
  const isPhoto = image.startsWith("data:") || image.startsWith("http");

  if (isPhoto) {
    return (
      // Data-URL/user-uploaded images intentionally bypass next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${cat.gradient} ${className}`}
    >
      <span className={emojiSize}>{image || cat.emoji}</span>
    </div>
  );
}
