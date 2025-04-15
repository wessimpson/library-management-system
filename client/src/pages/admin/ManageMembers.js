import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaSearch, FaInfoCircle, FaCheck, FaBan, FaHistory } from 'react-icons/fa';
import { getMembers, getMemberDetails, updateMemberStatus } from '../../utils/api';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Member details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Status update
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getMembers();
        setMembers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        setError('Failed to load members. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);
  
  // Filter members based on search term and status
  const filteredMembers = members.filter(member => {
    // Check status filter
    if (statusFilter && member.MembershipStatus !== statusFilter) {
      return false;
    }
    
    // Check search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        `${member.FirstName} ${member.LastName}`.toLowerCase().includes(searchLower) ||
        member.Email.toLowerCase().includes(searchLower) ||
        (member.Phone && member.Phone.includes(searchTerm))
      );
    }
    
    return true;
  });
  
  const handleViewDetails = async (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await getMemberDetails(member.MemberID);
      setMemberDetails(response.data);
    } catch (error) {
      console.error('Error fetching member details:', error);
      setError('Failed to load member details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const handleOpenStatusModal = (member) => {
    setSelectedMember(member);
    setNewStatus(member.MembershipStatus);
    setShowStatusModal(true);
  };
  
  const handleStatusChange = async () => {
    try {
      setLoading(true);
      
      await updateMemberStatus(selectedMember.MemberID, {
        membershipStatus: newStatus
      });
      
      // Update member in the list
      setMembers(members.map(m => 
        m.MemberID === selectedMember.MemberID 
          ? { ...m, MembershipStatus: newStatus } 
          : m
      ));
      
      setStatusUpdateSuccess(`Membership status for ${selectedMember.FirstName} ${selectedMember.LastName} has been updated to ${newStatus}.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusUpdateSuccess('');
      }, 3000);
      
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating member status:', error);
      setError(error.response?.data?.message || 'Failed to update member status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let variant = 'secondary';
    
    switch (status) {
      case 'Active':
        variant = 'success';
        break;
      case 'Suspended':
        variant = 'warning';
        break;
      case 'Expired':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{status}</Badge>;
  };
  
  if (loading && members.length === 0) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  if (error && members.length === 0) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <h1 className="mb-4">Manage Members</h1>
      
      {statusUpdateSuccess && (
        <Alert variant="success" className="mb-4">
          {statusUpdateSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={8}>
          <Form.Group>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <Form.Control
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Expired">Expired</option>
          </Form.Select>
        </Col>
      </Row>
      
      {filteredMembers.length === 0 ? (
        <Alert variant="info">
          No members found matching your search criteria.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Membership Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.MemberID}>
                  <td>{member.FirstName} {member.LastName}</td>
                  <td>{member.Email}</td>
                  <td>{member.Phone || '-'}</td>
                  <td>{member.MembershipType}</td>
                  <td>
                    <StatusBadge status={member.MembershipStatus} />
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleViewDetails(member)}
                    >
                      <FaInfoCircle /> Details
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleOpenStatusModal(member)}
                    >
                      Change Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      
      {/* Member Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Member Details: {selectedMember?.FirstName} {selectedMember?.LastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {memberDetails ? (
                <>
                  <Row>
                    <Col md={6}>
                      <h5 className="mb-3">Personal Information</h5>
                      <dl className="row">
                        <dt className="col-sm-4">Name</dt>
                        <dd className="col-sm-8">
                          {memberDetails.FirstName} {memberDetails.LastName}
                        </dd>
                        
                        <dt className="col-sm-4">Email</dt>
                        <dd className="col-sm-8">{memberDetails.Email}</dd>
                        
                        <dt className="col-sm-4">Phone</dt>
                        <dd className="col-sm-8">{memberDetails.Phone || '-'}</dd>
                        
                        <dt className="col-sm-4">Address</dt>
                        <dd className="col-sm-8">{memberDetails.Address || '-'}</dd>
                      </dl>
                    </Col>
                    <Col md={6}>
                      <h5 className="mb-3">Membership Information</h5>
                      <dl className="row">
                        <dt className="col-sm-4">ID</dt>
                        <dd className="col-sm-8">{memberDetails.MemberID}</dd>
                        
                        <dt className="col-sm-4">Type</dt>
                        <dd className="col-sm-8">{memberDetails.MembershipType}</dd>
                        
                        <dt className="col-sm-4">Status</dt>
                        <dd className="col-sm-8">
                          <StatusBadge status={memberDetails.MembershipStatus} />
                        </dd>
                        
                        <dt className="col-sm-4">Join Date</dt>
                        <dd className="col-sm-8">
                          {new Date(memberDetails.MembershipDate).toLocaleDateString()}
                        </dd>
                        
                        <dt className="col-sm-4">Total Fines</dt>
                        <dd className="col-sm-8">
                          ${memberDetails.totalFines ? memberDetails.totalFines.toFixed(2) : '0.00'}
                        </dd>
                      </dl>
                    </Col>
                  </Row>
                  
                  {memberDetails.activeBorrowings?.length > 0 && (
                    <>
                      <hr />
                      <h5 className="mb-3">
                        <FaHistory className="me-2" />
                        Active Borrowings ({memberDetails.activeBorrowings.length})
                      </h5>
                      <Table size="sm">
                        <thead>
                          <tr>
                            <th>Book</th>
                            <th>Borrowed On</th>
                            <th>Due Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberDetails.activeBorrowings.map(item => (
                            <tr key={item.BorrowID}>
                              <td>{item.Title}</td>
                              <td>{new Date(item.BorrowDate).toLocaleDateString()}</td>
                              <td>{new Date(item.DueDate).toLocaleDateString()}</td>
                              <td>
                                <StatusBadge status={item.Status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </>
              ) : (
                <div className="alert alert-warning">
                  Failed to load member details. Please try again.
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowDetailsModal(false);
              handleOpenStatusModal(selectedMember);
            }}
          >
            Change Status
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Change Status Modal */}
      <Modal 
        show={showStatusModal} 
        onHide={() => setShowStatusModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Change Membership Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Update membership status for member: <strong>{selectedMember?.FirstName} {selectedMember?.LastName}</strong>
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>New Status</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Expired">Expired</option>
            </Form.Select>
          </Form.Group>
          
          <div className="mt-3">
            {newStatus === 'Active' && (
              <Alert variant="success">
                <FaCheck className="me-2" />
                Member will have full access to library services.
              </Alert>
            )}
            
            {newStatus === 'Suspended' && (
              <Alert variant="warning">
                <FaBan className="me-2" />
                Member will be temporarily restricted from borrowing books.
              </Alert>
            )}
            
            {newStatus === 'Expired' && (
              <Alert variant="danger">
                <FaBan className="me-2" />
                Member will have no access to library services until membership is renewed.
              </Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStatusChange}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Confirm Status Change'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageMembers;