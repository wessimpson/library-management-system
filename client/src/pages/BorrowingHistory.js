import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { getMemberBorrowings } from '../utils/api';
import { FaFilter, FaCalendarAlt, FaBookOpen, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const BorrowingHistory = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and sorting
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('BorrowDate');
  const [sortDirection, setSortDirection] = useState('desc');
  
  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        setLoading(true);
        const response = await getMemberBorrowings(statusFilter);
        setBorrowings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching borrowing history:', error);
        setError('Failed to load borrowing history. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchBorrowings();
  }, [statusFilter]);
  
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortIcon = (field) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />;
  };
  
  // Sort the borrowings
  const sortedBorrowings = [...borrowings].sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];
    
    // Handle dates
    if (sortField === 'BorrowDate' || sortField === 'DueDate' || sortField === 'ReturnDate') {
      fieldA = fieldA ? new Date(fieldA).getTime() : 0;
      fieldB = fieldB ? new Date(fieldB).getTime() : 0;
    }
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let variant = 'secondary';
    
    switch (status) {
      case 'Active':
        variant = 'primary';
        break;
      case 'Returned':
        variant = 'success';
        break;
      case 'Overdue':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{status}</Badge>;
  };
  
  if (loading && borrowings.length === 0) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  if (error && borrowings.length === 0) {
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
      <h1 className="mb-4">Borrowing History</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <FaFilter className="me-2 text-muted" />
                <span className="me-3">Filter by Status:</span>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-auto"
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Returned">Returned</option>
                  <option value="Overdue">Overdue</option>
                </Form.Select>
              </div>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <div className="text-muted">
                Showing {sortedBorrowings.length} {sortedBorrowings.length === 1 ? 'record' : 'records'}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {sortedBorrowings.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No borrowing records found with the selected filters.
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('Title')}
                >
                  Book {sortIcon('Title')}
                </th>
                <th 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('BorrowDate')}
                >
                  Borrowed On {sortIcon('BorrowDate')}
                </th>
                <th 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('DueDate')}
                >
                  Due Date {sortIcon('DueDate')}
                </th>
                <th 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('ReturnDate')}
                >
                  Returned On {sortIcon('ReturnDate')}
                </th>
                <th 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('Status')}
                >
                  Status {sortIcon('Status')}
                </th>
                <th 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('FineAmount')}
                >
                  Fine {sortIcon('FineAmount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBorrowings.map((item) => (
                <tr key={item.BorrowID}>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaBookOpen className="me-2 text-muted" />
                      {item.Title}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-muted" />
                      {new Date(item.BorrowDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{new Date(item.DueDate).toLocaleDateString()}</td>
                  <td>
                    {item.ReturnDate 
                      ? new Date(item.ReturnDate).toLocaleDateString() 
                      : '-'}
                  </td>
                  <td>
                    <StatusBadge status={item.Status} />
                  </td>
                  <td>
                    {item.FineAmount > 0 
                      ? `$${item.FineAmount.toFixed(2)}` 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default BorrowingHistory;