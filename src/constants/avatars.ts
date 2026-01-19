export const AVATAR_OPTIONS = [
    { id: 'farmer_green', label: '농부', icon: 'face-man-profile', color: '#10B981', bg: '#ECFDF5' }, // Green
    { id: 'farmer_woman', label: '여성 농부', icon: 'face-woman-profile', color: '#F97316', bg: '#FFEDD5' }, // Orange
    { id: 'expert', label: '전문가', icon: 'face-man-shimmer', color: '#3B82F6', bg: '#DBEAFE' }, // Blue
    { id: 'grandpa', label: '어르신', icon: 'face-man', color: '#EAB308', bg: '#FEF9C3' }, // Yellow
    { id: 'grandma', label: '베테랑', icon: 'face-woman', color: '#EC4899', bg: '#FCE7F3' }, // Pink
    { id: 'tech', label: '스마트', icon: 'robot-happy-outline', color: '#6366F1', bg: '#E0E7FF' }, // Indigo
];

export const getAvatarById = (id: string) => {
    return AVATAR_OPTIONS.find(avatar => avatar.id === id) || AVATAR_OPTIONS[0];
};
