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

const AllProperty = () => {
   const [allProperties, setAllProperties] = useState([]);

   const getAllProperty = async () => {
      try {
         const response = await axios.get('http://localhost:8001/api/admin/getallproperties', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         if (response.data.success) {
            setAllProperties(response.data.data);
         } else {
            message.error(response.data.message);
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      getAllProperty();
   }, []);

   return (
      <div className="p-3">
         <h4 className="section-title-modern">🏠 All Properties</h4>
         <TableContainer component={Paper} className="modern-table-container">
            <Table sx={{ minWidth: 650 }} aria-label="properties table">
               <TableHead className="modern-table-head">
                  <TableRow>
                     <TableCell>Property ID</TableCell>
                     <TableCell align="center">Owner ID</TableCell>
                     <TableCell align="center">Type</TableCell>
                     <TableCell align="center">Ad Type</TableCell>
                     <TableCell align="center">Address</TableCell>
                     <TableCell align="center">Contact</TableCell>
                     <TableCell align="center">Amount</TableCell>
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
                        <TableCell align="center" sx={{ fontFamily: 'monospace' }}>#{property.ownerId.slice(-6)}</TableCell>
                        <TableCell align="center">{property.propertyType}</TableCell>
                        <TableCell align="center">{property.propertyAdType}</TableCell>
                        <TableCell align="center">{property.propertyAddress}</TableCell>
                        <TableCell align="center">{property.ownerContact}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>₹{property.propertyAmt}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default AllProperty;
