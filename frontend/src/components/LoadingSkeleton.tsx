import { Box, Card, CardContent, Grid2, Skeleton } from '@mui/material';
import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'list' | 'detail';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'list' }) => {
  if (variant === 'detail') {
    return (
      <Grid2 container spacing={4} className="animate-pulse">
        {/* Left Column: Note Details */}
        <Grid2 size={{ xs: 12, md: 8 }} className="flex flex-col gap-6">
          <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <CardContent className="p-6">
              <Skeleton variant="text" width="40%" height={28} className="bg-slate-700 mb-4" />
              <Skeleton variant="text" width="90%" className="bg-slate-700 mb-2" />
              <Skeleton variant="text" width="85%" className="bg-slate-700 mb-2" />
              <Skeleton variant="text" width="60%" className="bg-slate-700" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <CardContent className="p-6">
              <Skeleton variant="text" width="50%" height={28} className="bg-slate-700 mb-4" />
              <Skeleton variant="text" width="95%" className="bg-slate-700 mb-2" />
              <Skeleton variant="text" width="90%" className="bg-slate-700 mb-2" />
              <Skeleton variant="text" width="80%" className="bg-slate-700" />
            </CardContent>
          </Card>
        </Grid2>

        {/* Right Column: Sidebar */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <CardContent className="p-5 flex flex-col gap-4">
              <Skeleton variant="text" width="60%" className="bg-slate-700 mb-2" />
              <Box className="flex flex-col gap-2">
                <Skeleton variant="rectangular" height={40} className="bg-slate-700 rounded-md" />
                <Skeleton variant="rectangular" height={40} className="bg-slate-700 rounded-md" />
                <Skeleton variant="rectangular" height={40} className="bg-slate-700 rounded-md" />
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    );
  }

  return (
    <Grid2 container spacing={3} className="animate-pulse">
      {Array.from({ length: 6 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card className="bg-slate-800/40 border border-slate-700/50 rounded-xl h-44">
            <CardContent className="p-5 flex flex-col gap-4">
              <Box className="flex justify-between items-center">
                <Skeleton variant="text" width="40%" height={20} className="bg-slate-700" />
                <Skeleton
                  variant="rectangular"
                  width="60"
                  height={24}
                  className="bg-slate-700 rounded-md"
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Skeleton variant="text" width="90%" className="bg-slate-700" />
                <Skeleton variant="text" width="85%" className="bg-slate-700" />
              </Box>
              <Skeleton variant="text" width="30%" className="bg-slate-700 self-end mt-auto" />
            </CardContent>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );
};
