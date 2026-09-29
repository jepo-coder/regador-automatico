"""IrriSmart Automation - version Python/Flask (ejecucion local).

Contiene las clases del sistema (simulacion, no hardware real) y un servidor
Flask que entrega la pagina y una pequena API. La pagina tambien funciona sola
en GitHub Pages usando JavaScript.
"""
from flask import Flask, jsonify, request, send_from_directory


class SensorHumedad:
    """Simula un sensor de humedad del suelo (valor de 0 a 100 %)."""

    def __init__(self, humedad_inicial=50):
        self.humedad = humedad_inicial

    def leer(self):
        """Devuelve la humedad actual. En un prototipo real vendria del sensor."""
        return self.humedad


class ElectroValvula:
    """Simula la valvula que deja pasar o corta el agua."""

    def __init__(self):
        self.abierta = False

    def abrir(self):
        self.abierta = True

    def cerrar(self):
        self.abierta = False


class ProgramadorHorario:
    """Guarda las horas del dia y la accion de cada una."""

    def __init__(self):
        self.horarios = {"07:00": "Riego", "12:00": "Revision", "18:00": "Riego"}

    def accion_a(self, hora):
        return self.horarios.get(hora, "Sin accion")


class SistemaRiego:
    """Controlador: compara la humedad con el umbral y decide el riego."""

    def __init__(self, sensor, valvula, programador, umbral=40):
        self.sensor = sensor
        self.valvula = valvula
        self.programador = programador
        self.umbral = umbral

    def evaluar(self):
        humedad = self.sensor.leer()
        if humedad < self.umbral:      # suelo demasiado seco
            self.valvula.abrir()
        else:                          # humedad suficiente
            self.valvula.cerrar()
        return {"humedad": humedad, "umbral": self.umbral,
                "riego_activo": self.valvula.abierta}


app = Flask(__name__)


@app.route("/")
def inicio():
    return send_from_directory(".", "index.html")


@app.route("/<archivo>")
def estaticos(archivo):
    # Solo se entregan los archivos publicos de la pagina.
    if archivo in ("style.css", "script.js"):
        return send_from_directory(".", archivo)
    return ("No encontrado", 404)


@app.route("/api/estado")
def estado():
    """Ejemplo: /api/estado?humedad=30&umbral=45"""
    try:
        humedad = min(100, max(0, float(request.args.get("humedad", 50))))
        umbral = min(100, max(0, float(request.args.get("umbral", 40))))
    except ValueError:
        return jsonify(error="Valores numericos invalidos"), 400
    sistema = SistemaRiego(SensorHumedad(humedad), ElectroValvula(),
                           ProgramadorHorario(), umbral)
    return jsonify(sistema.evaluar())


@app.route("/api/contacto", methods=["POST"])
def contacto():
    datos = request.get_json(silent=True) or {}
    if not all(datos.get(c) for c in ("nombre", "correo", "mensaje")):
        return jsonify(ok=False, error="Faltan campos"), 400
    print("Mensaje recibido:", datos)  # demostracion: solo se muestra en consola
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(debug=True)
