# WEB103 Project 4 - Bolt Bucket

Submitted by: **Dhimy Jean**

About this web app: **Bolt Bucket is a custom car builder. Pick a body style (coupe or convertible), then choose an exterior color, roof, wheels, and interior. The car preview and the price update as you choose, impossible combinations are blocked, and saved cars can be viewed, edited, and deleted. Everything is stored in a PostgreSQL database hosted on Render.**

Time spent: **__ hours** spent in total

## Required Features

The following **required** functionality is completed:

- [x] **The web app uses React to display data from an API**
- [x] **Data is supplied to the app using a Render PostgreSQL database**
  - [x] **The web app uses a Render PostgreSQL database**
  - [x] **The PostgreSQL database includes a table that matches the data displayed in the web app** (`custom_cars`, plus the option tables `exteriors`, `roofs`, `wheels`, `interiors` and `incompatibilities`)
- [x] **The web app has a well-structured user interface**
  - [x] **The app provides multiple features of the `CustomItem` (car) for the user to customize** (exterior, roof, wheels, interior, and convertible)
  - [x] **Each customizable feature has multiple options to choose from** (10 exteriors, 5 roofs, 6 wheels, 10 interiors)
  - [x] **The price of the `CustomItem` changes dynamically as different options are selected** (the price badge starts at $65,000 and adds each option's price)
  - [x] **The visual interface changes in response to at least one customizable feature** (the Corvette photo in the preview is repainted in the chosen paint color, the wheel rims and brake calipers change to the chosen wheels' colors, and the roof panel changes to the chosen roof finish)
- [x] **The web app allows the user to save new `CustomItem`**
  - [x] **The user can submit their choices to save the `CustomItem` to the list of created `CustomItem`s**
  - [x] **Users can view a list of all submitted `CustomItem`s**
  - [x] **If a user submits a feature combo that is impossible, they should receive an appropriate error message**
- [x] **Saved `CustomItem`s can be updated and deleted in its detail page OR the list view of submitted `CustomItem`s**
  - [x] **Users can edit a submitted `CustomItem` from the list view of submitted `CustomItem`s**
  - [x] **Users can delete a submitted `CustomItem` from the list view of submitted `CustomItem`s**

The following **stretch** functionality is completed:

- [x] **User is alerted to impossible combos early**
  - Options that can't be combined with your current choices are greyed out in the picker (click one to see why), and a warning appears as soon as the current selection is impossible. The server checks every submission again.

## Video Walkthrough

<!-- Replace with your GIF. Show the app running AND the table contents in the Render dashboard. -->
<img src='' title='Video Walkthrough' width='' alt='Video Walkthrough' />

GIF created with ...

## How it works

### Pages

| Route | Page |
| --- | --- |
| `/` | Customize: build and save a new car |
| `/customcars` | View Cars: every saved car, with Details / Edit / Delete |
| `/customcars/:id` | Car details: the four choices as images, price, Edit / Delete |
| `/edit/:id` | Edit a saved car |

### Impossible combinations

- A convertible can't have the Carbon Flash - Nacelles, Transparent Roof Panel, or Visible Carbon Fiber roof (the `convertible_ok` column of `roofs`).
- Some paint/wheel and paint/interior pairs aren't offered (the `incompatibilities` table), for example Torch Red paint with an Adrenaline Red interior.

The rules live in the database, so the client (`client/src/utilities/validation.js`) and the server (`server/utilities/validation.js`) check the same data.

### API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/custom-cars` | All saved cars, with their options and total price |
| GET | `/api/custom-cars/:id` | One car |
| POST | `/api/custom-cars` | Create a car (`201`, or `400` with validation errors) |
| PUT | `/api/custom-cars/:id` | Update a car |
| DELETE | `/api/custom-cars/:id` | Delete a car |
| GET | `/api/options` | Base price, every option, and the incompatibility rules |

## Running it yourself

1. Create a Postgres database on [Render](https://render.com), then create a **Web Service** from this repository. Set the web service's **Root Directory** to `.`, build command to `npm install && npm run build`, and start command to `npm start`.
2. Add these environment variables to the web service using the database's **Internal Database URL** or **Connections** values:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `NODE_ENV=production`
3. For local development, copy `server/.env.example` to `server/.env` and fill in the values for your local or Render database.

4. Install dependencies and create + seed the tables (this **drops and recreates** the app's tables):

   ```bash
   npm install
   npm run reset
   ```

   Run `npm run reset` against the Render database only when you intentionally want to replace its current app data.

5. Start the client and server:

   ```bash
   npm run dev
   ```

   The app is at <http://localhost:5173>; the API is on port 3000. Vite may choose the next available port if 5173 is already occupied.

## Notes

- The car preview is a photo that is recolored in the browser. Mask images mark the body paint, the wheel rims, the brake calipers, and the roof panel, and only those pixels change color, so reflections and shadows stay realistic. The wheel's spoke pattern can't change in the photo (only its color and caliper color do), and the interior and Convertible choices don't change the photo. The roof, wheel, and interior picker images are SVG drawings generated from the option data (colors, finishes, spoke styles).
- Option photos are optional. To replace a drawing with a photo, save it as `client/public/options/<roofs|wheels|interiors>/<option-name>.png` (`.jpg` and `.webp` also work), using the option's name in lowercase with dashes, e.g. `client/public/options/roofs/visible-carbon-fiber.png`. Options without a file keep their drawing. The names are: roofs `body-color`, `carbon-flash-metallic`, `carbon-flash-nacelles`, `transparent-roof-panel`, `visible-carbon-fiber`; wheels `silver-aluminum`, `carbon-flash-with-accelerate-yellow-caliper`, `bronze-metallic`, `edge-blue`, `satin-graphite-with-red-stripe`, `gloss-black-20-spoke`; interiors `jet-black`, `jet-black-with-gray-seat`, `sky-cool-gray`, `brownstone`, `jet-black-adrenaline-red`, `twilight-blue`, `ceramic-white`, `adrenaline-red`, `habanero-orange`, `natural-dipped`.
- Photo credit: ["Chevrolet Corvette C8 Stingray 3LT Coupe Z51 Torch Red.jpg"](https://commons.wikimedia.org/wiki/File:Chevrolet_Corvette_C8_Stingray_3LT_Coupe_Z51_Torch_Red.jpg) by Ethan Llamas, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons. It was resized, and `client/src/assets/corvette-c8.jpg` plus the paint mask `corvette-c8-paint-mask.png` derived from it are shared under the same license.
- `server/.env` is git-ignored. Never put real credentials in `server/.env.example`.
- The production server serves the built React files from `server/public` and uses the `PORT` value supplied by Render.

## License

Copyright 2026 Dhimy Jean

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
