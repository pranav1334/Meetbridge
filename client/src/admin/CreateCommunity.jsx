import { useState } from "react";
import API from "../services/api";

function CreateCommunity() {
  const [form, setForm] = useState({
    name: "",
    logo: "",
    cover_image: "",
    description: "",
    category: "",
    city: "",
    website: "",
    whatsapp_link: "",
    discord_link: "",
    instagram_link: "",
    rules: "",
    approval_type: "admin",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const imageUrl = await uploadImage(file);

      setForm({
        ...form,
        logo: imageUrl,
      });

      setLogoPreview(imageUrl);
    } catch (error) {
      setError(error.response?.data?.detail || "Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const imageUrl = await uploadImage(file);

      setForm({
        ...form,
        cover_image: imageUrl,
      });

      setCoverPreview(imageUrl);
    } catch (error) {
      setError(error.response?.data?.detail || "Cover image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const createCommunity = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await API.post("/communities/", form);
      setMessage(res.data.message || "Community created successfully");

      setForm({
        name: "",
        logo: "",
        cover_image: "",
        description: "",
        category: "",
        city: "",
        website: "",
        whatsapp_link: "",
        discord_link: "",
        instagram_link: "",
        rules: "",
        approval_type: "admin",
      });

      setLogoPreview("");
      setCoverPreview("");
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to create community");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Create Community</h1>
      <p className="page-subtitle">
        Only admin can create and manage communities.
      </p>

      <form className="panel form-grid" onSubmit={createCommunity}>
        {message && <div className="success full">{message}</div>}
        {error && <div className="error full">{error}</div>}

        <div className="form-group">
          <label>Community Name</label>
          <input
            name="name"
            placeholder="Example: AI Builders Hyderabad"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Community Category</label>
          <input
            name="category"
            placeholder="Example: AI / Machine Learning"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            name="city"
            placeholder="Example: Hyderabad"
            value={form.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Approval Type</label>
          <select
            name="approval_type"
            value={form.approval_type}
            onChange={handleChange}
          >
            <option value="admin">Admin Approval</option>
            <option value="auto">Auto Approval</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload Community Logo</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleLogoUpload}
          />

          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="upload-preview-logo"
            />
          )}
        </div>

        <div className="form-group">
          <label>Upload Cover Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleCoverUpload}
          />

          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover preview"
              className="upload-preview-cover"
            />
          )}
        </div>

        <div className="form-group">
          <label>Website URL</label>
          <input
            name="website"
            placeholder="Paste website link"
            value={form.website}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>WhatsApp Group Link</label>
          <input
            name="whatsapp_link"
            placeholder="Paste WhatsApp group link"
            value={form.whatsapp_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Discord Link</label>
          <input
            name="discord_link"
            placeholder="Paste Discord server link"
            value={form.discord_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Instagram Link</label>
          <input
            name="instagram_link"
            placeholder="Paste Instagram link"
            value={form.instagram_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full">
          <label>Community Description</label>
          <textarea
            name="description"
            placeholder="Explain what this community is about"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full">
          <label>Community Rules</label>
          <textarea
            name="rules"
            placeholder="Write community rules for members"
            value={form.rules}
            onChange={handleChange}
          />
        </div>

        <button className="primary-btn full" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Create Community"}
        </button>
      </form>
    </div>
  );
}

export default CreateCommunity;