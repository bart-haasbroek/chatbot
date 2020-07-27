import { Component, ViewChild } from '@angular/core';
import { Observable, timer, merge, BehaviorSubject } from 'rxjs';
import {
	scan,
	map,
	startWith,
	filter,
	switchMap,
	takeWhile,
	withLatestFrom,
	share,
	tap,
} from 'rxjs/operators';
import {
	ChatBoxStartinQuestion,
	ChatbotResponses,
} from './conversationData/chatbot';
import { ConversationOptions } from './conversationData/conversationOptions';
import {
	ChatbotMessage,
	Chatmessage,
} from './conversationData/chatmessage.interface';

/**
 * Generic component information
 */
@Component({
	selector: 'app-chatbot',
	styleUrls: ['chatbot.component.scss'],
	templateUrl: 'chatbot.component.html',
})

/**
 * ChatbotComponent is a list of section blocks used throughout the entire app.
 */
export class ChatbotComponent {
	/**
	 * Reference to the message screen
	 */
	@ViewChild('messageScreen', { static: false }) messageScreen: any;
	/**
	 * The subject for changes when option is chosen
	 */
	// public answerChosen$: Subject<any> = new Subject();
	public answerChosen$: BehaviorSubject<any> = new BehaviorSubject<any>(
		ChatBoxStartinQuestion,
	);
	/**
	 * The observable which hold the answer options for the chat
	 */
	public conversationOptions$: Observable<any>;
	/**
	 * whether or not the chatbot is typing
	 */
	public chatbotIsTyping$: Observable<boolean>;
	/**
	 * whether or not the chatbot is typing
	 */

	public showTypingIcon: boolean;
	/**
	 * whether or not the chatbot is typing
	 */
	public endConversation$: Observable<boolean>;
	/**
	 * chatbot
	 */
	public chat$: Observable<any>;

	/**
	 * The init function of the component
	 */
	ngOnInit(): void {
		this.chatbotIsTyping$ = this.answerChosen$.pipe(
			// Only get trough if an answer is chosen after a click. This prevent that if the chat is resetted, the first value, which is a chatbox message, is triggerd this function
			// Also dont get trough if the emitted value is the last one
			filter(
				(option: Chatmessage) => !option.fromChatbot && !option.isLast,
			),
			switchMap(() => {
				return timer(0, 2000).pipe(
					takeWhile(timer => timer < 1, true),
					// timer is 0 at first and complete when its 1. Convert it here since typing is true as long the timer lives;
					map((timer: number) => !timer),
					tap(showIcon => {
						const delay: number = showIcon ? 500 : 0;
						setTimeout(() => {
							this.showTypingIcon = showIcon;
							this.scrollToBottomOfChat();
						}, delay);
					}),
				);
			}),
			share(),
		);
		const responser$: any = merge(
			this.answerChosen$,
			this.chatbotIsTyping$.pipe(
				filter((isTyping: any) => isTyping === false),
				withLatestFrom(this.answerChosen$),
				map(
					(chosenOption: any) =>
						ChatbotResponses[chosenOption[1].chatbotResponseId],
				),
			),
		);
    // Keep track of the conversation. 
    // if the new message is 999, the chat will be reset with the initial message
		this.chat$ = responser$.pipe(
			scan((currentChat: any, newMessage: any) => {
				return newMessage.id === 999
					? [newMessage]
					: [...currentChat, newMessage];
			}, []),
			tap(() => {
				this.scrollToBottomOfChat();
			}),
		);

		this.conversationOptions$ = responser$.pipe(
			filter((option: Chatmessage) => option.fromChatbot),
			map(
				(option: ChatbotMessage) =>
					ConversationOptions[option.nextOptionsId],
			),
		);

		this.endConversation$ = responser$.pipe(
			map((option: any) => option.isLast),
			startWith(false),
		);
	}

	/**
	 * Answer to to chat bot
	 */
	public answerChat(option: any): void {
		this.answerChosen$.next(option);
	}
	/**
	 * Start over with the chat
	 */
	public resetChat(): void {
		this.answerChosen$.next(ChatBoxStartinQuestion);
	}

	/**
	 * Scroll to bottom of the messagescreen so the newest message is visible
	 */
	private scrollToBottomOfChat(): void {
		setTimeout(() => {
			const messageScreenNativeElement = this.messageScreen.nativeElement;
			messageScreenNativeElement.scrollTop =
				messageScreenNativeElement.scrollHeight;
		}, 1);
	}
}
