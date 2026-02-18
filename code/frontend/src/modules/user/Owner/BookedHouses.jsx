import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Search, Download, Home, Users, IndianRupee, FileSpreadsheet } from 'lucide-react';

const BookedHouses = () => {
  const [bookedProperties, setBookedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookedProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8001/api/owner/getbookedproperties', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) {
        setBookedProperties(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch booked properties');
      }
    } catch (error) {
      console.error(error);
      message.error('Error fetching booked properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedProperties();
  }, []);

  const filteredProperties = bookedProperties.filter(prop =>
    prop.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.propertyType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = bookedProperties.reduce((sum, prop) => sum + (prop.propertyAmt || 0), 0);

  const exportToExcel = () => {
    if (bookedProperties.length === 0) {
      message.warning('No booked properties to export');
      return;
    }

    const exportData = bookedProperties.map((prop, index) => ({
      'S.No': index + 1,
      'Tenant Name': prop.tenantName,
      'Tenant Phone': prop.tenantPhone,
      'Property Type': prop.propertyType,
      'Ad Type': prop.propertyAdType,
      'Property Address': prop.propertyAddress,
      'Rent Amount (₹)': prop.propertyAmt,
      'Bedrooms': prop.bedrooms,
      'Bathrooms': prop.bathrooms,
      'Furnished': prop.furnished,
      'Booking Status': prop.bookingStatus,
      'Booked Date': new Date(prop.bookedDate).toLocaleDateString('en-IN'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },   // S.No
      { wch: 20 },  // Tenant Name
      { wch: 15 },  // Tenant Phone
      { wch: 15 },  // Property Type
      { wch: 12 },  // Ad Type
      { wch: 35 },  // Address
      { wch: 15 },  // Rent Amount
      { wch: 10 },  // Bedrooms
      { wch: 10 },  // Bathrooms
      { wch: 15 },  // Furnished
      { wch: 15 },  // Status
      { wch: 15 },  // Booked Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Booked Houses');

    // Add summary sheet
    const summaryData = [
      { 'Summary': 'Total Booked Properties', 'Value': bookedProperties.length },
      { 'Summary': 'Total Monthly Revenue', 'Value': `₹${totalRevenue.toLocaleString('en-IN')}` },
      { 'Summary': 'Report Generated On', 'Value': new Date().toLocaleString('en-IN') },
      { 'Summary': 'Owner Name', 'Value': bookedProperties[0]?.ownerName || 'N/A' },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Booked_Houses_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
    message.success(`Exported ${bookedProperties.length} booked properties to ${fileName}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading booked properties...</span>
      </div>
    );
  }

  return (
    <Container fluid>
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Total Booked Houses</h6>
                  <h2 className="mb-0 fw-bold">{bookedProperties.length}</h2>
                </div>
                <Home size={40} opacity={0.7} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Total Tenants</h6>
                  <h2 className="mb-0 fw-bold">{new Set(bookedProperties.map(p => p.tenantName)).size}</h2>
                </div>
                <Users size={40} opacity={0.7} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-1">Total Revenue / Month</h6>
                  <h2 className="mb-0 fw-bold">₹{totalRevenue.toLocaleString('en-IN')}</h2>
                </div>
                <IndianRupee size={40} opacity={0.7} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search & Export Bar */}
      <Row className="mb-3">
        <Col md={8}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by tenant name, property address, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Col>
        <Col md={4} className="d-flex justify-content-end gap-2">
          <Button
            variant="success"
            onClick={exportToExcel}
            className="d-flex align-items-center gap-2"
            disabled={bookedProperties.length === 0}
          >
            <FileSpreadsheet size={18} />
            Export to Excel
          </Button>
          <Button
            variant="outline-primary"
            onClick={fetchBookedProperties}
            className="d-flex align-items-center gap-2"
          >
            <Download size={18} />
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Booked Properties Table */}
      {filteredProperties.length === 0 ? (
        <Card className="shadow-sm border-0 text-center p-5">
          <Card.Body>
            <Home size={60} className="text-muted mb-3" />
            <h4 className="text-muted">No Booked Houses Found</h4>
            <p className="text-muted">
              {searchTerm ? 'No properties match your search.' : 'You don\'t have any booked properties yet. Once tenants book your properties, they will appear here.'}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <TableContainer component={Paper} className="shadow-sm">
          <Table sx={{ minWidth: 900 }} aria-label="booked houses table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tenant Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Property Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Rent (₹)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Bedrooms</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Furnished</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Booked Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties.map((prop, index) => (
                <TableRow
                  key={prop.bookingId}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <strong>{prop.tenantName}</strong>
                  </TableCell>
                  <TableCell>{prop.tenantPhone}</TableCell>
                  <TableCell>
                    <Badge bg="info">{prop.propertyType}</Badge>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 250 }}>{prop.propertyAddress}</TableCell>
                  <TableCell align="center">
                    <strong style={{ color: '#28a745' }}>₹{prop.propertyAmt?.toLocaleString('en-IN')}</strong>
                  </TableCell>
                  <TableCell align="center">{prop.bedrooms}</TableCell>
                  <TableCell align="center">
                    <Badge bg={
                      prop.furnished === 'fully-furnished' ? 'success' :
                      prop.furnished === 'semi-furnished' ? 'warning' : 'secondary'
                    }>
                      {prop.furnished}
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Badge bg="success">Booked</Badge>
                  </TableCell>
                  <TableCell align="center">
                    {new Date(prop.bookedDate).toLocaleDateString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Footer Summary */}
      {filteredProperties.length > 0 && (
        <div className="mt-3 text-muted d-flex justify-content-between">
          <span>Showing {filteredProperties.length} of {bookedProperties.length} booked properties</span>
          <span>Total Revenue: <strong className="text-success">₹{totalRevenue.toLocaleString('en-IN')}</strong></span>
        </div>
      )}
    </Container>
  );
};

export default BookedHouses;
