import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Archive,
  Pencil,
  Trash2,
  Flame,
  Trophy,
  ArchiveRestore,
  Sparkles,
} from "lucide-react";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import HabitForm from "../components/HabitForm.jsx";
import HabitSuggestionModal from "../components/HabitSuggestionModal.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { CATEGORIES } from "../utils/constants.js";
import { streakFromKeys } from "../utils/dateHelpers.js";
import { format, subDays } from "date-fns";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [logsByHabit, setLogsByHabit] = useState({});
  const [loading, setLoading] = useState(true);

  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [habitsRes, rangeRes] = await Promise.all([
        api.get("/habits", { params: { includeArchived: "true" } }),
        api.get("/logs/range", {
          params: {
            start: format(subDays(new Date(), 89), "yyyy-MM-dd"),
            end: format(new Date(), "yyyy-MM-dd"),
          },
        }),
      ]);
      setHabits(habitsRes.data);
      const byId = {};
      for (const h of habitsRes.data) byId[h._id] = [];
      for (const l of rangeRes.data) {
        if (!byId[l.habitId]) byId[l.habitId] = [];
        byId[l.habitId].push(l.completedDate);
      }
      for (const k of Object.keys(byId)) byId[k] = byId[k].sort().reverse();
      setLogsByHabit(byId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return habits.filter((h) => {
      if (!showArchived && h.isArchived) return false;
      if (showArchived && !h.isArchived) return false;
      if (category !== "All" && h.category !== category) return false;
      if (q && !h.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [habits, query, category, showArchived]);

  const activeCount = habits.filter((h) => !h.isArchived).length;
  const archivedCount = habits.filter((h) => h.isArchived).length;

  const save = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        const res = await api.put(`/habits/${editing._id}`, data);
        setHabits((hs) => hs.map((h) => (h._id === res.data._id ? res.data : h)));
      } else {
        const res = await api.post("/habits", data);
        setHabits((hs) => [...hs, res.data]);
        setLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
      }
      setFormOpen(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const archive = async (habit) => {
    const res = await api.put(`/habits/${habit._id}/archive`);
    setHabits((hs) => hs.map((h) => (h._id === res.data._id ? res.data : h)));
  };

  const remove = async (habit) => {
    await api.delete(`/habits/${habit._id}`);
    setHabits((hs) => hs.filter((h) => h._id !== habit._id));
    setDeleteTarget(null);
  };

  const acceptSuggestion = async (s) => {
    const res = await api.post("/habits", {
      name: s.name,
      description: s.description,
      category: s.category,
      frequency: s.frequency,
      icon: s.icon,
      targetDays: s.frequency === "daily" ? 7 : 3,
    });
    setHabits((hs) => [...hs, res.data]);
    setLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
  };

  if (loading) return <LoadingSpinner full />;

 return (
   <div className="space-y-7 animate-fade-in">
     {/* Page header */}
     <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
       <div>
         <div className="text-sm text-muted">Your routine library</div>

         <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
           Habits
         </h1>

         <p className="mt-2 text-sm text-soft max-w-xl">
           Create, organize, and manage the routines you're building with
           Routiq.
         </p>
       </div>

       <div className="flex items-center gap-2">
         <button className="btn-secondary" onClick={() => setSuggestOpen(true)}>
           <Sparkles size={15} />
           <span className="hidden sm:inline">Ask Routiq</span>
         </button>

         <button
           className="btn-primary"
           onClick={() => {
             setEditing(null);
             setFormOpen(true);
           }}
         >
           <Plus size={15} />
           New habit
         </button>
       </div>
     </div>

     {/* Library overview */}
     <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
       <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4 flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center">
           <Flame size={18} />
         </div>

         <div>
           <div className="text-xl font-semibold">{activeCount}</div>
           <div className="text-xs text-muted">Active habits</div>
         </div>
       </div>

       <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4 flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-(--surface-hover) text-muted flex items-center justify-center">
           <Archive size={18} />
         </div>

         <div>
           <div className="text-xl font-semibold">{archivedCount}</div>
           <div className="text-xs text-muted">Archived habits</div>
         </div>
       </div>
     </div>

     {/* Filters */}
     <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-3 md:p-4">
       <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
         <div className="relative flex-1">
           <Search
             size={16}
             className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
           />

           <input
             className="input pl-9"
             placeholder="Search your habits..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
         </div>

         <select
           className="input lg:w-52"
           value={category}
           onChange={(e) => setCategory(e.target.value)}
         >
           <option value="All">All categories</option>

           {CATEGORIES.map((c) => (
             <option key={c}>{c}</option>
           ))}
         </select>

         <div className="inline-flex rounded-xl border border-(--divider) bg-(--bg-base) p-1 text-sm">
           <button
             onClick={() => setShowArchived(false)}
             className={`flex-1 lg:flex-none px-4 py-2 rounded-lg font-medium transition ${
               !showArchived
                 ? "bg-(--surface-strong) text-brand-700 dark:text-brand-300 shadow-sm"
                 : "text-muted hover:text-(--text)"
             }`}
           >
             Active
             <span className="ml-1.5 text-xs opacity-70">{activeCount}</span>
           </button>

           <button
             onClick={() => setShowArchived(true)}
             className={`flex-1 lg:flex-none px-4 py-2 rounded-lg font-medium transition ${
               showArchived
                 ? "bg-(--surface-strong) text-brand-700 dark:text-brand-300 shadow-sm"
                 : "text-muted hover:text-(--text)"
             }`}
           >
             Archived
             <span className="ml-1.5 text-xs opacity-70">{archivedCount}</span>
           </button>
         </div>
       </div>
     </div>

     {/* Habit library */}
     {filtered.length === 0 ? (
       <div className="rounded-3xl border border-dashed border-(--divider) bg-(--surface) px-6 py-14 text-center">
         <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto">
           {showArchived ? <Archive size={22} /> : <Plus size={22} />}
         </div>

         <h3 className="mt-4 font-semibold">
           {showArchived
             ? "No archived habits"
             : habits.length === 0
               ? "Your routine starts here"
               : "No habits found"}
         </h3>

         <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
           {showArchived
             ? "Habits you archive will stay here with their history intact."
             : habits.length === 0
               ? "Start with one small habit you can realistically repeat."
               : "Try changing your search or category filter."}
         </p>

         {!showArchived && habits.length === 0 && (
           <button
             className="btn-primary mt-5"
             onClick={() => {
               setEditing(null);
               setFormOpen(true);
             }}
           >
             <Plus size={14} />
             Create your first habit
           </button>
         )}
       </div>
     ) : (
       <div className="grid lg:grid-cols-2 gap-4">
         {filtered.map((h) => {
           const keys = logsByHabit[h._id] || [];
           const { current, longest } = streakFromKeys(keys);

           return (
             <div
               key={h._id}
               className={`group rounded-3xl border border-(--divider) bg-(--surface-strong) p-5 transition hover:border-brand-500/20 hover:shadow-(--shadow) ${
                 h.isArchived ? "opacity-75" : ""
               }`}
             >
               {/* Habit top */}
               <div className="flex items-start gap-3">
                 <div
                   className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                   style={{
                     background: `${h.color}18`,
                     color: h.color,
                   }}
                 >
                   {h.icon}
                 </div>

                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 flex-wrap">
                     <h3 className="font-semibold truncate">{h.name}</h3>

                     {h.isArchived && (
                       <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300">
                         Archived
                       </span>
                     )}
                   </div>

                   {h.description && (
                     <p className="mt-1 text-sm text-muted line-clamp-2">
                       {h.description}
                     </p>
                   )}
                 </div>
               </div>

               {/* Habit metadata */}
               <div className="mt-5 flex items-center gap-2 flex-wrap">
                 <span className="text-xs px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
                   {h.category}
                 </span>

                 <span className="text-xs px-2.5 py-1.5 rounded-lg bg-(--surface-hover) text-muted capitalize">
                   {h.frequency}
                 </span>
               </div>

               {/* Statistics */}
               <div className="mt-5 pt-4 border-t border-(--divider) grid grid-cols-3 gap-3">
                 <div>
                   <div className="flex items-center gap-1.5 text-xs text-muted">
                     <Flame
                       size={13}
                       className={current > 0 ? "text-amber-500" : "text-faint"}
                     />
                     Current
                   </div>

                   <div className="mt-1 text-sm font-semibold">
                     {current} days
                   </div>
                 </div>

                 <div>
                   <div className="flex items-center gap-1.5 text-xs text-muted">
                     <Trophy size={13} className="text-amber-500" />
                     Best
                   </div>

                   <div className="mt-1 text-sm font-semibold">
                     {longest} days
                   </div>
                 </div>

                 <div>
                   <div className="text-xs text-muted">Completed</div>

                   <div className="mt-1 text-sm font-semibold">
                     {keys.length} times
                   </div>
                 </div>
               </div>

               {/* Actions */}
               <div className="mt-4 pt-3 border-t border-(--divider) flex items-center justify-end gap-1">
                 <button
                   className="btn-ghost px-3 py-2 text-xs"
                   onClick={() => {
                     setEditing(h);
                     setFormOpen(true);
                   }}
                 >
                   <Pencil size={14} />
                   Edit
                 </button>

                 <button
                   className="btn-ghost px-3 py-2 text-xs"
                   onClick={() => archive(h)}
                 >
                   {h.isArchived ? (
                     <ArchiveRestore size={14} />
                   ) : (
                     <Archive size={14} />
                   )}

                   {h.isArchived ? "Restore" : "Archive"}
                 </button>

                 <button
                   className="btn-ghost p-2 text-rose-500 hover:bg-rose-500/10"
                   onClick={() => setDeleteTarget(h)}
                   title="Delete"
                 >
                   <Trash2 size={15} />
                 </button>
               </div>
             </div>
           );
         })}
       </div>
     )}

     {/* Create / edit */}
     <Modal
       open={formOpen}
       onClose={() => {
         setFormOpen(false);
         setEditing(null);
       }}
       title={editing ? "Edit habit" : "New habit"}
     >
       <HabitForm
         initial={editing}
         submitting={submitting}
         onCancel={() => {
           setFormOpen(false);
           setEditing(null);
         }}
         onSubmit={save}
       />
     </Modal>

     {/* Delete confirmation */}
     <Modal
       open={!!deleteTarget}
       onClose={() => setDeleteTarget(null)}
       title="Delete habit?"
       maxWidth="max-w-sm"
     >
       <p className="text-sm text-soft leading-relaxed">
         This will permanently delete <b>{deleteTarget?.name}</b> and all of its
         history. This action cannot be undone.
       </p>

       <div className="flex justify-end gap-2 mt-5">
         <button
           className="btn-secondary"
           onClick={() => setDeleteTarget(null)}
         >
           Cancel
         </button>

         <button
           className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 transition"
           onClick={() => remove(deleteTarget)}
         >
           <Trash2 size={14} />
           Delete
         </button>
       </div>
     </Modal>

     <HabitSuggestionModal
       open={suggestOpen}
       onClose={() => setSuggestOpen(false)}
       onAccept={acceptSuggestion}
     />
   </div>
 );
}
