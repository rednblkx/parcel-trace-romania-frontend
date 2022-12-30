# Parcel Tracking App

A web application for tracking parcels made with React and Chakra UI, using Supabase for the backend.

## Features

- Monitoring for updates on the backend using pg_cron and sending notifications via ntfy.sh
- Check for updates on the parcel every 31th minute by calling an edge function on supabase
- User-friendly interface built with Chakra UI

## Prerequisites

- Node.js and npm or yarn installed
- A supabase project and database set up at [supabase.com](https://supabase.com)
- Check Supabase local development [guide](https://supabase.com/docs/guides/resources/supabase-cli/local-development)
- Have a Google account and Google Cloud Console project set up to enable OAuth Authentication(as only Google is enabled on Auth component) and use the monitoring feature
- The following environment variables set in the `.env` file:
  - `VITE_SUPABASE_KEY`: Your supabase API key
  - `VITE_SUPABASE_URL`: Your supabase URL

## Installation

To install and run the app, follow these steps:

1. Clone the repository: `git clone https://github.com/redmusicxd/parcel-trace-romania-frontend.git`
2. Navigate to the project directory: `cd parcel-trace-romania-frontend`
3. Install the dependencies: `npm install` or `yarn install`
4. Set the environment variables in the `.env` file:
  - `VITE_SUPABASE_KEY`: Your supabase API key
  - `VITE_SUPABASE_URL`: Your supabase URL
5. Start the development server: `npm run dev` or `yarn dev`

## Deployment

To deploy the app, run the following command:

`npm run build or yarn build`

This will build the app and generate a `dist` directory with the static files. You can then host the app on any static file host, such as GitHub Pages or Vercel.

## Backend

The source code for the backend of the app can be found in the [parcel-romania-backend repository](https://github.com/redmusicxd/parcel-romania-backend).

## Contributing

Contributions are welcomed to this app. If you would like to contribute, please follow these guidelines:

- Fork the repository and create a new branch for your changes
- Make your changes and commit them with a descriptive commit message
- Open a pull request, explaining the changes you made and the problem they solve

## License

The Parcel Tracking App is licensed under the [MIT License](LICENSE).

This README.md file was written using OpenAI's ChatGPT
