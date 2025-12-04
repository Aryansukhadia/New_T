
export const getAvailableWorkPieceStatus = (role) => {
    if (role == 'superAdmin') {
        return ['pending', 'underCutting', 'redayToStich', 'underStitching', 'readyToFinishing', 'underFinishing', 'readyToDeliver'];
    } else if (role == 'admin') {
        return ['pending', 'underCutting', 'redayToStich', 'underStitching', 'readyToFinishing', 'underFinishing', 'readyToDeliver'];
    } else if (role == 'subAdmin') {
        return ['pending', 'underCutting', 'redayToStich', 'underStitching', 'readyToFinishing', 'underFinishing', 'readyToDeliver'];
    } else if (role == 'cutter') {
        return ['pending', 'underCutting'];
    } else if (role == 'stitcher') {
        return ['redayToStich', 'underStitching'];
    } else if (role == 'finisher') {
        return ['readyToFinishing', 'underFinishing'];
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
            'pending': ['underCutting'],
            'underCutting': ['redayToStich'],
            'redayToStich': ['underStitching'],
            'underStitching': ['readyToFinishing'],
            'readyToFinishing': ['underFinishing'],
            'underFinishing': ['readyToDeliver'],
            'readyToDeliver': []
        };
    } else if (role == 'cutter') {
        return {
            'pending': ['underCutting'],
            'underCutting': ['redayToStich']
        };
    } else if (role == 'stitcher') {
        return {
            'redayToStich': ['underStitching'],
            'underStitching': ['readyToFinishing']
        };
    } else if (role == 'finisher') {
        return {
            'readyToFinishing': ['underFinishing'],
            'underFinishing': ['readyToDeliver']
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
