export const getAvailableRoles = (role) => {
    if (role == 'superAdmin') {
        return ['admin', 'subAdmin'];
    } else if (role == 'admin') {
        return ['subAdmin', 'cutter', 'stitcher', 'finisher', 'deliveryBoy', 'accountant'];
    } else if (role == 'subAdmin') {
        return ['cutter', 'stitcher', 'finisher', 'deliveryBoy', 'accountant']; // SubAdmin can create users with these roles
    }
    return []; // default case
}

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