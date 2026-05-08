import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`max-w-[72%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? "bg-rose-500 text-white rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
        }`}
      >
        {message.content}
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-xs text-gray-400">{time}</span>
        {isMine && (
          <span className="text-xs text-gray-400">{message.is_read ? "既読" : ""}</span>
        )}
      </div>
    </div>
  );
}
