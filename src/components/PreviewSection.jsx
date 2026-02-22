import React from 'react';
import { ExternalLink, Github, Monitor, Smartphone } from 'lucide-react';

export default function PreviewSection({ previewImageUrl }) {
  return (
    <div className="w-full max-w-5xl mx-auto mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
      <div className="relative group">
        {/* Glow Effect behind image */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Browser Top Bar Mac-style */}
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
            </div>
            <div className="bg-slate-950/50 px-3 py-1 rounded-md text-[10px] text-slate-500 font-mono flex items-center gap-2">
              <Monitor className="w-3 h-3" />
              localhost:5173/rizz-calculator
            </div>
            <div className="w-12"></div> {/* Spacer */}
          </div>

          {/* The Preview Image */}
          <div className="aspect-video md:aspect-[16/8] overflow-hidden">
            <img 
              src={previewImageUrl} 
              alt="Rizz Calculator Preview" 
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>

          {/* Preview Footer / Info */}
          <div className="p-6 bg-slate-900/90 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Project Preview: v1.0.0</h3>
              <p className="text-slate-400 text-sm">Responsive AI Dashboard with Neural Scanline Effects</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                <Smartphone className="w-4 h-4" /> Mobile View
              </button>
              <button className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                <ExternalLink className="w-4 h-4" /> Live Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}