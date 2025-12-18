


export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

export function createProfileUrl(userId?: string) {
    if (!userId) {
        return '/profile';
    }
    return `/profile/${userId}`;
}

export function requireAuth(
    user: any,
    onAuthenticated: () => void
) {
    if (user) {
        onAuthenticated();
    }
    // If not authenticated, the 401 interceptor will handle showing login modal
}