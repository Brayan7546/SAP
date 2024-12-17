from flask import Flask
from flask_mysqldb import MySQL
import MySQLdb.cursors
import pandas as pd
import json
import re

# Inicializar la base de datos
db = MySQL()


def crear_tablas():
    from flask_mysqldb import MySQLdb
    conn = db.connection
    cursor = conn.cursor()

    # Crear tablas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS equipos (
            id INT AUTO_INCREMENT PRIMARY KEY,          -- Identificador único del equipo
            eqtyp VARCHAR(1) NOT NULL,                  -- Tipo de equipo
            shtxt VARCHAR(40) NOT NULL,                 -- Denominación
            brgew DECIMAL(13, 3),                       -- Peso del objeto
            gewei VARCHAR(3),                           -- Unidad de peso
            groes VARCHAR(18),                          -- Tamaño/Dimensión
            inbdt DATE,                                 -- Fecha de puesta en servicio de objeto técnico
            eqart VARCHAR(10),                          -- Clase de objeto / tipo de equipo
            answt DECIMAL(13, 2),                       -- Valor de adquisición
            ansdt DATE,                                 -- Fecha de adquisición
            waers VARCHAR(5),                           -- Clave de moneda
            herst VARCHAR(30),                          -- Fabricante del activo fijo
            herld VARCHAR(3),                           -- País de fabricación
            typbz VARCHAR(20),                          -- Denominación de tipo del fabricante
            baujj VARCHAR(4),                           -- Año de construcción
            baumm VARCHAR(2),                           -- Mes de construcción
            mapar VARCHAR(40),                          -- Número de pieza de fabricante
            serge VARCHAR(40),                          -- Número de serie según el fabricante
            abckz VARCHAR(1),                           -- Indicador ABC para objeto técnico CRITICIDAD
            gewrk VARCHAR(8),                           -- Puesto trabajo responsable medidas mantenimient DIVISIÓN DE MANTENIMIENTO
            tplnr VARCHAR(30),                          -- Ubicación técnica
            class VARCHAR(18),                          -- No de clase
            caracteristicas JSON
        );
    ''')


    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clases (
            id INT AUTO_INCREMENT PRIMARY KEY,
            clase VARCHAR(255) NOT NULL,               -- Campo para "clase"
            caracteristica VARCHAR(255) NOT NULL,      -- Campo para "caracteristica"
            denominacion VARCHAR(255) NOT NULL,        -- Campo para "denominacion"
            tipo_campo VARCHAR(10) NOT NULL,           -- Campo para "tipo_campo"
            ctd_posiciones INT NOT NULL,               -- Campo para "ctd_posiciones"
            decimales INT,                             -- Campo para "decimales" (puede ser nulo)
            unidad VARCHAR(50)                         -- Campo para "unidad" (puede ser nulo)
        );
    ''')
    conn.commit()
    cursor.close()


def crear_equipo(datos):
    conn = db.connection
    cursor = conn.cursor()
    query = '''
        INSERT INTO equipos (eqtyp, shtxt, brgew, gewei, groes, inbdt, eqart, answt, ansdt, waers, herst, herld, typbz, baujj, baumm, mapar, serge, abckz, gewrk, tplnr, class, caracteristicas)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    '''
    valores = (
        datos['eqtyp'], datos['shtxt'], datos.get('brgew'), datos.get('gewei'), datos.get('groes'), datos.get('inbdt'), datos.get('eqart'), datos.get('answt'), datos.get('ansdt'), datos.get('waers'),
        datos.get('herst'), datos.get('herld'), datos.get('typbz'), datos.get('baujj'), datos.get('baumm'), datos.get('mapar'), datos.get('serge'), datos.get('abckz'), datos.get('gewrk'), datos.get('tplnr'),
        datos.get('class'), datos.get('caracteristicas')
    )
    try:
        cursor.execute(query, valores)
        conn.commit()
        return {'message': 'Equipo creado exitosamente', 'id': cursor.lastrowid}
    except Exception as e:
        return {'error': str(e)}
    finally:
        cursor.close()

def obtener_equipo(equipo_id):
    conn = db.connection
    cursor = conn.cursor()
    query = 'SELECT * FROM equipos WHERE id = %s'
    cursor.execute(query, (equipo_id,))
    equipo = cursor.fetchone()
    cursor.close()
    return equipo


def obtener_todos_equipos():
    conn = db.connection
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)  # <-- DictCursor
    query = '''
        SELECT 
            id, eqtyp, shtxt, brgew, gewei, groes, inbdt, eqart, answt, ansdt, waers, herst, herld, typbz, baujj, baumm, mapar, serge, abckz, gewrk, tplnr, class, caracteristicas
        FROM equipos
    '''
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    equipos = []
    for row in rows:
        equipos.append({
            'id': row['id'],
            'eqtyp': row['eqtyp'],
            'shtxt': row['shtxt'],
            'brgew': row['brgew'],
            'gewei': row['gewei'],
            'groes': row['groes'],
            'inbdt': row['inbdt'].isoformat() if row['inbdt'] else None,
            'eqart': row['eqart'],
            'answt': row['answt'],
            'ansdt': row['ansdt'].isoformat() if row['ansdt'] else None,
            'waers': row['waers'],
            'herst': row['herst'],
            'herld': row['herld'],
            'typbz': row['typbz'],
            'baujj': row['baujj'],
            'baumm': row['baumm'],
            'mapar': row['mapar'],
            'serge': row['serge'],
            'abckz': row['abckz'],
            'gewrk': row['gewrk'],
            'tplnr': row['tplnr'],
            'class': row['class'],
            'caracteristicas': row['caracteristicas']
        })
    return equipos


