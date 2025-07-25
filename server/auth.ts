import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";

declare global {
  namespace Express {
    // Define User interface properly to avoid circular reference
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      name: string | null;
      created: Date;
      isAdmin: boolean | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "digital-village-ai-buddy-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for Docker HTTP environment
      httpOnly: true, // Prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax', // Allow cross-origin requests with credentials
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log('User not found');
          return done(null, false);
        }
        
        const passwordMatches = await comparePasswords(password, user.password);
        console.log(`Password match result: ${passwordMatches}`);
        
        if (!passwordMatches) {
          return done(null, false);
        } else {
          console.log(`Login successful for user: ${username}, isAdmin: ${user.isAdmin}`);
          return done(null, user);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user?.isAdmin === true) {
      return next();
    }
    res.status(403).json({ message: "Requires admin privileges" });
  };


  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, name, isAdmin = false } = req.body; // Added isAdmin field

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        name: name || null,
        isAdmin, // Added isAdmin to user creation
      });

      // Log user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: UserType | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          message: "Invalid username or password",
        });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({
        message: "Logged out successfully",
      });
    });
  });

  app.get("/api/user", isAuthenticated, (req, res) => {
    res.status(200).json(req.user);
  });

  //Example admin route
  app.get("/api/admin/dashboard", isAuthenticated, isAdmin, (req, res) => {
    res.status(200).json({ message: "Admin Dashboard" });
  });
}