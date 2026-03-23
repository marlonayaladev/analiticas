import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ShoppingCart, AlertTriangle, Users, DollarSign, Target, Settings, Zap, ListChecks, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const sections = [
  { id: 'dashboard', label: '1. Resumen Ejecutivo', icon: Target },
  { id: 'bbdd', label: '2. Data Center (BB_DD)', icon: ShoppingCart },
  { id: 'divisas', label: '3. Control Cambiario (T.C.)', icon: DollarSign },
  { id: 'mejora', label: '4. Mejora Continua', icon: Zap },
  { id: 'backlog', label: '5. Seguimiento Backlog', icon: ListChecks },
];

export default function App() {
  const [data, setData] = useState(null);
  const [errorServidor, setErrorServidor] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const [expandedProvRow, setExpandedProvRow] = useState(null); 
  const [expandedCountry, setExpandedCountry] = useState(null);

  useEffect(() => {
    fetch('https://sap-dashboard-backend.onrender.com/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error("Error HTTP " + res.status);
        return res.json();
      })
      .then(json => {
        if (json.error) setErrorServidor(json.error);
        else setData(json);
      })
      .catch(err => setErrorServidor("No se pudo conectar al Backend."));
  }, []);

  if (errorServidor) return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] p-8">
      <div className="bg-[#1e293b] p-6 rounded-xl border border-red-500/30 text-red-400 font-bold text-center">
        <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-red-500" />
        <p>Error de conexión: {errorServidor}</p>
      </div>
    </div>
  );

  if (!data || !data.kpis) return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  const formatterMonto = (value) => `$${value.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex font-sans overflow-hidden">
      
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <nav className="w-64 bg-[#1e293b]/80 border-r border-slate-700/50 p-6 flex flex-col justify-between hidden md:flex h-screen">
        <div>
          <div className="mb-10 text-xl font-black text-blue-500 tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <span className="text-sm">SAP</span>
            </div>
            ANALYTICS
          </div>
          <div className="space-y-3">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button 
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-slate-700/50 pt-6 mt-6">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sistema</div>
          <button className="flex items-center gap-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            <Settings size={18}/> Configuración
          </button>
        </div>
      </nav>

      {/* 2. ÁREA PRINCIPAL DEL DASHBOARD */}
      <main className="flex-1 p-6 lg:p-10 h-screen overflow-y-auto scrollbar-hide">
        
        <div className="flex justify-between items-end mb-8 pb-6 border-b border-slate-700/50">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              {sections.find(s => s.id === activeSection)?.label.toUpperCase()}
            </h1>
            <p className="text-slate-400 text-sm mt-2">Control Operativo ME5A - Tipología OC49</p>
          </div>
        </div>

        {activeSection === 'dashboard' ? (
          <>
            {/* Tarjetas KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KpiCard title="TOTAL OCS" value={data.kpis.total} icon={<ShoppingCart size={20} />} color="from-blue-600 to-blue-400" />
              <KpiCard title="TOTAL OC49" value={data.kpis.oc49} sub={`${data.kpis.porcentaje}%`} icon={<AlertTriangle size={20} />} color="from-orange-600 to-orange-400" />
              {/* Nueva Tarjeta de Auditoría */}
              <KpiCard title="RIESGO >$20k USD" value={data.kpis.alertas} sub="Requieren Contrato" icon={<ShieldAlert size={20} />} color="from-red-600 to-red-400" />
              <KpiCard title="MONTO GESTIONADO" value={`$${data.kpis.monto}`} icon={<DollarSign size={20} />} color="from-purple-600 to-purple-400" />
            </div>

            {/* GRÁFICOS (3 COLUMNAS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
              
              {/* Gráfico 1: Pastel */}
              <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-slate-700/50 h-full">
                <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div> Distribución Tipología
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.distribution} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                        {data.distribution.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}/>
                      <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 2: Países (INTERACTIVO Y HORIZONTAL) */}
              <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-1 h-4 bg-purple-500 rounded-full"></div> Monto OC49 por País
                  </h3>
                  {expandedCountry && (
                    <button onClick={() => setExpandedCountry(null)} className="text-xs text-white bg-slate-700 px-2 py-1 rounded hover:bg-slate-600">
                      Cerrar Detalle
                    </button>
                  )}
                </div>
                <div className="h-60 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.paises} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="pais" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} width={70} />
                      <Tooltip 
                        formatter={(value) => [formatterMonto(value), "Monto Total USD"]}
                        cursor={{ fill: '#334155', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                      />
                      <Bar 
                        dataKey="monto" 
                        radius={[0, 6, 6, 0]} 
                        barSize={30}
                        cursor="pointer"
                        onClick={(data) => setExpandedCountry(prev => prev?.pais === data.pais ? null : data)}
                      >
                        {data.paises.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ef4444', '#10b981', '#f59e0b'][index % 3]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-slate-500 text-center mt-2 italic">Clic en la barra del país para ver detalle</p>
                </div>

                {/* Acordeón Detalle del País */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedCountry ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  {expandedCountry && (
                    <div className="bg-[#0f172a]/50 rounded-xl border border-slate-700/50 p-4">
                      <h4 className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">
                        Grupos de Compra: <span className="text-white">{expandedCountry.pais}</span>
                      </h4>
                      <div className="overflow-y-auto max-h-48">
                        <table className="w-full text-left text-sm">
                          <thead className="text-slate-500 border-b border-slate-700/50">
                            <tr>
                              <th className="pb-2 font-medium">Nombre (Texto)</th>
                              <th className="pb-2 text-right font-medium">Monto USD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/30">
                            {expandedCountry.detalle_grupos.map((g, idx) => (
                              <tr key={idx} className="hover:bg-slate-700/20">
                                <td className="py-2 text-slate-300 font-medium">{g.grupo}</td>
                                <td className="py-2 text-right text-emerald-400 font-mono">{g.monto}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gráfico 3: Grupos de Compra */}
              <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-slate-700/50 h-full">
                <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div> Top Grupos de Compra
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.grupos} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="group" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} width={60} />
                      <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}/>
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* TABLA INTERACTIVA DE PROVEEDORES */}
            <div className="bg-[#1e293b] rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden mb-10">
              <div className="px-6 py-5 border-b border-slate-700/50 bg-[#1e293b]">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div> Top Proveedores Recurrentes <span className="text-[10px] text-slate-500 ml-2">(Clic para desplegar órdenes)</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a]/80 text-slate-400 text-xs uppercase tracking-widest">
                      <th className="px-6 py-4 font-semibold">Proveedor</th>
                      <th className="px-6 py-4 font-semibold text-center">Frecuencia OC49</th>
                      <th className="px-6 py-4 font-semibold text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {data.proveedores.map((p, i) => (
                      <React.Fragment key={i}>
                        {/* Fila Principal Clicable */}
                        <tr 
                          onClick={() => setExpandedProvRow(expandedProvRow === i ? null : i)}
                          className="hover:bg-slate-700/40 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-slate-200">{p.name}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-500/20">
                              {p.value} Pedidos
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-500 group-hover:text-white transition-colors">
                            {expandedProvRow === i ? <ChevronUp className="inline" size={18} /> : <ChevronDown className="inline" size={18} />}
                          </td>
                        </tr>

                        {/* Acordeón de Órdenes de Compra */}
                        {expandedProvRow === i && (
                          <tr className="bg-[#0f172a]/40">
                            <td colSpan="3" className="px-6 py-4">
                              <div className="border border-slate-700/50 rounded-lg overflow-hidden max-w-2xl mx-auto">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-[#1e293b]/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                      <th className="px-6 py-3 border-b border-slate-700/50">Nº de Pedido (OC)</th>
                                      <th className="px-6 py-3 border-b border-slate-700/50 text-right">Monto Total USD</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-700/30">
                                    {p.orders.map((order, idx) => (
                                      <tr key={idx} className="hover:bg-[#1e293b]/40 transition-colors">
                                        <td className="px-6 py-3 font-mono text-emerald-400 font-bold">{order.pedido}</td>
                                        <td className="px-6 py-3 text-right font-semibold text-slate-300">{order.monto}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700/50 rounded-2xl text-slate-500">
            <Zap size={32} className="mb-4 text-slate-600" />
            <p className="font-semibold text-lg">Módulo en construcción.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ title, value, sub, icon, color }) {
  return (
    <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-slate-700/50 relative overflow-hidden flex flex-col justify-between h-[130px] transition-transform hover:-translate-y-1 duration-300">
      <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full bg-gradient-to-br ${color} opacity-10 blur-xl pointer-events-none`}></div>
      <div className="flex justify-between items-start z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 z-10 mt-2">
        <h2 className="text-3xl font-black text-white tracking-tight">{value}</h2>
        {sub && <span className="text-xs font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-md border border-slate-600/50">{sub}</span>}
      </div>
    </div>
  );
}