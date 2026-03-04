# TSK-3.2 Integration Guide: Frontend ↔ BFF Auth0 Flow

## Current Status

### ✅ **TSK-3.2 COMPLETED - Core Auth0 Integration Working**

**Critical Path Components (No TS Errors):**
- ✅ AuthService with BFF integration
- ✅ AuthController with FEN response handling  
- ✅ AuthStore with MobX state management
- ✅ useAuth0Login hook with proper Auth0 configuration
- ✅ Auth0LoginButton with reactive UI
- ✅ API interceptors updated for new AuthStore

### 🔄 **Legacy Migration Pending (Non-blocking)**

The following files still reference the old `useAuthStore` and will need migration in future phases:
- `app/(tabs)/index.tsx`
- `app/(tabs)/profile.tsx` 
- `app/_layout.tsx`
- `src/components/Navbar.tsx`
- `src/features/auth/components/GoogleLoginButton.tsx`
- `src/features/auth/hooks/useTempLogin.ts`
- `src/features/groups/components/CreateGroup.tsx`
- `src/features/groups/services/groups.service.ts`
- `src/features/students/hooks/useProfile.ts`
- `src/features/students/services/student.service.ts`

**Note**: These legacy references do not affect the new Auth0 flow and can be migrated incrementally.

**1. AuthService (`src/features/auth/services/auth.service.ts`)**
- `exchangeAuthorizationCode()` method implemented
- Calls BFF endpoint: `POST http://localhost:8007/api/auth/callback`
- Handles FEN-formatted responses

**2. AuthController (`src/features/auth/controllers/AuthController.ts`)**
- `handleAuthorizationCode()` method fully implemented
- Integrates with BFF via AuthService
- Handles FEN response validation
- Updates AuthStore with user data and tokens
- Includes navigation to authenticated area
- Comprehensive error handling

**3. AuthStore (`src/features/auth/store/AuthStore.ts`)**
- Enhanced to handle FEN response data
- Added Auth0 tokens storage for refresh token flow (TSK-4.2)
- MobX reactive state management
- Additional methods for better state control

**4. Auth0LoginButton (`src/features/auth/components/Auth0LoginButton.tsx`)**
- Updated with reactive state management
- Temporary polling solution (will use MobX observer when TS issues resolved)
- Shows authenticated/unauthenticated states

## Authentication Flow (End-to-End)

```
1. User clicks "Ingresar con Auth0" button
   ↓
2. useAuth0Login hook opens Auth0 Universal Login
   ↓
3. User authenticates with Auth0
   ↓
4. Auth0 redirects with authorization code
   ↓
5. useAuth0Login receives code and calls AuthController.handleAuthorizationCode()
   ↓
6. AuthController calls AuthService.exchangeAuthorizationCode()
   ↓
7. AuthService sends POST to http://localhost:8007/api/auth/callback
   ↓
8. BFF exchanges code for tokens with Auth0
   ↓
9. BFF returns FEN-formatted response with user profile
   ↓
10. AuthController validates FEN response
    ↓
11. AuthController updates AuthStore with user data
    ↓
12. AuthController navigates to /(tabs)
    ↓
13. UI updates to show authenticated state
```

## FEN Response Format Expected

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Authentication successful",
  "data": {
    "access_token": "local_jwt_token_with_permissions",
    "user": {
      "id_user": 1,
      "id_role": 2,
      "full_name": "John Doe",
      "email": "john.doe@ucaldas.edu.co",
      "picture": "https://example.com/avatar.jpg"
    },
    "auth0_tokens": {
      "access_token": "auth0_access_token",
      "id_token": "auth0_id_token",
      "refresh_token": "auth0_refresh_token",
      "expires_in": 3600
    }
  }
}
```

## Error Handling

- **Network errors**: Caught and displayed via toast
- **Invalid FEN format**: Validated and error shown
- **Auth0 errors**: Passed through from BFF
- **Domain validation**: Handled by BFF (@ucaldas.edu.co only)

## Testing the Integration

1. **Start Backend**: `cd Uniconnect-Backend-Core && npm run start:dev`
2. **Start Frontend**: `cd Uniconnect-Frontend && npm start`
3. **Test Flow**: Click Auth0 login button and complete authentication

## Next Steps (TSK-4.1 & TSK-4.2)

- **TSK-4.1**: Standardize buttons under WebForge Elements
- **TSK-4.2**: Implement refresh token flow using stored auth0_tokens
- **MobX Observer**: Re-enable when TypeScript configuration is resolved

## Architecture Compliance

✅ **Kiro Framework MVC Local**: Controller handles business logic, Store manages state, View is pure UI
✅ **BFF Pattern**: All Auth0 communication goes through backend proxy
✅ **FEN Protocol**: All responses follow strict FEN format
✅ **Security**: Client secret stays on backend, authorization code flow with PKCE