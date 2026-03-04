import React from 'react';
import { Auth0LoginContainer } from '../containers/Auth0LoginContainer';

/**
 * Auth0LoginButton - WebForge Elements Pattern (TSK-4.1)
 * 
 * This component now delegates to the Auth0LoginContainer which follows
 * the WebForge Elements architecture:
 * 
 * - Container (Auth0LoginContainer): Handles business logic and state
 * - Element (AuthButton): Pure UI component with no dependencies
 * 
 * This achieves absolute decoupling of logic from UI components
 */
export const Auth0LoginButton = () => {
  return <Auth0LoginContainer />;
};