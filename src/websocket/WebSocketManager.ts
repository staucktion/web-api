import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Config from "src/config/Config";
import Logger from "src/log/Logger";
import AuthService from "src/service/auth/authService";
import UserDto from "src/dto/auth/UserDto";

declare module "socket.io" {
	interface Socket {
		user?: UserDto;
	}
}

class WebSocketManager {
	private io: SocketServer;
	private authService: AuthService;

	constructor(httpServer: HttpServer) {
		this.authService = new AuthService();
		this.io = new SocketServer(httpServer, {
			cors: {
				origin: Config.appUrl,
				credentials: true,
			},
			path: "/socket.io",
			transports: ["websocket", "polling"],
		});

		this.initialize();
	}

	private async authenticateSocket(socket: Socket): Promise<void> {
		try {
			const cookies = socket.handshake.headers.cookie;
			if (!cookies) {
				Logger.info(`WebSocket client ${socket.id} connected without authentication`);
				return;
			}

			// Parse cookies string to get token
			const cookiePairs = cookies.split(";").map((cookie) => cookie.trim().split("="));
			const tokenCookie = cookiePairs.find(([key]) => key === "token");

			if (!tokenCookie) {
				Logger.info(`WebSocket client ${socket.id} connected without token`);
				return;
			}

			const token = decodeURIComponent(tokenCookie[1]);
			const tokenContent = this.authService.verifyJWT(token);

			if (!tokenContent) {
				Logger.warn(`WebSocket client ${socket.id} provided invalid token`);
				return;
			}

			const user = await this.authService.getUser({ gmail_id: tokenContent.gmail_id });

			if (user) {
				socket.user = user;
				// Join a room specific to this user
				socket.join(`user:${user.id}`);
				Logger.info(`WebSocket client ${socket.id} authenticated as user ${user.id}`);
			}
		} catch (error) {
			Logger.error(`Error authenticating WebSocket client ${socket.id}: ${error}`);
		}
	}

	private initialize(): void {
		this.io.on("connection", async (socket: Socket) => {
			Logger.info(`WebSocket client connected: ${socket.id}`);

			// Authenticate the socket connection
			await this.authenticateSocket(socket);

			// Allow clients to join rooms
			socket.on("joinRoom", (room: string) => {
				socket.join(room);
				Logger.info(`Socket ${socket.id} joined room: ${room}`);
			});

			// Allow clients to leave rooms
			socket.on("leaveRoom", (room: string) => {
				socket.leave(room);
				Logger.info(`Socket ${socket.id} left room: ${room}`);
			});

			socket.on("disconnect", () => {
				Logger.info(`WebSocket client disconnected: ${socket.id}`);
			});
		});
	}

	// Method to broadcast a message to all connected clients
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public broadcast(event: string, data: any): void {
		this.io.emit(event, data);
	}

	// Method to send a message to a specific client
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public sendToClient(socketId: string, event: string, data: any): void {
		this.io.to(socketId).emit(event, data);
	}

	// Method to send a message to a specific user by their user ID
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public sendToUser(userId: number, event: string, data: any): void {
		this.io.to(`user:${userId}`).emit(event, data);
	}

	// Method to send a message to a specific room
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public sendToRoom(room: string, event: string, data: any): void {
		this.io.to(room).emit(event, data);
	}

	// Method to get all authenticated sockets
	public getAuthenticatedSockets(): Socket[] {
		return Array.from(this.io.sockets.sockets.values()).filter((socket): socket is Socket & { user: UserDto } => socket.user !== undefined);
	}
}

export default WebSocketManager;
