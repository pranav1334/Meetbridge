import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function CreateMeetup() {
  const [communities, setCommunities] = useState([]);

  const [form, setForm] = useState({
    community_id: "",
    title: "",
    banner: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    venue_name: "",
    google_maps_link: "",
    capacity_limit: 100,
    registration_deadline: "",
  });

  const [bannerPreview, setBannerPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchCommunities = useCallback(async () => {
    try {
      const res = await API.get("/communities/");
      setCommunities(res.data);
    } catch {
      setError("Failed to load communities");
    }
  }, []);

  useEffect(() => {
    const loadCommunities = async () => {
      await fetchCommunities();
    };

    loadCommunities();
  }, [fetchCommunities]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "capacity_limit"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const uploadImage = async (file) => {
    const imageData = new FormData();
    imageData.append("file", file);

    const res = await API.post("/uploads/image", imageData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.image_url;
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const imageUrl = await uploadImage(file);

      setForm({
        ...form,
        banner: imageUrl,
      });

      setBannerPreview(imageUrl);
    } catch (error) {
      setError(error.response?.data?.detail || "Banner image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const createMeetup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        community_id: Number(form.community_id),
      };

      const res = await API.post("/meetups/", payload);
      setMessage(res.data.message || "Meetup created successfully");

      setForm({
        community_id: "",
        title: "",
        banner: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        venue_name: "",
        google_maps_link: "",
        capacity_limit: 100,
        registration_deadline: "",
      });

      setBannerPreview("");
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to create meetup");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Create Meetup</h1>
      <p className="page-subtitle">
        Only admin can create meetups for communities.
      </p>

      <form className="panel form-grid" onSubmit={createMeetup}>
        {message && <div className="success full">{message}</div>}
        {error && <div className="error full">{error}</div>}

        <div className="form-group">
          <label>Select Community</label>
          <select
            name="community_id"
            value={form.community_id}
            onChange={handleChange}
            required
          >
            <option value="">Choose a community</option>
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Meetup Title</label>
          <input
            name="title"
            placeholder="Example: Building AI Projects for Beginners"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Meetup Date</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Start Time</label>
          <input
            name="start_time"
            type="time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>End Time</label>
          <input
            name="end_time"
            type="time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Venue Name</label>
          <input
            name="venue_name"
            placeholder="Example: Sreenidhi University Seminar Hall"
            value={form.venue_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Capacity Limit</label>
          <input
            name="capacity_limit"
            type="number"
            placeholder="Maximum number of attendees"
            value={form.capacity_limit}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Registration Deadline</label>
          <input
            name="registration_deadline"
            type="date"
            value={form.registration_deadline}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full">
          <label>Upload Meetup Banner Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleBannerUpload}
          />

          {bannerPreview && (
            <img
              src={bannerPreview}
              alt="Meetup banner preview"
              className="upload-preview-cover"
            />
          )}
        </div>

        <div className="form-group full">
          <label>Google Maps Link</label>
          <input
            name="google_maps_link"
            placeholder="Paste Google Maps location link"
            value={form.google_maps_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full">
          <label>Meetup Description</label>
          <textarea
            name="description"
            placeholder="Explain meetup topic, agenda, and benefits"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <button className="primary-btn full" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Create Meetup"}
        </button>
      </form>
    </div>
  );
}

export default CreateMeetup;