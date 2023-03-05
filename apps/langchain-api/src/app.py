from langchain.llms import OpenAI
from flask import Flask, request
from werkzeug.exceptions import HTTPException
import json
import os

app = Flask(__name__)


@app.errorhandler(Exception)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""

    return {"error": str(e)}, 500


@app.route("/")
def hello_world():
    return "hello from langchain-api"


@app.route("/llms/OpenAI/generate", methods=["POST"])
def llm_openai():
    args_dict = request.json["args"]
    func_params = request.json["func"]

    llm = OpenAI(**args_dict)
    app.logger.info('start generate')
    resp = llm.generate(func_params)
    app.logger.info('end generate')
    return resp.to_dict()


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
