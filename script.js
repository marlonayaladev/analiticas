import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#FFBB28'];

const DashboardCompras = () => {
  const [data, setData] = useState({ distribucion_oc: [], top_proveedores: [], top_grupos: [] });

  useEffect(() => {
    // Consumir el endpoint de Python
    fetch('http://localhost:8000/api/dashboard-compras')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Error al cargar datos:", err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Dashboard de Análisis: Órdenes de Compra (OC49)</h2>
      
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        {/* Gráfico de Pastel */}
        <div style={{ width: '400px', height: '400px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Distribución Total vs OC49</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.distribucion_oc}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {data.distribucion_oc.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tablas de Recurrencia */}
        <div style={{ flex: 1 }}>
          <h3>Top Proveedores (OC49)</h3>
          <table border="1" width="100%" style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead style={{ backgroundColor: '#f4f4f4' }}>
              <tr><th>Proveedor</th><th>N° de OCs</th></tr>
            </thead>
            <tbody>
              {data.top_proveedores.map((prov, i) => (
                <tr key={i}><td>{prov.Proveedor}</td><td style={{ textAlign: 'center' }}>{prov.Frecuencia}</td></tr>
              ))}
            </tbody>
          </table>

          <h3>Top Grupos de Compras (OC49)</h3>
          <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f4f4f4' }}>
              <tr><th>Grupo de Compra</th><th>N° de OCs</th></tr>
            </thead>
            <tbody>
              {data.top_grupos.map((grupo, i) => (
                <tr key={i}><td>{grupo.Grupo}</td><td style={{ textAlign: 'center' }}>{grupo.Frecuencia}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardCompras;