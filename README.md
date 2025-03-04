# Virtual Office
Ce projet est un virtual desktop qui permet de se connecter et d'accéder à son environnement avec plusieurs applications.

## Design & Interface
L'interface utilisateur s'inspire du style **glassmorphism** de macOS, avec des éléments semi-transparents, des arrière-plans floutés et des bordures subtiles. 

## Fonctionnalités
Virtual Office propose plusieurs applications intégrées :

- **📝 Bloc-notes** 
- **🧮 Calculatrice** 
- **📁 Explorateur de fichiers**
- **🎵 Lecteur de musique** 
- **🌤 Application météo** 
- **⏰ Horloge** 
- **💻 Terminal** 
- **📅 Agenda** 
- **🤖 Chatbot** 
- **🎮 Application de jeux** 
- **📽 Lecteur multimédia** 
- **📰 Application de nouvelles** 
- **🖼 Visionneuse de photos** 
- **📈 Application boursière** 







# Installation
Pour installer et tester le projet, veuillez suivre les étapes suivantes.

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
pip install django cohere requests Pillow Plotly
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


User : demo / demo
