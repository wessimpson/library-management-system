import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert } from 'react-bootstrap';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { getOverdueBooks, getBooks, getMembers, getAllReservations } from '../../utils/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report data
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({
    totalBooks: 0,
    totalAvailable: 0,
    totalCheckedOut: 0
  });
  const [memberSummary, setMemberSummary] = useState({
    totalMembers: 0,
    activeMembers: 0,
    suspendedMembers: 0,
    expiredMembers: 0
  });
  
  // Active report type
  const [activeReport, setActiveReport] = useState('overdue');
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        const [
          overdueResponse,
          reservationsResponse,
          booksResponse,
          membersResponse
        ] = await Promise.all([
          getOverdueBooks(),
          getAllReservations(),
          getBooks(),
          getMembers()
        ]);
        
        // Set overdue books
        setOverdueBooks(overdueResponse.data);
        
        // Set reservations
        setReservations(reservationsResponse.data);
        
        // Calculate inventory summary
        const books = booksResponse.data;
        const totalBooks = books.length;
        const totalAvailable = books.reduce((total, book) => total + book.AvailableCopies, 0);
        const totalCheckedOut = books.reduce((total, book) => total + (book.TotalCopies - book.AvailableCopies), 0);
        
        setInventorySummary({
          totalBooks,
          totalAvailable,
          totalCheckedOut
        });
        
        // Calculate member summary
        const members = membersResponse.data;
        const totalMembers = members.length;
        const activeMembers = members.filter(m => m.MembershipStatus === 'Active').length;
        const suspendedMembers = members.filter(m => m.MembershipStatus === 'Suspended').length;
        const expiredMembers = members.filter(m => m.MembershipStatus === 'Expired').length;
        
        setMemberSummary({
          totalMembers,
          activeMembers,
          suspendedMembers,
          expiredMembers
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError('Failed to load report data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  // Function to simulate export to different formats
  const handleExport = (format) => {
    alert(`Exporting ${activeReport} report as ${format.toUpperCase()}. (This is a simulation)`);
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
  
  if (error) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }
  
  // Render the selected report
  const renderReport = () => {
    switch (activeReport) {
      case 'overdue':
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Overdue Books Report</h3>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleExport('pdf')}
                >
                  <FaFilePdf className="me-1" /> Export as PDF
                </Button>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <FaFileExcel className="me-1" /> Export as Excel
                </Button>
              </div>
            </div>
            
            {overdueBooks.length === 0 ? (
              <Alert variant="info">No overdue books at this time.</Alert>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Member</th>
                      <th>Borrow Date</th>
                      <th>Due Date</th>
                      <th>Days Overdue</th>
                      <th>Fine Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueBooks.map(item => (
                      <tr key={item.BorrowID}>
                        <td>{item.Title}</td>
                        <td>{item.FirstName} {item.LastName}</td>
                        <td>{new Date(item.BorrowDate).toLocaleDateString()}</td>
                        <td>{new Date(item.DueDate).toLocaleDateString()}</td>
                        <td>{item.DaysOverdue}</td>
                        <td>${item.FineAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        );
        
      case 'inventory':
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Inventory Summary Report</h3>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleExport('pdf')}
                >
                  <FaFilePdf className="me-1" /> Export as PDF
                </Button>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <FaFileExcel className="me-1" /> Export as Excel
                </Button>
              </div>
            </div>
            
            <Row className="mb-4">
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="display-4 mb-2">{inventorySummary.totalBooks}</div>
                    <Card.Title>Total Books</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="display-4 mb-2 text-success">{inventorySummary.totalAvailable}</div>
                    <Card.Title>Available Books</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="display-4 mb-2 text-primary">{inventorySummary.totalCheckedOut}</div>
                    <Card.Title>Checked Out</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        );
        
      case 'members':
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Membership Report</h3>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleExport('pdf')}
                >
                  <FaFilePdf className="me-1" /> Export as PDF
                </Button>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <FaFileExcel className="me-1" /> Export as Excel
                </Button>
              </div>
            </div>
            
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="display-4 mb-2">{memberSummary.totalMembers}</div>
                    <Card.Title>Total Members</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="display-4 mb-2 text-success">{memberSummary.activeMembers}</div>
                    <Card.Title>Active</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="display-4 mb-2 text-warning">{memberSummary.suspendedMembers}</div>
                    <Card.Title>Suspended</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="display-4 mb-2 text-danger">{memberSummary.expiredMembers}</div>
                    <Card.Title>Expired</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        );
        
      case 'reservations':
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Active Reservations Report</h3>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleExport('pdf')}
                >
                  <FaFilePdf className="me-1" /> Export as PDF
                </Button>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <FaFileExcel className="me-1" /> Export as Excel
                </Button>
              </div>
            </div>
            
            {reservations.length === 0 ? (
              <Alert variant="info">No active reservations at this time.</Alert>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Reserved By</th>
                      <th>Email</th>
                      <th>Reserved On</th>
                      <th>Expires On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(item => (
                      <tr key={item.ReservationID}>
                        <td>{item.Title}</td>
                        <td>{item.FirstName} {item.LastName}</td>
                        <td>{item.Email}</td>
                        <td>{new Date(item.ReservationDate).toLocaleString()}</td>
                        <td>{new Date(item.ExpiryDate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        );
        
      default:
        return <div>Select a report type</div>;
    }
  };
  
  return (
    <Container className="my-5">
      <h1 className="mb-4">Reports</h1>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Select Report Type</Form.Label>
                  <Form.Select 
                    value={activeReport}
                    onChange={(e) => setActiveReport(e.target.value)}
                  >
                    <option value="overdue">Overdue Books Report</option>
                    <option value="inventory">Inventory Summary</option>
                    <option value="members">Membership Report</option>
                    <option value="reservations">Active Reservations</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {renderReport()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;