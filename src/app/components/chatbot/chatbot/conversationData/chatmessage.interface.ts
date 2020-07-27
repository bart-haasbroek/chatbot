export interface Chatmessage {
	/**
	 * Text of the message
	 */
	text: string;
	/**
	 * Wheter or not the message is from the chatbox
	 */
	fromChatbot: boolean;

	/**
	 * Wheter or not this message is the last one before showing the end text
	 */
	isLast: boolean;
}

export interface ConversationOption extends Chatmessage {
	/**
	 * The id of the response of the chatbox message which be show next
	 */
	chatbotResponseId: number;
}

export interface ChatbotMessage extends Chatmessage {
	/**
	 * Id of the message
	 */
	id: number;

	/**
	 * The id of the next option set
	 */
	nextOptionsId: number;
}
