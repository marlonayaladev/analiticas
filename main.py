from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def limpiar_numeros(val):
    if pd.isna(val): return 0.0
    try: return float(str(val).replace(',', '').strip())
    except: return 0.0

@app.get("/api/dashboard")
def get_dashboard_data():
    try:
        # 1. Leer archivo
        df = pd.read_excel("Reporte ME5A - USD 20.000.xlsx", sheet_name='BB_DD', dtype=str)
        df['Pedido'] = df['Pedido'].astype(str).str.strip()
        df['Valor total'] = df['Valor total'].apply(limpiar_numeros)
        df['Valor total USD'] = df['Valor total USD'].apply(limpiar_numeros)
        
        # 2. Motor de T.C. (Calcula el USD faltante)
        tasas = {'PEN': 3.45, 'CLP': 925.93, 'UF': 0.024, 'COP': 3678, 'EURO': 0.87, 'USD': 1}
        def calc_usd(row):
            if row['Valor total USD'] > 0: return row['Valor total USD']
            moneda = str(row['Moneda']).upper().strip()
            valor = row['Valor total']
            if moneda in tasas: return valor / tasas[moneda]
            return valor
            
        df['USD_Real'] = df.apply(calc_usd, axis=1)

        # 3. Filtrar OC49
        df_oc49 = df[df['Pedido'].str.startswith('49')].copy()
        
        # KPIs Generales
        total_ocs = int(df['Pedido'].nunique())
        count_49 = int(df_oc49['Pedido'].nunique())
        total_usd_49 = float(df_oc49['USD_Real'].sum())
        alertas_20k = int(df_oc49[df_oc49['USD_Real'] > 20000]['Pedido'].nunique())

        # 4. Proveedores + Detalle de Pedidos (Ordenados por monto de riesgo)
        top_prov_names = df_oc49['Nombre de proveedor'].value_counts().head(8).index
        proveedores_list = []
        for prov in top_prov_names:
            prov_df = df_oc49[df_oc49['Nombre de proveedor'] == prov].drop_duplicates(subset=['Pedido'])
            prov_df = prov_df.sort_values(by='USD_Real', ascending=False) # Ordenar por las más caras
            
            orders = []
            for _, row in prov_df.head(50).iterrows(): # Mostramos el top 50 de órdenes por proveedor
                orders.append({
                    "pedido": row['Pedido'],
                    "monto": f"${float(row['USD_Real']):,.2f}"
                })
            proveedores_list.append({
                "name": str(prov),
                "value": len(prov_df),
                "orders": orders
            })

        # 5. Grupos de Compra Globales
        grupos = df_oc49['Grupo de compras'].value_counts().head(6).reset_index()
        grupos.columns = ['group', 'count']
        grupos['group'] = grupos['group'].astype(str)

        # 6. Distribución Interactiva de Países
        country_map = {"CL": "Chile", "PE": "Perú", "CO": "Colombia", "CL01": "Chile", "PE01": "Perú", "CO01": "Colombia"}
        df_oc49['Pais'] = df_oc49['País'].map(country_map).fillna(df_oc49['País'])
        
        paises_list = []
        for pais in df_oc49['Pais'].dropna().unique():
            pais_df = df_oc49[df_oc49['Pais'] == pais]
            monto_pais = float(pais_df['USD_Real'].sum())
            
            grupos_pais = pais_df.groupby('Grupo de compras')['USD_Real'].sum().reset_index()
            grupos_pais = grupos_pais.sort_values(by='USD_Real', ascending=False)
            
            detalle_grupos = []
            for _, r in grupos_pais.iterrows():
                detalle_grupos.append({
                    "grupo": str(r['Grupo de compras']),
                    "monto": f"${float(r['USD_Real']):,.2f}"
                })
                
            paises_list.append({
                "pais": str(pais),
                "monto": monto_pais,
                "detalle_grupos": detalle_grupos
            })
            
        paises_list = sorted(paises_list, key=lambda x: x['monto'], reverse=True)

        return {
            "kpis": {
                "total": total_ocs,
                "oc49": count_49,
                "porcentaje": round((count_49 / total_ocs) * 100, 1) if total_ocs > 0 else 0,
                "monto": f"{total_usd_49:,.2f}",
                "alertas": alertas_20k # Nuevo KPI de riesgo
            },
            "distribution": [
                {"name": "Tipo OC49", "value": count_49},
                {"name": "Otras OCs", "value": total_ocs - count_49}
            ],
            "proveedores": proveedores_list,
            "grupos": grupos.to_dict(orient='records'),
            "paises": paises_list
        }
    except Exception as e:
        return {"error": str(e)}