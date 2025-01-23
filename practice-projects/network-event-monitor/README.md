# Network Event Monitor

Network Event Monitor is a web application designed to monitor network events and visualize data using various widgets. The application consists of a backend built with FastAPI and a frontend built with React and Material-UI.

## Features

- **Event Management**: Create, edit, and delete network events.
- **Widget Integration**: Add, edit, and delete widgets to visualize event data.
- **Real-time Updates**: Receive real-time updates via WebSockets.
- **Ping Plotter**: Monitor network latency and status using the Ping Plotter widget.

## Technologies Used

- **Backend**: FastAPI, SQLite, aioping, aiodns
- **Frontend**: React, Material-UI, styled-components, react-toastify, react-big-calendar
- **WebSockets**: Real-time updates using WebSockets
- **Docker**: Containerized deployment using Docker and Docker Compose

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/network-event-monitor.git
    cd network-event-monitor
    ```

2. Create a `.env` file in the root directory and configure the environment variables:

    ```sh
    cp .env.example .env
    ```

3. Build and start the application using Docker Compose:

    ```sh
    docker-compose up --build
    ```

4. Access the application at `http://localhost:<FRONTEND_LOCAL_PORT>`.

## Usage

### Creating an Event

1. Click on a date in the calendar to create a new event and fill in the details.
2. Click "Save" to create the event.
3. Click the envent on the calendar to view and edit the event.

### Adding Widgets

1. Select an event on the calendar, 
2. Click "View Event".
3. Select a widget from the dropdown and 
4. Click "Add Widget"

### Editing an Event

#### From the Calendar

1. Click on an event on the calendar.
2. Change the event's details
3. Click "Save" to update the event.

#### From the Event Page

1. Click the pen icon to edit the event details.
2. Change the event's details.
3. Click "Save" to update the event.

### Monitoring Data

Once an event has started (the current time is between the event's start and stop times), the
widgets will automatically begin monitoring data. Updates will be relayed via websockets in real time.

## Development

### Frontend

1. Navigate to the `frontend` directory:

    ```sh
    cd frontend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Start the development server:

    ```sh
    npm run dev
    ```

### Backend

1. Navigate to the `backend` directory:

    ```sh
    cd backend
    ```

2. Create a virtual environment and activate it:

    ```sh
    python -m venv env
    source env/bin/activate
    ```

3. Install dependencies:

    ```sh
    pip install -r requirements.txt
    ```

4. Start the FastAPI server:

    ```sh
    uvicorn main:app --reload
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.