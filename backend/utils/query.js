// Reads ?page and ?limit safely
const getPagination = (query, defaultLimit = 12) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 50);
    return { page, limit, skip: (page - 1) * limit };
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Case-insensitive "contains" search across several fields
const searchFilter = (search, fields) => {
    if (!search || !search.trim()) return {};
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    return { $or: fields.map((f) => ({ [f]: regex })) };
};

// Copies only the allowed keys that are present in body
const pick = (body, keys) =>
    keys.reduce((acc, key) => {
        if (body[key] !== undefined) acc[key] = body[key];
        return acc;
    }, {});

const AUTHOR_FIELDS = "username avatar bio location createdAt";

module.exports = { getPagination, searchFilter, pick, AUTHOR_FIELDS };
