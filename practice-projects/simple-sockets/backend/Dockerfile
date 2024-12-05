FROM python:3.10.6
ENV TZ="America/New_York"

EXPOSE 8000
WORKDIR /code
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY . .
RUN rm -f /code/database/main.db
CMD ["fastapi", "run", "main.py"]