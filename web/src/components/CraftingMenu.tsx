import React, { useState, useEffect } from "react";
import { fetchNui } from "../utils/fetchNui";
import { useNuiEvent } from "../hooks/useNuiEvent";

interface Ingredient {
  name: string;
  label: string;
  amount: number;
  count: number;
  image?: string;
}

interface CraftableItem {
  id: string;
  name: string;
  label: string;
  description?: string;
  image?: string;
  ingredients: Ingredient[];
  duration: number; // in ms
  level?: number;
}

const CraftingMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<CraftableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CraftableItem | null>(null);
  const [crafting, setCrafting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tableName, setTableName] = useState("SISTEMA DE MANUFATURA");

  // Helper to convert hex to rgb space-separated
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : "34 197 94";
  };

  useNuiEvent<boolean>("setVisible", setVisible);
  useNuiEvent<string>("setTableName", setTableName);
  useNuiEvent<string>("setPrimaryColor", (color) => {
    const rgb = hexToRgb(color);
    document.documentElement.style.setProperty("--color-primary", rgb);
  });

  useNuiEvent<CraftableItem[]>("setCraftingData", (data) => {
    setItems(data);
    // Preserve selection if possible
    setSelectedItem((prev) => {
      if (!prev) return data.length > 0 ? data[0] : null;
      const found = data.find((i) => i.id === prev.id);
      return found || (data.length > 0 ? data[0] : null);
    });
  });

  // Only reset time left when selection changes AND we are not currently crafting
  useEffect(() => {
    if (selectedItem && !crafting) {
      setTimeLeft(selectedItem.duration);
    }
  }, [selectedItem, crafting]);

  useEffect(() => {
    if (!visible) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    fetchNui("close");
  };

  const formatTime = (ms: number) => {
    return new Date(Math.max(0, ms)).toISOString().substr(14, 5);
  };

  const handleCraft = async () => {
    if (!selectedItem || crafting) return;

    // Start animation immediately
    setCrafting(true);
    setProgress(0);
    setTimeLeft(selectedItem.duration);

    // Send request to server
    try {
      await fetchNui("craftItem", { itemId: selectedItem.id });
    } catch (e) {
      console.error("Crafting request failed", e);
      setCrafting(false);
      return;
    }

    const startTime = Date.now();
    const duration = selectedItem.duration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);
      setTimeLeft(Math.max(0, duration - elapsed));

      if (newProgress >= 100) {
        clearInterval(interval);
        setCrafting(false);
        setProgress(0);
        // Reset time to selected item's duration when done
        // We use the functional update or just check current valid selection
        // But since we are in a closure, we trust the state flow will handle the reset via effect if needed?
        // Actually Effect won't trigger if crafting just became false but selectedItem didn't change.
        // So we manually reset.
        // We need to access the LATEST selectedItem to be correct.
        // But simplistically:
        setTimeLeft(0);
      }
    }, 50);
  };

  // Effect to reset time when crafting finishes
  useEffect(() => {
    if (!crafting && selectedItem) {
      setTimeLeft(selectedItem.duration);
    }
  }, [crafting, selectedItem]);

  if (!visible) return null;

  const canCraft = selectedItem?.ingredients.every(
    (ing) => ing.count >= ing.amount,
  );

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black/80 font-sans text-slate-100 dark">
      <div className="w-[1200px] h-[800px] bg-background-dark text-slate-100 flex flex-col overflow-hidden rounded-xl shadow-2xl border border-white/5 relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 glass z-20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-widest uppercase text-slate-300">
              {tableName}
            </h1>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20">
              OPERACIONAL
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-500 font-bold leading-none">
                Status
              </p>
              <p className="text-sm font-mono font-bold text-primary flex items-center justify-end gap-1">
                <span className="material-icons-round text-sm">wifi</span>{" "}
                CONECTADO
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
            >
              <span className="material-icons-round text-slate-400">close</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 glass shrink-0">
            <button className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-icons-round">build</span>
            </button>
          </aside>

          {/* Items List */}
          <aside className="w-72 border-r border-white/5 flex flex-col glass shrink-0">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Projetos Disponíveis
              </h2>
              <span className="material-icons-round text-slate-500 text-sm">
                filter_list
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer group relative overflow-hidden ${isSelected ? "border-primary bg-primary/5 glow-green" : "border-white/5 hover:border-white/20"}`}
                  >
                    {isSelected && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-primary"></div>
                    )}
                    <p
                      className={`text-xs font-bold uppercase tracking-wide ${isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-[10px] font-bold uppercase mt-1 ${isSelected ? "text-primary" : "text-slate-600"}`}
                    >
                      Tempo: {item.duration / 1000}s
                    </p>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="flex-1 flex flex-col relative bg-gradient-to-br from-background-dark to-[#1a1a1a]">
            {selectedItem ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Rotating Background Ring */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="absolute w-[500px] h-[500px] border border-dashed border-white rounded-full animate-[spin_60s_linear_infinite]"></div>
                    <div className="absolute w-[400px] h-[400px] border border-white rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                  </div>

                  {/* Item Image */}
                  <div className="relative z-10 bg-black/20 rounded-full p-6 backdrop-blur-sm">
                    <div className="w-64 h-64 rounded-full border-4 border-white/5 overflow-hidden shadow-2xl relative flex items-center justify-center group bg-black/40">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <img
                        src={
                          selectedItem.image ||
                          `nui://ox_inventory/web/images/${selectedItem.name}.png`
                        }
                        alt={selectedItem.label}
                        className="w-40 h-40 object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {crafting && (
                      <div className="absolute inset-0 border border-dashed border-primary/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    )}
                  </div>

                  <div className="text-center mt-6 relative z-10 transition-all duration-300">
                    <h3 className="text-3xl font-bold tracking-tight text-white uppercase glow-text">
                      {selectedItem.label}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto">
                      {selectedItem.description ||
                        "Tempo para criar: " +
                          selectedItem.duration / 1000 +
                          "s"}
                    </p>
                  </div>
                </div>

                {/* Crafting Actions */}
                <div className="p-8 space-y-6 z-10 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="max-w-xl mx-auto w-full">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        PROGRESSO
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono ${crafting ? "text-primary animate-pulse" : "text-slate-500"}`}
                        >
                          {crafting
                            ? `FABRICANDO - ${formatTime(timeLeft)}`
                            : "AGUARDANDO"}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-primary w-full glow-green transition-all duration-100 ease-linear"
                        style={{ width: `${crafting ? progress : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={handleCraft}
                      disabled={!canCraft || crafting}
                      className={`
                                                relative overflow-hidden font-bold px-12 py-4 rounded-md flex items-center gap-3 transition-all transform group
                                                ${
                                                  !canCraft
                                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                                                    : crafting
                                                      ? "bg-primary/20 text-primary cursor-wait"
                                                      : "bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 text-background-dark shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                                }
                                            `}
                    >
                      <span className="material-icons-round group-hover:translate-x-0.5 transition-transform">
                        {crafting ? "settings_suggest" : "play_arrow"}
                      </span>
                      <span className="tracking-widest text-sm">
                        {!canCraft
                          ? "RECURSOS INSUFICIENTES"
                          : crafting
                            ? "PROCESSANDO..."
                            : "INICIALIZAR MONTAGEM"}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <span className="material-icons-round text-6xl mb-4 opacity-20">
                  construction
                </span>
                <p className="text-sm tracking-widest uppercase">
                  Selecione um projeto
                </p>
              </div>
            )}
          </section>

          {/* Details / Ingredients Sidebar */}
          <aside className="w-80 border-l border-white/5 flex flex-col glass shrink-0">
            {selectedItem && (
              <>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Recursos Necessários
                  </h2>
                  <span className="material-icons-round text-slate-500 text-sm">
                    inventory
                  </span>
                </div>
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  {selectedItem.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 p-1 border border-white/5">
                          <img
                            src={`nui://ox_inventory/web/images/${ing.name}.png`}
                            alt={ing.label}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            {ing.label}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase">
                            Material
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-mono font-bold ${ing.count >= ing.amount ? "text-primary" : "text-red-500"}`}
                        >
                          {ing.count} / {ing.amount}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-8">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Estimativa
                    </h3>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-20"></div>
                      <span className="text-2xl font-mono font-bold text-white glow-text relative z-10">
                        {formatTime(timeLeft)}
                      </span>
                      <div className="flex gap-1 mt-3">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse delay-75"></div>
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </aside>
        </main>

        <footer className="h-10 px-6 glass flex items-center justify-between border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              <span>
                Sistema: <span className="text-white">Online</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CraftingMenu;
