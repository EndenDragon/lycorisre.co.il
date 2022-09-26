from flask import Flask, render_template
import time

app = Flask(__name__)

app_start_stamp = time.time()

@app.route("/")
def index():
    return render_template("index.html", app_start_stamp=app_start_stamp)