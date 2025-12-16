import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'

const API_URL = '/api/users'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(API_URL)
      setUsers(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle form submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setSuccess(null)

      if (editingUser) {
        // Update existing user
        await axios.put(`${API_URL}/${editingUser.id}`, formData)
        setSuccess('User updated successfully!')
      } else {
        // Create new user
        await axios.post(API_URL, formData)
        setSuccess('User created successfully!')
      }

      // Reset form
      setFormData({ name: '', email: '' })
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user')
    }
  }

  // Handle edit button click
  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '' })
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await axios.delete(`${API_URL}/${id}`)
      setSuccess('User deleted successfully!')
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user')
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h1>👥 User Management</h1>
        <p>Create, Read, Update, and Delete users</p>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success">
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Create/Update Form */}
      <div className="form-section">
        <h2>{editingUser ? '✏️ Edit User' : '➕ Create New User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter user name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter user email"
              required
            />
          </div>
          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              {editingUser ? 'Update User' : 'Create User'}
            </button>
            {editingUser && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="users-section">
        <h2>📋 Users List</h2>
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>Create your first user using the form above</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-id">ID: {user.id}</div>
                <h3>{user.name}</h3>
                <p>📧 {user.email}</p>
                <p>📅 Created: {new Date(user.created_at).toLocaleDateString()}</p>
                <div className="user-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
