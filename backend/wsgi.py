# /usr/bin/python3
"""
Converts fastapi app to wsgi app

uwsgi --http=0.0.0.0:8080 -w wsgi:application

Using make:
    $ make runserver-uwsgi
"""

from api import app
from a2wsgi import ASGIMiddleware

application = ASGIMiddleware(app)
