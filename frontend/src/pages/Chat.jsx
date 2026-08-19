import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Chat = () => {
	const { userId } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const socketRef = useRef(null);
	const messagesEndRef = useRef(null);
	const [messages, setMessages] = useState([]);
	const [matchUser, setMatchUser] = useState(location.state?.matchUser || null);
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;

		const loadConversation = async () => {
			try {
				const response = await API.get(`/messages/${userId}`);
				if (active) {
					setMessages(response.data);
					if (!location.state?.matchUser && response.data.length > 0) {
						const firstMessage = response.data[0];
						const otherUser =
							(firstMessage.sender?._id || firstMessage.sender) === user?._id
								? firstMessage.receiver
								: firstMessage.sender;
						setMatchUser(otherUser);
					}
				}
			} catch (err) {
				if (active) {
					setError(err.response?.data?.message || "Unable to load messages");
				}
			} finally {
				if (active) setLoading(false);
			}
		};

		loadConversation();

		const socket = io(SOCKET_URL, {
			auth: { token: localStorage.getItem("token") },
		});
		socketRef.current = socket;

		socket.on("receiveMessage", (message) => {
			const senderId = message.sender?._id || message.sender;
			const receiverId = message.receiver?._id || message.receiver;
			if (
				(senderId === userId && receiverId === user?._id) ||
				(senderId === user?._id && receiverId === userId)
			) {
				setMessages((current) =>
					current.some((item) => item._id === message._id)
						? current
						: [...current, message],
				);
			}
		});

		socket.on("connect_error", () => {
			if (active) setError("Unable to connect to messaging");
		});

		return () => {
			active = false;
			socket.disconnect();
		};
	}, [userId, user?._id]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = (event) => {
		event.preventDefault();
		const trimmedContent = content.trim();
		if (!trimmedContent || sending) return;

		setSending(true);
		setError("");
		socketRef.current?.emit("sendMessage", {
			receiverId: userId,
			content: trimmedContent,
		});
		setContent("");
		setSending(false);
	};

	const getProfilePicSrc = (profilePic) => {
		if (!profilePic) return "";
		if (profilePic.startsWith("http://") || profilePic.startsWith("https://") || profilePic.startsWith("data:")) {
			return profilePic;
		}
		return `http://localhost:5000${profilePic}`;
	};

	const formatMessageTime = (createdAt) =>
		new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(createdAt));

	return (
		<main className="min-h-screen bg-[#F6FFEA] px-4 py-8 sm:px-6">
			<section className="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm" style={{ minHeight: "calc(100vh - 140px)" }}>
				<header className="flex items-center gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-7">
					<button
						type="button"
						onClick={() => navigate("/matches")}
						className="text-2xl font-bold text-[#C93638]"
						aria-label="Back to matches"
					>
						&#8592;
					</button>
					{matchUser?.profilePic ? (
						<img
							src={getProfilePicSrc(matchUser.profilePic)}
							alt={matchUser.name}
							className="h-12 w-12 rounded-full object-cover ring-2 ring-[#FFDE96]"
						/>
					) : (
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#62C4DA] text-xl font-black text-white ring-2 ring-[#FFDE96]">
							{matchUser?.name?.charAt(0).toUpperCase() || "?"}
						</div>
					)}
					<div className="min-w-0">
						<h1 className="truncate text-xl font-black !text-black sm:text-2xl">
							{matchUser?.name || (loading ? "Loading..." : "Your match")}
						</h1>
						<p className="truncate text-sm text-gray-500">
							{matchUser?.university || "Matched with you"}
						</p>
					</div>
				</header>

				{error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</p>}

				<div className="flex-1 space-y-3 overflow-y-auto bg-[#FFFCF8] px-5 py-6 sm:px-7">
					{!loading && messages.length === 0 && (
						<p className="py-12 text-center text-sm text-gray-500">Start the conversation.</p>
					)}
					{messages.map((message) => {
						const ownMessage = (message.sender?._id || message.sender) === user?._id;
						return (
							<div key={message._id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
								<div className={`flex max-w-[80%] flex-col ${ownMessage ? "items-end" : "items-start"}`}>
									<p className={`rounded-2xl px-4 py-3 text-sm ${ownMessage ? "rounded-br-sm bg-[#C93638] text-white" : "rounded-bl-sm bg-white text-gray-700 shadow-sm"}`}>
										{message.content}
									</p>
									<time dateTime={message.createdAt} className="mt-1 px-1 text-[11px] text-gray-400">
										{formatMessageTime(message.createdAt)}
									</time>
								</div>
							</div>
						);
					})}
					<div ref={messagesEndRef} />
				</div>

				<form onSubmit={sendMessage} className="flex gap-3 border-t border-gray-100 bg-white p-4 sm:p-5">
					<input
						value={content}
						onChange={(event) => setContent(event.target.value)}
						placeholder="Write a message..."
						className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FA855A]"
						maxLength={2000}
					/>
					<button type="submit" disabled={!content.trim() || sending} className="rounded-xl bg-[#C93638] px-5 py-3 font-bold text-white transition hover:bg-[#FA855A] disabled:cursor-not-allowed disabled:opacity-50">
						Send
					</button>
				</form>
			</section>
		</main>
	);
};

export default Chat;
