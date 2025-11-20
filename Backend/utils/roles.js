export const getAvailableRoles = (role) => {
    if (role == 'superAdmin') {
        return ['admin', 'subAdmin'];
    } else if (role == 'admin') {
        return ['subAdmin'];
    } else if (role == 'subAdmin') {
        return []; // no roles available
    }
    return []; // default case
}