export const getAvailableWorkPieceStatus = (role: string) => {
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

export const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'Pending';
        case 'cutting':
            return 'Cutting';
        case 'redaytostich':
            return 'Ready to Stitch';
        case 'stitching':
            return 'Stitching';
        case 'readytofinishing':
            return 'Ready to Finish';
        case 'finishing':
            return 'Finishing';
        case 'readytodeliver':
            return 'Ready to Deliver';
        case 'in_progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        default:
            return status;
    }
};

// Get allowed status transitions for a role
export const getAllowedStatusTransitions = (role: string): Record<string, string[]> => {
    if (role == 'superAdmin' || role == 'admin' || role == 'subAdmin') {
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
export const canTransitionStatus = (role: string, currentStatus: string, newStatus: string): boolean => {
    const transitions = getAllowedStatusTransitions(role);
    return transitions[currentStatus]?.includes(newStatus) || false;
}

// Get the next allowed status for current status based on role
export const getNextAllowedStatus = (role: string, currentStatus: string): string | null => {
    const transitions = getAllowedStatusTransitions(role);
    const allowedTransitions = transitions[currentStatus] || [];
    return allowedTransitions.length > 0 ? allowedTransitions[0] : null;
}

export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'cutting':
        case 'in_progress':
            return 'info';
        case 'redaytostich':
            return 'secondary';
        case 'stitching':
            return 'primary';
        case 'readytofinishing':
            return 'secondary';
        case 'finishing':
            return 'info';
        case 'readytodeliver':
        case 'completed':
            return 'success';
        default:
            return 'default';
    }
};