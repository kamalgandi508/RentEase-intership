import { message } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Form, Modal, Col, InputGroup, Row, FloatingLabel } from 'react-bootstrap';



const AllProperties = () => {
   const [image, setImage] = useState(null);
   const [editingPropertyId, setEditingPropertyId] = useState(null);
   const [editingPropertyData, setEditingPropertyData] = useState({
      propertyType: '',
      propertyAdType: '',
      propertyAddress: '',
      ownerContact: '',
      propertyAmt: 0,
      additionalInfo: ''
   });
   const [allProperties, setAllProperties] = useState([]);
   const [show, setShow] = useState(false);

   const handleClose = () => setShow(false);

   const handleShow = (propertyId) => {
      const propertyToEdit = allProperties.find(property => property._id === propertyId);
      if (propertyToEdit) {
         setEditingPropertyId(propertyId);
         setEditingPropertyData(propertyToEdit);
         setShow(true);
      }
   };

   const getAllProperty = async () => {
      try {
         const response = await axios.get('http://localhost:8001/api/owner/getallproperties', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });
         if (response.data.success) {
            setAllProperties(response.data.data);
         } else {
            message.error('Something went wrong')
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      getAllProperty();
   }, []);


   const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImage(file);
   }
   const handleChange = (e) => {
      const { name, value } = e.target;
      setEditingPropertyData({ ...editingPropertyData, [name]: value });
   }

   useEffect(() => {
      setEditingPropertyData((prevDetails) => ({
         ...prevDetails,
         propertyImage: image,
      }));
   }, [image]);

   const saveChanges = async (propertyId, status) => {
      try {
         const formData = new FormData();
         formData.append('propertyType', editingPropertyData.propertyType);
         formData.append('propertyAdType', editingPropertyData.propertyAdType);
         formData.append('propertyAddress', editingPropertyData.propertyAddress);
         formData.append('ownerContact', editingPropertyData.ownerContact);
         formData.append('propertyAmt', editingPropertyData.propertyAmt);
         formData.append('additionalInfo', editingPropertyData.additionalInfo);
         formData.append('propertyImage', image);
         formData.append('isAvailable', status);
         const res = await axios.patch(`http://localhost:8001/api/owner/updateproperty/${propertyId}`, formData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         })
         if (res.data.success) {
            message.success(res.data.message)
            handleClose();
         }
      } catch (error) {
         console.log(error);
         message.error('Failed to save changes');
      }
   };

   const handleDelete = async (propertyId) => {
      let assure = window.confirm("are you sure to delete")
      if (assure) {
         try {
            const response = await axios.delete(`http://localhost:8001/api/owner/deleteproperty/${propertyId}`, {
               headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.data.success) {
               message.success(response.data.message);
               getAllProperty();
            } else {
               message.error(response.data.message);
            }
         } catch (error) {
            console.log(error);
         }
      }

   }


   return (
      <div className="p-3">
         <h4 className="section-title-modern">🏠 My Properties</h4>
         <TableContainer component={Paper} className="modern-table-container">
            <Table sx={{ minWidth: 650 }} aria-label="properties table">
               <TableHead className="modern-table-head">
                  <TableRow>
                     <TableCell>Property ID</TableCell>
                     <TableCell align="center">Property Type</TableCell>
                     <TableCell align="center">Ad Type</TableCell>
                     <TableCell align="center">Address</TableCell>
                     <TableCell align="center">Contact</TableCell>
                     <TableCell align="center">Amount</TableCell>
                     <TableCell align="center">Availability</TableCell>
                     <TableCell align="center">Action</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allProperties.map((property) => (
                     <TableRow
                        key={property._id}
                        className="modern-table-row"
                     >
                        <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace' }}>
                           #{property._id.slice(-6)}
                        </TableCell>
                        <TableCell align="center">{property.propertyType}</TableCell>
                        <TableCell align="center">{property.propertyAdType}</TableCell>
                        <TableCell align="center">{property.propertyAddress}</TableCell>
                        <TableCell align="center">{property.ownerContact}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>₹{property.propertyAmt}</TableCell>
                        <TableCell align="center">
                           <span className={`badge-modern ${property.isAvailable === 'Available' ? 'badge-available' : 'badge-unavailable'}`}>
                              {property.isAvailable}
                           </span>
                        </TableCell>
                        <TableCell align="center">
                           <div className="d-flex gap-2 justify-content-center">
                              <Button className="btn-modern btn-modern-info" size="sm" onClick={() => handleShow(property._id, 'Available')}>
                                 ✏️ Edit
                              </Button>
                           <Modal show={show && editingPropertyId === property._id} onHide={handleClose}>
                              <Modal.Header closeButton>
                                 <Modal.Title>Modal heading</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                 <Form onSubmit={() => saveChanges(property._id)}>
                                    <Row className="mb-3">
                                       <Form.Group as={Col} md="4">
                                          <Form.Group as={Col}>
                                             <Form.Label>Property type</Form.Label>
                                             <Form.Select
                                                name='propertyType'
                                                value={editingPropertyData.propertyType}
                                                onChange={handleChange}
                                                defaultValue={'Choose...'}
                                             >
                                                <option value="choose.." disabled>Choose...</option>
                                                <option value="residential">Residential</option>
                                                <option value="commercial">Commercial</option>
                                                <option value="land/plot">Land/Plot</option>
                                             </Form.Select>
                                          </Form.Group>
                                       </Form.Group>
                                       <Form.Group as={Col} md="4">
                                          <Form.Group as={Col}>
                                             <Form.Label>Property Ad type</Form.Label>
                                             <Form.Select name='propertyAdType' value={editingPropertyData.propertyAdType} onChange={handleChange}>
                                                <option defaultValue value="choose.." disabled>Choose...</option>
                                                <option value="rent">Rent</option>
                                                <option value="sale">Sale</option>
                                             </Form.Select>
                                          </Form.Group>
                                       </Form.Group>
                                       <Form.Group as={Col} md="4">
                                          <Form.Label>Property Full Address</Form.Label>
                                          <InputGroup hasValidation>
                                             <Form.Control
                                                type="text"
                                                placeholder="Address"
                                                aria-describedby="inputGroupPrepend"
                                                required
                                                name='propertyAddress'
                                                value={editingPropertyData.propertyAddress}
                                                onChange={handleChange}
                                             />
                                          </InputGroup>
                                       </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                       <Form.Group as={Col} md="6">
                                          <Form.Label>Property Image</Form.Label>
                                          <Form.Control
                                             type="file"
                                             placeholder="image"
                                             required
                                             accept='image/*'
                                             name='image'
                                             onChange={handleImageChange}
                                          />
                                       </Form.Group>
                                       <Form.Group as={Col} md="3">
                                          <Form.Label>Owner Contact No.</Form.Label>
                                          <Form.Control type="phone" placeholder="contact number" required
                                             name='ownerContact'
                                             value={editingPropertyData.ownerContact}
                                             onChange={handleChange}
                                          />
                                       </Form.Group>
                                       <Form.Group as={Col} md="3">
                                          <Form.Label>Property Amt.</Form.Label>
                                          <Form.Control type="number" placeholder="amount" required
                                             name='propertyAmt'
                                             value={editingPropertyData.propertyAmt}
                                             onChange={handleChange}
                                          />
                                       </Form.Group>
                                       <FloatingLabel
                                          label="Additional details for the Property"
                                          className="mt-4"
                                       >
                                          <Form.Control name='additionalInfo' value={editingPropertyData.additionalInfo} onChange={handleChange} as="textarea" placeholder="Leave a comment here" />
                                       </FloatingLabel>
                                    </Row>
                                    <Button style={{ float: 'right' }} type='submit' className='btn-modern btn-modern-info mx-2'>Update</Button>
                                 </Form>
                              </Modal.Body>
                           </Modal>

                           <Button className='btn-modern btn-modern-danger mx-2' size="sm" onClick={() => handleDelete(property._id)}>🗑️ Delete</Button>
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default AllProperties;

