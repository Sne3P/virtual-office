# virtual-office


# Installation

```
git clone https://github.com/votre-utilisateur/virtual-office.git    
cd virtual-office
```

## Create and activate a virtual environment:

Linux/Mac:
```
python3 -m venv venv

source venv/bin/activate
```

Windows:

```
python -m venv venv

venv\Scripts\activate
```

## Install dependencies:

```
pip install -r requirements.txt
```
Apply migrations:

```
python manage.py migrate

python manage.py createdemo
```


# Start the server:

```
python manage.py runserver
```

Open http://127.0.0.1:8000/ in your browser.


User : demo / Azerty!12345#
