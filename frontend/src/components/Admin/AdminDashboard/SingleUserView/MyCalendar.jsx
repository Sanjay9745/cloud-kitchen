/* eslint-disable react/prop-types */
import { useState } from "react";
import Calendar from "react-calendar";
import "./MyCalendar.css"; // Create your custom CSS file for styling


const MyCalendar = ({ events }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Render event markers on the calendar
  const renderEventMarkers = ({ date }) => {
    // Subtract one day from the date
    const modifiedDate = new Date(date);
    modifiedDate.setDate(date.getDate() + 1);

    const dateStr = modifiedDate.toISOString().split("T")[0];

    const dateEvents = events.filter((event) => event.date === dateStr);

    return (
      <div className="event-markers">
        {dateEvents.map((event) => (
          <div
            key={event.id}
            className="event-marker"
            style={{
              backgroundColor:
                event.status === ""
                  ? "green"
                  : event.status === "paused"
                  ? "red"
                  : "dodgerblue",
            }}
          >
            {event.meal} &nbsp;
            {event.status !== "" && <span>{event.status}</span>}
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="my-calendar">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        tileContent={renderEventMarkers}
      />
    </div>
  );
};

export default MyCalendar;
