# Use official lightweight Python image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set container working directory
WORKDIR /app

# Install production-ready WSGI server and dependencies
RUN pip install --no-cache-dir flask requests python-dotenv gunicorn

# Copy project files
COPY . .

# Cloud Run defaults to port 8080
ENV PORT=8080

# Start production server using Gunicorn
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 server:app
