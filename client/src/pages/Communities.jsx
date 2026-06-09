import { useEffect, useState } from "react";
import API from "../services/api";
import CommunityCard from "../components/CommunityCard";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await API.get("/communities/", {
        params: filters,
      });
      setCommunities(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCommunities();
  };

  return (
    <div className="page">
      <h1 className="page-title">Explore Communities</h1>
      <p className="page-subtitle">
        Find communities based on your interests, city, and career goals.
      </p>

      <form className="panel form-grid" onSubmit={handleSearch}>
        <input
          name="search"
          placeholder="Search by community name"
          value={filters.search}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category e.g. AI, Startup, Design"
          value={filters.category}
          onChange={handleChange}
        />

        <input
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleChange}
        />

        <button className="primary-btn" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <p className="page-subtitle">Loading communities...</p>
      ) : communities.length === 0 ? (
        <div className="panel">
          <h3>No communities found</h3>
          <p>Admin should create communities first.</p>
        </div>
      ) : (
        <div className="grid">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Communities;