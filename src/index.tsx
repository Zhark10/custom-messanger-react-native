/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {FC} from 'react';
import Animated from 'react-native-reanimated';
import {KeyboardAvoidingView, View} from 'react-native';

import {TLibraryInputData} from './types/T_LibraryInputData';
import {AnswerType, IAnswer} from './types';
import {isIos} from './utils/helpers/platform';
import {ChatInput} from './components/answer-panels/ChatInput/ChatInput';
import {ChatMultichoice} from './components/answer-panels/ChatMultichoice/ChatMultichoice';
import {getAnswerSize} from './utils/helpers/answer-panel-size-detect';
import {AnswerAnimWrapperStyles} from './components/shared/S_AnswerAnimWrapper';

import {useChatMiddleware} from './utils/hooks/USE_ChatMiddleware';
import {useAnswerFieldAnimation} from './utils/hooks/USE_AnswerFieldAnimation';

export const MessangerStack: FC<TLibraryInputData> = libraryInputData => {
  const chatMiddleware = useChatMiddleware(libraryInputData);
  const {
    messageIndex,
    currentChatBotQuestion: {myAnswerType},
    answerFieldVisible,
    setAnswerFieldVisible,
  } = chatMiddleware;

  const answerSize = getAnswerSize(myAnswerType, 0);
  const answerFieldAnimation = useAnswerFieldAnimation(
    answerFieldVisible,
    answerSize,
  );

  React.useEffect(() => {
    const setVisibleByTime = setTimeout(
      () => setAnswerFieldVisible(true),
      2000,
    );
    return () => clearTimeout(setVisibleByTime);
  }, [answerFieldVisible]);

  React.useEffect(() => {
    const isLastMessageInModel =
      messageIndex === libraryInputData.messages.length - 1;

    if (isLastMessageInModel) {
      libraryInputData.events.endConversationEvent();
    }
  }, [messageIndex]);

  const selectAnswerField = (): React.ReactNode => {
    const answerFields = {
      [AnswerType.INPUT]: ChatInput,
      [AnswerType.MULTICHOICE]: ChatMultichoice,
      [AnswerType.PHOTO]: ChatInput,
      [AnswerType.CHOICE]: ChatInput,
      [AnswerType.DATEPICKER]: ChatInput,
      [AnswerType.ONLY_BUTTON]: ChatInput,
    };
    const AnswerField = answerFields[myAnswerType];
    const chatProps: IAnswer = {chatMiddleware, libraryInputData};
    return <AnswerField {...chatProps} />;
  };

  return (
    <KeyboardAvoidingView
      behavior={isIos ? 'padding' : undefined}
      style={{flex: 1}}>
      <View style={{flex: 1}} />
      <Animated.View
        style={[
          AnswerAnimWrapperStyles.main,
          {height: answerFieldAnimation.offsetValue},
        ]}>
        {answerFieldVisible && selectAnswerField()}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};
