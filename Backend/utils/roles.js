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