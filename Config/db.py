# Config/db.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

app = Flask(__name__)

# Configuración de la aplicación
app.config['SECRET_KEY'] = '12345'

# Configuración de base de datos desde variables de entorno
_db_uri = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///ferrejunior.db')
# Normalizar prefijos de drivers
if _db_uri.startswith('mysql://'):
    _db_uri = 'mysql+pymysql://' + _db_uri[len('mysql://'):]
elif _db_uri.startswith('postgres://'):
    # Heroku/Railway/Neon usan postgres:// (obsoleto en SQLAlchemy 1.4+)
    _db_uri = 'postgresql+psycopg2://' + _db_uri[len('postgres://'):]
elif _db_uri.startswith('postgresql://') and '+' not in _db_uri[:15]:
    _db_uri = 'postgresql+psycopg2://' + _db_uri[len('postgresql://'):]
app.config['SQLALCHEMY_DATABASE_URI'] = _db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configurar carpetas estáticas y templates
app.static_folder = 'static'
app.template_folder = 'templates'

# Crear los objetos de bd
db = SQLAlchemy(app)
ma = Marshmallow(app)