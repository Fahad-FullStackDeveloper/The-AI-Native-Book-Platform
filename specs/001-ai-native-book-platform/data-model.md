# Data Model: Authentication System

## User Entity

**Description**: Represents a registered user of the book platform

**Fields**:
- `id` (string): Unique identifier for the user (UUID)
- `email` (string): User's email address (required, unique)
- `name` (string): User's full name (optional)
- `password` (string): Hashed password (required for email/password auth)
- `createdAt` (timestamp): Account creation date
- `updatedAt` (timestamp): Last update timestamp
- `backgroundSoftware` (string): User's software experience level (beginner, intermediate, advanced)
- `backgroundHardware` (string): User's hardware experience level (beginner, intermediate, advanced)
- `backgroundDescription` (string): Additional background information (optional)
- `isEmailVerified` (boolean): Whether the user's email has been verified
- `preferences` (json): User preferences for content personalization

**Relationships**:
- One-to-many with user interactions (questions asked to chatbot)
- One-to-many with personalized content settings

**Validation Rules**:
- Email must be valid email format
- Email must be unique
- Background fields must be from predefined options (beginner, intermediate, advanced)
- Password must meet minimum security requirements (8+ characters)

## Session Entity

**Description**: Represents an active user session

**Fields**:
- `id` (string): Unique session identifier
- `userId` (string): Reference to the user
- `expiresAt` (timestamp): Session expiration time
- `createdAt` (timestamp): Session creation time
- `ipAddress` (string): IP address of the session
- `userAgent` (string): Browser/device information

**Relationships**:
- Many-to-one with User (many sessions per user)

## BackgroundQuestion Entity

**Description**: Represents questions asked during signup to gather user background

**Fields**:
- `id` (string): Unique identifier for the question
- `questionText` (string): The text of the question
- `questionType` (string): Type of question (multiple-choice, text, etc.)
- `options` (array): Available options for multiple-choice questions
- `isRequired` (boolean): Whether this question is required

**Note**: This entity may be primarily defined in application code rather than database, depending on implementation approach.

## PersonalizationSettings Entity

**Description**: Stores content personalization preferences for each user

**Fields**:
- `id` (string): Unique identifier for the setting
- `userId` (string): Reference to the user
- `moduleId` (string): Reference to the module/chapter
- `personalizationLevel` (string): Level of personalization (basic, intermediate, advanced)
- `preferredLanguage` (string): Preferred language for content (default: English)
- `createdAt` (timestamp): Creation time
- `updatedAt` (timestamp): Last update time

**Relationships**:
- Many-to-one with User (many personalization settings per user)