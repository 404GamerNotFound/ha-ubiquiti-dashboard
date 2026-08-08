# Ubiquiti Network Dashboard

Eine moderne, lokal laufende Lovelace-Karte für Home Assistant. Sie stellt
UniFi Access Points, Switches, aktive Ports und deren Uplinks als kompakte
Netzwerktopologie dar.

![Vorschau des Ubiquiti Network Dashboard](assets/preview.svg)

> Diese Dashboard-Karte nutzt bestehende UniFi- oder Ubiquiti-Entitäten. Sie
> ersetzt weder die offizielle UniFi-Integration noch verbindet sie sich direkt
> mit einem Controller.

## Funktionen

- Access Points mit Online-Status, Modell, Client-Anzahl und optionalen
  Band-Metriken
- Switches als Geräteansicht mit konfigurierten Ports, Link-Status, PoE und
  optionaler Geschwindigkeit
- Farbige Uplink-Linien zwischen AP und Switch-Port
- Responsive Darstellung, Home-Assistant-Theme-Variablen und keine externen
  Abhängigkeiten
- Klick auf ein Gerät oder einen Port öffnet dessen Home-Assistant-Detaildialog

## Installation über HACS

1. Öffne **HACS → Dashboards** und wähle **Custom repository**.
2. Füge https://github.com/404GamerNotFound/ha-ubiquiti-dashboard als Typ
   **Dashboard** hinzu.
3. Installiere **Ubiquiti Network Dashboard**.
4. Aktualisiere Home Assistant vollständig, einschließlich Browser-Cache.
5. Öffne dein Dashboard, füge eine Karte hinzu und wähle
   **Ubiquiti Network Dashboard**. Die Entitäten werden über den YAML-Editor
   der Karte hinterlegt.

HACS registriert die Ressource automatisch. Bei einer manuellen Installation
ist die Modulressource:

~~~yaml
url: /hacsfiles/ha-ubiquiti-dashboard/ha-ubiquiti-dashboard.js
type: module
~~~

## Schnellstart

Ersetze die Beispiel-Entitäts-IDs durch die Entitäten deiner Installation:

~~~yaml
type: custom:ha-ubiquiti-dashboard
title: Mein Netzwerk
theme: auto # auto, dark oder light
access_points:
  - name: Wohnzimmer AP
    model: U6+
    status_entity: binary_sensor.wohnzimmer_ap_status
    clients_entity: sensor.wohnzimmer_ap_clients
    bands:
      - label: 2,4 GHz
        entity: sensor.wohnzimmer_ap_24ghz_clients
      - label: 5 GHz
        entity: sensor.wohnzimmer_ap_5ghz_clients
    uplink:
      switch: USW Wohnzimmer
      port: 8
  - name: Büro AP
    model: U6 Pro
    status_entity: binary_sensor.buero_ap_status
    clients_entity: sensor.buero_ap_clients
    uplink:
      switch: USW Wohnzimmer
      port: 6
switches:
  - name: USW Wohnzimmer
    model: USW Lite 8 PoE
    status_entity: binary_sensor.usw_wohnzimmer_status
    ports:
      - number: 1
        name: Home Assistant
        status_entity: binary_sensor.usw_wohnzimmer_port_1
        speed_entity: sensor.usw_wohnzimmer_port_1_speed
      - number: 6
        name: Büro AP
        status_entity: binary_sensor.usw_wohnzimmer_port_6
        poe_entity: binary_sensor.usw_wohnzimmer_port_6_poe
      - number: 8
        name: Wohnzimmer AP
        status_entity: binary_sensor.usw_wohnzimmer_port_8
        poe_entity: binary_sensor.usw_wohnzimmer_port_8_poe
~~~

## Konfigurationsreferenz

| Schlüssel | Typ | Beschreibung |
| --- | --- | --- |
| title | Text | Titel der Karte; Standard: UniFi Network |
| theme | auto, dark, light | Farbmodus der Karte |
| access_points | Liste | APs, die oberhalb der Switches erscheinen |
| switches | Liste | Switches mit den darzustellenden Ports |
| status_entity | Entity-ID | Optionaler Online-Status eines AP, Switches oder Ports |
| clients_entity | Entity-ID | Zustand wird als Client-Anzahl angezeigt |
| speed_entity | Entity-ID | Optionaler Text unter einem Port, etwa 1 Gbit/s |
| poe_entity | Entity-ID | Bei on erscheint am Port ein PoE-Symbol |
| uplink.switch / uplink.port | Text / Zahl | Verknüpft einen AP mit einem Switch-Port |

Die kürzeren Aliasse entity, clients, poe und speed werden ebenfalls akzeptiert.
Die Statusauswertung behandelt on, online, connected und up als online; off,
unavailable, unknown, disconnected und down als offline.

## HACS- und Entwicklungsstandard

Das Repository ist als HACS-Typ **Dashboard** aufgebaut, der im HACS-Backend
technisch **plugin** heißt.

- hacs.json enthält Namen, installierbare Ressource, README-Darstellung und die
  minimale Home-Assistant-Version.
- dist/ha-ubiquiti-dashboard.js ist die installierbare, namensgleiche
  JavaScript-Ressource.
- Die GitHub Action prüft das Repository mit der offiziellen HACS-Validierung
  sowie die JavaScript-Syntax bei Pushes und Pull Requests.
- Für die Aufnahme in die HACS-Standardliste müssen auf GitHub zusätzlich eine
  Repository-Beschreibung, passende Topics, aktivierte Issues, ein öffentliches
  Repository und ein GitHub Release eingerichtet sein.

## Entwicklung

~~~bash
npm run build
npm run check
~~~

src/ha-ubiquiti-dashboard.js ist die Quelldatei. Der Build kopiert die
abhängigkeitsfreie Auslieferungsdatei nach dist; diese Datei muss in Releases
eingecheckt bleiben, damit HACS sie ohne Build-Schritt installieren kann.

## Lizenz und Marken

MIT. UniFi und Ubiquiti sind Marken ihrer jeweiligen Inhaber. Dieses Projekt
steht in keiner Verbindung zu Ubiquiti Inc.
