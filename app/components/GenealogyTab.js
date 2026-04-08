export default function GenealogyTab() {
  const FamilyCard = ({ label, id, relation, isMain }) => (
    <div className={`bg-white p-3 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-3 ${isMain ? 'ring-2 ring-[#1B4820] scale-105' : ''}`}>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
        <img src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-[12px] font-black text-neutral-800">#{id}</p>
        <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{relation}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 py-4 max-w-lg mx-auto">
      
      {/* LÍNEA DE ASCENDENCIA */}
      <div className="space-y-6 text-center">
        <h5 className="text-[10px] pb-2 font-black uppercase tracking-[0.3em] text-neutral-400">Línea de Ascendencia</h5>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
           <FamilyCard id="88" relation="Abuelo (P)" />
           <FamilyCard id="91" relation="Abuelo (M)" />
           <FamilyCard id="22" relation="Abuela (P)" />
           <FamilyCard id="10" relation="Abuela (M)" />
        </div>

        <div className="flex justify-center items-center gap-4 relative">
          <div className="absolute h-10 w-px bg-neutral-200 -top-10" />
          <FamilyCard id="102" relation="Padre" />
          <FamilyCard id="45" relation="Madre" />
        </div>
      </div>

      {/* SUJETO ACTUAL */}
      <div className="relative py-14 flex justify-center">
  {/* Línea conectora vertical de fondo */}
  <div className="absolute h-full w-px bg-neutral-200 top-0 left-1/2 -translate-x-1/2" />
  
  {/* Card del Sujeto Actual */}
  <div className="bg-[#1B4820] text-white p-8 rounded-[3rem] shadow-2xl z-10 text-center min-w-[220px] border-4 border-white relative">
    {/* Imagen Circular del Sujeto */}
    <div className="relative inline-block mb-4">
      <img 
        src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800" 
        className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-md" 
        alt="Sujeto Actual"
      />
      
    </div>

    {/* Identificador Principal */}
    <p className="text-2xl font-black italic leading-none mb-4">#204</p>
    
    {/* Sección de Peso Actual */}
    <div className="pt-4 border-t border-white/10">
      <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mb-1">Peso Actual</p>
      <p className="text-xl font-black italic leading-none">740 kg</p>
    </div>
  </div>
</div>

      {/* LÍNEA DE DESCENDENCIA */}
      <div className="space-y-6 text-center">
        <h5 className="text-[10px] font-black pb-2 uppercase tracking-[0.3em] text-neutral-400">Descendencia Directa</h5>
        <div className="grid grid-cols-2 gap-4">
           <FamilyCard id="01" relation="Hijo" />
           <FamilyCard id="05" relation="Hija" />
        </div>
      </div>

    </div>
  );
}