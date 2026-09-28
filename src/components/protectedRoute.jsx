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
        } else if (userRole === 'warehouse manager' || userRole === 'store manager') {
            userRole = 'store manager';
        } else if (userRole.includes('shift') || userRole.includes('incharge')) {
            userRole = 'shift incharge';
        } else if (userRole === 'super admin' || userRole === 'admin') {
            userRole = 'admin';
        }

        const normalizedAllowedRoles = allowedRoles.map(r => {
            const role = (r || '').toLowerCase().trim();
            if (role === 'sales' || role === 'sales manager') return 'order manager';
            if (role === 'warehouse manager' || role === 'store manager') return 'store manager';
            if (role.includes('shift') || role.includes('incharge')) return 'shift incharge';
            if (role === 'super admin' || role === 'admin') return 'admin';
            return role;
        });
        
        // Admin always permitted
        const hasAccess = userRole === 'admin' || normalizedAllowedRoles.includes(userRole);
        
        if (!hasAccess) {
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