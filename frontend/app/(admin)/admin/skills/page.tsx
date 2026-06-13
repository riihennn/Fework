"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Loader2, ChevronDown,
  Layers, Wrench, Tv, Hammer, Sparkles, Check, X,
  AlertTriangle, Eye, EyeOff, FolderPlus, Tag,
  Search, ArrowRight, Inbox, FolderOpen, Unlink,
  Cog, Zap, Droplets, Paintbrush, Shield
} from "lucide-react";
import { request } from "@/services/api";

// ── API ───────────────────────────────────────────────────────────────────
async function apiFetch(path: string, opts: RequestInit = {}) {
  const method = (opts.method as any) || "GET";
  const body = opts.body ? JSON.parse(opts.body as string) : undefined;
  return await request(path, method, body, opts.headers as Record<string, string>);
}

// ── Icon helpers ───────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Wrench, Tv, Hammer, Sparkles, Layers, Cog, Zap, Droplets, Paintbrush, Shield,
};
const ICON_OPTIONS = Object.keys(ICON_MAP);

function CatIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] || Wrench;
  return <Icon size={size} />;
}

// ── Types ─────────────────────────────────────────────────────────────────
interface SkillCategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

interface Skill {
  _id: string;
  name: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

interface GroupedEntry {
  category: string;
  slug: string;
  icon: string;
  description?: string;
  catId: string;
  skills: Skill[];
}

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold ${type === "success" ? "bg-teal-600" : "bg-rose-500"}`}
    >
      {type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`bg-white rounded-[28px] shadow-2xl border border-gray-100 w-full ${wide ? "max-w-lg" : "max-w-md"} p-8`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[#0F172A] text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ── Add Skill Modal ────────────────────────────────────────────────────────
function AddSkillModal({ initial, onSave, onCancel, saving }: {
  initial?: Partial<Skill>;
  onSave: (name: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(name.trim()); }} className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Skill Name *</label>
        <input
          autoFocus required value={name} onChange={e => setName(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
          placeholder="e.g. Electrician"
        />
        <p className="text-xs text-gray-400 mt-1.5">The skill will appear in <strong>All Skills</strong>. You can assign it to a group later.</p>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 h-12 rounded-2xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add to All Skills
        </button>
      </div>
    </form>
  );
}

// ── Assign to Group Modal ─────────────────────────────────────────────────
function AssignGroupModal({ skill, categories, onSave, onCancel, saving }: {
  skill: Skill;
  categories: SkillCategory[];
  onSave: (categoryName: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [selected, setSelected] = useState(skill.category || "");
  return (
    <div className="space-y-4">
      <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
        <Tag size={14} className="text-teal-600 shrink-0" />
        <span className="text-sm font-bold text-[#0F172A]">{skill.name}</span>
        {skill.category && (
          <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{skill.category}</span>
        )}
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Assign to Group</label>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setSelected("")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all text-left ${selected === "" ? "border-gray-300 bg-gray-50 text-[#0F172A]" : "border-gray-100 hover:border-gray-200 text-gray-400"}`}
          >
            <Inbox size={15} />
            No Group (Ungrouped)
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setSelected(cat.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all text-left ${selected === cat.name ? "border-teal-400 bg-teal-50 text-teal-700" : "border-gray-100 hover:border-gray-200 text-[#0F172A]"}`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${selected === cat.name ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500"}`}>
                <CatIcon name={cat.icon} size={13} />
              </div>
              {cat.name}
              {selected === cat.name && <Check size={14} className="ml-auto text-teal-600" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(selected)}
          className="flex-1 h-12 rounded-2xl bg-[#0F172A] text-white text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          {selected ? `Move to ${selected.split(" ")[0]}` : "Ungroup"}
        </button>
      </div>
    </div>
  );
}

