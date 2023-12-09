"use client"
import React, { useState, useEffect } from 'react';
import { getTicketmasterEvents, getSeatGeekEvents  } from '../../services/ticketmaster';
import styles from './Dashboard.module.css'; // Import your CSS module

interface PriceRange {
  type: string;
  currency: string;
  min: number;
  max: number;
}

interface Event {
  id: string;
  name: string;
  imageUrl?: string;
  date?: string;
  venue?: string;
  description?: string;
  priceRanges?: PriceRange[]; // Changed to an array of PriceRange objects
  // other fields...
}


export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sortKey, setSortKey] = useState<'name' | 'date'>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getTicketmasterEvents(), getSeatGeekEvents()])
      .then(([ticketmasterEvents, seatGeekEvents]) => {
        // Combine or process the events as needed
        setEvents([...ticketmasterEvents, ...seatGeekEvents]);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSort = (a: Event, b: Event): number => {
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortKey === 'date') {
      return (new Date(a.date || '')).getTime() - (new Date(b.date || '')).getTime();
    }
    return 0;
  };

  const filteredEvents = events
    .filter(event => event.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort(handleSort);

  return (
    <div className={styles.dashboard}>
      <h1>Events Dashboard</h1>
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search events..."
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <label htmlFor="sort">Sort by Name or Date: </label>
        <select
          id="sort"
          onChange={e => setSortKey(e.target.value as 'name' | 'date')}
          className={styles.sortSelect}  // Ensure to add this if you have specific styles for the select element
        >
          <option value="name">Name</option>
          <option value="date">Date</option>
        </select>
      </div>
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p>Error loading events: {error}</p>
      ) : filteredEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <table className={styles.eventsTable}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Price Range</th>
              {/* Other headers if needed */}
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event.id}>
                <td>
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.name} className={styles.eventImage} />
                  )}
                </td>
                <td>{event.name}</td>
                <td>{event.date}</td>
                <td>{event.venue}</td>
                <td>
                  {event.priceRanges && event.priceRanges.map((range, index) => (
                    <div key={index}>${range.min} - ${range.max} {range.currency}</div>
                  ))}
                </td>
                {/* Other cells if needed */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}




