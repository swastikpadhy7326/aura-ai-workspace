import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Download,
  CheckCircle,
  X
} from 'lucide-react';
import { MemoryItem } from '../types';

interface MemoryVaultProps {
  onAskInChat: (query: string) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({ onAskInChat }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);

  // Form State
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formCategory, setFormCategory] = useState<'Preferences' | 'Work' | 'Education' | 'Personal' | 'System' | 'Fact'>('Fact');
  const [formPinned, setFormPinned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['All', 'Work', 'Education', 'Preferences', 'Personal', 'System', 'Fact'];

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      setMemories(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim() || !formValue.trim()) return;

    if (editingMemory) {
      const res = await fetch(`/api/memory/${editingMemory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: formKey,
          value: formValue,
          category: formCategory,
          pinned: formPinned,
        }),
      });
      const updated = await res.json();
      setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      showToast(`Updated memory: "${updated.key}"`);
    } else {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: formKey,
          value: formValue,
          category: formCategory,
          pinned: formPinned,
        }),
      });
      const created = await res.json();
      setMemories((prev) => [created, ...prev]);
      showToast(`Stored new memory in vault.`);
    }

    setIsAddModalOpen(false);
    setEditingMemory(null);
    setFormKey('');
    setFormValue('');
    setFormCategory('Fact');
    setFormPinned(false);
  };

  const handleDeleteMemory = async (id: string) => {
    await fetch(`/api/memory/${id}`, { method: 'DELETE' });
    setMemories((prev) => prev.filter((m) => m.id !== id));
    showToast('Memory item deleted.');
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to permanently erase all memories stored in AURA?')) {
      await fetch('/api/memory', { method: 'DELETE' });
      setMemories([]);
      showToast('All memories cleared successfully.');
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aura_memory_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const openEditModal = (mem: MemoryItem) => {
    setEditingMemory(mem);
    setFormKey(mem.key);
    setFormValue(mem.value);
    setFormCategory(mem.category);
    setFormPinned(Boolean(mem.pinned));
    setIsAddModalOpen(true);
  };

  const filteredMemories = memories
    .filter((m) => (filterCategory === 'All' ? true : m.category === filterCategory))
    .filter((m) => m.key.toLowerCase().includes(searchQuery.toLowerCase()) || m.value.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 bg-[#020617] text-slate-200 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Bento Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Persistent Long-Term Memory Vault
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 text-indigo-400 border border-slate-800 font-mono">
                {memories.length} Entities
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              User-governed persistent memory nodes. Add, inspect, search, and recall facts dynamically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-memory-btn"
            onClick={() => {
              setEditingMemory(null);
              setFormKey('');
              setFormValue('');
              setFormCategory('Fact');
              setFormPinned(false);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Store Memory</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 cursor-pointer"
            title="Export JSON memory vault backup"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800 text-indigo-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar Bento Tile */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memory vault..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleClearAll}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
            title="Erase all memories"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-md space-y-3 flex flex-col justify-between transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800">
                  {mem.category}
                </span>

                <div className="flex items-center gap-1">
                  {mem.pinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  <button
                    onClick={() => openEditModal(mem)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white tracking-tight">{mem.key}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{mem.value}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-mono">
                {new Date(mem.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => onAskInChat(`What do you remember about: ${mem.key}?`)}
                className="text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Recall in Chat
              </button>
            </div>
          </div>
        ))}

        {filteredMemories.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No memories found matching your filters.
          </div>
        )}
      </div>

      {/* Modal for Adding/Editing Memory */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#020617] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {editingMemory ? 'Edit Memory Entity' : 'Store New Memory Node'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Key / Subject
                </label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="e.g. Major Project Presentation Date"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Memory Value / Context
                </label>
                <textarea
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. Project presentation is on Friday Dec 12 at 10:00 AM in Room 402."
                  rows={3}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Fact">Fact</option>
                    <option value="Preferences">Preferences</option>
                    <option value="Work">Work</option>
                    <option value="Education">Education</option>
                    <option value="Personal">Personal</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPinned}
                      onChange={(e) => setFormPinned(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Pin to Context (High Priority)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-medium border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  {editingMemory ? 'Update Entity' : 'Save Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
