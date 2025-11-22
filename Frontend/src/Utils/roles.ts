export const getAvailableRoles = (role: string) => {
    if (role == 'superAdmin') {
        return ['admin'];
    } else if (role == 'admin') {
        return ['subAdmin'];
    } else if (role == 'subAdmin') {
        return [];
    }
    return [];
}