// ── Category Form ─────────────────────────────────────────────────────────
function CategoryForm({ initial, onSave, onCancel, saving }: {
  initial?: Partial<SkillCategory>;
  onSave: (data: Partial<SkillCategory>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [icon, setIcon] = useState(initial?.icon || "Wrench");
  const [description, setDescription] = useState(initial?.description || "");

  const autoSlug = (n: string) => n.toLowerCase().replace(/[&]/g, "and").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ name, slug, icon, description }); }} className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Group Name *</label>
        <input required value={name} onChange={e => { setName(e.target.value); if (!initial?.slug) setSlug(autoSlug(e.target.value)); }}
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all" placeholder="e.g. Repairs & Maintenance" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Slug *</label>
        <input required value={slug} onChange={e => setSlug(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all font-mono text-sm" placeholder="repairs-maintenance" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map(ic => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${icon === ic ? "border-teal-500 bg-teal-50 text-teal-600" : "border-gray-200 hover:border-gray-300 text-gray-500"}`}>
              <CatIcon name={ic} size={16} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
        <input value={description} onChange={e => setDescription(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all" placeholder="Short description..." />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 h-12 rounded-2xl bg-[#0F172A] text-white text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {initial?._id ? "Update Group" : "Create Group"}
        </button>
      </div>
    </form>
  );
}

// ── Skill Pill ─────────────────────────────────────────────────────────────
function SkillPill({
  skill, onAssign, onEdit, onDelete, onToggle, showCategory = false
}: {
  skill: Skill;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  showCategory?: boolean;
}) {
  return (
    <motion.div layout key={skill._id}
      className={`group flex items-center gap-2.5 pl-3.5 pr-2 py-2.5 rounded-2xl border transition-all ${skill.isActive ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm" : "bg-gray-50 border-dashed border-gray-200 opacity-50"}`}
    >
      <Tag size={12} className="text-teal-500 shrink-0" />
      <span className="flex-1 text-[13px] font-semibold text-[#0F172A] truncate">{skill.name}</span>
      {showCategory && skill.category && (
        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 truncate max-w-[80px]">{skill.category}</span>
      )}
      {/* Action buttons — appear on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <button onClick={onAssign} title="Assign to group"
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-teal-100 text-gray-400 hover:text-teal-600 transition-all">
          <ArrowRight size={11} />
        </button>
        <button onClick={onToggle} title={skill.isActive ? "Hide" : "Show"}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
          {skill.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
        </button>
        <button onClick={onEdit}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all">
          <Pencil size={11} />
        </button>
        <button onClick={onDelete}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-rose-100 text-gray-400 hover:text-rose-500 transition-all">
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Edit Skill Name Modal ──────────────────────────────────────────────────
function EditSkillNameModal({ skill, onSave, onCancel, saving }: {
  skill: Skill; onSave: (name: string) => void; onCancel: () => void; saving: boolean;
}) {
  const [name, setName] = useState(skill.name);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(name.trim()); }} className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Skill Name *</label>
        <input autoFocus required value={name} onChange={e => setName(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 h-12 rounded-2xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Save
        </button>
      </div>
    </form>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────
function DeleteConfirm({ name, type, onConfirm, onCancel, saving, warning }: {
  name: string; type: string; onConfirm: () => void; onCancel: () => void; saving: boolean; warning?: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100">
        <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-rose-700">Delete {type}: <span className="text-rose-600">{name}</span>?</p>
          {warning && <p className="text-xs text-rose-500 mt-0.5">{warning}</p>}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
        <button onClick={onConfirm} disabled={saving} className="flex-1 h-12 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}Delete
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function SkillsCMSPage() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [ungrouped, setUngrouped] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [grouped, setGrouped] = useState<GroupedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  // Modals
  const [addSkillModal, setAddSkillModal] = useState<{ open: boolean; initial?: Skill }>({ open: false });
  const [editSkillModal, setEditSkillModal] = useState<{ open: boolean; skill?: Skill }>({ open: false });
  const [assignModal, setAssignModal] = useState<{ open: boolean; skill?: Skill }>({ open: false });
  const [catModal, setCatModal] = useState<{ open: boolean; initial?: Partial<SkillCategory> }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: "skill" | "category"; id: string; name: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [catData, skillData] = await Promise.all([
        apiFetch("/skills/categories") as Promise<SkillCategory[]>,
        apiFetch("/skills") as Promise<{ skills: Skill[], ungrouped: Skill[], grouped: GroupedEntry[] }>,
      ]);
      setCategories(catData);
      setAllSkills(skillData.skills);
      setUngrouped(skillData.ungrouped);
      setGrouped(skillData.grouped);
      if (expandedCats.size === 0 && catData.length > 0) {
        setExpandedCats(new Set(catData.map((c: SkillCategory) => c._id)));
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id: string) => setExpandedCats(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Filtered all skills for search
  const filteredAll = useMemo(() =>
    search.trim()
      ? allSkills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      : allSkills
    , [allSkills, search]);

  // ── Add skill ──────────────────────────────────────────────────────────
  const handleAddSkill = async (name: string) => {
    setSaving(true);
    try {
      await apiFetch("/skills", { method: "POST", body: JSON.stringify({ name, category: "" }) });
      showToast(`"${name}" added to All Skills!`);
      setAddSkillModal({ open: false });
      load();
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Edit skill name ────────────────────────────────────────────────────
  const handleEditSkill = async (name: string) => {
    if (!editSkillModal.skill) return;
    setSaving(true);
    try {
      await apiFetch(`/skills/${editSkillModal.skill._id}`, { method: "PATCH", body: JSON.stringify({ name }) });
      showToast("Skill renamed!");
      setEditSkillModal({ open: false });
      load();
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Assign skill to group ──────────────────────────────────────────────
  const handleAssignGroup = async (categoryName: string) => {
    if (!assignModal.skill) return;
    setSaving(true);
    try {
      await apiFetch(`/skills/${assignModal.skill._id}`, { method: "PATCH", body: JSON.stringify({ category: categoryName }) });
      const action = categoryName ? `Moved to "${categoryName}"` : "Moved to Ungrouped";
      showToast(action);
      setAssignModal({ open: false });
      load();
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Toggle skill active ────────────────────────────────────────────────
  const handleToggleSkill = async (skill: Skill) => {
    try {
      await apiFetch(`/skills/${skill._id}`, { method: "PATCH", body: JSON.stringify({ isActive: !skill.isActive }) });
      showToast(`Skill ${skill.isActive ? "hidden" : "shown"}`);
      load();
    } catch (e: any) { showToast(e.message, "error"); }
  };

  // ── Toggle category active ─────────────────────────────────────────────
  const handleToggleCat = async (cat: SkillCategory) => {
    try {
      await apiFetch(`/skills/categories/${cat._id}`, { method: "PATCH", body: JSON.stringify({ isActive: !cat.isActive }) });
      showToast(`Group ${cat.isActive ? "hidden" : "shown"}`);
      load();
    } catch (e: any) { showToast(e.message, "error"); }
  };

  // ── Save category ──────────────────────────────────────────────────────
  const handleSaveCat = async (data: Partial<SkillCategory>) => {
    setSaving(true);
    try {
      if (catModal.initial?._id) {
        await apiFetch(`/skills/categories/${catModal.initial._id}`, { method: "PATCH", body: JSON.stringify(data) });
        showToast("Group updated!");
      } else {
        await apiFetch("/skills/categories", { method: "POST", body: JSON.stringify(data) });
        showToast("Group created!");
      }
      setCatModal({ open: false });
      load();
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal) return;
    setSaving(true);
    try {
      const path = deleteModal.type === "category"
        ? `/skills/categories/${deleteModal.id}`
        : `/skills/${deleteModal.id}`;
      await apiFetch(path, { method: "DELETE" });
      showToast(`${deleteModal.type === "category" ? "Group" : "Skill"} deleted`);
      setDeleteModal(null);
      load();
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Layers size={20} />
            </div>
            Skills CMS
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 ml-[52px]">
            {allSkills.length} skills · {categories.length} groups · {ungrouped.length} ungrouped
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddSkillModal({ open: true })}
            className="h-10 px-4 rounded-2xl bg-teal-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-sm">
            <Plus size={14} /> Add Skill
          </button>
          <button onClick={() => setCatModal({ open: true })}
            className="h-10 px-4 rounded-2xl bg-[#0F172A] text-white text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm">
            <FolderPlus size={14} /> New Group
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <Loader2 size={28} className="animate-spin text-teal-500" />
          <p className="text-sm font-bold text-gray-400">Loading skills...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 items-start">

          {/* ═══════════════════════════════════════════════════════════
              LEFT PANEL — All Skills
          ═══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-[#0F172A] flex items-center gap-2">
                    <Tag size={16} className="text-teal-500" />
                    All Skills
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{allSkills.length}</span>
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Master pool of all skills. Assign each to a group →</p>
                </div>
                <button onClick={() => setAddSkillModal({ open: true })}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-600 transition-all">
                  <Plus size={16} />
                </button>
              </div>
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search skills..."
                  className="w-full h-9 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-300 transition-all bg-gray-50"
                />
              </div>
            </div>

            {/* Skills list */}
            <div className="p-4 space-y-1.5 max-h-[560px] overflow-y-auto">
              {filteredAll.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-gray-300">
                  <Tag size={22} />
                  <p className="text-xs font-bold">{search ? "No skills match your search" : "No skills yet"}</p>
                </div>
              ) : (
                filteredAll.map(skill => (
                  <SkillPill
                    key={skill._id}
                    skill={skill}
                    showCategory
                    onAssign={() => setAssignModal({ open: true, skill })}
                    onEdit={() => setEditSkillModal({ open: true, skill })}
                    onDelete={() => setDeleteModal({ open: true, type: "skill", id: skill._id, name: skill.name })}
                    onToggle={() => handleToggleSkill(skill)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT PANEL — Groups
          ═══════════════════════════════════════════════════════════ */}
          <div className="space-y-4">

            {/* Ungrouped banner */}
            {ungrouped.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-[20px] px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Inbox size={15} className="text-amber-600" />
                  <span className="text-sm font-bold text-amber-700">{ungrouped.length} ungrouped skill{ungrouped.length > 1 ? "s" : ""}</span>
                  <span className="text-xs text-amber-500">— assign them to a group below</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ungrouped.map(skill => (
                    <button key={skill._id} onClick={() => setAssignModal({ open: true, skill })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-all">
                      <Tag size={10} />
                      {skill.name}
                      <ArrowRight size={10} className="opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Groups header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-[#0F172A] flex items-center gap-2">
                <FolderOpen size={16} className="text-gray-500" />
                Groups
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{categories.length}</span>
              </h2>
            </div>

            {/* Group cards */}
            {categories.length === 0 ? (
              <div className="bg-white rounded-[20px] border border-dashed border-gray-200 py-12 flex flex-col items-center gap-3 text-gray-300">
                <FolderPlus size={24} />
                <p className="text-xs font-bold">No groups yet — create one!</p>
                <button onClick={() => setCatModal({ open: true })}
                  className="h-9 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-gray-800 transition-all">
                  Create First Group
                </button>
              </div>
            ) : (
              categories.map(cat => {
                const group = grouped.find(g => g.category === cat.name);
                const skills = group?.skills || [];
                const isOpen = expandedCats.has(cat._id);

                return (
                  <motion.div key={cat._id} layout
                    className={`bg-white rounded-[22px] border shadow-sm transition-all ${cat.isActive ? "border-gray-100" : "border-dashed border-gray-200"}`}>

                    {/* Group header */}
                    <div className="flex items-center gap-3 px-5 py-4">
                      <button onClick={() => toggleExpand(cat._id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-[#0F172A] text-white" : "bg-gray-50 text-gray-500"}`}>
                          <CatIcon name={cat.icon} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[14px] text-[#0F172A]">{cat.name}</span>
                            {!cat.isActive && <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Hidden</span>}
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {skills.length} skill{skills.length !== 1 ? "s" : ""}
                            {cat.description && ` · ${cat.description}`}
                          </p>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-gray-400 shrink-0">
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>

                      {/* Group actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleToggleCat(cat)} title={cat.isActive ? "Hide group" : "Show group"}
                          className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                          {cat.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button onClick={() => setCatModal({ open: true, initial: cat })}
                          className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, type: "category", id: cat._id, name: cat.name })}
                          className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Skills inside group */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4">
                            <div className="border-t border-gray-50 pt-3 space-y-1.5">
                              {skills.length === 0 ? (
                                <div className="py-5 flex flex-col items-center gap-1.5 text-gray-300">
                                  <Unlink size={18} />
                                  <p className="text-xs font-bold">No skills in this group</p>
                                  <p className="text-[10px] text-gray-300">Assign skills from the left panel</p>
                                </div>
                              ) : (
                                skills.map(skill => (
                                  <SkillPill
                                    key={skill._id}
                                    skill={skill}
                                    onAssign={() => setAssignModal({ open: true, skill })}
                                    onEdit={() => setEditSkillModal({ open: true, skill })}
                                    onDelete={() => setDeleteModal({ open: true, type: "skill", id: skill._id, name: skill.name })}
                                    onToggle={() => handleToggleSkill(skill)}
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {addSkillModal.open && (
          <Modal title="Add New Skill" onClose={() => setAddSkillModal({ open: false })}>
            <AddSkillModal
              initial={addSkillModal.initial}
              onSave={handleAddSkill}
              onCancel={() => setAddSkillModal({ open: false })}
              saving={saving}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editSkillModal.open && editSkillModal.skill && (
          <Modal title="Edit Skill Name" onClose={() => setEditSkillModal({ open: false })}>
            <EditSkillNameModal
              skill={editSkillModal.skill}
              onSave={handleEditSkill}
              onCancel={() => setEditSkillModal({ open: false })}
              saving={saving}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assignModal.open && assignModal.skill && (
          <Modal title="Assign to Group" onClose={() => setAssignModal({ open: false })} wide>
            <AssignGroupModal
              skill={assignModal.skill}
              categories={categories}
              onSave={handleAssignGroup}
              onCancel={() => setAssignModal({ open: false })}
              saving={saving}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {catModal.open && (
          <Modal title={catModal.initial?._id ? "Edit Group" : "Create New Group"} onClose={() => setCatModal({ open: false })}>
            <CategoryForm
              initial={catModal.initial}
              onSave={handleSaveCat}
              onCancel={() => setCatModal({ open: false })}
              saving={saving}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal?.open && (
          <Modal title="Confirm Delete" onClose={() => setDeleteModal(null)}>
            <DeleteConfirm
              name={deleteModal.name}
              type={deleteModal.type === "category" ? "group" : "skill"}
              warning={deleteModal.type === "category" ? "Skills in this group will be moved to Ungrouped (not deleted)." : undefined}
              onConfirm={handleDelete}
              onCancel={() => setDeleteModal(null)}
              saving={saving}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
