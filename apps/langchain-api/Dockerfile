FROM python:3.9

WORKDIR /usr/src/app

RUN pip install langchain openai flask

COPY src ./src

EXPOSE 5000

CMD ["python", "src/app.py"]
