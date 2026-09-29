# IrriSmart Automation

Proyecto de Feria Científica Escolar: página web educativa y **simulación** de un sistema automático de riego.
Un sensor de humedad indica si el suelo está seco; si la humedad es menor al umbral, se activa el riego.

> ⚠️ La página muestra una **simulación**. No es un prototipo físico ni presenta resultados de mediciones reales.

## Archivos
`index.html`, `style.css`, `script.js` (sitio estático) · `app.py` (Python + Flask) · `requirements.txt`

## Instalar Python
1. Descarga Python 3.10 o superior desde https://www.python.org/downloads/
2. En Windows marca **Add Python to PATH** al instalar.
3. Verifica: `python --version`

## Instalar dependencias y ejecutar Flask
```bash
cd feria-irrigacion
python -m venv venv
venv\Scripts\activate          # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```
Abre http://127.0.0.1:5000 en el navegador. Prueba la API: http://127.0.0.1:5000/api/estado?humedad=30&umbral=45

## Abrir solo la página (sin Flask)
Haz doble clic en `index.html`. Todo funciona con JavaScript.

## Publicar en GitHub Pages
1. Crea un repositorio público llamado `regador-automatico` en GitHub y sube los archivos (`index.html` en la raíz).
2. Ve a **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.
4. Espera 1–2 minutos: el enlace será `https://TU-USUARIO.github.io/regador-automatico/`.

Nota: GitHub Pages no ejecuta Python; el formulario de contacto solo se guarda en Flask local.
