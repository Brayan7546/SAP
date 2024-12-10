# config.py
import os

class Config:
    SECRET_KEY = '773e2996b970504daadaf2625cfc07187e23035e4686aa8dade5bcb2ca190d13'

class DevelopmentConfig(Config):
    DEBUG = True
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = ''
    MYSQL_DB = 'SAP'
    MYSQL_PORT = 3306
    MYSQL_UNIX_SOCKET = None
    MYSQL_CONNECT_TIMEOUT = 10  # Valor en segundos
    MYSQL_READ_DEFAULT_FILE = None
    MYSQL_USE_UNICODE = True
    MYSQL_CHARSET = 'utf8'
    MYSQL_SQL_MODE = None
    MYSQL_CURSORCLASS = 'DictCursor'
    MYSQL_AUTOCOMMIT = True
    MYSQL_CUSTOM_OPTIONS = {}


config = {
    'development': DevelopmentConfig
}