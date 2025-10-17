# Firebase Security Rules Deployment Guide

## Overview
This guide explains how to deploy the Firebase security rules that include admin code validation and comprehensive role-based access control.

## Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized: `firebase init`
3. Logged into Firebase: `firebase login`

## Deploying Security Rules

### 1. Deploy Firestore Rules
```bash
# Deploy the security rules
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

### 2. Verify Rules Deployment
After deployment, you can verify the rules in the Firebase Console:
1. Go to Firebase Console → Firestore Database → Rules
2. Check that the new rules are active
3. Test the rules using the Rules Playground

## Security Features Implemented

### 1. Admin Code Validation
- **Rule**: `isValidAdminCode(adminCode)` function validates admin code `993322`
- **Protection**: Prevents unauthorized admin account creation
- **Location**: Applied in user creation rules

### 2. Role-Based Access Control
- **Admin**: Full system access, user management, restaurant approval
- **Doctor**: Patient consultations, medical data access (requires verification)
- **Restaurant Owner**: Menu management, order handling
- **Patient**: Health features, food ordering, consultations

### 3. Data Protection
- Users can only read/update their own data
- Restaurant owners can only manage their own restaurants
- Doctors can only access their patients' data
- Admins have full access to all data

## Testing the Rules

### 1. Using Firebase Console Rules Playground
1. Go to Firebase Console → Firestore → Rules
2. Click "Rules playground"
3. Test different scenarios:
   - User trying to create admin account without code
   - User trying to access other users' data
   - Restaurant owner trying to access other restaurants

### 2. Test Cases to Verify

#### Admin Code Validation
```javascript
// This should FAIL
{
  "role": "admin",
  "adminCode": "wrong_code"
}

// This should SUCCEED
{
  "role": "admin", 
  "adminCode": "993322"
}
```

#### Role-Based Access
```javascript
// Patient trying to access admin functions - should FAIL
// Restaurant owner trying to access other restaurants - should FAIL
// Doctor trying to access non-patient data - should FAIL
```

## Monitoring and Maintenance

### 1. Rule Monitoring
- Monitor Firestore usage in Firebase Console
- Check for rule violations in Firebase Console → Functions → Logs
- Set up alerts for unusual access patterns

### 2. Updating Admin Code
To change the admin code:
1. Update `ADMIN_CODE` in `lib/adminValidation.ts`
2. Update the `isValidAdminCode` function in `firestore.rules`
3. Redeploy rules: `firebase deploy --only firestore:rules`

### 3. Adding New Roles
To add new roles:
1. Update role hierarchy in `lib/adminValidation.ts`
2. Add role checks in `firestore.rules`
3. Update client-side validation
4. Redeploy rules

## Security Best Practices

### 1. Regular Audits
- Review access logs monthly
- Test security rules quarterly
- Update admin codes periodically

### 2. Principle of Least Privilege
- Users only get access to what they need
- Admin functions are restricted to verified admins
- Sensitive data is protected by multiple layers

### 3. Defense in Depth
- Client-side validation (UX)
- Server-side validation (Security)
- Database rules (Final protection)
- Monitoring and logging (Detection)

## Troubleshooting

### Common Issues

#### 1. Rules Not Deploying
```bash
# Check Firebase project
firebase projects:list

# Reinitialize if needed
firebase init firestore
```

#### 2. Rules Syntax Errors
- Use Firebase Console Rules Playground to test syntax
- Check for missing semicolons or brackets
- Validate function definitions

#### 3. Access Denied Errors
- Verify user authentication status
- Check role assignments in user documents
- Ensure proper data structure

### Debug Commands
```bash
# Check current rules
firebase firestore:rules:get

# Test rules locally
firebase emulators:start --only firestore

# View deployment logs
firebase functions:log
```

## Additional Security Measures

### 1. Environment Variables
Store sensitive data in environment variables:
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CODE=993322
```

### 2. Firebase Functions
Consider using Firebase Functions for additional server-side validation:
```javascript
// functions/src/auth.js
exports.validateUserRegistration = functions.auth.user().onCreate(async (user) => {
  // Additional validation logic
});
```

### 3. Monitoring
Set up monitoring for:
- Failed authentication attempts
- Unusual access patterns
- Admin code usage
- Role escalation attempts

## Conclusion

The implemented security rules provide comprehensive protection for your Diabeto Maestro application. The admin code validation ensures only authorized users can create admin accounts, while role-based access control protects user data and system functionality.

Remember to:
- Test rules thoroughly before deployment
- Monitor system usage regularly
- Update security measures as the application grows
- Keep admin codes secure and change them periodically
