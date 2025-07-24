import {Avatar} from "@mui/material";

// get the initial characters of fullName
function getInitials(fullName: string): string {
    if (!fullName) return '';

    const words = fullName.trim().split(/\s+/);
    const first = words[0]?.[0] || '';
    const last = words[words.length - 1]?.[0] || '';

    return (first + last).toUpperCase();
}

// get random color based on fullName
function stringToColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color: string = '#' + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
    return color;
}

interface AvatarDefaultProps {
    fullName: string,
    width?: number | string,
    height?: number | string,
    mr?: number | string
}

export default function AvatarDefault({fullName, width=40, height=40, mr=2}: AvatarDefaultProps) {
    return (
        <Avatar sx={{backgroundColor: stringToColor(fullName), width, height, mr}}>
            {getInitials(fullName)}
        </Avatar>
    )
}