# The Travelling Technicians Website

A professional website for a mobile phone and laptop doorstep repair service operating in Lower Mainland, BC.

## Features

- Doorstep repair service booking
- Device repair services (mobile phones and laptops)
- Online booking system
- Service area identification
- Transparent pricing

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for containerized setup)
- Supabase account (for database)

### Local Development

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local to add your Supabase URL and anon key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Setup

1. Build and run using Docker Compose
   ```bash
   docker-compose up -d
   ```

2. Access the application at [http://localhost:3000](http://localhost:3000)

3. To stop the containers
   ```bash
   docker-compose down
   ```

## Database Setup

The application uses Supabase for the database. The schema migrations are provided in the `./sql` directory.

### Setting Up the Database

1. Create a new Supabase project
2. Run the SQL scripts in the `./sql` directory in order
3. Update your environment variables with the Supabase URL and anon key

## Deployment

### Deploy to Production

1. Build the Docker image
   ```bash
   docker build -t travelling-technicians .
   ```

2. Push to your container registry
   ```bash
   docker tag travelling-technicians:latest <registry-url>/travelling-technicians:latest
   docker push <registry-url>/travelling-technicians:latest
   ```

## Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Supabase
- **Containerization:** Docker
- **Booking System:** Custom implementation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries, please reach out to [contact@travellingtechnicians.com](mailto:contact@travellingtechnicians.com)

