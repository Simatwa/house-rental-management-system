.PHONY: install setup developmentsuperuser runserver runserver-prod default

default: install setup developmentsuperuser runserver-api

install:
	pip install -r requirements.txt

setup:
	python manage.py makemigrations users finance external rental management

	python manage.py migrate

	python manage.py collectstatic --no-input


developmentsuperuser:
	python manage.py createsuperuser --username developer \
	 --email developer@localhost.domain --noinput --identity_number 12345678

runserver:
	python manage.py runserver

runserver-uwsgi:
	uwsgi --http=0.0.0.0:8080 -w wsgi:application --static-map /static=files/static --static-map=/media=files/media

runserver-api:
	python -m api run api