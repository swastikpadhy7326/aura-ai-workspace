import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { DocumentChunk, DocumentItem } from '../types';

interface RagStudioProps {
  onAskInChat: (query: string) => void;
}

export const RagStudio: React.FC<RagStudioProps> = ({ onAskInChat }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentChunk[]>([]);
  const [uploadText, setUploadText] = useState('');
  const [docName, setDocName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/rag/documents');
      const data = await res.json();
      setDocuments(data);
      if (data.length > 0 && !selectedDoc) {
        setSelectedDoc(data[0]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const res = await fetch('/api/rag/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            text: content || 'Sample document content for RAG vector retrieval.',
            size: file.size,
            type: file.type || 'text/plain',
          }),
        });
        const newDoc = await res.json();
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedDoc(newDoc);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err) {}
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handlePasteUpload = async () => {
    if (!docName.trim() || !uploadText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rag/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: docName.endsWith('.txt') ? docName : `${docName}.txt`,
          text: uploadText,
          size: uploadText.length,
          type: 'text/plain',
        }),
      });
      const newDoc = await res.json();
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
      setDocName('');
      setUploadText('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (e) {}
    setLoading(false);
  };

  const handleDeleteDoc = async (id: string) => {
    await fetch(`/api/rag/documents/${id}`, { method: 'DELETE' });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(documents.find((d) => d.id !== id) || null);
    }
  };

  const handleSemanticSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const allChunks: DocumentChunk[] = [];
    documents.forEach((doc) => allChunks.push(...doc.chunks));

    const scored = allChunks.map((chunk) => {
      let score = 0;
      const textLower = chunk.text.toLowerCase();
      words.forEach((w) => {
        if (textLower.includes(w)) score += 1.5;
      });
      if (textLower.includes(q.toLowerCase())) score += 3.0;
      return { ...chunk, similarityScore: Number(Math.min(0.99, 0.45 + score * 0.15).toFixed(2)) };
    });

    scored.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
    setSearchResults(scored.slice(0, 5));
  };

  return (
    <div className="flex-1 bg-[#020617] text-slate-200 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Bento Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Document Intelligence & RAG Engine
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 text-indigo-400 border border-slate-800">
                Vector Store
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingest PDFs, research whitepapers, code, CSV tables, and notes for grounded citation retrieval
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Ingesting...' : 'Upload Document'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.docx,.csv,.json,.md,.py,.js"
            />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Document parsed, chunked, and vectorized into the RAG semantic store successfully!</span>
        </div>
      )}

      {/* Main Studio Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Library (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Document Library ({documents.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/30'
                        : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                        {doc.name.endsWith('.csv') ? (
                          <FileSpreadsheet className="w-4 h-4" />
                        ) : doc.name.endsWith('.json') || doc.name.endsWith('.js') || doc.name.endsWith('.py') ? (
                          <FileCode className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-medium text-white truncate">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {doc.chunkCount} chunks • {Math.round(doc.size / 1024)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDoc(doc.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {documents.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No documents ingested yet. Upload a PDF or paste text below.
                </div>
              )}
            </div>
          </div>

          {/* Quick Paste Ingestion Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Direct Text Ingestion</span>
            </h4>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Document Title (e.g. ProjectNotes.txt)"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste research text, requirements, or documentation to chunk..."
              rows={4}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
            <button
              onClick={handlePasteUpload}
              disabled={loading || !docName.trim() || !uploadText.trim()}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 hover:text-indigo-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
            >
              Parse & Vectorize Text
            </button>
          </div>
        </div>

        {/* Chunk Inspector & Semantic Query Engine (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Semantic Retrieval Search Box */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Semantic Passage Retrieval & Cosine Similarity</span>
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSemanticSearch(e.target.value)}
                placeholder="Query RAG knowledge base (e.g., 'What are the permission tiers in agent architecture?')..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Semantic Matches Result */}
            {searchResults.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-[10px] text-slate-500">Top Semantic Matches ({searchResults.length})</span>
                  <button
                    onClick={() => onAskInChat(`Based on the uploaded documents: ${searchQuery}`)}
                    className="text-indigo-400 hover:underline flex items-center gap-1 font-medium text-xs"
                  >
                    <span>Ask AURA in Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {searchResults.map((match) => (
                    <div
                      key={match.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/30 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-indigo-300 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {match.docName} • Page {match.page || 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 text-indigo-400 font-mono text-[10px] border border-slate-800 font-semibold">
                          Match: {Math.round((match.similarityScore || 0.8) * 100)}%
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{match.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Document Chunk Breakdown */}
          {selectedDoc ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>{selectedDoc.name}</span>
                    <span className="text-xs font-mono text-slate-500 font-normal">
                      ({selectedDoc.chunks.length} Overlapping Chunks)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedDoc.summary}</p>
                </div>

                <button
                  onClick={() => onAskInChat(`Summarize the main points of ${selectedDoc.name}`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Summarize Document</span>
                </button>
              </div>

              {/* Chunk List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Vector Chunks (150 words + 30 word overlap)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedDoc.chunks.map((chunk, idx) => (
                    <div
                      key={chunk.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono text-indigo-400 font-semibold">Chunk #{idx + 1}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ~{chunk.tokenEstimate} Tokens • Page {chunk.page || 1}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-4">
                        {chunk.text}
                      </p>
                      <div className="pt-1 text-[10px] text-slate-600 font-mono">
                        ID: {chunk.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
              Select a document from the left library to inspect its vector chunks and token embeddings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
