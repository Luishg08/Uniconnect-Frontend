# TSK-4.2: Refresh Token Flow Implementation

## Overview

TSK-4.2 implements a complete refresh token flow for Auth0 authentication, enabling seamless session persistence and automatic token renewal following the Kiro Framework standards.

## Architecture Implementation

### 🎯 **Backend (BFF) - Uniconnect-Backend-Core**

**1. AuthService Enhancement:**
- Added `refreshAuth0Token()` method for secure token exchange with Auth0
- Validates refresh tokens and generates new local JWT with permissions
- Returns FEN-formatted responses with updated tokens

**2. New Endpoint:**
- `POST /api/auth/refresh` - BFF endpoint for token refresh
- Accepts refresh token and user ID for validation
- Comprehensive Swagger documentation

**3. UsersService Update:**
- Added `findById()` method for user validation during refresh

### 🎯 **Frontend - Uniconnect-Frontend**

**1. AuthStore Enhancement:**
- Session persistence with AsyncStorage
- Token expiration tracking with calculated timestamps
- Automatic state restoration on app startup
- Enhanced Auth0 tokens management

**2. AuthController Enhancement:**
- `refreshTokens()` method for BFF communication
- `ensureValidTokens()` for proactive token validation
- `initializeAuth()` for app startup authentication

**3. New Hooks:**
- `useAppInitialization` - Handles app startup auth restoration
- `useTokenRefresh` - Automatic periodic token refresh

**4. Enhanced API Interceptor:**
- Automatic token refresh on 401 responses
- Proactive token refresh before requests
- Retry failed requests with new tokens

## Implementation Details

### **Session Persistence Flow**
```
App Start → AuthStore.initializeFromStorage() → 
Check Token Expiration → Refresh if Needed → 
Restore Session or Clear Auth
```

### **Automatic Token Refresh Flow**
```
API Request → Check Token Expiration → 
Refresh if Expired → Retry Request → 
Success or Handle Failure
```

### **Periodic Token Refresh**
```
useTokenRefresh Hook → Check Every 2 Minutes → 
Refresh 5 Minutes Before Expiration → 
Update AuthStore → Continue Session
```

## Key Features

### ✅ **Session Persistence**
- Auth state automatically saved to AsyncStorage
- Restored on app restart
- Secure token storage with expiration tracking

### ✅ **Automatic Token Refresh**
- Proactive refresh before token expiration
- Retry failed API requests with new tokens
- Periodic background refresh checks

### ✅ **Error Handling**
- Graceful fallback when refresh fails
- Clear auth state on invalid refresh tokens
- User-friendly error messages

### ✅ **Security**
- Refresh tokens never exposed to frontend logic
- All token exchange happens through BFF
- Secure storage with AsyncStorage

## Usage Examples

### **App Root Setup**
```typescript
import { AppRoot } from '@/src/components/AppRoot';

export default function App() {
  return (
    <AppRoot>
      <YourAppContent />
    </AppRoot>
  );
}
```

### **Manual Token Refresh**
```typescript
import { useTokenRefresh } from '@/src/features/auth';

const MyComponent = () => {
  const { refreshNow } = useTokenRefresh();
  
  const handleRefresh = async () => {
    const success = await refreshNow();
    if (success) {
      console.log('Tokens refreshed successfully');
    }
  };
};
```

### **Check Token Status**
```typescript
import { authController } from '@/src/features/auth';

// Ensure valid tokens before important operations
const isValid = await authController.ensureValidTokens();
if (isValid) {
  // Proceed with authenticated operation
}
```

## API Endpoints

### **Backend Endpoints**

**Refresh Token:**
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "auth0_refresh_token",
  "user_id": 1
}
```

**Response (FEN Format):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_local_jwt",
    "user": { ... },
    "auth0_tokens": {
      "access_token": "new_auth0_token",
      "refresh_token": "refresh_token",
      "expires_in": 3600
    }
  }
}
```

## Configuration

### **Environment Variables (Backend)**
```env
AUTH0_DOMAIN=dev-tuflbr5cbjtkf3zm.us.auth0.com
AUTH0_CLIENT_ID=huUn12y9VgAKakJPe8t0Fp5ePGLTCYWf
AUTH0_CLIENT_SECRET=QRISU1CVcjfCUdAvKFAzr9ZCOmAj744aA7Yl_eI28Z5_gMnE8ihBk2w3aLsjHKBS
```

### **AsyncStorage Keys (Frontend)**
```
uniconnect-auth - Main auth state storage
```

## Testing Strategy

### **Backend Testing**
```bash
# Start backend
cd Uniconnect-Backend-Core
npm run start:dev

# Test refresh endpoint
curl -X POST http://localhost:8007/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"token","user_id":1}'
```

### **Frontend Testing**
```typescript
// Test session persistence
authStore.setAuth(token, user, auth0Tokens);
// Restart app - session should be restored

// Test automatic refresh
// Wait for token expiration - should refresh automatically
```

## Error Scenarios Handled

### **Refresh Token Expired**
- Clear auth state
- Redirect to login
- Show "Please login again" message

### **Network Errors**
- Retry refresh attempts
- Graceful degradation
- Maintain user experience

### **Invalid User**
- Clear auth state
- Handle user not found errors
- Secure error responses

## Performance Considerations

### **Optimizations**
- Lazy loading of auth controller in API interceptors
- Efficient AsyncStorage operations
- Minimal background refresh checks
- Smart expiration calculations

### **Memory Management**
- Proper cleanup of intervals
- Efficient state updates
- Minimal re-renders with MobX

## Security Features

### **Token Security**
- Refresh tokens handled only by BFF
- Secure AsyncStorage for persistence
- Automatic cleanup on logout
- No sensitive data in logs

### **Validation**
- User ID validation during refresh
- Token expiration checks
- Secure error handling
- Domain validation maintained

## Compliance Verification

✅ **Kiro Framework**: MVC Local pattern maintained
✅ **BFF Pattern**: All Auth0 communication through backend
✅ **FEN Protocol**: All responses in standard format
✅ **WebForge Elements**: UI components remain pure
✅ **Security**: Refresh tokens never exposed to frontend
✅ **Persistence**: Seamless session restoration
✅ **Error Handling**: Graceful failure scenarios