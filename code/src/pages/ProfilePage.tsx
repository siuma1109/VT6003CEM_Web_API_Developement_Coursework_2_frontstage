import React, { useState, useEffect } from 'react';
import { userService, UserData as ApiUserData, signupCodeService, SignupCode, rolesService, Role } from '../services/api/apiService';
import { useAuth } from '../context/AuthContext';

interface ExtendedUserData extends ApiUserData {
  roles: Role[];
  avatar?: string;
}

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [userData, setUserData] = useState<ExtendedUserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signupCodes, setSignupCodes] = useState<SignupCode[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const getAvatarUrl = (avatarPath: string) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
    return `${baseUrl}/${avatarPath}`;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userData?.roles.some(role => role.name === 'admin')) {
      fetchSignupCodes();
      fetchRoles();
    }
  }, [userData]);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUserData(response.data as ExtendedUserData);
        setFormData({
          name: response.data.name,
          email: response.data.email,
        });
      }
    } catch (err) {
      setError('Failed to fetch profile data');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesService.listRoles();
      if (response.success) {
        // Filter out the admin role as it shouldn't be assignable
        const filteredRoles = response.data.filter(role => role.name !== 'admin');
        setAvailableRoles(filteredRoles);
      }
    } catch (err) {
      setError('Failed to fetch roles');
    }
  };

  const fetchSignupCodes = async () => {
    try {
      const response = await signupCodeService.listCodes();
      if (response.success) {
        setSignupCodes(response.data);
      }
    } catch (err) {
      setError('Failed to fetch signup codes');
    }
  };

  const handleGenerateCode = async () => {
    if (!selectedRoleId) {
      setError('Please select a role for the signup code');
      return;
    }

    setIsGeneratingCode(true);
    setError(null);
    try {
      const response = await signupCodeService.generateCode(selectedRoleId as number);
      if (response.success) {
        setSuccess('Signup code generated successfully');
        setSelectedRoleId(''); // Reset role selection
        fetchSignupCodes();
      }
    } catch (err) {
      setError('Failed to generate signup code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleDeleteCode = async (id: number) => {
    setError(null);
    try {
      const response = await signupCodeService.deleteCode(id);
      if (response.success) {
        setSuccess('Signup code deleted successfully');
        fetchSignupCodes();
      }
    } catch (err) {
      setError('Failed to delete signup code');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await userService.updateProfile({ name: formData.name });
      if (response.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        fetchProfile(); // Refresh the data
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isAdmin = userData?.roles.some(role => role.name === 'admin');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await userService.uploadAvatar(formData);
      if (response.success) {
        setSuccess('Avatar updated successfully');
        fetchProfile(); // Refresh profile data
      }
    } catch (err) {
      setError('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Profile</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {userData && (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {userData.avatar ? (
                    <img
                      src={getAvatarUrl(userData.avatar)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </div>
              {isUploading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Uploading avatar...
                </p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                  <p className="text-gray-900 dark:text-white">{userData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(userData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(userData.updatedAt)}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed px-4 py-2"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfile();
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Roles</h2>
              <div className="space-y-2">
                {userData.roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{role.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Assigned: {formatDate(role.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex flex-col space-y-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Signup Codes</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : '')}
                      className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                    >
                      <option value="">Select Role</option>
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGeneratingCode || !selectedRoleId}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      {isGeneratingCode ? 'Generating...' : 'Generate New Code'}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {signupCodes.map((code) => (
                    <div key={code.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">{code.code}</p>
                          {code.role && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full capitalize">
                              {code.role.name}
                            </span>
                          )}
                        </div>
                        {code.generatedBy && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Generated by: {code.generatedBy.name} ({code.generatedBy.email})
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {formatDate(code.createdAt)}
                        </p>
                        {code.usedAt && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Used by: {code.usedBy} at {formatDate(code.usedAt)}
                          </p>
                        )}
                      </div>
                      {!code.usedAt && (
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                  {signupCodes.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No signup codes generated yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 