from flask import Flask
from flask_mysqldb import MySQL
import MySQLdb.cursors
import pandas as pd
import datetime
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
            datsl DATE,                                 -- Fecha de validez del objeto técnico
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
        INSERT INTO equipos (datsl, eqtyp, shtxt, brgew, gewei, groes, inbdt, eqart, answt, ansdt, waers, herst, herld, typbz, baujj, baumm, mapar, serge, abckz, gewrk, tplnr, class, caracteristicas)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    '''
    valores = (
        datos['datsl'], datos['eqtyp'], datos['shtxt'], datos.get('brgew'), datos.get('gewei'), datos.get('groes'), datos.get('inbdt'), datos.get('eqart'), datos.get('answt'), datos.get('ansdt'), datos.get('waers'),
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
            id, datsl, eqtyp, shtxt, brgew, gewei, groes, inbdt, eqart, answt, ansdt, waers, herst, herld, typbz, baujj, baumm, mapar, serge, abckz, gewrk, tplnr, class, caracteristicas
        FROM equipos
    '''
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    equipos = []
    for row in rows:
        equipos.append({
            'id': row['id'],
            'datsl': row['datsl'].isoformat() if row['inbdt'] else None,
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

# Función auxiliar para validar datos
def validar_datos_equipo(datos):
    # Validar campos numéricos
    campos_numericos = ['brgew', 'answt']
    for campo in campos_numericos:
        if campo in datos and datos[campo]:
            try:
                datos[campo] = float(datos[campo])
            except ValueError:
                return False, f'El campo {campo} debe ser un número'
    
    # Validar longitudes máximas
    limites = {
        'eqtyp': 1,
        'shtxt': 40,
        'gewei': 3,
        'groes': 18,
        'eqart': 10,
        'waers': 5,
        'herst': 30,
        'herld': 3,
        'typbz': 20,
        'baujj': 4,
        'baumm': 2,
        'mapar': 40,
        'serge': 40,
        'abckz': 1,
        'gewrk': 8,
        'tplnr': 30
    }
    
    for campo, limite in limites.items():
        if campo in datos and datos[campo] and len(str(datos[campo])) > limite:
            return False, f'El campo {campo} excede el límite de {limite} caracteres'
    
    return True, None

def actualizar_equipo(equipo_id, datos, table:bool = False):
    # Validar datos antes de actualizar
    valido, error = validar_datos_equipo(datos)
    if not valido:
        print ("error: %s" % error)
        return {'error': error}
    
    conn = db.connection
    cursor = conn.cursor()
    query = '''
        UPDATE equipos
        SET datsl = %s, eqtyp = %s, shtxt = %s, brgew = %s, gewei = %s, groes = %s, inbdt = %s, eqart = %s,
            answt = %s, ansdt = %s, waers = %s, herst = %s, herld = %s, typbz = %s, baujj = %s, baumm = %s,
            mapar = %s, serge = %s, abckz = %s, gewrk = %s, tplnr = %s, class = %s, caracteristicas = %s
        WHERE id = %s
    '''
    
    if not table:
        valores = (
            datos['datsl'], datos['eqtyp'], datos['shtxt'], datos.get('brgew'), datos.get('gewei'), datos.get('groes'),
            datos.get('inbdt'), datos.get('eqart'), datos.get('answt'), datos.get('ansdt'), datos.get('waers'),
            datos.get('herst'), datos.get('herld'), datos.get('typbz'), datos.get('baujj'), datos.get('baumm'),
            datos.get('mapar'), datos.get('serge'), datos.get('abckz'), datos.get('gewrk'), datos.get('tplnr'),
            datos.get('class'), datos.get('caracteristicas'), equipo_id
        )
        
    else:
        valores = (
            datos.get('datsl'), datos.get('eqtyp'), datos.get('shtxt'), datos.get('brgew'), 
            datos.get('gewei'), datos.get('groes'), datos.get('inbdt'), datos.get('eqart'), 
            datos.get('answt'), datos.get('ansdt'), datos.get('waers'), datos.get('herst'),
            datos.get('herld'), datos.get('typbz'), datos.get('baujj'), datos.get('baumm'),
            datos.get('mapar'), datos.get('serge'), datos.get('abckz'), datos.get('gewrk'), 
            datos.get('tplnr'), datos.get('class'), datos.get('caracteristicas'), equipo_id
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
        cursor.execute(query, (clase,))
        campos = cursor.fetchall()
        return campos
    except Exception as e:
        return []
    finally:
        cursor.close()


def procesar_archivo_excel(file_path):
    """
    Procesa un archivo Excel y extrae datos relevantes y características dinámicas correctamente.
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

    # Identificar columnas básicas y renombrarlas usando su código corto
    columnas_basicas = [col for col in df.columns if not col.startswith(('car', 'val'))]
    columnas_renombradas = {}
    for col in columnas_basicas:
        match = re.match(r'^[a-z]{5}', col)  # Obtener las primeras 5 letras como código
        if match:
            columnas_renombradas[col] = match.group()

    # Renombrar las columnas básicas con sus códigos cortos
    df.rename(columns=columnas_renombradas, inplace=True)

    # Identificar columnas car y val
    columnas_caracteristicas = [col for col in df.columns if re.match(r'^car\d+', col)]
    columnas_valores = [col for col in df.columns if re.match(r'^val\d+', col)]

    # Ordenar columnas para asegurar que car y val estén alineados
    columnas_caracteristicas.sort()
    columnas_valores.sort()

    # Filtrar filas completamente vacías
    primera_fila_vacia = df[df.isnull().all(axis=1)].index.min()
    if primera_fila_vacia is not None:
        df = df.loc[:primera_fila_vacia - 1]
    df = df.dropna(how='all')

    # Procesar filas
    equipos = []
    for _, row in df.iterrows():
        # Extraer columnas básicas
        equipo = {col: (str(row[col]) if isinstance(row[col], (pd.Timestamp, datetime.time)) else 
                        row[col] if pd.notna(row[col]) else "") 
                for col in columnas_renombradas.values()}

        # Procesar características dinámicas
        caracteristicas = {}
        for car_col, val_col in zip(columnas_caracteristicas, columnas_valores):
            if pd.notna(row[car_col]) and pd.notna(row[val_col]):
                # Remover números entre paréntesis y limpiar la clave
                key = re.sub(r'\(\d+\)', '', row[car_col]).strip()
                value = row[val_col]
                caracteristicas[key] = str(value) if isinstance(value, (pd.Timestamp, datetime.time)) else value

        equipo['caracteristicas'] = caracteristicas
        equipos.append(equipo)

    return equipos