"use client";

import { useState } from "react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    await onSend(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 bg-white border-t border-gray-200">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        maxLength={500}
        placeholder="メッセージを入力..."
        className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
        style={{ maxHeight: "120px" }}
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="w-10 h-10 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition flex-shrink-0"
      >
        ➤
      </button>
    </form>
  );
}
