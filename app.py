from flask import Flask, render_template
from database import db, crear_tablas  # Importar la instancia de la base de datos y la función crear_tablas
from config import config

def create_app(config_name):
    app = Flask(__name__)

    # Cargar la configuración desde config.py
    app.config.from_object(config[config_name])

    # Inicializar la base de datos
    db.init_app(app)

    # Crear las tablas si no existen
    with app.app_context():
        crear_tablas()  # Llamar a la función para crear las tablas

    @app.route('/')
    def index():
        return render_template('base.html')

    @app.route('/gestion_equipos')
    def gestion_equipos():
        return render_template('gestion_equipos.html')

    return app

if __name__ == '__main__':
    app = create_app('development')  # Puedes cambiar 'development' a 'production' si es necesario
    app.run(debug=True)
