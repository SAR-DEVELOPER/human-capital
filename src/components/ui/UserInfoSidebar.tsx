// components/ui/UserInfoSidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Divider,
    Chip,
    Stack,
    Skeleton,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    AccountCircle as AccountIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
}

/**
 * UserInfoSidebar Component
 * Displays current logged-in user information in a sidebar panel
 * Fetches user data from auth/profile API endpoint
 */
export default function UserInfoSidebar() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Use Next.js API route to avoid CORS issues
                const res = await fetch('/api/auth/profile', {
                    method: 'GET',
                    credentials: 'include', // Important: include cookies for authentication
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch profile: ${res.status}`);
                }

                const data = await res.json();
                console.log('Profile data loaded in sidebar:', data);

                if (data && (data.identity || data.jwt)) {
                    // Extract data from the nested structure
                    const identity = data.identity || {};
                    const jwt = data.jwt || {};

                    setProfileData({
                        id: identity.id || "",
                        name: identity.name || jwt.name || "User",
                        email: identity.email || jwt.email || "",
                        role: identity.jobTitle || jwt.role || "",
                        department: identity.department || ""
                    });
                    setError(null);
                } else {
                    throw new Error('Invalid profile data structure');
                }
            } catch (err) {
                console.error('Failed to load profile in sidebar:', err);
                setError(err instanceof Error ? err.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // Generate avatar initials from name
    const getInitials = (name: string): string => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Generate consistent color from string
    const stringToColor = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 65%, 50%)`;
    };

    if (loading) {
        return (
            <Card
                elevation={2}
                sx={{
                    position: 'sticky',
                    top: 24,
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2} alignItems="center">
                        <Skeleton variant="circular" width={80} height={80} />
                        <Skeleton variant="text" width="80%" height={30} />
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="rectangular" width="100%" height={40} />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    if (error || !profileData) {
        return (
            <Card
                elevation={2}
                sx={{
                    position: 'sticky',
                    top: 24,
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                }}
            >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <AccountIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                        Not logged in
                    </Typography>
                    {error && (
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {error}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    }

    const avatarColor = stringToColor(profileData.name);

    return (
        <Card
            elevation={2}
            sx={{
                position: 'sticky',
                top: 24,
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                },
            }}
        >
            {/* Header with gradient */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}dd 100%)`,
                    p: 3,
                    pb: 4,
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: 'white',
                        opacity: 0.9,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                    }}
                >
                    Current User
                </Typography>
            </Box>

            {/* Avatar positioned to overlap header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: -5,
                    mb: 2,
                }}
            >
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: avatarColor,
                        fontSize: 32,
                        fontWeight: 700,
                        border: '4px solid white',
                        boxShadow: 3,
                    }}
                >
                    {getInitials(profileData.name)}
                </Avatar>
            </Box>

            <CardContent sx={{ px: 3, pb: 3, pt: 0 }}>
                {/* User Name */}
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 600,
                        mb: 0.5,
                        color: 'text.primary',
                    }}
                >
                    {profileData.name}
                </Typography>

                {/* Role & Department Chips */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                    {profileData.role && (
                        <Chip
                            icon={<WorkIcon />}
                            label={profileData.role}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                        />
                    )}
                    {profileData.department && (
                        <Chip
                            icon={<BusinessIcon />}
                            label={profileData.department}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                        />
                    )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* User Details */}
                <Stack spacing={1.5}>
                    {/* Email */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <EmailIcon
                            sx={{
                                fontSize: 20,
                                color: 'text.secondary',
                                mt: 0.25,
                            }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    letterSpacing: 0.5,
                                }}
                            >
                                Email
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.primary',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {profileData.email}
                            </Typography>
                        </Box>
                    </Box>

                    {/* User ID */}
                    {profileData.id && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <PersonIcon
                                sx={{
                                    fontSize: 20,
                                    color: 'text.secondary',
                                    mt: 0.25,
                                }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                        fontSize: '0.65rem',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    User ID
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.primary',
                                        wordBreak: 'break-word',
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {profileData.id}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

