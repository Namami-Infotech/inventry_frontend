import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/setupAxios.js';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || (token && isTokenExpired(token))) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        let userRole = (user.role || '').toLowerCase().trim();
        if (userRole === 'sales' || userRole === 'sales manager') {
            userRole = 'order manager';
        }
        if (userRole === 'warehouse manager' || userRole === 'store manager') {
            userRole = 'store manager';
        }
        const normalizedAllowedRoles = allowedRoles.map(r => {
            const role = r.toLowerCase().trim();
            if (role === 'sales' || role === 'sales manager') return 'order manager';
            if (role === 'warehouse manager' || role === 'store manager') return 'store manager';
            return role;
        });
        
        if (!normalizedAllowedRoles.includes(userRole)) {
            console.warn(`Access blocked: Role '${userRole}' is not allowed on this route.`);
            return <Navigate to="/login" replace />; 
        }
    }

    return children;
};

export default ProtectedRoute;



// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, allowedRoles }) => {

//     const storedUser = localStorage.getItem("user");

//     if (!storedUser) {
//         console.log("No user found");
//         return <Navigate to="/login" replace />;
//     }


//     const user = JSON.parse(storedUser);

//     const userRole = user?.role?.toLowerCase()?.trim();


//     const allowed = allowedRoles.map(role =>
//         role.toLowerCase().trim()
//     );


//     console.log("ProtectedRoute Debug:", {
//         userRole,
//         allowedRoles: allowed,
//         matched: allowed.includes(userRole)
//     });


//     if (!allowed.includes(userRole)) {
//         return <Navigate to="/login" replace />;
//     }


//     return children;
// };


// export default ProtectedRoute;