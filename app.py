from flask import Flask, render_template, request, jsonify
from database import (
    db, crear_tablas,
    crear_equipo, obtener_equipo, actualizar_equipo, eliminar_equipo, obtener_todos_equipos,
    obtener_campos_por_clase
)
from config import config

# Inicializar Flask fuera de `create_app`
app = Flask(__name__)

# Configuración de la aplicación
app.config.from_object(config['development'])

# Inicializar la base de datos
db.init_app(app)

# Crear las tablas si no existen
with app.app_context():
    crear_tablas()


@app.route('/')
def index():
    return render_template('gestion_equipos.html')


@app.route('/gestion_equipos')
def gestion_equipos():
    return render_template('gestion_equipos.html')


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



if __name__ == '__main__':
    app.run(debug=True)
