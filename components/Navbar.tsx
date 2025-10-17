'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { LogOut, User, Settings, Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useEnhancedAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavigationItems = (role: string) => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard' },
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { href: '/admin', label: 'Admin Panel' },
          { href: '/consultations', label: 'Manage Doctors' },
          { href: '/food-ordering', label: 'Manage Restaurants' },
        ];
      case 'doctor':
        return [
          ...baseItems,
          { href: '/doctor-setup', label: 'My Profile' },
          { href: '/consultations', label: 'My Consultations' },
          { href: '/patients', label: 'My Patients' },
        ];
      case 'restaurant_owner':
        return [
          ...baseItems,
          { href: '/restaurant-setup', label: 'My Restaurant' },
          { href: '/food-ordering', label: 'Orders' },
        ];
      case 'patient':
      default:
        return [
          ...baseItems,
          { href: '/diets', label: 'Diet Plans' },
          { href: '/consultations', label: 'Book Consultation' },
          { href: '/exercises', label: 'Exercise' },
          { href: '/food-ordering', label: 'Order Food' },
          { href: '/my-orders', label: 'My Orders' },
          { href: '/meal-suggestions', label: 'Meal Suggestions' },
        ];
    }
  };

  const navigationItems = profile ? getNavigationItems(profile.role) : [];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md border-b relative z-50">
      <div className="page-content px-4 sm:px-6 lg:px-8">
        <div className="flex-between h-16">
          {/* Logo */}
          <div className="flex-start">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
              Diabeto Maestro
            </Link>
          </div>

          {/* Desktop Navigation */}
          {profile && (
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Account Switcher removed */}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ''} alt={profile?.name || ''} />
                      <AvatarFallback>
                        {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'restaurant_owner' && (
                    <DropdownMenuItem asChild>
                      <Link href="/restaurant-setup" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Restaurant Setup
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {profile && (
              <>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ''} alt={profile?.name || ''} />
                      <AvatarFallback>
                        {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'restaurant_owner' && (
                    <DropdownMenuItem asChild>
                      <Link href="/restaurant-setup" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Restaurant Setup
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop Auth Buttons */}
          {!profile && (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {profile ? (
                <>
                  {/* Navigation Items */}
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-mobile-link"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="nav-mobile-link"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="nav-mobile-link"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}