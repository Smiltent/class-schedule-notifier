<h1 align="center">Class Schedule Notifier</h1>
<p align="center"><em>Notifies you about class changes</em></p>

## What is this project?
Well, as the description says, it notifies you on class changes using [ntfy](https://ntfy.sh/).  
Later on, will be made as a dedicated app and a website with an API.

## Features
* [x] Obtains & parses all the classes from the provided URL
* [ ] Functional API
* [ ] Notifies you when classes change
* [ ] Morning notifications

## Technologies
* Typescript (and their libraries, see [package.json](package.json))
* MongoDB
* Redis
* & more, during the development process

## Todo
* [ ] Currently, the parsing exports all the data into multiple .json files. I want to cache all the files into RAM (as in total, theres around >1mb data). Redis?
* [ ] Periodically check new class schedules via the `/timetable/server/ttviewer.js?__func=getTTViewerData` endpoint
* [ ] Old weeks get stored in an external database. MongoDB?
* [ ] Generate statistics based off a bunch of filters
* [ ] Static website, that uses the API to generate data
* [ ] Make the User-agent be changable in `.env`
* [ ] Integrate ntfy, notifying about changes & morning notifications
* [ ] Maybe Discord webhook?
* [ ] 

## License
[MIT License](LICENSE)