def actualizar_equipo(equipo_id, datos):
    conn = db.connection
    cursor = conn.cursor()
    query = '''
        UPDATE equipos
        SET eqtyp = %s, shtxt = %s, brgew = %s, gewei = %s, groes = %s, inbdt = %s, eqart = %s,
            answt = %s, ansdt = %s, waers = %s, herst = %s, herld = %s, typbz = %s, baujj = %s, baumm = %s,
            mapar = %s, serge = %s, abckz = %s, gewrk = %s, tplnr = %s, class = %s, caracteristicas = %s
        WHERE id = %s
    '''
    valores = (
        datos['eqtyp'], datos['shtxt'], datos.get('brgew'), datos.get('gewei'), datos.get('groes'),
        datos.get('inbdt'), datos.get('eqart'), datos.get('answt'), datos.get('ansdt'), datos.get('waers'),
        datos.get('herst'), datos.get('herld'), datos.get('typbz'), datos.get('baujj'), datos.get('baumm'),
        datos.get('mapar'), datos.get('serge'), datos.get('abckz'), datos.get('gewrk'), datos.get('tplnr'),
        datos.get('class'), datos.get('caracteristicas'), equipo_id
    )
    try:
        cursor.execute(query, valores)
        conn.commit()
        return {'message': 'Equipo actualizado exitosamente'}
    except Exception as e:
        return {'error': str(e)}
    finally:
        cursor.close()

def eliminar_equipo(equipo_id):
    conn = db.connection
    cursor = conn.cursor()
    query = 'DELETE FROM equipos WHERE id = %s'
    try:
        cursor.execute(query, (equipo_id,))
        conn.commit()
        return {'message': 'Equipo eliminado exitosamente'}
    except Exception as e:
        return {'error': str(e)}
    finally:
        cursor.close()


def obtener_campos_por_clase(clase):
    conn = db.connection
    cursor = conn.cursor()
    query = """
        SELECT DISTINCT caracteristica, denominacion, tipo_campo, ctd_posiciones, decimales, unidad
        FROM clases
        WHERE clase = %s
    """
    try:
        print(f"Clase recibida: {clase}")
        cursor.execute(query, (clase,))
        campos = cursor.fetchall()
        print(f"Datos crudos enviados al frontend (sin duplicados): {campos}")
        return campos
    except Exception as e:
        print(f"Error al obtener campos para la clase '{clase}': {e}")
        return []
    finally:
        cursor.close()


def procesar_archivo_excel(file_path):
    """
    Procesa un archivo Excel y extrae datos relevantes.
    Identifica automáticamente las columnas por su código corto (5 letras).
    Detiene la lectura al encontrar la primera fila completamente vacía.
    """
    # Leer el archivo Excel
    df = pd.read_excel(file_path)

    # Normalizar los nombres de las columnas
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(r'\s+', '_', regex=True)
        .str.replace(r'[^\w]', '', regex=True)
    )

    # Patrón para encontrar los códigos cortos (5 letras + opcionalmente números al final)
    patron_codigo = re.compile(r'^[a-z]{5}\d*')

    # Identificar las columnas relevantes automáticamente
    columnas_relevantes = {}
    for col in df.columns:
        match = patron_codigo.match(col)
        if match:
            codigo = match.group()[:5]  # Solo las primeras 5 letras del código
            columnas_relevantes[codigo] = col  # Asignar el nombre original de la columna

    # Mapeo automático: renombrar columnas relevantes con sus códigos cortos
    df.rename(columns=columnas_relevantes, inplace=True)

    # Identificar la primera fila completamente vacía
    primera_fila_vacia = df[df.isnull().all(axis=1)].index.min()
    if primera_fila_vacia is not None:
        df = df.loc[:primera_fila_vacia - 1]  # Cortar el DataFrame

    # Filtrar filas completamente vacías
    df = df.dropna(how='all')

    # Procesar filas
    equipos = []
    columnas_dinamicas = [col for col in df.columns if col.startswith('car') or col.startswith('val')]
    for _, row in df.iterrows():
        # Extraer datos relevantes
        equipo = {codigo: row[col] for codigo, col in columnas_relevantes.items() if col in df.columns}
        print(equipo)

        # Extraer características dinámicas
        caracteristicas = {}
        for col in columnas_dinamicas:
            if col.startswith('car'):
                numero = col[3:]
                valor_col = f'val{numero}'
                if valor_col in df.columns and pd.notna(row[col]):
                    caracteristicas[row[col]] = row[valor_col]

        equipo['caracteristicas'] = caracteristicas
        equipos.append(equipo)

    # Limpieza de datos
    def limpiar_datos(obj):
        if obj is None or (isinstance(obj, float) and pd.isna(obj)):
            return ""
        if isinstance(obj, float):
            return round(obj, 2)
        return obj

    equipos_limpios = json.loads(json.dumps(equipos, default=limpiar_datos, ensure_ascii=False))
    return equipos_limpios