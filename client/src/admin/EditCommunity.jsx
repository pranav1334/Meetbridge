import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EditCommunity() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await API.get(`/communities/${id}`);

      setForm({
        name: res.data.name || "",
        logo: res.data.logo || "",
        cover_image: res.data.cover_image || "",
        description: res.data.description || "",
        category: res.data.category || "",
        city: res.data.city || "",
        website: res.data.website || "",
        whatsapp_link: res.data.whatsapp_link || "",
        discord_link: res.data.discord_link || "",
        instagram_link: res.data.instagram_link || "",
        rules: res.data.rules || "",
        approval_type: res.data.approval_type || "admin",
      });

      setLogoPreview(res.data.logo || "");
      setCoverPreview(res.data.cover_image || "");
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load community");
    }
  }, [id]);

  useEffect(() => {
    const loadCommunity = async () => {
      await fetchCommunity();
    };

    loadCommunity();
  }, [fetchCommunity]);

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

  const updateCommunity = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      const res = await API.put(`/communities/${id}`, form);

      setMessage(res.data.message || "Community updated successfully");

      setTimeout(() => {
        navigate("/admin/communities");
      }, 800);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to update community");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Edit Community</h1>
      <p className="page-subtitle">
        Update community details, images, rules, and approval type.
      </p>

      <form className="panel form-grid" onSubmit={updateCommunity}>
        {message && <div className="success full">{message}</div>}
        {error && <div className="error full">{error}</div>}

        <div className="form-group">
          <label>Community Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Community Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            name="city"
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
          <label>Update Community Logo</label>
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
          <label>Update Cover Image</label>
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
            value={form.website}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>WhatsApp Group Link</label>
          <input
            name="whatsapp_link"
            value={form.whatsapp_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Discord Link</label>
          <input
            name="discord_link"
            value={form.discord_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Instagram Link</label>
          <input
            name="instagram_link"
            value={form.instagram_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full">
          <label>Community Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full">
          <label>Community Rules</label>
          <textarea
            name="rules"
            value={form.rules}
            onChange={handleChange}
          />
        </div>

        <button className="primary-btn full" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Update Community"}
        </button>
      </form>
    </div>
  );
}

export default EditCommunity;