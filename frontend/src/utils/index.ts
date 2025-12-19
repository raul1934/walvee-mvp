


export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

export function createProfileUrl(userId?: string) {
    if (!userId) {
        return '/profile';
    }
    return `/profile/${userId}`;
}

/**
 * Create city URL using country and city IDs
 * Example: (1, 42) -> "/1/42"
 */
export function createCityUrl(countryId: number | string, cityId: number | string): string {
    return `/${countryId}/${cityId}`;
}

/**
 * Create legacy city URL using city name (for backward compatibility)
 * Example: "San Diego, United States" -> "/City?name=San%20Diego%2C%20United%20States"
 */
export function createLegacyCityUrl(cityName: string): string {
    return `/City?name=${encodeURIComponent(cityName)}`;
}

/**
 * Parse city URL to extract country and city IDs
 * Example: "/1/42" -> { countryId: "1", cityId: "42" }
 */
export function parseCityUrl(pathname: string): { countryId: string | null, cityId: string | null } {
    const parts = pathname.split('/').filter(p => p);
    if (parts.length >= 2) {
        return {
            countryId: parts[0],
            cityId: parts[1]
        };
    }
    return { countryId: null, cityId: null };
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