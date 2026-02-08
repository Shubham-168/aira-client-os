'use client';

import React, { useState, useCallback } from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout, useDeleteAccount, authStore, queryClient } from '@repo/core';
import { webTokenStorage } from '@/lib/api';
import { clearAllDevAuthStorage } from '@/lib/dev-mock-auth';
import { ROUTES } from '@/lib/constants';

interface UserMenuProps {
  userName?: string;
  userAvatar?: string;
  className?: string;
}

export function UserMenu({
  userName = 'User',
  userAvatar,
  className,
}: UserMenuProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handleLogout = useCallback(() => {
    logout(undefined, {
      onSuccess: () => {
        router.push('/signin');
      },
      onError: error => {
        console.error('Logout failed:', error);
      },
    });
  }, [logout, router]);

  const handleDeleteAccount = useCallback(() => {
    if (process.env.NODE_ENV !== 'production') {
      setShowDeleteDialog(false);
      authStore.getState().clear();
      clearAllDevAuthStorage();
      queryClient.clear();
      webTokenStorage.clear();
      router.push(ROUTES.SIGNIN);
      return;
    }
    deleteAccount(undefined, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        router.push(ROUTES.SIGNIN);
      },
      onError: error => {
        console.error('Delete account failed:', error);
      },
    });
  }, [deleteAccount, router]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={className}>
            <Avatar className="h-12 w-12 border-2 border-border cursor-pointer hover:border-primary/50 transition-colors">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone. All your data, including rules and settings, will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
