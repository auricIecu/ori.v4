#!/usr/bin/env python
# Script para probar directamente la conexión con la API de Groq
import os
import sys
from groq import Groq
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener la clave API de Groq
api_key = os.getenv("GROQ_API_KEY")

# Mostrar información de depuración
print(f"API Key (primeros 5 caracteres): {api_key[:5]}...")
print(f"Longitud de API Key: {len(api_key)}")

# Inicializar cliente Groq con la clave API
client = Groq(api_key=api_key)

# Hacer una consulta mínima a la API
try:
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": "Hola, esta es una prueba de conexión"}],
        temperature=1,
        max_tokens=10,
        stream=False
    )
    
    # Imprimir la respuesta
    print("Conexión exitosa!")
    print("Respuesta de Groq:", completion.choices[0].message.content)

except Exception as e:
    print("Error al conectar con API Groq:")
    print(f"Tipo de error: {type(e).__name__}")
    print(f"Mensaje de error: {str(e)}")
    print("Por favor, verifica que tu API Key sea válida y esté activa en https://console.groq.com/")
