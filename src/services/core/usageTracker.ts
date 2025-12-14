
export interface UserUsageStats {
    // Lifetime
    totalCost: number;
    totalRequests: number;

    // Daily
    lastRequestDate: string; // YYYY-MM-DD
    dailyCost: number;
    dailyRequests: number;

    // Counts by type (Lifetime)
    textRequests: number;
    imageRequests: number;
    videoRequests: number;
}

export interface GlobalUsageData {
    [userId: string]: UserUsageStats;
}

const STORAGE_KEY = 'vitrinex_api_usage_v2';

// Estimated costs (USD)
export const COSTS = {
    TEXT_REQUEST: 0.0001,
    IMAGE_REQUEST: 0.04,
    VIDEO_REQUEST: 0.10,
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const getAllUsageStats = (): GlobalUsageData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return {};
};

export const getUserUsageStats = (userId: string): UserUsageStats => {
    const allStats = getAllUsageStats();
    if (!allStats[userId]) {
        return {
            totalCost: 0,
            totalRequests: 0,
            lastRequestDate: getTodayDate(),
            dailyCost: 0,
            dailyRequests: 0,
            textRequests: 0,
            imageRequests: 0,
            videoRequests: 0
        };
    }

    // Check date rollover
    const today = getTodayDate();
    if (allStats[userId].lastRequestDate !== today) {
        allStats[userId].lastRequestDate = today;
        allStats[userId].dailyCost = 0;
        allStats[userId].dailyRequests = 0;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allStats));
    }

    return allStats[userId];
};

export const trackUsage = (userId: string, type: 'text' | 'image' | 'video') => {
    const allStats = getAllUsageStats();
    const today = getTodayDate();

    if (!allStats[userId]) {
        allStats[userId] = {
            totalCost: 0,
            totalRequests: 0,
            lastRequestDate: today,
            dailyCost: 0,
            dailyRequests: 0,
            textRequests: 0,
            imageRequests: 0,
            videoRequests: 0
        };
    }

    const stats = allStats[userId];

    // Rollover check
    if (stats.lastRequestDate !== today) {
        stats.lastRequestDate = today;
        stats.dailyCost = 0;
        stats.dailyRequests = 0;
    }

    let cost = 0;
    if (type === 'text') {
        stats.textRequests++;
        cost = COSTS.TEXT_REQUEST;
    } else if (type === 'image') {
        stats.imageRequests++;
        cost = COSTS.IMAGE_REQUEST;
    } else if (type === 'video') {
        stats.videoRequests++;
        cost = COSTS.VIDEO_REQUEST;
    }

    stats.totalCost += cost;
    stats.totalRequests++;
    stats.dailyCost += cost;
    stats.dailyRequests++;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allStats));
};

export const resetUserUsageStats = (userId: string) => {
    const allStats = getAllUsageStats();
    const today = getTodayDate();

    allStats[userId] = {
        totalCost: 0,
        totalRequests: 0,
        lastRequestDate: today,
        dailyCost: 0,
        dailyRequests: 0,
        textRequests: 0,
        imageRequests: 0,
        videoRequests: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allStats));
    return allStats[userId];
};

export const resetAllUsageStats = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    return {};
};

// Calculate global totals from individual users
export const getGlobalUsageSummary = () => {
    const allStats = getAllUsageStats();
    let totalCost = 0;
    let textRequests = 0;
    let imageRequests = 0;
    let videoRequests = 0;

    Object.values(allStats).forEach(userStats => {
        totalCost += userStats.totalCost;
        textRequests += userStats.textRequests;
        imageRequests += userStats.imageRequests;
        videoRequests += userStats.videoRequests;
    });

    return { totalCost, textRequests, imageRequests, videoRequests };
}
