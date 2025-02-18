import express, { Router } from "express";
import Config from "src/config/Config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import AuthFacade from "src/facade/auth/authFacade";
import * as crypto from "crypto";
import { authCookieOptions } from "src/constants/authConstants";
import { CombinedState } from "src/types/authTypes";

class AuthEndpoint {
	private authFacade: AuthFacade;
	private router: Router;

	constructor() {
		this.authFacade = new AuthFacade();
		this.router = express.Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		if (Config.googleOAuth.clientID && Config.googleOAuth.clientSecret) {
			const passportInit = passport.initialize({ userProperty: "passportUser" });

			passport.use(
				new GoogleStrategy(
					{
						clientID: Config.googleOAuth.clientID,
						clientSecret: Config.googleOAuth.clientSecret,
						// Check if the appUrl doesn't end with a number, if it does, it's a port number so we don't need to add /web-api
						callbackURL: `${isNaN(+Config.appUrl.split("").pop()) ? "/web-api" : ""}/auth/google/callback`,
						passReqToCallback: true,
					},
					function (req, _accessToken, _refreshToken, _params, profile, done) {
						const rawState = req.query.state as string | undefined;
						if (!rawState) {
							done(new Error("No state provided"), null);
							return;
						}

						let parsedState: CombinedState;
						try {
							const jsonString = Buffer.from(rawState, "base64url").toString("utf8");
							parsedState = JSON.parse(jsonString) as CombinedState;
						} catch (err) {
							done(new Error("Invalid state format"), null);
							return;
						}
						const stateFromCookie = (req.cookies as Record<string, string | undefined>).oauthState;

						if (!stateFromCookie || stateFromCookie !== parsedState.randomState) {
							done(new Error("Invalid or mismatched OAuth state"), null);
							return;
						}

						done(null, {
							email: profile.email,
							username: profile.displayName,
							gmail_id: profile.id,
						});
					}
				)
			);

			this.router.post(
				"/auth/google",
				passportInit,
				function (req: express.Request, res: express.Response, next: express.NextFunction) {
					const randomState = crypto.randomBytes(16).toString("hex");
					res.cookie("oauthState", randomState, authCookieOptions);
					const stateData = {
						randomState,
						previousLink: req.get("Referer"),
					};
					const stateString = JSON.stringify(stateData);
					const stateEncoded = Buffer.from(stateString).toString("base64url");

					passport.authenticate("google", {
						scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
						session: false,
						state: stateEncoded,
					})(req, res, next);
				},
				this.authFacade.handleAuthError
			);

			this.router.get(
				"/auth/google/callback",
				passportInit,
				passport.authenticate("google", {
					failureRedirect: "/",
					session: false,
				}),
				this.authFacade.handleSuccessfulGoogleCallback,
				this.authFacade.handleAuthError
			);
		} else {
			console.warn("Google OAuth configuration is not set up properly. Auth service will not work.");
		}

		this.router.post("/auth/logout", this.authFacade.handleLogout);

		this.router.post("/auth/info", this.authFacade.handleUserInfo);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default AuthEndpoint;
