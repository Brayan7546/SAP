from flask import Flask
from flask_mysqldb import MySQL
import MySQLdb.cursors

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
            invnr VARCHAR(25),                          -- Número de inventario
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
            class VARCHAR(18)                           -- No de clase
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
        INSERT INTO equipos (eqtyp, shtxt, brgew, gewei, groes, invnr, inbdt, eqart, answt, ansdt, waers, herst, herld, typbz, baujj, baumm, class, caracteristicas)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    '''
    valores = (
        datos['eqtyp'], datos['shtxt'], datos.get('brgew'), datos.get('gewei'), datos.get('groes'), datos.get('invnr'),
        datos.get('inbdt'), datos.get('eqart'), datos.get('answt'), datos.get('ansdt'), datos.get('waers'),
        datos.get('herst'), datos.get('herld'), datos.get('typbz'), datos.get('baujj'), datos.get('baumm'), datos.get('class'), datos.get('caracteristicas')
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
            id, eqtyp, shtxt, brgew, gewei, groes, invnr, inbdt, eqart, answt, ansdt, waers, herst, herld, typbz, baujj, baumm, caracteristicas, class
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
            'invnr': row['invnr'],
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
            'caracteristicas': row['caracteristicas'],
            'class': row['class']
        })
    return equipos



def actualizar_equipo(equipo_id, datos):
    conn = db.connection
    cursor = conn.cursor()
    query = '''
        UPDATE equipos
        SET eqtyp = %s, shtxt = %s, brgew = %s, gewei = %s, groes = %s, invnr = %s, inbdt = %s, eqart = %s,
            answt = %s, ansdt = %s, waers = %s, herst = %s, herld = %s, typbz = %s, baujj = %s, baumm = %s, class = %s, caracteristicas = %s
        WHERE id = %s
    '''
    valores = (
        datos['eqtyp'], datos['shtxt'], datos.get('brgew'), datos.get('gewei'), datos.get('groes'), datos.get('invnr'),
        datos.get('inbdt'), datos.get('eqart'), datos.get('answt'), datos.get('ansdt'), datos.get('waers'),
        datos.get('herst'), datos.get('herld'), datos.get('typbz'), datos.get('baujj'), datos.get('baumm'), datos.get('class'), datos.get('caracteristicas'), equipo_id
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
