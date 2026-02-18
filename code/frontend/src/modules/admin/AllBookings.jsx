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

const AllBookings = () => {
   const [allBookings, setAllBookings] = useState([]);

   const getAllBooking = async () => {
      try {
         const response = await axios.get('http://localhost:8001/api/admin/getallbookings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         if (response.data.success) {
            setAllBookings(response.data.data);
         } else {
            message.error(response.data.message);
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      getAllBooking();
   }, []);

   return (
      <div className="p-3">
         <h4 className="section-title-modern">📋 All Bookings</h4>
         <TableContainer component={Paper} className="modern-table-container">
            <Table sx={{ minWidth: 650 }} aria-label="bookings table">
               <TableHead className="modern-table-head">
                  <TableRow>
                     <TableCell>Booking ID</TableCell>
                     <TableCell align="center">Owner ID</TableCell>
                     <TableCell align="center">Property ID</TableCell>
                     <TableCell align="center">Tenant ID</TableCell>
                     <TableCell align="center">Tenant Name</TableCell>
                     <TableCell align="center">Contact</TableCell>
                     <TableCell align="center">Status</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allBookings.map((booking) => (
                     <TableRow
                        key={booking._id}
                        className="modern-table-row"
                     >
                        <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace' }}>
                           #{booking._id.slice(-6)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'monospace' }}>#{booking.ownerID.slice(-6)}</TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'monospace' }}>#{booking.propertyId.slice(-6)}</TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'monospace' }}>#{booking.userID.slice(-6)}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>{booking.userName}</TableCell>
                        <TableCell align="center">{booking.phone}</TableCell>
                        <TableCell align="center">
                           <span className={`badge-modern ${booking.bookingStatus === 'pending' ? 'badge-pending' : booking.bookingStatus === 'booked' ? 'badge-booked' : 'badge-cancelled'}`}>
                              {booking.bookingStatus === 'pending' ? '⏳' : booking.bookingStatus === 'booked' ? '✅' : '❌'} {booking.bookingStatus}
                           </span>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default AllBookings;
