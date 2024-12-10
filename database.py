from flask import Flask
from flask_mysqldb import MySQL

# Inicializar la base de datos
db = MySQL()


def crear_tablas():
    from flask_mysqldb import MySQLdb
    conn = db.connection
    cursor = conn.cursor()

    # Crear tablas
    cursor.executecursor.execute('''
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
            baumm VARCHAR(2)                            -- Mes de construcción
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


