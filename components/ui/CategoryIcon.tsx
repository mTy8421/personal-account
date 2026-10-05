import React from "react";
import * as LucideIcons from "lucide-react";

interface CategoryIconProps {
  name?: string | null;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name, className = "w-5 h-5", size = 20 }: CategoryIconProps) {
  if (!name) {
    const DefaultIcon = LucideIcons.Tag;
    return <DefaultIcon size={size} className={className} />;
  }

  // ค้นหาไอคอนใน Lucide
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Tag;

  return <IconComponent size={size} className={className} />;
}
