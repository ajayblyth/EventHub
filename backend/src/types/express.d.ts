//It means TypeScript declaration file.
// It is mainly used to describe/extend types, not to contain normal executable application code.


import type { JwtPayload } from "jsonwebtoken"; //JwtPayload is the TypeScript type representing a decoded JWT payload.

export interface AuthUser extends JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};

// Makes this file a TypeScript module
//         ↓
// Allows declare global to work correctly



/*JwtPayload — Theory

JwtPayload is a TypeScript type provided by the jsonwebtoken library.

It describes the data inside a decoded JWT.

For example:

{
  "userId": "123",
  "role": "attendee",
  "iat": 123456,
  "exp": 123999
}

After:

const decoded = jwt.verify(token, secret);

decoded contains this JWT payload.

So:
 
user?: string | JwtPayload;

tells TypeScript:

req.user can contain the decoded JWT payload.

In simple terms: JwtPayload = the type of the data we get after decoding/verifying the JWT.



declare global "I want to make a type change that applies globally in this project."


"The type I want to modify belongs to Express."
  namespace Express {
Express already has a Request type.

We want to add user to that existing Request.

user?: string | JwtPayload;

Means:

user → property name
? → optional; it may or may not exist
: → specifies the type
string | JwtPayload → user can be either a string OR a JwtPayload
*/