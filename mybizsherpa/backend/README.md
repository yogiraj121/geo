# Nearby Location Backend

Simple Node.js/Express API that demonstrates a "nearby user" search feature by latitude/longitude and radius.

## Install

```bash
cd mybizsherpa/backend
npm install
```

## Run

```bash
npm run dev
```

By default the server listens on port **4000** (you can override with `PORT` in a `.env` file).

## API

### Health

- **GET** `/health`

Response:

```json
{ "status": "ok", "message": "Nearby location API is running" }
```

### Nearby Users

- **GET** `/api/users/nearby?lat=<number>&lng=<number>&radiusKm=<number>`

Example:

```text
GET http://localhost:4000/api/users/nearby?lat=28.61&lng=77.21&radiusKm=50
```

Response shape:

```json
{
  "center": { "latitude": 28.61, "longitude": 77.21 },
  "radiusKm": 50,
  "count": 2,
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "latitude": 28.6139,
      "longitude": 77.209,
      "info": "User in New Delhi",
      "distanceKm": 0.53
    }
  ]
}
```

You can replace the demo in-memory users in `src/data/users.js` with your own data source (database, etc.) and keep the controller logic the same.


