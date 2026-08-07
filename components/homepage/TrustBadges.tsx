import { ShieldCheck, Star, Lock, MapPin } from "lucide-react";
import { trustBadges } from "@/lib/mock-data";

const iconMap = {
  "shield-check": ShieldCheck,
  star: Star,
  lock: Lock,
  "map-pin": MapPin,
};

export default function TrustBadges() {
  return (
    <div className="bg-navy border-t border-white/10">
      <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-4 px-6 md:px-16 py-6">
        {trustBadges.map((badge) => {
          const Icon = iconMap[badge.icon as keyof typeof iconMap];
          return (
            <div key={badge.label} className="flex items-center gap-2 text-white/85 text-sm">
              <Icon className="w-4 h-4 text-gold" />
              <span>{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
