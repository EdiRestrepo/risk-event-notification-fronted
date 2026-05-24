Como de momento no tengo la comunicacion con el backend, quiero que simules las alertas como si estuvieran llegando desde el backend, cada 20segundos y que se desaparezca a los 5segundos, para ver reflejado la implementacion de los patrones observer y strategy, mostrando diferentes tipos de alertas (Sin modificar los patrones method factory y decorator ya implementados).
Teniendo en cuenta que la alerta desde el bacekend va a llegar con esta estructura:
{
  "title": "Nueva alerta de riesgo",
  "content": {
    "id": "3f0b2d8e-6b2a-4f8f-9c35-2a8d1e9b7c11",
    "eventType": 1,
    "riskLevel": 3,
    "title": "Alerta por lluvias intensas",
    "message": "Se reportan lluvias intensas con posible riesgo de inundación en la zona.",
    "location": "Medellín - Valle de Aburrá",
    "source": "SIATA",
    "createdAt": "2026-05-12T22:23:00",
    "expiresAt": "2026-05-13T02:23:00",
    "status": "Active",
    "instructions": [
      "Evite transitar por zonas inundables.",
      "No cruce quebradas o corrientes de agua."
    ],
    "channels": [
      1,
      2,
      3
    ]
  }
}
