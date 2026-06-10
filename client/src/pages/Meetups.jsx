import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import MeetupCard from "../components/MeetupCard";

function Meetups() {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetups = useCallback(async () => {
    try {
      const res = await API.get("/meetups/");
      setMeetups(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadMeetups = async () => {
      await fetchMeetups();
    };

    loadMeetups();
  }, [fetchMeetups]);

  return (
    <div className="page">
      <h1 className="page-title">Meetups</h1>
      <p className="page-subtitle">
        Discover meetups created by admins and register as an approved community
        member.
      </p>

      {loading ? (
        <p>Loading meetups...</p>
      ) : meetups.length === 0 ? (
        <div className="panel">
          <h3>No meetups found</h3>
          <p>Admin should create meetups first.</p>
        </div>
      ) : (
        <div className="grid">
          {meetups.map((meetup) => (
            <MeetupCard key={meetup.id} meetup={meetup} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Meetups;