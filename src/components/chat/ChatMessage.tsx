import { ChatMessage as ChatMessageType, AGENT_CONFIG, AgentType } from '@/types/loan';
import { formatTime } from '@/lib/session';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const agentConfig = message.agent_type ? AGENT_CONFIG[message.agent_type] : null;

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : agentConfig
            ? agentConfig.color
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : agentConfig ? (
          <span>{agentConfig.icon}</span>
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Agent badge for assistant messages */}
        {!isUser && agentConfig && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full mb-1',
              agentConfig.color
            )}
          >
            {agentConfig.name}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed',
            isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

export function TypingIndicator({ agentType }: { agentType?: AgentType }) {
  const agentConfig = agentType ? AGENT_CONFIG[agentType] : null;

  return (
    <div className="flex gap-3 animate-fade-in">
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm',
          agentConfig ? agentConfig.color : 'bg-muted text-muted-foreground'
        )}
      >
        {agentConfig ? <span>{agentConfig.icon}</span> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex flex-col items-start">
        {agentConfig && (
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full mb-1', agentConfig.color)}>
            {agentConfig.name}
          </span>
        )}
        <div className="chat-bubble-assistant px-4 py-3">
          <div className="typing-indicator flex items-center gap-1">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
