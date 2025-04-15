import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import AuthContext from '../utils/AuthContext';
import { getMemberProfile } from '../utils/api';

const Profile = () => {
  const { currentUser, updateProfile, changePassword } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMemberProfile();
        setProfile(response.data);
        setProfileForm({
          firstName: response.data.FirstName,
          lastName: response.data.LastName,
          phone: response.data.Phone || '',
          address: response.data.Address || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    
    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        setProfileSuccess('Profile updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setProfileSuccess(''), 3000);
      } else {
        setProfileError(result.message);
      }
    } catch (error) {
      setProfileError('An error occurred while updating profile');
      console.error('Update profile error:', error);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        setPasswordSuccess('Password changed successfully!');
        // Reset password form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Clear success message after 3 seconds
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(result.message);
      }
    } catch (error) {
      setPasswordError('An error occurred while changing password');
      console.error('Change password error:', error);
    }
  };
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <h1 className="mb-4">My Profile</h1>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header as="h5">Personal Information</Card.Header>
            <Card.Body>
              {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}
              {profileError && <Alert variant="danger">{profileError}</Alert>}
              
              <Form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                  />
                </Form.Group>
                
                <Button type="submit" variant="primary">
                  Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header as="h5">Change Password</Card.Header>
            <Card.Body>
              {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                
                <Button type="submit" variant="primary">
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <Card className="mt-4">
            <Card.Header as="h5">Membership Details</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-5">Membership Type</dt>
                <dd className="col-sm-7">{profile?.MembershipType}</dd>
                
                <dt className="col-sm-5">Membership Status</dt>
                <dd className="col-sm-7">{profile?.MembershipStatus}</dd>
                
                <dt className="col-sm-5">Member Since</dt>
                <dd className="col-sm-7">
                  {profile?.MembershipDate && new Date(profile.MembershipDate).toLocaleDateString()}
                </dd>
                
                {profile?.totalFines > 0 && (
                  <>
                    <dt className="col-sm-5">Outstanding Fines</dt>
                    <dd className="col-sm-7">${profile.totalFines.toFixed(2)}</dd>
                  </>
                )}
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;