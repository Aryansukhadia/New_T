
export const getAvailableWorkPieceStatus = (role) => {
    if (role == 'superAdmin') {
        return ['pending', 'cutting', 'redayToStich', 'stitching', 'readyToFinishing', 'finishing', 'readyToDeliver'];
    } else if (role == 'admin') {
        return ['pending', 'cutting', 'redayToStich', 'stitching', 'readyToFinishing', 'finishing', 'readyToDeliver'];
    } else if (role == 'subAdmin') {
        return ['pending', 'cutting', 'redayToStich', 'stitching', 'readyToFinishing', 'finishing', 'readyToDeliver'];
    } else if (role == 'cutter') {
        return ['pending', 'cutting'];
    } else if (role == 'stitcher') {
        return ['redayToStich', 'stitching'];
    } else if (role == 'finisher') {
        return ['readyToFinishing', 'finishing'];
    } else if (role == 'deliveryBoy') {
        return ['readyToDeliver'];
    } else if (role == 'accountant') {
        return [];
    }
    return [];
}


// Define allowed status transitions for each role
export const getAllowedStatusTransitions = (role) => {
    if (role == 'superAdmin' || role == 'admin' || role == 'subAdmin') {
        // Admins can perform all transitions
        return {
            'pending': ['cutting'],
            'cutting': ['redayToStich'],
            'redayToStich': ['stitching'],
            'stitching': ['readyToFinishing'],
            'readyToFinishing': ['finishing'],
            'finishing': ['readyToDeliver'],
            'readyToDeliver': []
        };
    } else if (role == 'cutter') {
        return {
            'pending': ['cutting'],
            'cutting': ['redayToStich']
        };
    } else if (role == 'stitcher') {
        return {
            'redayToStich': ['stitching'],
            'stitching': ['readyToFinishing']
        };
    } else if (role == 'finisher') {
        return {
            'readyToFinishing': ['finishing'],
            'finishing': ['readyToDeliver']
        };
    } else if (role == 'deliveryBoy') {
        return {
            'readyToDeliver': []
        };
    }
    return {};
}

// Check if a status transition is allowed for a role
export const canTransitionStatus = (role, currentStatus, newStatus) => {
    const transitions = getAllowedStatusTransitions(role);
    return transitions[currentStatus]?.includes(newStatus) || false;
}
