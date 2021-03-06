import { useContext, useState, useCallback, useEffect } from 'react'

import { TMessageAddedInStack } from '../../store/T_ChatProvider'
import { TOnlyOneMessageIteration } from '../../types'
import { ChatContext } from '../../store/ChatProvider'
import { TLibraryInputData, TOutputData } from '../../types/T_LibraryInputData'

export type TUseChatMiddleware = {
  currentChatBotQuestion: TOnlyOneMessageIteration
  messageIndex: number
  sendAnswer: (answer: any, type: EBubbleType, sendAnswerOutput?: boolean) => void
  answerFieldVisible: boolean
  setAnswerFieldVisible: React.Dispatch<React.SetStateAction<boolean>>
  savedChatInfo: TOutputData
  refreshMessages: React.Dispatch<React.SetStateAction<TMessageAddedInStack[]>>
  messages: TMessageAddedInStack[]
}

export enum EBubbleType {
  TEXT = 'TEXT',
  PHOTO = 'PHOTO',
  DOUBLE_PHOTO = 'DOUBLE_PHOTO',
  CREDIT_CARD = 'CREDIT_CARD',
}

export const useChatMiddleware = (libraryInputData: TLibraryInputData): TUseChatMiddleware => {
  const {
    currentMessage: [messageIndex, setNewMessageIndex],
    chatInfo: [savedChatInfo, refreshChatInfo],
    messageStack: [messages, refreshMessages],
  } = useContext(ChatContext)!

  const [answerFieldVisible, setAnswerFieldVisible] = useState(false)

  const currentChatBotQuestion = libraryInputData.messages[messageIndex]
  const myAnswerType = currentChatBotQuestion.myAnswer && Object.getOwnPropertyNames(currentChatBotQuestion.myAnswer)[0]

  useEffect(() => {
    if (messageIndex === libraryInputData.messages.length - 1) {
      libraryInputData.events.endConversationEvent(savedChatInfo)
    }
  }, [messageIndex])

  const currentKeyForFormdata =
    currentChatBotQuestion.myAnswer && myAnswerType && currentChatBotQuestion.myAnswer[myAnswerType].keyForFormData

  const dto = (answer: any, type: EBubbleType, answerForSaving: any) => {
    const answerDto: TMessageAddedInStack = {
      id: answerForSaving,
      sender: 'me',
    }

    const additionalFields = {
      [EBubbleType.TEXT]: () => {
        answerDto.text = answer
      },
      [EBubbleType.PHOTO]: () => {
        answerDto.picture = answer
      },
      [EBubbleType.DOUBLE_PHOTO]: () => {
        answerDto.twoSidePicture = answer
      },
      [EBubbleType.CREDIT_CARD]: () => {
        answerDto.creditCard = answer
      },
    }
    additionalFields[type]()

    return answerDto
  }
  const sendAnswer = useCallback(
    (answer: any, type: EBubbleType, sendAnswerOutput?: boolean) => {
      setAnswerFieldVisible(false)
      let answerForSaving = answer

      if (typeof answer !== 'string') {
        answerForSaving = answer.join(', ')
      }

      const answerDto = dto(answer, type, answerForSaving)

      refreshChatInfo((currentState) => {
        const dataForSaving = {
          ...currentState,
          [currentKeyForFormdata]: answer,
        }

        if (sendAnswerOutput) {
          libraryInputData.events.answerSended(dataForSaving)
        }
        return dataForSaving
      })

      const timeout = setTimeout(() => {
        setNewMessageIndex((current) => current + 1)
        refreshMessages((currentStack) => [...currentStack, answerDto])
      }, answerForSaving.length * 100)
      return () => clearTimeout(timeout)
    },
    [
      currentKeyForFormdata,
      libraryInputData.events,
      refreshChatInfo,
      refreshMessages,
      savedChatInfo,
      setNewMessageIndex,
      setAnswerFieldVisible,
    ],
  )

  return {
    currentChatBotQuestion,
    messageIndex,
    sendAnswer,
    answerFieldVisible,
    setAnswerFieldVisible,
    savedChatInfo,
    refreshMessages,
    messages,
  }
}
