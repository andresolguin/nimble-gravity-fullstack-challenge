# Nimble Gravity — Fullstack Challenge (React)

Small React app that:
- Fetches open jobs from the provided API
- Lets the user paste a GitHub repo URL per job
- Submits an application to the selected job via POST

## Tech
- React + Vite

## How to run

npm install
npm run dev

Open: http://localhost:5173

## API
Base URL:
- https://botfilter-h5ddh6dye8exb7ha.centralus-01.azurewebsites.net

Used endpoints:
- GET `/api/candidate/get-by-email?email=...`
- GET `/api/jobs/get-list`
- POST `/api/candidate/apply-to-job`

## Notes
While the instructions mention `uuid`, `candidateId`, `jobId`, and `repoUrl`, the API validation requires `applicationId` as well. The app includes it in the POST body.
