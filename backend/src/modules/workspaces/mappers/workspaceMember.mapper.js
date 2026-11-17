export const toWorkspaceMemberResponse = (membership) => {
    return {
        _id: membership._id,
        user: {
            _id: membership.user._id,
            name: membership.user.name,
            email: membership.user.email,
        },
        role: membership.role,
        joinedAt: membership.joinedAt,
    };
};