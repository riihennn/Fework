import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface SkillGroup {
  category: string;
  slug: string;
  icon: string;
  description?: string;
  skills: { _id: string; name: string; isActive: boolean }[];
}

export function useSkillGroups() {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/skills?activeOnly=true`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.grouped) {
          // Only show groups that have at least one active skill
          const filtered: SkillGroup[] = json.data.grouped
            .map((g: any) => ({
              ...g,
              skills: (g.skills || []).filter((s: any) => s.isActive !== false),
            }))
            .filter((g: SkillGroup) => g.skills.length > 0);
          setGroups(filtered);
        }
      })
      .catch(() => {}) // silently fail — UI falls back to empty
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading };
}
