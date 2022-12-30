# Parcel Tracking App

A web application for tracking parcels made with React and Chakra UI, using Supabase for the backend.

## Features

- Monitor for updates on the parcel with a cron job running inside the supabase PostgreSQL database using the pg_cron extension
- Check for updates on the parcel every 31th minute by calling an edge function on supabase
- User-friendly interface built with Chakra UI

## Installation

To install and run the app, follow these steps:

1. Clone the repository: `git clone https://github.com/redmusicxd/parcel-trace-romania-frontend.git`
2. Navigate to the project directory: `cd parcel-trace-romania-frontend`
3. Install the dependencies: `npm install` or `yarn install`
4. Run the app with Vite: `npm run dev` or `yarn dev`

## Configuration

The app requires the following environment variables to be set in order to connect to the supabase backend:

- `VITE_SUPABASE_KEY`: The API key for the supabase backend
- `VITE_SUPABASE_URL`: The URL for the supabase backend

You can set these environment variables in a .env file in the root of the project, or by using a tool like `dotenv`.

## Backend

The source code for the backend of the app can be found in the [parcel-romania-backend repository](https://github.com/redmusicxd/parcel-romania-backend).

## Contributing

Contributions are welcomed to this app. If you would like to contribute, please follow these guidelines:

- Fork the repository and create a new branch for your changes
- Make your changes and commit them with a descriptive commit message
- Open a pull request, explaining the changes you made and the problem they solve

## License

The Parcel Tracking App is licensed under the [MIT License](LICENSE).
