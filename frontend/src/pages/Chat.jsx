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
	const [menuOpen, setMenuOpen] = useState(false);
	const [moderationAction, setModerationAction] = useState("");
	const [confirmationAction, setConfirmationAction] = useState("");

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

	const handleContentKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			sendMessage(event);
		}
	};

	const handleBlock = async () => {
		setModerationAction("block");
		setError("");
		try {
			await API.post(`/users/block/${userId}`);
			navigate("/matches");
		} catch (err) {
			setError(err.response?.data?.message || "Unable to block this user");
		} finally {
			setModerationAction("");
		}
	};

	const handleReport = async () => {
		setModerationAction("report");
		setError("");
		try {
			await API.post("/reports", {
				reportedUser: userId,
				reason: "Inappropriate behavior",
				description: `Reported from chat with ${matchUser?.name || "the user"}.`,
			});
			setError("Report submitted to the admin.");
		} catch (err) {
			setError(err.response?.data?.message || "Unable to submit report");
		} finally {
			setModerationAction("");
		}
	};

	const openConfirmation = (action) => {
		setMenuOpen(false);
		setConfirmationAction(action);
	};

	const closeConfirmation = () => {
		if (!moderationAction) setConfirmationAction("");
	};

	const confirmModerationAction = () => {
		setConfirmationAction("");
		if (confirmationAction === "block") {
			handleBlock();
		} else {
			handleReport();
		}
	};

	return (
		<>
			<main className="flex min-h-0 flex-1 overflow-hidden bg-[#F6FFEA] p-3 sm:p-5">
			<section className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
				<header className="flex shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-7">
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
					<div className="relative ml-auto">
						<button
							type="button"
							onClick={() => setMenuOpen((open) => !open)}
							className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-black leading-none text-gray-500 transition hover:bg-gray-100 hover:text-[#C93638]"
							aria-label="Chat options"
							aria-expanded={menuOpen}
						>
							&#8943;
						</button>
						{menuOpen && (
							<div className="absolute right-0 top-12 z-10 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
								<button
									type="button"
									onClick={() => openConfirmation("block")}
									disabled={Boolean(moderationAction)}
									className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
								>
									Block
								</button>
								<button
									type="button"
									onClick={() => openConfirmation("report")}
									disabled={Boolean(moderationAction)}
									className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
								>
									Report
								</button>
							</div>
						)}
					</div>
				</header>

				{error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</p>}

				<div className="chat-messages min-h-0 flex-1 space-y-3 overflow-y-scroll bg-[#FFFCF8] px-5 py-5 sm:px-7">
					{!loading && messages.length === 0 && (
						<p className="py-12 text-center text-sm text-gray-500">Start the conversation.</p>
					)}
					{messages.map((message) => {
						const ownMessage = (message.sender?._id || message.sender) === user?._id;
						return (
							<div key={message._id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
								<div className={`flex max-w-[80%] flex-col ${ownMessage ? "items-end" : "items-start"}`}>
									<p className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${ownMessage ? "rounded-br-sm bg-[#C93638] text-white" : "rounded-bl-sm bg-white text-gray-700 shadow-sm"}`}>
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

				<form onSubmit={sendMessage} className="flex shrink-0 gap-3 border-t border-gray-100 bg-white p-4 sm:p-5">
					<textarea
						value={content}
						onChange={(event) => setContent(event.target.value)}
						onKeyDown={handleContentKeyDown}
						placeholder="Write a message..."
						className="min-h-[48px] min-w-0 flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FA855A]"
						maxLength={2000}
						rows={1}
					/>
					<button type="submit" disabled={!content.trim() || sending} className="rounded-xl bg-[#C93638] px-5 py-3 font-bold text-white transition hover:bg-[#FA855A] disabled:cursor-not-allowed disabled:opacity-50">
						Send
					</button>
				</form>
			</section>
			</main>

			{confirmationAction && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="moderation-dialog-title"
						className="w-full max-w-md rounded-[24px] border border-white/70 bg-white p-6 shadow-2xl sm:p-7"
					>
						<div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${confirmationAction === "block" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
							{confirmationAction === "block" ? "!" : "i"}
						</div>
						<h2 id="moderation-dialog-title" className="mt-5 text-xl font-black text-gray-900">
							{confirmationAction === "block" ? `Block ${matchUser?.name || "this user"}?` : `Report ${matchUser?.name || "this user"}?`}
						</h2>
						<p className="mt-2 text-sm leading-6 text-gray-500">
							{confirmationAction === "block"
								? "They will no longer be able to see your profile or appear in your matches."
								: "This report will be sent to the admin team for review."}
						</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={closeConfirmation}
								disabled={Boolean(moderationAction)}
								className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={confirmModerationAction}
								disabled={Boolean(moderationAction)}
								className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${confirmationAction === "block" ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"}`}
							>
								{moderationAction ? "Processing..." : confirmationAction === "block" ? "Block user" : "Submit report"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Chat;
