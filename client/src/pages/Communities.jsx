import { useEffect, useState } from "react";
import API from "../services/api";
import CommunityCard from "../components/CommunityCard";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    city: "",
    sort: "newest",
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
    const loadCommunities = async () => {
      try {
        setLoading(true);

        const res = await API.get("/communities/", {
          params: {
            search: "",
            category: "",
            city: "",
            sort: "newest",
          },
        });

        setCommunities(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
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
        Find communities based on your interests, city, member count, and meetup activity.
      </p>

      <form className="panel form-grid" onSubmit={handleSearch}>
        <div className="form-group">
          <label>Search Community</label>
          <input
            name="search"
            placeholder="Search by community name"
            value={filters.search}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            name="category"
            placeholder="Example: AI, Startup, Design"
            value={filters.category}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            name="city"
            placeholder="Example: Hyderabad"
            value={filters.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Sort By</label>
          <select name="sort" value={filters.sort} onChange={handleChange}>
            <option value="newest">Newest</option>
            <option value="member_count">Member Count</option>
            <option value="meetup_count">Meetup Count</option>
          </select>
        </div>

        <button className="primary-btn full" type="submit">
          Search / Sort
        </button>
      </form>

      {loading ? (
        <p className="page-subtitle">Loading communities...</p>
      ) : communities.length === 0 ? (
        <div className="panel" style={{ marginTop: "24px" }}>
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