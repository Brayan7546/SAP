from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import pandas as pd
import json
import os
from database import (
    db, crear_tablas,
    crear_equipo, obtener_equipo, actualizar_equipo, eliminar_equipo, obtener_todos_equipos,
    obtener_campos_por_clase, procesar_archivo_excel
)
from config import config

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xls', 'xlsx'}

# Inicializar Flask fuera de `create_app`
app = Flask(__name__)

# Configuración de la aplicación
app.config.from_object(config['development'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Inicializar la base de datos
db.init_app(app)

# Crear las tablas si no existen
with app.app_context():
    crear_tablas()


@app.route('/')
def index():
    equipos = obtener_todos_equipos()
    return render_template('gestion_equipos.html', equipos=equipos)


@app.route('/gestion_equipos')
def gestion_equipos():
    equipos = obtener_todos_equipos()  # Llama a la función que obtiene todos los equipos
    return render_template('gestion_equipos.html', equipos=equipos)


@app.route('/equipos', methods=['POST'])
def crear():
    datos = request.json
    resultado = crear_equipo(datos)
    return jsonify(resultado)

@app.route('/equipos/<int:equipo_id>', methods=['GET'])
def obtener(equipo_id):
    equipo = obtener_equipo(equipo_id)
    if equipo:
        return jsonify(equipo)
    return jsonify({'error': 'Equipo no encontrado'}), 404


@app.route('/equipos', methods=['GET'])
def obtener_todos():
    equipos = obtener_todos_equipos()
    return jsonify(equipos)


@app.route('/equipos/<int:equipo_id>', methods=['PUT'])
def actualizar(equipo_id):
    datos = request.json
    resultado = actualizar_equipo(equipo_id, datos)
    return jsonify(resultado)


@app.route('/equipos/<int:equipo_id>', methods=['DELETE'])
def eliminar(equipo_id):
    resultado = eliminar_equipo(equipo_id)
    return jsonify(resultado)

@app.route('/clases/<string:clase>', methods=['GET'])
def obtener_campos(clase):
    campos = obtener_campos_por_clase(clase)
    return jsonify(campos)  # Devuelve los datos directamente como JSON

# Verifica si la extensión del archivo es permitida
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def limpiar_datos(data):
    """
    Recorrer recursivamente la estructura de datos para reemplazar NaN, None, etc.
    """
    if isinstance(data, list):
        return [limpiar_datos(item) for item in data]
    elif isinstance(data, dict):
        return {key: limpiar_datos(value) for key, value in data.items()}
    elif pd.isna(data) or data is None:
        return ""  # Reemplazar NaN y None con una cadena vacía
    elif isinstance(data, float):  # Si es un número flotante, redondear si es necesario
        return round(data, 2)
    return data  # Devolver el valor sin cambios

@app.route('/upload_excel', methods=['POST'])
def upload_excel():
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió un archivo'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'El archivo no tiene nombre'}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            # Procesar el archivo Excel
            equipos = procesar_archivo_excel(file_path)
            return jsonify(equipos)  # Retorna los datos directamente en formato JSON

        except Exception as e:
            print(f"Error al procesar el archivo: {str(e)}")  # Agrega este log
            import traceback
            traceback.print_exc()  # Muestra el error completo en la consola
            return jsonify({'error': f'Error al procesar el archivo: {str(e)}'}), 500

    return jsonify({'error': 'Formato de archivo no permitido'}), 400


@app.route('/equipos/masivo', methods=['POST'])
def subir_equipos_masivo():
    try:
        equipos = request.json  # Recibe los datos en formato JSON
        print("Datos recibidos:", equipos)  # Log para depuración
        
        if not isinstance(equipos, list):
            return jsonify({'error': 'Formato de datos incorrecto, se esperaba una lista'}), 400
        
        resultados = []

        for equipo in equipos:
            # Convertir 'caracteristicas' a JSON string si es un diccionario
            if isinstance(equipo.get('caracteristicas'), dict):
                equipo['caracteristicas'] = json.dumps(equipo['caracteristicas'])
            
            # Llamar a la función existente 'crear_equipo'
            resultado = crear_equipo(equipo)
            
            if 'error' in resultado:
                return jsonify({'error': resultado['error']}), 400
            
            resultados.append({
                'id': resultado['id'],
                'eqtyp': equipo['eqtyp'],
                'shtxt': equipo['shtxt']
            })

        return jsonify(resultados), 200
    except Exception as e:
        print("Error en el servidor:", str(e))
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
