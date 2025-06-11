const IteratoService = (function () {
    // Add a global variable for feedback ID
    let feedbackId = '';
    let chatHistory = [];
    let fdbk_tags = [];
    let msg_first_toast = "How was your experience?";
    let msg_2nd_toast = "We will try to do better! Would you like to share more feedback?"
    let ask_if_positive = false;
    let ask_if_negetive = true;
    let focused_conversation = true;

    const createToastStyles = function () {
        const style = document.createElement('style');
        style.textContent = `
                        @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100..900&display=swap');

                        .toast-notification {
                            position: fixed;
                            bottom: -100px;
                            left: 50%;
                            transform: translateX(-50%);
                            background-color: #1c1c1e;
                            color: #FFFFFF;
                            padding: 16px;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            z-index: 9999;
                            opacity: 0;
                            transition: opacity 0.4s ease-out, bottom 0.4s;
                            max-width: 400px;
                            width: 400px;
                            box-sizing: border-box;
                            text-align: center;
                            font-family: 'Lexend Deca', sans-serif;
                            font-optical-sizing: auto;
                            font-style: normal;
                            font-size: 0.95rem;
                            font-weight: 300;
                            }

                        .toast-notification button {
                            margin: 0;
                        }

                        .toast-notification p {
                            margin: 0;
                        }
                        
                        /* Typing indicator styles */
                        .typing-indicator {
                            display: inline-flex;
                            align-items: center;
                            height: 20px;
                        }
                        
                        .typing-indicator span {
                            height: 8px;
                            width: 8px;
                            background: #ededef;
                            border-radius: 50%;
                            display: inline-block;
                            margin: 0 2px;
                            opacity: 0.4;
                            animation: typing 1s infinite ease-in-out;
                        }
                        
                        .typing-indicator span:nth-child(1) {
                            animation-delay: 0s;
                        }
                        
                        .typing-indicator span:nth-child(2) {
                            animation-delay: 0.2s;
                        }
                        
                        .typing-indicator span:nth-child(3) {
                            animation-delay: 0.4s;
                        }
                        
                        @keyframes typing {
                            0% { opacity: 0.4; transform: scale(1); }
                            50% { opacity: 1; transform: scale(1.2); }
                            100% { opacity: 0.4; transform: scale(1); }
                        }

                        @media screen and (max-width: 480px) {
                            .toast-notification {
                                max-width: 96vw;
                                min-width: 96vw;
                                width: 90%;
                                left: 50%;
                                transform: translateX(-50%);
                                margin-left: 0;
                                bottom: -100px;
                                border-radius: 16px 16px 0 0;
                            }
                        }
                        
                        .toast-notification.show {
                            opacity: 1;
                            bottom: 30px;
                        }

                        @media screen and (max-width: 480px) {
                            .toast-notification.show {
                                bottom: 0;
                            }
                        }

                        .toast-notification.hide {
                            opacity: 0;
                            bottom: -100px;
                        }

                        .toast-button {
                            padding: 8px 16px;
                            margin: 0 !important;
                            background-color: #efefef;
                            color: #000;
                            border: none;
                            border-radius: 100px;
                            cursor: pointer;
                            font-size: 14px;
                            font-family: inherit;
                            font-optical-sizing: auto;
                            font-style: normal;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            width: 40px;
                            height: 40px;
                            padding: 0;
                        }

                        .toast-button:hover {
                            background-color: #ededed;
                        }

                        .toast-feedback-button {
                            margin: 0 !important;
                        }
                    `;
        document.head.appendChild(style);
    };

    const removeOverlay = async function () {
        const overlay = document.getElementById('iterato-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(async () => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                try {
                    const response = await fetch('https://iterato-api.unlink-at.workers.dev/talkwithAIPM', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            project_id: window._iteratoProjectId,
                            event_id: window._iteratoEventId,
                            fdbk_id: feedbackId,
                            domain: getDomain(),
                            conversation: chatHistory || [],
                            need_quest: false,
                            user_info: window.it_setUserInfo || {}
                        })
                    });
                    const responseData = await response.json();
                } catch (error) {
                    console.log('Error sending close event:', error);
                }

            }, 300);
        }
    };

    const createToast = function (id, message, hasButtons = false, hasFeedbackOptions = false, hasFeedbackInput = false) {
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = 'toast-notification';

        if (hasFeedbackOptions || hasFeedbackInput) {
            const closeButton = document.createElement('button');
            closeButton.className = 'toast-close-button';
            closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '8px';
            closeButton.style.right = '8px';
            closeButton.style.background = 'transparent';
            closeButton.style.border = 'none';
            closeButton.style.padding = '0';
            closeButton.style.margin = '0';
            closeButton.style.cursor = 'pointer';
            closeButton.style.color = '#efefef';
            closeButton.style.width = '24px';
            closeButton.style.height = '24px';
            closeButton.onclick = function () {

                removeOverlay();

                toast.className = 'toast-notification hide';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 500);
            };
            toast.appendChild(closeButton);

            toast.style.paddingRight = '36px';
        }

        const messageText = document.createTextNode(message);
        toast.appendChild(messageText);

        if (hasFeedbackOptions) {
            toast.appendChild(document.createElement('br'));

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.gap = '16px';
            buttonContainer.style.marginTop = '16px';

            const noButton = document.createElement('button');
            noButton.className = 'toast-feedback-button secondary';
            noButton.textContent = 'No';
            noButton.style.backgroundColor = 'transparent';
            noButton.style.border = '0';
            noButton.style.color = '#aaa';
            noButton.style.padding = '8px 16px';
            noButton.style.borderRadius = '4px';
            noButton.onclick = function () {
                toast.className = 'toast-notification hide';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 500);
            };

            const yesButton = document.createElement('button');
            yesButton.className = 'toast-feedback-button primary';
            yesButton.textContent = 'Yes';
            yesButton.style.backgroundColor = '#ededed';
            yesButton.style.border = 'none';
            yesButton.style.color = '#111';
            yesButton.style.width = 'fit-content';
            yesButton.style.padding = '8px 16px';
            yesButton.style.borderRadius = '40px';
            yesButton.onclick = function () {
                toast.className = 'toast-notification hide';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                        showFeedbackInputToast();
                    }
                }, 500);
            };

            buttonContainer.appendChild(noButton);
            buttonContainer.appendChild(yesButton);
            toast.appendChild(buttonContainer);
        }

        if (hasFeedbackInput) {
            toast.appendChild(document.createElement('br'));

            const inputContainer = document.createElement('div');
            inputContainer.style.marginTop = '16px';

            const feedbackInput = document.createElement('input');
            feedbackInput.type = 'text';
            feedbackInput.placeholder = 'Please share your feedback...';
            feedbackInput.style.width = 'calc(100% - 16px)';
            feedbackInput.style.padding = '8px';
            feedbackInput.style.borderRadius = '4px';
            feedbackInput.style.border = 'none';
            feedbackInput.style.marginBottom = '16px';
            feedbackInput.style.fontFamily = 'inherit';
            feedbackInput.style.boxSizing = 'border-box';
            feedbackInput.style.color = '#ffffff';
            feedbackInput.style.minWidth = '0';

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit Feedback';
            submitButton.style.backgroundColor = '#28282b';
            submitButton.style.border = 'none';
            submitButton.style.color = '#000';
            submitButton.style.padding = '8px 16px';
            submitButton.style.borderRadius = '4px';
            submitButton.style.cursor = 'pointer';
            submitButton.onclick = async function () {
                const userResponse = feedbackInput.value;
                if (!userResponse.trim()) return;

                addUserMessage(userResponse);
                feedbackInput.value = '';
                questionCount++;

                // Create bot message with loading animation immediately
                const botMessageElement = addBotMessage("");

                // Fetch the next question in the background
                const data = await fetchNextQuestion(userResponse);

                if (data.continueChat === false) {
                    // Replace loading animation with thank you message
                    botMessageElement.innerHTML = '';
                    typeWriter(botMessageElement, "Thank you for sharing your feedback!");

                    feedbackInput.disabled = true;
                    submitButton.disabled = true;
                    submitButton.style.backgroundColor = '#dddddd';

                    setTimeout(async () => {
                        await removeOverlay();
                        toast.className = 'toast-notification hide';
                        setTimeout(() => {
                            if (toast.parentNode) {
                                toast.parentNode.removeChild(toast);
                            }
                        }, 500);
                    }, 3000);



                } else if (data.question) {
                    // Replace loading animation with the actual question
                    botMessageElement.innerHTML = '';
                    typeWriter(botMessageElement, data.question);
                }
            };

            inputContainer.appendChild(feedbackInput);
            inputContainer.appendChild(submitButton);
            toast.appendChild(inputContainer);
        }

        if (hasButtons) {
            toast.appendChild(document.createElement('br'));

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.gap = '16px';
            buttonContainer.style.marginTop = '10px';

            const dislikeButton = document.createElement('button');
            dislikeButton.className = 'toast-button';
            dislikeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-thumb-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 21.008a3 3 0 0 0 2.995 -2.823l.005 -.177v-4h2a3 3 0 0 0 2.98 -2.65l.015 -.173l.005 -.177l-.02 -.196l-1.006 -5.032c-.381 -1.625 -1.502 -2.796 -2.81 -2.78l-.164 .008h-8a1 1 0 0 0 -.993 .884l-.007 .116l.001 9.536a1 1 0 0 0 .5 .866a2.998 2.998 0 0 1 1.492 2.396l.007 .202v1a3 3 0 0 0 3 3z" /><path d="M5 14.008a1 1 0 0 0 .993 -.883l.007 -.117v-9a1 1 0 0 0 -.883 -.993l-.117 -.007h-1a2 2 0 0 0 -1.995 1.852l-.005 .15v7a2 2 0 0 0 1.85 1.994l.15 .005h1z" /></svg>';
            dislikeButton.onclick = function () {
                // Close the toast immediately
                toast.className = 'toast-notification hide';

                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }

                    // Send API request and wait for response
                    sendFeedbackToAPI('negative').then(response => {
                        // Check if response is successful
                        if (response && response.statusCode === 200 && response.result === true) {
                            if (ask_if_negetive) {
                                showFeedbackOptionsToast();

                            } else {
                                showNextToast('Thanks for your feedback!');
                            }
                            // Show feedback options toast
                        } else {
                            console.log('Dislike! Unsuccess');
                            // Show generic thanks toast
                            showNextToast('Thanks for your feedback!');
                        }
                    }).catch(error => {
                        console.error('Error sending feedback:', error);
                        // Show generic thanks toast on error
                        showNextToast('Thanks for your feedback!');
                    });
                }, 500);
            };

            const likeButton = document.createElement('button');
            likeButton.className = 'toast-button';
            likeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-thumb-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 3a3 3 0 0 1 2.995 2.824l.005 .176v4h2a3 3 0 0 1 2.98 2.65l.015 .174l.005 .176l-.02 .196l-1.006 5.032c-.381 1.626 -1.502 2.796 -2.81 2.78l-.164 -.008h-8a1 1 0 0 1 -.993 -.883l-.007 -.117l.001 -9.536a1 1 0 0 1 .5 -.865a2.998 2.998 0 0 0 1.492 -2.397l.007 -.202v-1a3 3 0 0 1 3 -3z" /><path d="M5 10a1 1 0 0 1 .993 .883l.007 .117v9a1 1 0 0 1 -.883 .993l-.117 .007h-1a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-7a2 2 0 0 1 1.85 -1.995l.15 -.005h1z" /></svg>';
            likeButton.onclick = function () {
                // Close the toast immediately
                toast.className = 'toast-notification hide';

                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }

                    // Send API request and wait for response
                    sendFeedbackToAPI('positive').then(response => {
                        // Check if response is successful
                        if (response && response.statusCode === 200 && response.result === true) {
                            // Show thanks toast
                            if (ask_if_positive) {
                                showFeedbackOptionsToast();

                            } else {
                                showNextToast('Thanks for the positive feedback!');
                            }
                        } else {
                            // Show generic thanks toast
                            console.log('Like! Unsuccess');

                            showNextToast('Thanks for your feedback!');
                        }
                    }).catch(error => {
                        console.error('Error sending feedback:', error);
                        // Show generic thanks toast on error
                        showNextToast('Thanks for your feedback!');
                    });
                }, 500);
            };

            buttonContainer.appendChild(dislikeButton);
            buttonContainer.appendChild(likeButton);

            toast.appendChild(buttonContainer);
        }

        document.body.appendChild(toast);
        return toast;
    };

    const showFeedbackOptionsToast = function () {
        try {

            let firstToast;

            try {
                firstToast = document.querySelector('.toast-notification');
                if (firstToast) {
                    firstToast.className = 'toast-notification hide';
                }
                if (firstToast && firstToast.parentNode) {
                    firstToast.parentNode.removeChild(firstToast);
                }
            } catch (error) {
                console.error('Error removing first toast:', error);
            }

            // Create new toast immediately
            const feedbackOptionsToastId = 'feedback-options-toast-' + Date.now();
            const newToast = createToast(feedbackOptionsToastId, msg_2nd_toast, false, false);

            newToast.appendChild(document.createElement('br'));

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.gap = '16px';
            buttonContainer.style.marginTop = '16px';

            const noButton = document.createElement('button');
            noButton.className = 'toast-feedback-button secondary';
            noButton.textContent = 'No';
            noButton.style.backgroundColor = 'transparent';
            noButton.style.border = '0';
            noButton.style.color = '#aaa';
            noButton.style.padding = '8px 16px';
            noButton.style.width = 'fit-content';
            noButton.style.borderRadius = '4px';
            noButton.onclick = function () {
                newToast.className = 'toast-notification hide';
                setTimeout(() => {
                    if (newToast.parentNode) {
                        newToast.parentNode.removeChild(newToast);
                    }
                }, 500);
            };

            const yesButton = document.createElement('button');
            yesButton.className = 'toast-feedback-button primary';
            yesButton.textContent = 'Yes';
            yesButton.style.backgroundColor = '#ededed';
            yesButton.style.border = 'none';
            yesButton.style.color = '#111';
            yesButton.style.width = 'fit-content';
            yesButton.style.padding = '8px 16px';
            yesButton.style.borderRadius = '40px';
            yesButton.onclick = function () {
                newToast.className = 'toast-notification hide';
                setTimeout(() => {
                    if (newToast.parentNode) {
                        newToast.parentNode.removeChild(newToast);
                        showFeedbackInputToast();
                    }
                }, 500);
            };

            buttonContainer.appendChild(noButton);
            buttonContainer.appendChild(yesButton);
            newToast.appendChild(buttonContainer);
            showToast(feedbackOptionsToastId);

        } catch (e) {
            console.error('Error in showFeedbackOptionsToast:', e);
            // Fallback to showing generic thanks toast
            showNextToast('Thanks for your feedback!');
        }
    };

    const showFeedbackInputToast = function () {

        if (focused_conversation) {

            const overlay = document.createElement('div');
            overlay.id = 'iterato-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            overlay.style.backdropFilter = 'blur(3px)';
            overlay.style.WebkitBackdropFilter = 'blur(3px)';
            overlay.style.zIndex = '9998';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(overlay);

            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);

        }

        const feedbackInputToastId = 'feedback-input-toast-' + Date.now();

        const toast = createToast(feedbackInputToastId, '', false, false, false);

        toast.style.zIndex = '9999';

        const chatContainer = document.createElement('div');
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
        chatContainer.style.width = '100%';
        chatContainer.style.maxHeight = window.innerWidth <= 480 ? 'calc(85vh - 120px)' : '300px';
        chatContainer.style.overflowY = 'auto';
        chatContainer.style.margin = '0 0 16px 0';

        const firstBotMessage = document.createElement('div');
        firstBotMessage.style.backgroundColor = '#28282b'; // Updated background
        firstBotMessage.style.border = '1px solid #555555'; // Added border
        firstBotMessage.style.borderRadius = '0 8px 8px 8px';
        firstBotMessage.style.padding = '8px 12px';
        firstBotMessage.style.margin = '0 0 8px 0';
        firstBotMessage.style.alignSelf = 'flex-start';
        firstBotMessage.style.maxWidth = '80%';
        firstBotMessage.style.textAlign = 'left';

        chatContainer.appendChild(firstBotMessage);

        function typeWriter(element, text, i = 0, speed = 30) {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(() => typeWriter(element, text, i, speed), speed);
            }
        }

        let questionCounter = 0; // Add a counter to track the number of questions

        async function fetchNextQuestion(userResponse) {
            try {
                if (userResponse) {
                    chatHistory.push({
                        role: "user/customer",
                        response: userResponse
                    });
                    questionCounter++; // Only increment counter after user responses
                }

                if (questionCounter >= 3) {
                    let finalQuestion = "Lastly! Any other insights or suggestions to help us?";
                    if (questionCounter > 3) {
                        finalQuestion = " Thank you for sharing the feedback!";
                    }

                    chatHistory.push({
                        role: "Product Manager",
                        question: finalQuestion
                    });

                    return {
                        question: finalQuestion,
                        continueChat: questionCounter < 4 // Stop after 4th question (user's 5th response)
                    };
                }

                console.log("Collecting Feedback. feedbackId:" + feedbackId);
                const response = await fetch('https://iterato-api.unlink-at.workers.dev/talkwithAIPM', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        project_id: window._iteratoProjectId,
                        event_id: window._iteratoEventId,
                        fdbk_id: feedbackId,
                        domain: getDomain(),
                        reaction: 'negative',
                        conversation: chatHistory || [],
                        need_quest: true,
                        user_info: window.it_setUserInfo || {}
                    })
                });

                const data = await response.json();

                if (data.question) {
                    chatHistory.push({
                        role: "Product Manager",
                        question: data.question
                    });
                }

                // Override the continueChat flag based on our question counter
                return {
                    ...data,
                    continueChat: questionCounter < 4
                };
            } catch (error) {
                console.error('Error fetching next question:', error);
                return {
                    question: "Thank you for your feedback!",
                    continueChat: false
                };
            }
        }

        function addBotMessage(text) {
            const botMessage = document.createElement('div');
            botMessage.style.backgroundColor = '#323232';
            botMessage.style.border = '1px solid #555555';
            botMessage.style.borderRadius = '0 8px 8px 8px';
            botMessage.style.padding = '8px 12px';
            botMessage.style.margin = '0 0 8px 0';
            botMessage.style.alignSelf = 'flex-start';
            botMessage.style.maxWidth = '80%';
            botMessage.style.textAlign = 'left';
            botMessage.style.opacity = '0';
            botMessage.style.transform = 'translateY(10px) scale(0.95)';
            botMessage.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            // Add loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'typing-indicator';
            loadingIndicator.innerHTML = '<span></span><span></span><span></span>';
            loadingIndicator.style.display = 'inline-block';

            // Add typing indicator styles to the createToastStyles function
            botMessage.appendChild(loadingIndicator);

            chatContainer.appendChild(botMessage);

            setTimeout(() => {
                botMessage.style.opacity = '1';
                botMessage.style.transform = 'translateY(0) scale(1)';
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);

            // Start typing effect after a small delay
            setTimeout(() => {
                loadingIndicator.remove();
                typeWriter(botMessage, text);

                // Ensure we scroll to the bottom as the message is being typed
                const scrollInterval = setInterval(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 100);

                // Clear the interval after the message is likely fully typed
                setTimeout(() => {
                    clearInterval(scrollInterval);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, text.length * 30 + 100);
            }, 800);

            return botMessage;
        }

        function addUserMessage(text) {
            const userMessage = document.createElement('div');
            userMessage.textContent = text;
            userMessage.style.backgroundColor = '#efefef'; // Updated background
            userMessage.style.border = '0px'; // Updated border
            userMessage.style.color = '#000000'; // Changed text color to white for better contrast
            userMessage.style.borderRadius = '8px 8px 0 8px';
            userMessage.style.padding = '8px 12px';
            userMessage.style.marginBottom = '8px';
            userMessage.style.marginTop = '8px';
            userMessage.style.alignSelf = 'flex-end';
            userMessage.style.maxWidth = '80%';
            userMessage.style.textAlign = 'left';
            userMessage.style.opacity = '0';
            userMessage.style.transform = 'translateY(10px) scale(0.95)';
            userMessage.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            chatContainer.appendChild(userMessage);

            setTimeout(() => {
                userMessage.style.opacity = '1';
                userMessage.style.transform = 'translateY(0) scale(1)';
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 10);

            return userMessage;
        }

        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.flexDirection = 'row';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.width = '100%';
        inputContainer.style.gap = '8px';
        inputContainer.style.marginBottom = '8px';

        const feedbackInput = document.createElement('input');
        feedbackInput.type = 'text';
        feedbackInput.placeholder = 'Type your feedback...';
        feedbackInput.style.flex = '1';
        feedbackInput.style.padding = '8px 16px';
        feedbackInput.style.borderRadius = '100px';
        feedbackInput.style.border = 'none';
        feedbackInput.style.fontFamily = 'inherit';
        feedbackInput.style.boxSizing = 'border-box';
        feedbackInput.style.fontSize = '1rem';
        feedbackInput.style.color = '#ffffff';
        feedbackInput.style.backgroundColor = '#28282b'; // Updated background color
        feedbackInput.style.minWidth = '0';

        const submitButton = document.createElement('button');
        submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M18 11l-6 -6" /><path d="M6 11l6 -6" /></svg>';
        submitButton.style.backgroundColor = '#efefef';
        submitButton.style.border = 'none';
        submitButton.style.color = '#111';
        submitButton.style.borderRadius = '100px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.width = '40px';
        submitButton.style.height = '40px';
        submitButton.style.display = 'flex';
        submitButton.style.alignItems = 'center';
        submitButton.style.justifyContent = 'center';
        submitButton.style.padding = '0';
        submitButton.style.minWidth = '40px';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close Chat';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.border = '0';
        closeButton.style.color = '#616161';
        closeButton.style.padding = '0';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.width = '100%';
        closeButton.style.marginTop = '8px';
        closeButton.style.fontWeight = '400';

        closeButton.onclick = function () {
            removeOverlay();
            toast.className = 'toast-notification hide';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        };

        let questionCount = 0;

        // Add loading indicator to the first bot message
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'typing-indicator';
        loadingIndicator.innerHTML = '<span></span><span></span><span></span>';
        firstBotMessage.appendChild(loadingIndicator);

        fetchNextQuestion().then(data => {
            if (data.question) {
                // Remove loading indicator before typing the message
                firstBotMessage.innerHTML = '';
                typeWriter(firstBotMessage, data.question);
                // Scroll to the bottom after the question is loaded
                setTimeout(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 100);
            } else {
                // Remove loading indicator before typing the message
                firstBotMessage.innerHTML = '';
                typeWriter(firstBotMessage, "What could we have done better?");
                // Scroll to the bottom after the question is loaded
                setTimeout(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 100);
            }
        });

        submitButton.onclick = async function () {
            const userResponse = feedbackInput.value;
            if (!userResponse.trim()) return;

            addUserMessage(userResponse);

            feedbackInput.value = '';

            questionCount++;

            const data = await fetchNextQuestion(userResponse);

            if (data.continueChat === false) {

                addBotMessage("Thank you for sharing your feedback!");

                feedbackInput.disabled = true;
                submitButton.disabled = true;
                submitButton.style.backgroundColor = '#dddddd';

                setTimeout(() => {
                    removeOverlay();
                    toast.className = 'toast-notification hide';
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 500);
                }, 3000);
            } else if (data.question) {

                addBotMessage(data.question);
            }
        };

        inputContainer.appendChild(feedbackInput);
        inputContainer.appendChild(submitButton);

        toast.appendChild(chatContainer);
        toast.appendChild(inputContainer);
        toast.appendChild(closeButton);

        showToast(feedbackInputToastId);

        setTimeout(() => feedbackInput.focus(), 100);
    };

    const showSecondQuestionToast = function (firstAnswer) {
        const secondQuestionToastId = 'second-question-toast-' + Date.now();
        const toast = createToast(secondQuestionToastId, 'What can we do more to improve?', false, false, false);

        toast.appendChild(document.createElement('br'));

        const inputContainer = document.createElement('div');
        inputContainer.style.marginTop = '16px';

        const feedbackInput = document.createElement('input');
        feedbackInput.type = 'text';
        feedbackInput.placeholder = 'Your suggestions...';
        feedbackInput.style.width = '100%';
        feedbackInput.style.padding = '8px 24px';
        feedbackInput.style.borderRadius = '4px';
        feedbackInput.style.border = 'none';
        feedbackInput.style.marginBottom = '16px';
        feedbackInput.style.fontFamily = 'inherit';
        feedbackInput.style.boxSizing = 'border-box';
        feedbackInput.style.minWidth = '0';
        feedbackInput.style.color = '#ffffff';


        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.style.backgroundColor = '#ededed';
        submitButton.style.border = 'none';
        submitButton.style.color = '#111';
        submitButton.style.padding = '8px 16px';
        submitButton.style.borderRadius = '4px';
        submitButton.style.cursor = 'pointer';
        submitButton.onclick = function () {
            const secondAnswer = feedbackInput.value;
            console.log('Second feedback submitted:', secondAnswer);

            toast.className = 'toast-notification hide';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);

                    const thankYouToastId = 'thank-you-toast-' + Date.now();
                    createToast(thankYouToastId, 'Thank you for sharing your feedback!');
                    showToast(thankYouToastId, true);
                }
            }, 500);
        };

        const closeButton = document.createElement('p');
        closeButton.textContent = 'Close Chat';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function () {

            removeOverlay();

            toast.className = 'toast-notification hide';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        };

        inputContainer.appendChild(feedbackInput);
        inputContainer.appendChild(submitButton);
        inputContainer.appendChild(closeButton);
        toast.appendChild(inputContainer);

        showToast(secondQuestionToastId);
    };

    const showNextToast = function (message = 'This is the second toast notification!') {
        // Declare firstToast outside the try block
        let firstToast;

        try {
            firstToast = document.querySelector('.toast-notification');
            if (firstToast) {
                firstToast.className = 'toast-notification hide';
            }
        } catch (error) {
            console.error('Error removing first toast:', error);
        }

        setTimeout(function () {
            // Check if firstToast exists before trying to remove it
            if (firstToast && firstToast.parentNode) {
                firstToast.parentNode.removeChild(firstToast);
            }

            const secondToastId = 'second-toast-' + Date.now();
            createToast(secondToastId, message);
            showToast(secondToastId, true);
        }, 100);
    };

    let oldLog = console.log;
    let collectedLogs = [];

    // Function to generate a universally unique ID for feedback
    const generateFeedbackId = function () {
        return Date.now().toString() + Math.random().toString(36).substring(2, 15);
    };

    // Function to get IP details
    const getIpDetails = async function () {
        try {
            const response = await fetch('https://ipapi.co/json/');
            return await response.json();
        } catch (error) {
            console.error('Error fetching IP details:', error);
            return { error: 'Failed to fetch IP details' };
        }
    };

    // Function to get domain
    const getDomain = function () {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');

        // Handle localhost and IPs
        if (parts.length < 2 || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname === 'localhost') {
            return hostname;
        }

        // Known public suffixes (extendable)
        const publicSuffixes = ['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au'];
        const lastTwo = parts.slice(-2).join('.');
        const lastThree = parts.slice(-3).join('.');

        if (publicSuffixes.includes(lastTwo)) {
            return lastThree;
        }

        return lastTwo;
    };

    // Function to send feedback to API
    const sendFeedbackToAPI = async function (reaction) {
        try {
            // Get IP details
            const ipDetails = await getIpDetails();

            // Prepare payload
            const payload = {
                project_id: window._iteratoProjectId,
                event_id: window._iteratoEventId,
                fdbk_id: feedbackId,
                domain: getDomain(),
                reaction: reaction, // 'positive' or 'negative'
                user_info: window.it_setUserInfo || {},
                conversation: {},
                ip_details: ipDetails,
                console_log: collectedLogs,
                browser_details: window.it_browser_details,
                need_quest: false,
                tags: fdbk_tags
            };

            // Send to API
            const response = await fetch('https://iterato-api.unlink-at.workers.dev/talkwithAIPM', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const statusCode = response.status;
            const data = await response.json();
            // Return both status code and data
            return {
                statusCode: statusCode,
                ...data,
                result: data.result || false
            };
        } catch (error) {
            console.error('Error sending feedback to API:', error);
            return {
                statusCode: 500,
                error: 'Failed to send feedback',
                result: false
            };
        }
    };

    const init = function (project_id) {
        createToastStyles();

        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(viewportMeta);
        } else {
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }

        try {
            console.log = function (message) {
                collectedLogs.push(Array.from(arguments));
                oldLog.apply(console, arguments);
            };
        } catch (error) {
            console.error('Error setting up console.log interception:', error);
        }

        try {
            // Create browser details object with comprehensive browser information
            window.it_browser_details = {
                user_agent: navigator.userAgent,
                screen_width: window.screen.width,
                screen_height: window.screen.height,
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight,
                pixel_ratio: window.devicePixelRatio,
                color_depth: window.screen.colorDepth,
                platform: navigator.platform,
                language: navigator.language,
                cookies_enabled: navigator.cookieEnabled,
                online_status: navigator.onLine,
                browser_name: (function () {
                    const ua = navigator.userAgent;
                    if (ua.indexOf("Firefox") > -1) return "Firefox";
                    else if (ua.indexOf("SamsungBrowser") > -1) return "Samsung Browser";
                    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
                    else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) return "Edge";
                    else if (ua.indexOf("Chrome") > -1) return "Chrome";
                    else if (ua.indexOf("Safari") > -1) return "Safari";
                    else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) return "Internet Explorer";
                    return "Unknown";
                })(),
                is_mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                connection_type: (navigator.connection || navigator.mozConnection || navigator.webkitConnection) ?
                    (navigator.connection || navigator.mozConnection || navigator.webkitConnection).effectiveType : "unknown"
            };
        } catch (error) {
            console.log('Error creating browser details object:', error);
            window.it_browser_details = { error: 'Failed to collect browser details' };
        }
        if (!project_id) {
            // Return a rejected promise if project_id is missing
            return Promise.resolve(false);
        }

        // Get the current domain
        const domain = window.location.hostname;

        // Return the fetch promise chain
        return fetch('https://iterato-api.unlink-at.workers.dev/verifyProject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                website_url: domain,
                project_id: project_id
            })
        })
            .then(response => {
                const statusCode = response.status;
                return response.json().then(data => {
                    // Check validation and set state
                    if (statusCode === 200 && data.result === "TRUE") {
                        window._iteratoInitialized = true;
                        window._iteratoProjectId = project_id;
                        console.log('IteratoService initialized successfully');
                        return true; // Resolve promise with true
                    } else {
                        console.log('Project validation failed:', { statusCode, data });
                        window._iteratoInitialized = false; // Ensure state is false on failure
                        return false; // Resolve promise with false
                    }
                }).catch(error => {
                    console.log('Error parsing validation response:', error);
                    console.log('Project validation failed due to JSON parsing error:', { statusCode });
                    window._iteratoInitialized = false;
                    return false; // Resolve promise with false on JSON error
                });
            })
            .catch(error => {
                console.log('Error validating project (fetch failed):', error);
                window._iteratoInitialized = false;
                return false; // Resolve promise with false on fetch error
            });
    };

    const showToast = function (toastId, autoHide = false) {

        if (!window._iteratoInitialized) {
            console.error('IteratoService not initialized. Please call IteratoService.init() first.');
            return false;
        }

        const toast = document.getElementById(toastId);
        if (!toast) return false;

        void toast.offsetWidth;

        toast.className = 'toast-notification show';

        if (autoHide) {
            setTimeout(function () {
                toast.className = 'toast-notification hide';

                removeOverlay();

                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 500);
            }, 3000);
        }

        return true;
    };
    const collect = function (event_id, toast_config = {}) {
        if (!event_id) {
            console.error('IteratoService: Event ID is required for collect function');
            return false;
        }

        if (!window._iteratoInitialized || !window._iteratoProjectId) {
            console.error('IteratoService: Service not initialized. Please call init() first');
            return false;
        }

        // Reset tags array
        fdbk_tags = [];

        // Process toast configuration if provided
        if (toast_config && typeof toast_config === 'object') {
            // Process tags if provided
            if ('tags' in toast_config) {
                if (Array.isArray(toast_config.tags)) {
                    // Filter out non-string values
                    fdbk_tags = toast_config.tags.filter(tag => typeof tag === 'string');
                } else {
                    console.warn('IteratoService: tags should be an array of strings, ignoring invalid format');
                }
            }

            // Process followup_if_positive if provided
            if ('followup_if_positive' in toast_config) {
                if (typeof toast_config.followup_if_positive === 'boolean') {
                    ask_if_positive = toast_config.followup_if_positive;
                } else {
                    console.warn('IteratoService: followup_if_positive should be a boolean, ignoring invalid value');
                    followup_if_negative = false;

                }
            }

            // Process followup_if_negative if provided
            if ('followup_if_negative' in toast_config) {
                if (typeof toast_config.followup_if_negative === 'boolean') {
                    ask_if_negetive = toast_config.followup_if_negative;
                } else {
                    console.warn('IteratoService: followup_if_negative should be a boolean, ignoring invalid value');
                    followup_if_negative = true;
                }
            }

            // Process followup_if_negative if provided
            if ('focused_chat' in toast_config) {
                if (typeof toast_config.focused_chat === 'boolean') {
                    focused_conversation = toast_config.focused_chat;
                } else {
                    console.warn('IteratoService: focused_chat should be a boolean, ignoring invalid value');
                    focused_conversation = false;
                }
            }

            // Process initial_prompt if provided
            if ('initial_prompt' in toast_config) {
                if (typeof toast_config.initial_prompt === 'string') {
                    msg_first_toast = toast_config.initial_prompt;
                } else {
                    console.warn('IteratoService: initial_prompt should be a string, ignoring invalid value');
                }
            }

            // Process followup_prompt if provided
            if ('followup_prompt' in toast_config) {
                if (typeof toast_config.followup_prompt === 'string') {
                    msg_2nd_toast = toast_config.followup_prompt;
                } else {
                    console.warn('IteratoService: followup_prompt should be a string, ignoring invalid value');
                }
            }

            // Any other properties in toast_config are simply ignored
        }

        // Generate a new feedback ID for this feedback session
        feedbackId = generateFeedbackId();
        chatHistory = [];

        // Store event ID globally
        window._iteratoEventId = event_id;

        // Verify event with API
        return fetch('https://iterato-api.unlink-at.workers.dev/verifyEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_id: event_id,
                project_id: window._iteratoProjectId
            })
        })
            .then(response => {
                const statusCode = response.status;
                return response.json().then(data => ({ statusCode, data }));
            })
            .then(({ statusCode, data }) => {
                if (statusCode === 200 && data.result === "TRUE") {
                    // Proceed with showing the toast - preserving original functionality
                    const existingToasts = document.querySelectorAll('.toast-notification');
                    existingToasts.forEach(toast => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    });

                    const firstToastId = 'first-toast-' + Date.now();
                    createToast(firstToastId, msg_first_toast, true);
                    showToast(firstToastId);
                    setTimeout(function () {
                        const toast = document.getElementById(firstToastId);
                        if (toast && toast.parentNode) {
                            toast.className = 'toast-notification hide';
                            setTimeout(() => {
                                if (toast.parentNode) {
                                    toast.parentNode.removeChild(toast);
                                }
                            }, 500);
                        }
                    }, 3500);
                    return true;
                } else {
                    console.error('IteratoService: Event verification failed:', { statusCode, data });
                    return false;
                }
            })
            .catch(error => {
                console.error('IteratoService: Error verifying event:', error);
                return false;
            });
    };

    const setUser = function (userinfo) {
        if (userinfo &&
            typeof userinfo === 'object' &&
            !Array.isArray(userinfo)
        ) {
            try {
                // Store the user info object in the window object
                window.it_setUserInfo = userinfo;
                ('IteratoService: User info set successfully.', window.it_setUserInfo);
                return true; // Indicate success
            } catch (error) {
                console.error('IteratoService: Error setting user info.', error);
                return false; // Indicate failure due to an unexpected error
            }
        } else {
            console.error('IteratoService: Invalid user info provided. Expected an object.', userinfo);
            return false; // Indicate failure due to invalid input
        }
    };

    // Function to generate or retrieve a unique user ID
    const getUserId = function () {
        let userId = localStorage.getItem('iterato_user_id');
        if (!userId) {
            // Generate a simple fingerprint based on browser properties
            const fingerprint = [
                navigator.userAgent,
                navigator.language,
                screen.colorDepth,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset(),
                navigator.platform
            ].join('|');

            // Create a hash of the fingerprint
            let hash = 0;
            for (let i = 0; i < fingerprint.length; i++) {
                const char = fingerprint.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }

            userId = 'uid_' + Math.abs(hash).toString(16) + Date.now().toString(16);
            localStorage.setItem('iterato_user_id', userId);
        }
        return userId;
    };

    // Function to push page view data to the API
    const pushPV = function () {
        try {
            // Get domain using existing function
            const domain = getDomain();

            // Get path (everything after the domain in the URL)
            const path = window.location.pathname + window.location.search + window.location.hash;

            // Get referrer
            const referrer = document.referrer || '';

            // Get or create user ID
            const userId = getUserId();

            // Prepare payload
            const payload = {
                domain: domain,
                path: path,
                referrer: referrer,
                user_id: userId
            };

            // Send to API
            fetch('https://iterato-api.unlink-at.workers.dev/pushPV', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Pageview Recorded.');
                    } else {
                        console.log('Failed to send page view data');
                    }
                })
                .catch(error => {
                    console.log('Error sending page view data:', error);
                });

            return true;
        } catch (error) {
            console.error('Error in pushPV function:', error);
            return false;
        }
    };

    // Expose the new function along with the existing ones
    return {
        collect: collect,
        showToast: showToast,
        init: init,
        setUser: setUser,
        pushPV: pushPV
    };
})();
IteratoService.pushPV();
